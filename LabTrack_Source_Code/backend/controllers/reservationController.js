const reservationService = require('../services/reservationService');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  res.json(await reservationService.listReservations(req.user, req.query.lab_id));
});

const getOne = asyncHandler(async (req, res) => {
  res.json(await reservationService.getReservation(req.params.id));
});

const create = asyncHandler(async (req, res) => {
  res.status(201).json(await reservationService.createReservation(req.user, req.body));
});

const approve = asyncHandler(async (req, res) => {
  res.json(await reservationService.approveReservation(req.params.id));
});

const reject = asyncHandler(async (req, res) => {
  res.json(await reservationService.rejectReservation(req.params.id));
});

module.exports = { list, getOne, create, approve, reject };
