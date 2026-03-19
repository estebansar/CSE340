import dotenv from "dotenv";
dotenv.config();

import { setupDatabase, testConnection } from './src/models/setup.js';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';  // Parse form data (Unit 3 Contact Form)
import flash from "connect-flash" //unit4 _part 1//
import connectPgSimple from 'connect-pg-simple';   // unit3_part2_ login form
import { caCert } from './src/models/db.js';   // unit3_part2_login form
import { startSessionCleanup } from './src/utils/session-cleanup.js'; // Unit3_Part2_Login Form_Session Cleanup

// Import MVC components
import routes from './src/controllers/routes.js';
import { addLocalVariables } from './src/middleware/global.js';


/**
 * Server configuration
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const NODE_ENV = process.env.NODE_ENV?.toLowerCase() || 'production';
const PORT = process.env.PORT || 3000;
console.log('SESSION_SECRET loaded:', Boolean(process.env.SESSION_SECRET));

/**
 * Setup Express Server
 */
const app = express();

// Session Middleware (Unit 3 Login Form)
const pgSession = connectPgSimple(session);

app.use(session({
  store: new pgSession({
    conObject: {
      connectionString: process.env.DB_URL,
      ssl: {
        ca: caCert,
        rejectUnauthorized: true,
        checkServerIdentity: () => { return undefined; }
      }
    },
    tableName: 'session',
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: NODE_ENV.includes('dev') !== true,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

//ended//

app.use(flash()) // Unit 4 - Flash messaging

startSessionCleanup(); // Unit3_Part2_Login Form_Session Cleanup Start

/**
 * Configure Express
 */
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Parse form data (Unit 3 Contact Form)
app.use(express.urlencoded({ extended: true }));
//end//
//unit 3_part 2_Building Your First Form: Contact Us//
app.use(express.json());
//end//
app.set('views', path.join(__dirname, 'src/views'));


//ended//

/**
 * Global Middleware
 */
app.use(addLocalVariables);

/**
 * Routes
 */
app.use('/', routes);

/**
 * Error Handling
 */

// 404 handler
app.use((req, res, next) => {
    const err = new Error('Page Not Found');
    err.status = 404;
    next(err);
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err);
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


/**
 * Start Server
 */
app.listen(PORT, async () => {
  await setupDatabase();
  await testConnection();
  console.log(`Server is running on http://127.0.0.1:${PORT}`);
});