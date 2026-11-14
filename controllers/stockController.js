import StockTransaction from '../models/StockTransaction.js';

export const getStockTransactions = async (req, res) => {
  try {
    const data = await StockTransaction.findAll();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStockTransactionById = async (req, res) => {
  try {
    const tx = await StockTransaction.findById(req.params.id);
    if (!tx) return res.status(404).json({ success: false, message: 'Transaction not found' });
    res.status(200).json({ success: true, data: tx });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addStock = async (req, res) => {
  try {
    const { product_id, transaction_type, quantity_change, reference_note } = req.body;
    const performed_by = req.user?.id;

    if (!product_id || !transaction_type || !quantity_change) {
      return res.status(400).json({ success: false, message: 'product_id, transaction_type, and quantity_change are required' });
    }

    if (!['stock_in', 'stock_out', 'adjustment'].includes(transaction_type)) {
      return res.status(400).json({ success: false, message: 'transaction_type must be stock_in, stock_out, or adjustment' });
    }

    const data = await StockTransaction.create({ product_id, transaction_type, quantity_change, performed_by, reference_note });
    res.status(201).json({ success: true, data, message: 'Stock transaction recorded successfully' });
  } catch (error) {
    if (error.code === '23514') {
      return res.status(400).json({ success: false, message: 'Transaction failed: Insufficient stock available.' });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getStockByProduct = async (req, res) => {
  try {
    const data = await StockTransaction.findByProduct(req.params.productId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
