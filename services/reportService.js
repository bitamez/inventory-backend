import pool from '../config/db.js';

export const getDailyReportService = async () => {
  const result = await pool.query('SELECT * FROM daily_sales_report LIMIT 30');
  return result.rows;
};

export const getMonthlyReportService = async () => {
  const result = await pool.query('SELECT * FROM monthly_sales_report LIMIT 12');
  return result.rows;
};

export const getStockReportService = async () => {
  const result = await pool.query('SELECT * FROM stock_level_report');
  return result.rows;
};

export const getTopProductsService = async () => {
  const result = await pool.query(`
    SELECT
      p.product_name,
      p.sku,
      p.category,
      SUM(si.quantity)   AS total_units_sold,
      SUM(si.line_total) AS total_revenue
    FROM sale_items si
    JOIN products p ON si.product_id = p.id
    JOIN sales s ON si.sale_id = s.id
    WHERE s.status = 'completed'
    GROUP BY p.id, p.product_name, p.sku, p.category
    ORDER BY total_revenue DESC
    LIMIT 10
  `);
  return result.rows;
};
