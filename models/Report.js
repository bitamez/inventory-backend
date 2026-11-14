import pool from '../config/db.js';

class Report {
  static async getStockStatus() {
    const result = await pool.query(`
      SELECT p.id, p.sku, p.product_name, p.stock_quantity, p.minimum_stock, p.selling_price,
             (p.stock_quantity * p.selling_price) AS stock_value,
             c.name AS category_name,
             CASE
               WHEN p.stock_quantity = 0 THEN 'out_of_stock'
               WHEN p.stock_quantity <= p.minimum_stock THEN 'low_stock'
               ELSE 'in_stock'
             END AS stock_status
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = true
      ORDER BY p.stock_quantity ASC
    `);
    return result.rows;
  }

  // Returns per-day totals for the last N days (used by DailyReport page)
  static async getDailyReport(days = 30) {
    const result = await pool.query(`
      SELECT
        DATE(created_at) AS sale_date,
        COUNT(*) AS total_transactions,
        COALESCE(SUM(total_amount), 0) AS total_revenue,
        COALESCE(SUM(vat_amount), 0) AS total_vat_collected
      FROM sales
      WHERE status = 'completed'
        AND created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      ORDER BY sale_date DESC
    `);
    return result.rows;
  }

  // Returns monthly revenue totals for a given year (used by Reports overview)
  static async getYearlySummary(year) {
    const targetYear = year || new Date().getFullYear();
    const result = await pool.query(`
      SELECT
        EXTRACT(MONTH FROM created_at) AS month_num,
        TO_CHAR(created_at, 'Mon') AS month_label,
        COALESCE(SUM(total_amount), 0) AS revenue
      FROM sales
      WHERE EXTRACT(YEAR FROM created_at) = $1
        AND status = 'completed'
      GROUP BY month_num, month_label
      ORDER BY month_num ASC
    `, [targetYear]);
    return result.rows;
  }

  static async getMonthlySummary(year, month) {
    const now = new Date();
    const targetYear = year || now.getFullYear();
    const targetMonth = month || now.getMonth() + 1;
    const result = await pool.query(`
      SELECT
        DATE(created_at) AS sale_date,
        COUNT(*) AS transaction_count,
        COALESCE(SUM(total_amount), 0) AS daily_revenue
      FROM sales
      WHERE EXTRACT(YEAR FROM created_at) = $1
        AND EXTRACT(MONTH FROM created_at) = $2
        AND status = 'completed'
      GROUP BY DATE(created_at)
      ORDER BY sale_date ASC
    `, [targetYear, targetMonth]);
    return result.rows;
  }

  static async getTopProducts(limit = 10) {
    const result = await pool.query(`
      SELECT p.product_name, p.sku,
             SUM(si.quantity) AS total_sold,
             SUM(si.subtotal) AS total_revenue
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
      JOIN sales s ON si.sale_id = s.id
      WHERE s.status = 'completed'
      GROUP BY p.id, p.product_name, p.sku
      ORDER BY total_sold DESC
      LIMIT $1
    `, [limit]);
    return result.rows;
  }
}

export default Report;
