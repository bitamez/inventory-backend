import pool from './config/db.js';

const run = async () => {
  try {
    const cols = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'approvals' 
      ORDER BY ordinal_position
    `);
    console.log('APPROVALS COLUMNS:');
    cols.rows.forEach(r => console.log(' -', r.column_name, ':', r.data_type));

    const data = await pool.query('SELECT * FROM approvals ORDER BY created_at DESC LIMIT 5');
    console.log('\nAPPROVALS DATA:', JSON.stringify(data.rows, null, 2));
    
    const stCols = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'stock_transactions' 
      ORDER BY ordinal_position
    `);
    console.log('\nSTOCK_TRANSACTIONS COLUMNS:');
    stCols.rows.forEach(r => console.log(' -', r.column_name, ':', r.data_type));
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
};

run();
