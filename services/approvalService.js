import pool from '../config/db.js';

export const processApprovalService = async ({ approval_id, action, reviewed_by, manager_notes }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const approval = await client.query(
      'SELECT * FROM approvals WHERE id = $1 FOR UPDATE',
      [approval_id]
    );
    if (!approval.rows.length) throw new Error('Approval record not found');
    if (approval.rows[0].status !== 'pending') throw new Error('Approval has already been processed');

    const newApprovalStatus = action === 'approve' ? 'approved' : 'rejected';
    const newSaleStatus     = action === 'approve' ? 'completed' : 'rejected';

    await client.query(
      `UPDATE approvals
       SET status=$1, reviewed_by=$2, manager_notes=$3, reviewed_at=NOW()
       WHERE id=$4`,
      [newApprovalStatus, reviewed_by, manager_notes, approval_id]
    );

    await client.query(
      `UPDATE sales SET status=$1, approved_by=$2 WHERE id=$3`,
      [newSaleStatus, reviewed_by, approval.rows[0].sale_id]
    );

    if (action === 'reject') {
      const items = await client.query(
        'SELECT * FROM sale_items WHERE sale_id = $1',
        [approval.rows[0].sale_id]
      );
      for (const item of items.rows) {
        
        await client.query(
          'UPDATE products SET stock_quantity = stock_quantity + $1 WHERE id = $2',
          [item.quantity, item.product_id]
        );
       
        await client.query(
          `INSERT INTO stock_transactions (product_id, transaction_type, quantity, reference_id, performed_by, notes)
           VALUES ($1, 'stock_in', $2, $3, $4, 'Stock restored — sale rejected by manager')`,
          [item.product_id, item.quantity, approval.rows[0].sale_id, reviewed_by]
        );
      }
    }

    await client.query('COMMIT');
    return { success: true, action, sale_id: approval.rows[0].sale_id };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const getAllApprovalsService = async () => {
  const result = await pool.query('SELECT * FROM pending_approvals_view');
  return result.rows;
};
