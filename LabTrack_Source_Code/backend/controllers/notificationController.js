const notificationService = require('../services/notificationService');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  res.json(notificationService.getUserNotifications(req.user.user_id));
});

const create = asyncHandler(async (req, res) => {
  res.status(201).json(notificationService.createNotification(req.body));
});

const markRead = asyncHandler(async (req, res) => {
  res.json(notificationService.markAsRead(req.params.id));
});

module.exports = { list, create, markRead };
