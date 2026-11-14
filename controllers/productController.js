import Product from '../models/Product.js';

export const getProducts = async (req, res) => {
  try {
    const data = await Product.findAll();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { selling_price, stock_quantity, minimum_stock } = req.body;
    
    if (Number(selling_price) < 0) return res.status(400).json({ success: false, message: 'Selling price cannot be negative' });
    if (Number(stock_quantity) < 0) return res.status(400).json({ success: false, message: 'Stock quantity cannot be negative' });
    if (Number(minimum_stock) < 0) return res.status(400).json({ success: false, message: 'Minimum stock cannot be negative' });

    const newProduct = await Product.create(req.body);
    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    if (error.code === '23505' && error.constraint === 'products_sku_key') {
      return res.status(400).json({ success: false, message: 'SKU already exists. Please use a unique SKU.' });
    }
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};


export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { selling_price, stock_quantity, minimum_stock } = req.body;
    
    if (selling_price !== undefined && Number(selling_price) < 0) {
      return res.status(400).json({ success: false, message: 'Selling price cannot be negative' });
    }
    if (stock_quantity !== undefined && Number(stock_quantity) < 0) {
      return res.status(400).json({ success: false, message: 'Stock quantity cannot be negative' });
    }
    if (minimum_stock !== undefined && Number(minimum_stock) < 0) {
      return res.status(400).json({ success: false, message: 'Minimum stock cannot be negative' });
    }

    const updatedProduct = await Product.update(id, req.body);
    
    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    res.status(200).json({ success: true, data: updatedProduct });
  } catch (error) {
    if (error.code === '23505' && error.constraint === 'products_sku_key') {
      return res.status(400).json({ success: false, message: 'SKU already exists. Please use a unique SKU.' });
    }
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Product.delete(id);
    
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};
