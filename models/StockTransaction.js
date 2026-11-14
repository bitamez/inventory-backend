import pool from '../config/db.js';

class StockTransaction {
  static async findAll() {
    const result = await pool.query(`
      SELECT st.*, p.product_name, p.sku, u.full_name AS performed_by_name
      FROM stock_transactions st
      LEFT JOIN products p ON st.product_id = p.id
      LEFT JOIN users u ON st.performed_by = u.id
      ORDER BY st.created_at DESC
    `);
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query(`
      SELECT st.*, p.product_name, p.sku, u.full_name AS performed_by_name
      FROM stock_transactions st
      LEFT JOIN products p ON st.product_id = p.id
      LEFT JOIN users u ON st.performed_by = u.id
      WHERE st.id = $1
    `, [id]);
    return result.rows[0] || null;
  }

  static async create({ product_id, transaction_type, quantity_change, performed_by, reference_note }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Insert the transaction record
      const txResult = await client.query(`
        INSERT INTO stock_transactions (product_id, transaction_type, quantity, performed_by, notes)
        VALUES ($1, $2, $3, $4, $5) RETURNING *
      `, [product_id, transaction_type, Math.abs(quantity_change), performed_by, reference_note]);

      // Update the product stock quantity
      const delta = transaction_type === 'stock_out' ? -Math.abs(quantity_change) : Math.abs(quantity_change);
      await client.query(`
        UPDATE products SET stock_quantity = stock_quantity + $1 WHERE id = $2
      `, [delta, product_id]);

      await client.query('COMMIT');
      return txResult.rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  static async findByProduct(productId) {
    const result = await pool.query(`
      SELECT st.*, u.full_name AS performed_by_name
      FROM stock_transactions st
      LEFT JOIN users u ON st.performed_by = u.id
      WHERE st.product_id = $1
      ORDER BY st.created_at DESC
    `, [productId]);
    return result.rows;
  }
}

export default StockTransaction;
