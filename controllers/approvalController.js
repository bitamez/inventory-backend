import Approval from '../models/Approval.js';

export const getApprovals = async (req, res) => {
  try {
    const data = await Approval.findAll();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPendingApprovals = async (req, res) => {
  try {
    const data = await Approval.findPending();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getApprovalById = async (req, res) => {
  try {
    const approval = await Approval.findById(req.params.id);
    if (!approval) return res.status(404).json({ success: false, message: 'Approval not found' });
    res.status(200).json({ success: true, data: approval });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const processApproval = async (req, res) => {
  try {
    const { approval_status, manager_notes } = req.body;
    const reviewed_by = req.user?.id;

    if (!['approved', 'rejected'].includes(approval_status)) {
      return res.status(400).json({ success: false, message: 'Status must be "approved" or "rejected"' });
    }

    const data = await Approval.process(req.params.id, { approval_status, review_note: manager_notes, reviewed_by });
    res.status(200).json({ success: true, data, message: `Sale ${approval_status} successfully` });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
