import pool from '../config/db.js';

export const userRepository = {
  /**
   * Find a user by email address
   */
  async findByEmail(email) {
    const normalizedEmail = email.toLowerCase().trim();
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [normalizedEmail]);
    if (!rows || rows.length === 0) return null;

    const user = rows[0];
    return {
      ...user,
      password: user.password_hash || user.password, // Normalize password field for bcrypt
    };
  },

  /**
   * Find a user by unique identifier
   */
  async findById(id) {
    const [rows] = await pool.query('SELECT id, username, email, created_at FROM users WHERE id = ?', [id]);
    return rows[0] || null;
  },

  /**
   * Create a new user record in MySQL
   */
  async create({ username, email, passwordHash, password }) {
    const normalizedEmail = email.toLowerCase().trim();
    const hash = passwordHash || password;

    const [result] = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username.trim(), normalizedEmail, hash]
    );

    return {
      id: result.insertId,
      username: username.trim(),
      email: normalizedEmail,
      createdAt: new Date().toISOString(),
    };
  },
};
