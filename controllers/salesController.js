import { createSaleService, getAllSalesService } from '../services/salesService.js';
import Sale from '../models/Sale.js';

export const getSales = async (req, res) => {
  try {
    const data = await getAllSalesService();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSaleById = async (req, res) => {
  try {
    const { id } = req.params;
    const sale = await Sale.findById(id);
    if (!sale) return res.status(404).json({ success: false, message: 'Sale not found' });

    const items = await Sale.getSaleItems(id);
    res.status(200).json({ success: true, data: { ...sale, items } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createSale = async (req, res) => {
  try {
    const prepared_by = req.user?.id;  
    const data = await createSaleService({ ...req.body, prepared_by });
    res.status(201).json({ success: true, data, message: 'Sale created successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
