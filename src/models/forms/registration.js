import db from '../db.js';

/**
 * Checks if an email address is already registered in the database.
 * 
 * @param {string} email - The email address to check
 * @returns {Promise<boolean>} True if email exists, false otherwise
 */
const emailExists = async (email) => {
    const query = `
        SELECT EXISTS(SELECT 1 FROM users WHERE email = $1) as exists
    `;
    const result = await db.query(query, [email]);
    return result.rows[0].exists;
};

/**
 * Saves a new user to the database with a hashed password.
 * 
 * @param {string} name - The user's full name
 * @param {string} email - The user's email address
 * @param {string} hashedPassword - The bcrypt-hashed password
 * @returns {Promise<Object>} The newly created user record (without password)
 */
const saveUser = async (name, email, hashedPassword) => {
    const query = `
        INSERT INTO users (name, email, password)
        VALUES ($1, $2, $3)
        RETURNING id, name, email, created_at
    `;
    const result = await db.query(query, [name, email, hashedPassword]);
    return result.rows[0];
};

/**
 * Retrieves all registered users from the database.
 * 
 * @returns {Promise<Array>} Array of user records (without passwords)
 */
const getAllUsers = async () => {
    const query = `
        SELECT id, name, email, created_at
        FROM users
        ORDER BY created_at DESC
    `;
    const result = await db.query(query);
    return result.rows;
};

const getUserById = async (id) => { 
    const query = `
        SELECT
            u.id,
            u.name,
            u.email,
            u.created_at,
            r.name AS role
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
};

const updateUserById = async (id, name, email) => { 
    const query = `
        UPDATE users
        SET name = $2,
            email = $3
        WHERE id = $1
        RETURNING id, name, email, role_id, created_at
    `;
    const result = await db.query(query, [id, name, email]);
    return result.rows[0];
};

export { emailExists, saveUser, getAllUsers, getUserById, updateUserById };