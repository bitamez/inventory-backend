import pool from '../config/db.js';

class Sale {
  static async findAll() {
    const result = await pool.query(`
      SELECT s.*, 
             prep.full_name AS prepared_by_name, 
             appr.full_name AS approved_by_name
      FROM sales s
      LEFT JOIN users prep ON s.prepared_by = prep.id
      LEFT JOIN users appr ON s.approved_by = appr.id
      ORDER BY s.created_at DESC
    `);
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query(`
      SELECT s.*, 
             prep.full_name AS prepared_by_name, 
             appr.full_name AS approved_by_name
      FROM sales s
      LEFT JOIN users prep ON s.prepared_by = prep.id
      LEFT JOIN users appr ON s.approved_by = appr.id
      WHERE s.id = $1
    `, [id]);
    return result.rows[0];
  }

  static async getSaleItems(saleId) {
    const result = await pool.query(`
      SELECT si.*, p.product_name, p.sku
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
      WHERE si.sale_id = $1
    `, [saleId]);
    return result.rows;
  }
}

export default Sale;
