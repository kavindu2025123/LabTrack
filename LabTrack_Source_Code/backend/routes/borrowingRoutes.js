const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const borrowingController = require('../controllers/borrowingController');

router.get('/', authMiddleware, borrowingController.list);
router.post(
  '/issue',
  authMiddleware,
  roleMiddleware(['Technical_Officer']),
  borrowingController.issue
);
router.put(
  '/:id/return',
  authMiddleware,
  roleMiddleware(['Technical_Officer']),
  borrowingController.returnEquipment
);

module.exports = router;
