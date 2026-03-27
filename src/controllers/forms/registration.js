import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import { emailExists, saveUser, getAllUsers, getUserById, updateUserById, deleteUser } from '../../models/forms/registration.js';
import { requireLogin, requireRole } from '../../middleware/auth.js';

const router = Router();

/**
 * Validation rules for user registration
 */
const registrationValidation = [
    body('name')
        .trim()
        .isLength({ min: 2 })
        .withMessage('Name must be at least 2 characters'),
    body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Must be a valid email address'),
    body('emailConfirm')
        .trim()
        .custom((value, { req }) => value === req.body.email)
        .withMessage('Email addresses must match'),
    body('password')
        .isLength({ min: 8 })
        .matches(/[0-9]/)
        .withMessage('Password must contain at least one number')
        .matches(/[!@#$%^&*]/)
        .withMessage('Password must contain at least one special character'),
    body('passwordConfirm')
        .custom((value, { req }) => value === req.body.password)
        .withMessage('Passwords must match')
];

/**  unit3_part2_Building a User Registration System///
 * Display the registration form page.
 */
const showRegistrationForm = (req, res) => {
    res.render('forms/registration/form', {
        title: 'User Registration',
        errors: [],
        formData: { 
            name: '',
            email: '',
            emailConfirm: ''
        }
    });
};

/**
 * Handle user registration with validation and password hashing.
 */
const processRegistration = async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.log(errors.array());

        return res.status(400).render('forms/registration/form', {
            title: 'User Registration',
            errors: errors.array().map(error => error.msg),
            formData: {
                name: req.body.name,
                email: req.body.email,
                emailConfirm: req.body.emailConfirm
            }

        })
    
    }

    // Extract validated data from request body
    const { name, email, password } = req.body;

    try {
        // Check if email already exists in database
        const emailAlreadyExists = await emailExists(email);

        if (emailAlreadyExists) {
            console.log('Email already registered');
            req.flash("notice", "Email is already registered.")
            return res.redirect('/register')
        }

        // Hash the password before saving to database
        const hashedPassword = await bcrypt.hash(password, 10);
        // TODO: Store the result in a variable called hashedPassword

        // Save user to database with hashed password
        await saveUser(name, email, hashedPassword);

        // TODO: Log success message to console
        console.log('User registered successfully');
        req.flash("notice", "User registered successfully.") // Unit 4 - Flash message
        return res.redirect('/register/list');
    } catch (error) {
        console.log(error);// TODO: Log the error to console
        return res.redirect('/register');// TODO: Redirect back to /register
    }
};

/**
 * Display all registered users.
 */
const showAllUsers = async (req, res) => {
    // Initialize users as empty array
    let users = [];

    try {
        users = await getAllUsers();  // TODO: Call getAllUsers() and assign to users variable
    } catch (error) {
        console.log(error);// TODO: Log the error to console
        return res.redirect('/register');// users remains empty array on error
    }

    res.render('forms/registration/list', {  // TODO: Render the users list view (forms/registration/list)
        title: 'Registered Users',  // TODO: Pass title: 'Registered Users' and the users variable in the data object
        users,
        currentUser: req.session.user
    });

};


/**
 * Display the edit account form
 * Users can edit their own account, admins can edit any account
 */
const showEditAccountForm = async (req, res) => { 
    const targetUserId = parseInt(req.params.id); 
    const currentUser = req.session.user; 

    const targetUser = await getUserById(targetUserId); 
    if (!targetUser) {
        req.flash('error', 'User not found.'); 
        return res.redirect('/register/list'); 
    }

    console.log('EDIT CHECK:', { currentUser, targetUserId }); // ✅ temporary debug

    const canEdit = currentUser.id === targetUserId || currentUser.role === 'admin'; 
    if (!canEdit) {
        req.flash('error', 'You do not have permission to edit this account.'); 
        return res.redirect('/register/list'); 
    }

    return res.render('forms/registration/edit', { 
        title: 'Edit Account', 
        user: targetUser 
    });
};

/**
 * Process account update
 */
const processEditAccount = async (req, res) => { 

    const userId = req.params.id; 
    const errors = validationResult(req); 

    if (!errors.isEmpty()) {
        return res.status(400).render('forms/registration/edit', { 
            title: 'Edit Account', 
            errors: errors.array().map(error => error.msg), 
            user: {
                id: req.params.id, 
                name: req.body.name, 
                email: req.body.email 
            }
        });
    }

    const { name, email } = req.body; 

    try {
        await updateUserById(userId, name, email); 

        req.flash('notice', 'User updated successfully'); 
        return res.redirect('/register/list'); 

    } catch (error) {
        console.log(error);
        return res.redirect('/register/list');
    }
};

/**
 * Delete a user account
 */
const processDeleteUser = async (req, res) => { 
    const userId = req.params.id; 

    try {
        await deleteUser(userId); 
        req.flash('notice', 'User deleted successfully'); 
        return res.redirect('/register/list'); 
    } catch (error) {
        console.log(error);
        return res.redirect('/register/list');
    }
};


/**
 * Validation rules for editing user accounts
 */
const editValidation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters') 
        .matches(/^[a-zA-Z\s'-]+$/)
        .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'), 
    body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Must be a valid email address') 
        .isLength({ max: 255 })
        .withMessage('Email address is too long') 
];

router.get('/', showRegistrationForm);
router.post('/', registrationValidation, processRegistration);
router.get('/list', showAllUsers);
router.get('/:id/edit', requireLogin, showEditAccountForm); 
router.post('/:id/edit', requireLogin, editValidation, processEditAccount);
router.post('/:id/delete', requireLogin, requireRole('admin'), processDeleteUser);  //unit4_part 1_managmenet-adding delete option)

export default router;