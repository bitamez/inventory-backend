import Category from '../models/Category.js';
import pool from '../config/db.js';

export const getCategories = async (req, res) => {
  try {
    const data = await Category.findAll();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const data = await Category.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};


export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const checkProducts = await pool.query('SELECT id FROM products WHERE category_id = $1 LIMIT 1', [id]);
    if (checkProducts.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Cannot delete category in use by products' });
    }

    const deleted = await Category.delete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    
    res.status(200).json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};
