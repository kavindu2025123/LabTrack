const paymentService = require('../services/paymentService');
const asyncHandler = require('../utils/asyncHandler');

const listFines = asyncHandler(async (req, res) => {
  res.json(await paymentService.listFines(req.user));
});

const createFine = asyncHandler(async (req, res) => {
  res.status(201).json(await paymentService.createFine(req.body));
});

const payFine = asyncHandler(async (req, res) => {
  res.json(await paymentService.payFine(req.user, req.params.id, req.body.stripe_payment_id));
});

module.exports = { listFines, createFine, payFine };
