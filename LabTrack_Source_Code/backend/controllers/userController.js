const userService = require('../services/userService');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  res.json(await userService.listUsers());
});

const getOne = asyncHandler(async (req, res) => {
  res.json(await userService.getUser(req.params.id));
});

const create = asyncHandler(async (req, res) => {
  res.status(201).json(await userService.createUser(req.body));
});

const update = asyncHandler(async (req, res) => {
  res.json(await userService.updateUser(req.params.id, req.body));
});

const remove = asyncHandler(async (req, res) => {
  res.json(await userService.deleteUser(req.params.id));
});

module.exports = { list, getOne, create, update, remove };
