const departmentService = require('../services/departmentService');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  res.json(await departmentService.listDepartments());
});

const create = asyncHandler(async (req, res) => {
  res.status(201).json(await departmentService.createDepartment(req.body.name));
});

const update = asyncHandler(async (req, res) => {
  res.json(await departmentService.updateDepartment(req.params.id, req.body.name));
});

const remove = asyncHandler(async (req, res) => {
  res.json(await departmentService.deleteDepartment(req.params.id));
});

module.exports = { list, create, update, remove };
