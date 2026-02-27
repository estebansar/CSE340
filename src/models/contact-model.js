import db from './db.js';

const saveContactForm = async (subject, message) => {
    const sql = `
        INSERT INTO contact_form (subject, message)
        VALUES ($1, $2)
        RETURNING id
    `;
    
    const result = await db.query(sql, [subject, message]);
    return result.rows[0].id;
};

export { saveContactForm };