import { supabase } from '../config/supabase.js';
import pool from '../config/db.js';

export const loginService = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);

  const profile = await pool.query(
    `SELECT p.*, r.role_name FROM users p LEFT JOIN roles r ON p.role_id = r.id WHERE p.id = $1`,
    [data.user.id]
  );

  return { token: data.session.access_token, user: data.user, profile: profile.rows[0] };
};

export const registerService = async ({ full_name, email, password, role_id }) => {
  const { data, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) throw new Error(error.message);

  const profile = await pool.query(
    `INSERT INTO users (id, full_name, email, password, role_id) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [data.user.id, full_name, email, password, role_id]
  );

  return profile.rows[0];
};


export const getProfileService = async (userId) => {
  const result = await pool.query(
    `SELECT p.*, r.role_name FROM users p LEFT JOIN roles r ON p.role_id = r.id WHERE p.id = $1`,
    [userId]
  );
  if (!result.rows.length) throw new Error('Profile not found');
  return result.rows[0];
};
