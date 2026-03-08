import { Router } from 'express';

// THE IMPORTS
import { addDemoHeaders } from '../middleware/demo/headers.js';
import { catalogPage, courseDetailPage } from './catalog/catalog.js';
import { homePage, aboutPage, demoPage, testErrorPage } from './index.js';

// adding facultylist page and facultydetail page_unit3_ part 2_ Building Your First Form: Contact Us
import { contactPage } from './index.js';

// adding facultylist page and facultydetail page

import { facultyListPage, facultyDetailPage } from './faculty/faculty.js';
// unit3_part 2_ building your first form:contact us//
import { body, validationResult } from 'express-validator';
//end//

import { saveContactForm } from '../models/contact-model.js';
// unit3_part 2_ building your first form:contact us//
import registrationRouter from './forms/registration.js';
// end//
import loginRoutes from './forms/login.js';
import { processLogout, showDashboard } from './forms/login.js';
import { requireLogin } from '../middleware/auth.js';

// Create a new router instance
const router = Router();

// Add registration-specific styles to all registration routes_unit3_part 2_Set Up Dynamic CSS Loading
router.use('/register', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/registration.css">');
    next();
});

//ROUTES GO BELOW
// Home and basic pages
router.get('/', homePage);
router.get('/about', aboutPage);
router.get('/contact', contactPage); // adding facultylist page and facultydetail page_unit3_ part 2_ Building Your First Form: Contact Us//

// Login routes (form and submission)
router.use('/login', loginRoutes);

// Authentication-related routes at root level
router.get('/logout', processLogout);
router.get('/dashboard', requireLogin, showDashboard);
//end//

// adding facultylist page and facultydetail page_unit3_ part 2_
router.use('/register', registrationRouter);
//end//

// POST route for contact form submissionAC
router.post(
    '/contact',
    [
        body('subject')
            .trim()
            .notEmpty()
            .withMessage('Subject is required'),

        body('message')
            .trim()
            .notEmpty()
            .withMessage('Message is required')
    ],
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.render('contact', {
                title: 'Contact',
                errors: errors.array()
            });
        }

        const { subject, message } = req.body;
        await saveContactForm(subject, message);
        res.render('contact-success', { title: 'Contact Submitted' });
    }
);
//end//

// Faculty pages
router.get('/faculty', facultyListPage);
router.get('/faculty/:facultyId', facultyDetailPage);

// Course catalog routes
router.get('/catalog', catalogPage);
router.get('/catalog/:slugId', courseDetailPage);

// Demo page with special middleware
router.get('/demo', addDemoHeaders, demoPage);

// Route to trigger a test error
router.get('/test-error', testErrorPage);


export default router;

