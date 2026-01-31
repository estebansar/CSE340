import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "src/views"));

/**
 * Configure Express middleware_ unit_2_ part1_ middleware in express_intro to middleware
 */
// Middleware to make NODE_ENV available to all templates
app.use((req, res, next) => {
    res.locals.NODE_ENV = NODE_ENV;
    // Continue to the next middleware or route handler
    next();
});

app.use((req, res, next) => {
  // skip paths that start with "/."
  if (req.path.startsWith("/.")) return next();
  next();
});

// Middleware to add global data to all templates_ unit_2_ part1_ middleware in express_intro to middleware
app.use((req, res, next) => {
    // Add current year for copyright
    res.locals.currentYear = new Date().getFullYear();
    next();
});

// time-based greeting middleware_UNIT2__intro to middleware
app.use((req, res, next) => {
  const hour = new Date().getHours(); // logic source

  if (hour < 12) {
    res.locals.greeting = "Good morning stranger";
  } else if (hour < 18) {
    res.locals.greeting = "Good afternoon ";
  } else {
    res.locals.greeting = "Good evening night owl";
  }

  next();
});

// Global middleware for random theme selection_unit2_part1_middleware in express_intro to middleware
app.use((req, res, next) => {
  const themes = ['blue-theme', 'green-theme', 'red-theme']; // values
  res.locals.bodyClass = themes[Math.floor(Math.random() * themes.length)]; //bodyClass
  next();
});

//make query parameters available to all templates
app.use((req, res, next) => {
  res.locals.queryParams = req.query || {}; // name: queryParams
  next();
});

// Course data - place this after imports, before routes-UNIT_2
const courses = {
    'CS121': {
        id: 'CS121',
        title: 'Introduction to Programming',
        description: 'Learn programming fundamentals using JavaScript and basic web development concepts.',
        credits: 3,
        sections: [
            { time: '9:00 AM', room: 'STC 392', professor: 'Brother Jack' },
            { time: '2:00 PM', room: 'STC 394', professor: 'Sister Enkey' },
            { time: '11:00 AM', room: 'STC 390', professor: 'Brother Keers' }
        ]
    },
    'MATH110': {
        id: 'MATH110',
        title: 'College Algebra',
        description: 'Fundamental algebraic concepts including functions, graphing, and problem solving.',
        credits: 4,
        sections: [
            { time: '8:00 AM', room: 'MC 301', professor: 'Sister Anderson' },
            { time: '1:00 PM', room: 'MC 305', professor: 'Brother Miller' },
            { time: '3:00 PM', room: 'MC 307', professor: 'Brother Thompson' }
        ]
    },
    'ENG101': {
        id: 'ENG101',
        title: 'Academic Writing',
        description: 'Develop writing skills for academic and professional communication.',
        credits: 3,
        sections: [
            { time: '10:00 AM', room: 'GEB 201', professor: 'Sister Anderson' },
            { time: '12:00 PM', room: 'GEB 205', professor: 'Brother Davis' },
            { time: '4:00 PM', room: 'GEB 203', professor: 'Sister Enkey' }
        ]
    }
};


// Route-specific middleware that sets custom headers_UNIT2_part1_ 6. Create a Demo Page with Special Headers (Route-Specific Middleware)
const addDemoHeaders = (req, res, next) => {
  res.setHeader('X-Demo-Page', 'true'); // header name
  res.setHeader('X-Middleware-Demo', 'This is a demo middleware'); // value can change
  next();
};


app.get("/", (req, res) => {
  const title = "Welcome Home";
  res.render("home", { title });
});

app.get("/about", (req, res) => {
  const title = "About Me";
  res.render("about", { title });
});

// Demo page route with header middleware_unit2_part1_6. Create a Demo Page with Special Headers (Route-Specific Middleware)
app.get('/demo', addDemoHeaders, (req, res) => {
  res.render('demo', {
    title: 'Middleware Demo Page' // title text
  });
});


// Course catalog list page- UNIT_2
app.get('/catalog', (req, res) => {
    res.render('catalog', {
        title: 'Course Catalog',
        courses: courses
    });
});

// Course detail page with route parameter- UNIT_2_"INTRO TO ROUTE PARAME"
app.get('/catalog/:courseId', (req, res, next) => {
    const courseId = req.params.courseId;
    const course = courses[courseId];
    if (!course) {
        const err = new Error(`Course ${courseId} not found`);
        err.status = 404;
        return next(err);
    }
    // Get sort parameter (default to 'time')
    const sortBy = req.query.sort || 'time';
    // Create a copy of sections to sort
    let sortedSections = [...course.sections];
    // Sort based on the parameter
    switch (sortBy) {
        case 'professor':
            sortedSections.sort((a, b) => a.professor.localeCompare(b.professor));
            break;
        case 'room':
            sortedSections.sort((a, b) => a.room.localeCompare(b.room));
            break;
        case 'time':
        default:
            // Keep original time order as default
            break;
    }
    console.log(`Viewing course: ${courseId}, sorted by: ${sortBy}`);
    res.render('course-detail', {
        title: `${course.id} - ${course.title}`,
        course: { ...course, sections: sortedSections },
        currentSort: sortBy
    });
});


// Test route for 500 errors //
app.get("/test-error", (req, res, next) => {
  const err = new Error("This is a test error"); 
  err.status = 500; 
  next(err); 
});

// Catch-all route for 404 errors
app.use((req, res, next) => {
    const err = new Error('Page Not Found');
    err.status = 404;
    next(err);
});

// Global error handler
app.use((err, req, res, next) => {
    // Prevent infinite loops, if a response has already been sent, do nothing
    if (res.headersSent || res.finished) {
        return next(err);
    }
    // Determine status and template
    const status = err.status || 500;
    const template = status === 404 ? '404' : '500';
    // Prepare data for the template
    const context = {
        title: status === 404 ? 'Page Not Found' : 'Server Error',
        error: NODE_ENV === 'production' ? 'An error occurred' : err.message,
        stack: NODE_ENV === 'production' ? null : err.stack,
        NODE_ENV // Our WebSocket check needs this and its convenient to pass along
    };
    // Render the appropriate error template with fallback
    try {
        res.status(status).render(`errors/${template}`, context);
    } catch (renderErr) {
        // If rendering fails, send a simple error page instead
        if (!res.headersSent) {
            res.status(status).send(`<h1>Error ${status}</h1><p>An error occurred.</p>`);
        }
    }
});


// REQUIRED: start the server (must be last)
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});