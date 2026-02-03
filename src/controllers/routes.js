import { Router } from 'express';

// THE IMPORTS
import { addDemoHeaders } from '../middleware/demo/headers.js';
import { catalogPage, courseDetailPage } from './catalog/catalog.js';
import { homePage, aboutPage, demoPage, testErrorPage } from './index.js';
// adding facultylist page and facultydetail page

import { facultyListPage, facultyDetailPage } from './faculty/faculty.js';


// Create a new router instance
const router = Router();

//ROUTES GO BELOW
// Home and basic pages
router.get('/', homePage);
router.get('/about', aboutPage);

// Faculty pages
router.get('/faculty', facultyListPage);
router.get('/faculty/:facultyId', facultyDetailPage);

// Course catalog routes
router.get('/catalog', catalogPage);
router.get('/catalog/:courseId', courseDetailPage);

// Demo page with special middleware
router.get('/demo', addDemoHeaders, demoPage);

// Route to trigger a test error
router.get('/test-error', testErrorPage);


export default router;

