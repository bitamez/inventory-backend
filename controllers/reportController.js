import Report from '../models/Report.js';

export const getStockReport = async (req, res) => {
  try {
    const data = await Report.getStockStatus();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDailyReport = async (req, res) => {
  try {
    const { days } = req.query;
    const data = await Report.getDailyReport(days ? parseInt(days) : 30);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getYearlySummary = async (req, res) => {
  try {
    const { year } = req.query;
    const data = await Report.getYearlySummary(year ? parseInt(year) : null);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMonthlyReport = async (req, res) => {
  try {
    const { year, month } = req.query;
    const data = await Report.getMonthlySummary(year, month);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTopProducts = async (req, res) => {
  try {
    const { limit } = req.query;
    const data = await Report.getTopProducts(limit ? parseInt(limit) : 10);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
