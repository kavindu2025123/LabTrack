const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const notificationController = require('../controllers/notificationController');

router.get('/', authMiddleware, notificationController.list);
router.post('/', authMiddleware, notificationController.create);
router.put('/:id/read', authMiddleware, notificationController.markRead);

module.exports = router;
