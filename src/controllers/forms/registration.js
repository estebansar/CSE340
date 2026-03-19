import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import { emailExists, saveUser, getAllUsers } from '../../models/forms/registration.js';

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
        title: 'User Registration'
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
        return res.redirect('/register');
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
        users
    });

};

router.get('/', showRegistrationForm);
router.post('/', registrationValidation, processRegistration);
router.get('/list', showAllUsers);

export default router;