const borrowingService = require('../services/borrowingService');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  res.json(await borrowingService.listBorrowings(req.user));
});

const issue = asyncHandler(async (req, res) => {
  res.status(201).json(await borrowingService.issueEquipment(req.user, req.body));
});

const returnEquipment = asyncHandler(async (req, res) => {
  res.json(await borrowingService.returnEquipment(req.params.id));
});

module.exports = { list, issue, returnEquipment };
