import pool from '../config/db.js';

class Product {
  static async findAll() {
    const result = await pool.query(
      'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.created_at DESC'
    );
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query(
      'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async create(data) {
    const { sku, product_name, description, category_id, cost_price, selling_price, unit_of_measure, stock_quantity, minimum_stock } = data;
    const result = await pool.query(
      `INSERT INTO products (sku, product_name, description, category_id, cost_price, selling_price, unit_of_measure, stock_quantity, minimum_stock) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        sku === '' ? null : sku, 
        product_name === '' ? null : product_name, 
        description === '' ? null : description, 
        category_id === '' ? null : category_id, 
        cost_price === '' ? null : cost_price, 
        selling_price === '' ? null : selling_price, 
        unit_of_measure === '' ? null : unit_of_measure, 
        stock_quantity === '' ? null : stock_quantity, 
        minimum_stock === '' ? null : minimum_stock
      ]
    );
    return result.rows[0];
  }

  static async update(id, data) {
    const { sku, product_name, description, category_id, cost_price, selling_price, unit_of_measure, stock_quantity, minimum_stock, is_active } = data;
    const result = await pool.query(
      `UPDATE products 
       SET sku = COALESCE($1, sku), 
           product_name = COALESCE($2, product_name), 
           description = $3, 
           category_id = COALESCE($4, category_id), 
           cost_price = COALESCE($5, cost_price), 
           selling_price = COALESCE($6, selling_price), 
           unit_of_measure = COALESCE($7, unit_of_measure),
           stock_quantity = COALESCE($8, stock_quantity), 
           minimum_stock = COALESCE($9, minimum_stock),
           is_active = COALESCE($10, is_active)
       WHERE id = $11 RETURNING *`,
      [
        sku === '' ? null : sku, 
        product_name === '' ? null : product_name, 
        description === '' ? null : description, 
        category_id === '' ? null : category_id, 
        cost_price === '' ? null : cost_price, 
        selling_price === '' ? null : selling_price, 
        unit_of_measure === '' ? null : unit_of_measure, 
        stock_quantity === '' ? null : stock_quantity, 
        minimum_stock === '' ? null : minimum_stock, 
        is_active, 
        id
      ]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
}

export default Product;
