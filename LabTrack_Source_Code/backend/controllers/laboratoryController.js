const laboratoryService = require('../services/laboratoryService');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  res.json(await laboratoryService.listLaboratories());
});

const availableOfficers = asyncHandler(async (req, res) => {
  res.json(await laboratoryService.listAvailableOfficers());
});

const myLab = asyncHandler(async (req, res) => {
  res.json(await laboratoryService.getMyLab(req.user.user_id));
});

const getOne = asyncHandler(async (req, res) => {
  res.json(await laboratoryService.getLaboratory(req.params.id));
});

const create = asyncHandler(async (req, res) => {
  res.status(201).json(await laboratoryService.createLaboratory(req.body));
});

const update = asyncHandler(async (req, res) => {
  res.json(await laboratoryService.updateLaboratory(req.params.id, req.body));
});

const remove = asyncHandler(async (req, res) => {
  res.json(await laboratoryService.deleteLaboratory(req.params.id));
});

module.exports = { list, availableOfficers, myLab, getOne, create, update, remove };
