import pool from '../config/db.js';

class SaleItem {
  static async findBySale(saleId) {
    const result = await pool.query(`
      SELECT si.*,
             p.product_name, p.sku, p.unit_of_measure,
             p.cost_price
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
      WHERE si.sale_id = $1
      ORDER BY si.id ASC
    `, [saleId]);
    return result.rows;
  }

  static async create(client, { sale_id, product_id, quantity, unit_price, discount_percent = 0 }) {
    const subtotal = parseFloat((quantity * unit_price * (1 - discount_percent / 100)).toFixed(2));
    const result = await client.query(`
      INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, discount_percent, subtotal)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
    `, [sale_id, product_id, quantity, unit_price, discount_percent, subtotal]);
    return result.rows[0];
  }

  static async deleteAll(saleId) {
    await pool.query('DELETE FROM sale_items WHERE sale_id = $1', [saleId]);
  }
}

export default SaleItem;
