// Route handlers for static pages
const homePage = (req, res) => {
    res.render('home', { title: 'Home' });
};

const aboutPage = (req, res) => {
    res.render('about', { title: 'About' });
};
// unit3_part2_Building Your First Form: Contact Us//
const contactPage = (req, res) => {
    res.render('contact', { title: 'Contact' });
};

const demoPage = (req, res) => {
    res.render('demo', { title: 'Middleware Demo Page' });
};

const testErrorPage = (req, res, next) => {
    const err = new Error('This is a test error');
    err.status = 500;
    next(err);
};

export { homePage, aboutPage, contactPage, demoPage, testErrorPage };// unit3_part2_Building Your First Form: Contact Us_added contactpage//