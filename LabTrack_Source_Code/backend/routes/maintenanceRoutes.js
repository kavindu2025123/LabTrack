const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const maintenanceController = require('../controllers/maintenanceController');

router.get('/', authMiddleware, maintenanceController.list);
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['Technical_Officer', 'Admin']),
  maintenanceController.report
);
router.put(
  '/:id/resolve',
  authMiddleware,
  roleMiddleware(['Technical_Officer', 'Admin']),
  maintenanceController.resolve
);

module.exports = router;
