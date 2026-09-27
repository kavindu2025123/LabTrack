const equipmentService = require('../services/equipmentService');
const asyncHandler = require('../utils/asyncHandler');

const listCategories = asyncHandler(async (req, res) => {
  res.json(await equipmentService.listCategories());
});

const createCategory = asyncHandler(async (req, res) => {
  res.status(201).json(await equipmentService.createCategory(req.body.name));
});

const updateCategory = asyncHandler(async (req, res) => {
  res.json(await equipmentService.updateCategory(req.params.id, req.body.name));
});

const deleteCategory = asyncHandler(async (req, res) => {
  res.json(await equipmentService.deleteCategory(req.params.id));
});

const list = asyncHandler(async (req, res) => {
  res.json(await equipmentService.listEquipment(req.query.lab_id));
});

const getOne = asyncHandler(async (req, res) => {
  res.json(await equipmentService.getEquipment(req.params.id));
});

const create = asyncHandler(async (req, res) => {
  res.status(201).json(await equipmentService.createEquipment(req.user, req.body));
});

const update = asyncHandler(async (req, res) => {
  res.json(await equipmentService.updateEquipment(req.user, req.params.id, req.body));
});

const remove = asyncHandler(async (req, res) => {
  res.json(await equipmentService.deleteEquipment(req.user, req.params.id));
});

module.exports = {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  list,
  getOne,
  create,
  update,
  remove,
};
