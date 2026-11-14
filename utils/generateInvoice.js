
export const generateInvoiceNumber = (sequenceNumber) => {
  const year = new Date().getFullYear();
  const seq = String(sequenceNumber).padStart(6, '0');
  return `INV-${year}-${seq}`;
};


import pool from '../config/db.js';

export const getNextInvoiceNumber = async () => {
  const result = await pool.query(`
    SELECT COUNT(*) + 1 AS next_seq FROM sales
  `);
  const seq = result.rows[0].next_seq;
  return generateInvoiceNumber(seq);
};
