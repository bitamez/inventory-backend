import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: 'postgresql://postgres.qprfuegtjhjietpjkcek:Messi%407962M@aws-0-eu-west-1.pooler.supabase.com:6543/postgres'
});

async function checkProducts() {
  try {
    const res = await pool.query('SELECT COUNT(*) FROM products');
    console.log('Product count:', res.rows[0].count);
  } catch (err) {
    console.error('Error fetching products:', err);
  } finally {
    await pool.end();
  }
}

checkProducts();
