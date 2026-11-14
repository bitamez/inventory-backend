import pool from '../config/db.js';

class Approval {
  static async findAll() {
    const result = await pool.query(`
      SELECT a.*,
             s.invoice_number, s.total_amount, s.customer_name,
             prep.full_name AS requested_by_name,
             appr.full_name AS reviewed_by_name
      FROM approvals a
      JOIN sales s ON a.sale_id = s.id
      LEFT JOIN users prep ON a.requested_by = prep.id
      LEFT JOIN users appr ON a.reviewed_by = appr.id
      ORDER BY a.requested_at DESC
    `);
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query(`
      SELECT a.*,
             s.invoice_number, s.total_amount, s.customer_name,
             prep.full_name AS requested_by_name,
             appr.full_name AS reviewed_by_name
      FROM approvals a
      JOIN sales s ON a.sale_id = s.id
      LEFT JOIN users prep ON a.requested_by = prep.id
      LEFT JOIN users appr ON a.reviewed_by = appr.id
      WHERE a.id = $1
    `, [id]);
    return result.rows[0] || null;
  }

  static async findPending() {
    const result = await pool.query(`
      SELECT a.*,
             s.invoice_number, s.total_amount, s.customer_name,
             prep.full_name AS requested_by_name
      FROM approvals a
      JOIN sales s ON a.sale_id = s.id
      LEFT JOIN users prep ON a.requested_by = prep.id
      WHERE a.status = 'pending'
      ORDER BY a.requested_at DESC
    `);
    return result.rows;
  }

  static async process(id, { approval_status, review_note, reviewed_by }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Update approval record using correct column names
      const result = await client.query(`
        UPDATE approvals
        SET status = $1, manager_notes = $2, reviewed_by = $3, reviewed_at = NOW()
        WHERE id = $4 RETURNING *
      `, [approval_status, review_note || null, reviewed_by, id]);

      if (!result.rows[0]) throw new Error('Approval not found');

      const saleStatus = approval_status === 'approved' ? 'completed' : 'rejected';
      await client.query(`UPDATE sales SET status = $1 WHERE id = $2`, [saleStatus, result.rows[0].sale_id]);

      // If rejected — restore stock
      if (approval_status === 'rejected') {
        const saleId = result.rows[0].sale_id;

        const saleRes = await client.query(`SELECT invoice_number FROM sales WHERE id = $1`, [saleId]);
        const invoiceNumber = saleRes.rows[0]?.invoice_number || 'Unknown';

        const itemsRes = await client.query(`SELECT product_id, quantity FROM sale_items WHERE sale_id = $1`, [saleId]);

        for (const item of itemsRes.rows) {
          await client.query(
            `UPDATE products SET stock_quantity = stock_quantity + $1 WHERE id = $2`,
            [item.quantity, item.product_id]
          );
          await client.query(
            `INSERT INTO stock_transactions (product_id, transaction_type, quantity, notes, performed_by)
             VALUES ($1, 'stock_in', $2, $3, $4)`,
            [item.product_id, item.quantity, `Restored — Sale Rejected (${invoiceNumber})`, reviewed_by]
          );
        }
      }

      await client.query('COMMIT');
      return result.rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}

export default Approval;
