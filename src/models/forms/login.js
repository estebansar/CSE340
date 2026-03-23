import bcrypt from 'bcrypt';
import db from '../db.js';


/**
 * Find a user by email address for login verification.
 * 
 * @param {string} email - Email address to search for
 * @returns {Promise<Object|null>} User object with password hash or null if not found
 */
const findUserByEmail = async (email) => {
    const result = await db.query(
        `SELECT 
            u.id,
            u.name,
            u.email,
            u.password,
            u.created_at,
            r.name AS role
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE LOWER(u.email) = LOWER($1)
        LIMIT 1`,
        [email]
    );

    return result.rows[0] || null;
};

/**
 * Verify a plain text password against a stored bcrypt hash.
 * 
 * @param {string} plainPassword - The password to verify
 * @param {string} hashedPassword - The stored password hash
 * @returns {Promise<boolean>} True if password matches, false otherwise
 */
const verifyPassword = async (plainPassword, hashedPassword) => {
    return await bcrypt.compare(plainPassword, hashedPassword);
};

export { findUserByEmail, verifyPassword };