const maintenanceService = require('../services/maintenanceService');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const { status, equipment_id, lab_id } = req.query;
  res.json(await maintenanceService.listTickets({ status, equipment_id, lab_id }));
});

const report = asyncHandler(async (req, res) => {
  res.status(201).json(await maintenanceService.reportIssue(req.user, req.body));
});

const resolve = asyncHandler(async (req, res) => {
  res.json(await maintenanceService.resolveTicket(req.user, req.params.id));
});

module.exports = { list, report, resolve };
