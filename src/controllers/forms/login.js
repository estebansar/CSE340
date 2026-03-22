import { body, validationResult } from 'express-validator';
import { findUserByEmail, verifyPassword } from '../../models/forms/login.js';
import { Router } from 'express';

const router = Router();

/**
 * Validation rules for login form
 */
const loginValidation = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail()
        .isLength({ max: 255 })
        .withMessage('Email address is too long'),

    body('password')
        .notEmpty()
        .isLength({ min: 8, max: 128 })
        .withMessage('Password must be between 78 and 128 characters')
];

/**
 * Display the login form.
 */
const showLoginForm = (req, res) => {
res.render('forms/login/form', { title: 'User Login' });  // TODO: Render the login form view (forms/login/form)
                                             // TODO: Pass title: 'User Login'
};

/**
 * Process login form submission.
 */
const processLogin = async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.log('Login validation errors:', errors.array());// TODO: Log validation errors to console
        res.redirect('/login');// TODO: Redirect back to /login
        return;
    }

    const { email, password } = req.body;// TODO: Extract email and password from req.body

    try {
        const user = await findUserByEmail(email);
        if (!user) {
            console.log('User not found');
            return res.redirect('/login');
        }

        const passwordMatch = await verifyPassword(password, user.password);
        if (!passwordMatch) {
            console.log('Invalid password');
            return res.redirect('/login');
        }

        // SECURITY: Remove password from user object before storing in session
        delete user.password;

        req.session.user = user;// TODO: Store user in session: req.session.user = user
         res.redirect('/dashboard');// TODO: Redirect to /dashboard
    } catch (error) {
        // Model functions do not catch errors, so handle them here
        console.error('Login error:', error);// TODO: Log error to console
        res.redirect('/login');// TODO: Redirect to /login
    }
};

/**
 * Handle user logout.
 * 
 * NOTE: connect.sid is the default session cookie name since we did not
 * specify a custom name when creating the session in server.js.
 */
const processLogout = (req, res) => {
    // First, check if there is a session object on the request
    if (!req.session) {
        // If no session exists, there's nothing to destroy,
        // so we just redirect the user back to the home page
        return res.redirect('/');
    }

    // Call destroy() to remove this session from the store (PostgreSQL in our case)
    req.session.destroy((err) => {
        if (err) {
            // If something goes wrong while removing the session from the database:
            console.error('Error destroying session:', err);

            /**
             * Clear the session cookie from the browser anyway, so the client
             * does not keep sending an invalid session ID.
             */
            res.clearCookie('connect.sid');

            /** 
             * Normally we would respond with a 500 error since logout did not fully succeed.
             * Example: return res.status(500).send('Error logging out');
             * 
             * Since this is a practice site, we will redirect to the home page anyway.
             */
            return res.redirect('/');
        }

        // If session destruction succeeded, clear the session cookie from the browser
        res.clearCookie('connect.sid');

        // Redirect the user to the home page
        res.redirect('/');
    });
};

/**
 * Display protected dashboard (requires login).
 */
const showDashboard = (req, res) => {
    const user = req.session.user;
    const sessionData = req.session;

    // Security check! Ensure user and sessionData do not contain password field
    if (user && user.password) {
        console.error('Security error: password found in user object');
        delete user.password;
    }
    if (sessionData.user && sessionData.user.password) {
        console.error('Security error: password found in sessionData.user');
        delete sessionData.user.password;
    }

    res.render('dashboard', { title: 'Dashboard', user, sessionData });
    // TODO: Render the dashboard view (dashboard)
    // TODO: Pass title: 'Dashboard', user, and sessionData to template
};


/**
 * Display account management page.
 */
const showAccount = (req, res) => {
    const user = req.session.user;

    res.render('account', {
        title: 'Account Management',
        user
    });
};

// Routes
router.get('/', showLoginForm);
router.post('/', loginValidation, processLogin);

// Export router as default, and specific functions for root-level routes
export default router;
export { processLogout, showDashboard, showAccount };