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
            return res.redirect('/register')
            return;
        }

        // Hash the password before saving to database
        // TODO: Use bcrypt.hash(password, 10) to hash the password
        // TODO: Store the result in a variable called hashedPassword

        // Save user to database with hashed password
        // TODO: Call saveUser(name, email, hashedPassword)

        // TODO: Log success message to console
        // TODO: Redirect to /register/list to show successful registration
        // NOTE: Later when we add authentication, we'll change this to require login first
    } catch (error) {
        // TODO: Log the error to console
        // TODO: Redirect back to /register
    }
};

/**
 * Display all registered users.
 */
const showAllUsers = async (req, res) => {
    // Initialize users as empty array
    let users = [];

    try {
        // TODO: Call getAllUsers() and assign to users variable
    } catch (error) {
        // TODO: Log the error to console
        // users remains empty array on error
    }

    // TODO: Render the users list view (forms/registration/list)
    // TODO: Pass title: 'Registered Users' and the users variable in the data object
};