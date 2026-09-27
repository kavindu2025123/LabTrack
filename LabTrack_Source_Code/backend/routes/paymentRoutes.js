const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const paymentController = require('../controllers/paymentController');

router.get('/fines', authMiddleware, paymentController.listFines);
router.post(
  '/fines',
  authMiddleware,
  roleMiddleware(['Technical_Officer', 'Admin']),
  paymentController.createFine
);
router.post(
  '/fines/:id/pay',
  authMiddleware,
  roleMiddleware(['Student']),
  paymentController.payFine
);

module.exports = router;
