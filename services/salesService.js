import pool from '../config/db.js';
import { getNextInvoiceNumber } from '../utils/generateInvoice.js';

const APPROVAL_THRESHOLD = 50000; 

export const createSaleService = async ({
  customer_name,
  prepared_by,   
  discount_percentage = 0,
  vat_percentage = 15,
  items,
}) => {
  if (!items || items.length === 0) {
    throw new Error('Sale must contain at least one item');
  }
  if (discount_percentage < 0 || discount_percentage > 100) {
    throw new Error('Discount percentage must be between 0 and 100');
  }
  if (vat_percentage < 0) {
    throw new Error('VAT percentage cannot be negative');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    let subtotal = 0;
    for (const item of items) {
      const product = await client.query(
        'SELECT * FROM products WHERE id = $1 AND is_active = TRUE FOR UPDATE',
        [item.product_id]
      );
      if (!product.rows.length) throw new Error(`Product ID ${item.product_id} not found or inactive`);
      if (Number(item.quantity) <= 0) {
        throw new Error(`Quantity for "${product.rows[0].product_name}" must be greater than zero`);
      }
      if (product.rows[0].stock_quantity < item.quantity) {
        throw new Error(`Insufficient stock for "${product.rows[0].product_name}". Available: ${product.rows[0].stock_quantity}, Requested: ${item.quantity}`);
      }
    
      if (!item.unit_price) item.unit_price = product.rows[0].selling_price;
      subtotal += Number(item.unit_price) * Number(item.quantity);
    }
    const discount_amount  = (subtotal * discount_percentage) / 100;
    const taxable_amount   = subtotal - discount_amount;
    const vat_amount       = (taxable_amount * vat_percentage) / 100;
    const total_amount     = taxable_amount + vat_amount;
    const needs_approval   = total_amount > APPROVAL_THRESHOLD;
    const status           = needs_approval ? 'pending_approval' : 'completed';
    const invoice_number = await getNextInvoiceNumber();
    const sale = await client.query(
      `INSERT INTO sales
         (invoice_number, customer_name, prepared_by,
          subtotal, discount_percentage, discount_amount,
          taxable_amount, vat_percentage, vat_amount,
          total_amount, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [
        invoice_number, customer_name, prepared_by,
        subtotal.toFixed(2), discount_percentage, discount_amount.toFixed(2),
        taxable_amount.toFixed(2), vat_percentage, vat_amount.toFixed(2),
        total_amount.toFixed(2), status,
      ]
    );
    const sale_id = sale.rows[0].id;

    for (const item of items) {
      const line_total = Number(item.unit_price) * Number(item.quantity);
      await client.query(
        `INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, line_total)
         VALUES ($1,$2,$3,$4,$5)`,
        [sale_id, item.product_id, item.quantity, item.unit_price, line_total.toFixed(2)]
      );
      await client.query(
        `UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2`,
        [item.quantity, item.product_id]
      );
      await client.query(
        `INSERT INTO stock_transactions (product_id, transaction_type, quantity, reference_id, performed_by, notes)
         VALUES ($1, 'stock_out', $2, $3, $4, $5)`,
        [item.product_id, item.quantity, sale_id, prepared_by, `Sold — Invoice ${invoice_number}`]
      );
    }

    if (needs_approval) {
      await client.query(
        `INSERT INTO approvals (sale_id, requested_by) VALUES ($1, $2)`,
        [sale_id, prepared_by]
      );
    }

    if (customer_name === 'TEST_ROLLBACK') {
      throw new Error("Simulated system crash! Transaction ROLLBACK triggered successfully.");
    }

    await client.query('COMMIT');
    return sale.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const getAllSalesService = async () => {
  
  const result = await pool.query(`
    SELECT s.*,
           prep.full_name  AS prepared_by_name,
           appr.full_name  AS approved_by_name
    FROM sales s
    LEFT JOIN users prep ON s.prepared_by = prep.id
    LEFT JOIN users appr ON s.approved_by = appr.id
    ORDER BY s.created_at DESC
  `);
  return result.rows;
};
