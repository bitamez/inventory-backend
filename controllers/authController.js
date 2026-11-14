
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import pool from '../config/db.js';

// Generate JWT token
const generateToken = (user) => {
  const JWT_SECRET = process.env.JWT_SECRET;

  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is missing from backend .env');
  }

  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role_id: user.role_id
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// REGISTER USER
export const registerUser = async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email and password are required'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check whether email already exists
    const existing = await pool.query(
      'SELECT id FROM inv_users WHERE email = $1',
      [normalizedEmail]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    const userId = randomUUID();

    // Default role ID: make sure role 3 exists in your database.
    const defaultRoleId = 3;

    const result = await pool.query(
      `INSERT INTO inv_users
       (id, full_name, email, password, role_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, full_name, email, role_id, is_active, created_at`,
      [
        userId,
        full_name.trim(),
        normalizedEmail,
        hashedPassword,
        defaultRoleId
      ]
    );

    const user = result.rows[0];

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user
    });

  } catch (error) {
    console.error('REGISTER ERROR:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};


// LOGIN USER
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user and role
    const result = await pool.query(
      `SELECT
         u.*,
         r.role_name
       FROM inv_users u
       LEFT JOIN inv_roles r ON u.role_id = r.id
       WHERE u.email = $1`,
      [normalizedEmail]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Contact admin.'
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT
    const token = generateToken(user);

    // Never return password to frontend
    const {
      password: userPassword,
      ...safeUser
    } = user;

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: safeUser
    });

  } catch (error) {
    console.error('LOGIN ERROR:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};


// LOGOUT USER
export const logoutUser = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};


// GET LOGGED-IN USER
export const getMe = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         u.id,
         u.full_name,
         u.email,
         u.role_id,
         u.is_active,
         u.created_at,
         r.role_name
       FROM inv_users u
       LEFT JOIN inv_roles r ON u.role_id = r.id
       WHERE u.id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      user: result.rows[0]
    });

  } catch (error) {
    console.error('GET ME ERROR:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Could not retrieve user',
      error: error.message
    });
  }
};
