const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const reservationController = require('../controllers/reservationController');

router.get('/', authMiddleware, reservationController.list);
router.get('/:id', authMiddleware, reservationController.getOne);
router.post('/', authMiddleware, roleMiddleware(['Student']), reservationController.create);
router.put(
  '/:id/approve',
  authMiddleware,
  roleMiddleware(['Technical_Officer']),
  reservationController.approve
);
router.put(
  '/:id/reject',
  authMiddleware,
  roleMiddleware(['Technical_Officer']),
  reservationController.reject
);

module.exports = router;
