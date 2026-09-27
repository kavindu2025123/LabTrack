const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const laboratoryController = require('../controllers/laboratoryController');

router.get('/', authMiddleware, laboratoryController.list);

// Must be BEFORE '/:id' so they aren't swallowed by the id route
router.get(
  '/available-officers',
  authMiddleware,
  roleMiddleware(['Admin']),
  laboratoryController.availableOfficers
);
router.get(
  '/my-lab',
  authMiddleware,
  roleMiddleware(['Technical_Officer']),
  laboratoryController.myLab
);

router.get('/:id', authMiddleware, laboratoryController.getOne);
router.post('/', authMiddleware, roleMiddleware(['Admin']), laboratoryController.create);
router.put('/:id', authMiddleware, roleMiddleware(['Admin']), laboratoryController.update);
router.delete('/:id', authMiddleware, roleMiddleware(['Admin']), laboratoryController.remove);

module.exports = router;
