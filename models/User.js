import pool from '../config/db.js';

class User {
  static async findAll() {
    const result = await pool.query(`
      SELECT u.id, u.full_name, u.email, u.is_active, u.created_at, r.role_name 
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      ORDER BY u.created_at DESC
    `);
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query(
      `SELECT u.id, u.full_name, u.email, u.is_active, u.created_at, r.role_name 
       FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  }

  static async create(data) {
    const { id, full_name, email, password, role_id } = data;
    const result = await pool.query(
      `INSERT INTO users (id, full_name, email, password, role_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, full_name, email, is_active, created_at`,
      [id, full_name, email, password, role_id]
    );
    return result.rows[0];
  }

  static async update(id, data) {
    const { full_name, role_id, is_active } = data;
    const result = await pool.query(
      `UPDATE users SET 
        full_name = COALESCE($1, full_name),
        role_id = COALESCE($2, role_id),
        is_active = COALESCE($3, is_active)
       WHERE id = $4 RETURNING id, full_name, email, is_active`,
      [full_name, role_id, is_active, id]
    );
    return result.rows[0];
  }

  static async deactivate(id) {
    const result = await pool.query(
      `UPDATE users SET is_active = false WHERE id = $1 RETURNING id, full_name, is_active`,
      [id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query(
      `DELETE FROM users WHERE id = $1 RETURNING id`,
      [id]
    );
    return result.rows[0];
  }
}

export default User;
