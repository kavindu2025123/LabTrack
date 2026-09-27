const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const equipmentController = require('../controllers/equipmentController');

// Categories - must be BEFORE '/' and '/:id' below
router.get('/categories', authMiddleware, equipmentController.listCategories);
router.post(
  '/categories',
  authMiddleware,
  roleMiddleware(['Admin', 'Technical_Officer']),
  equipmentController.createCategory
);
router.put(
  '/categories/:id',
  authMiddleware,
  roleMiddleware(['Admin', 'Technical_Officer']),
  equipmentController.updateCategory
);
router.delete(
  '/categories/:id',
  authMiddleware,
  roleMiddleware(['Admin', 'Technical_Officer']),
  equipmentController.deleteCategory
);

// Equipment
router.get('/', authMiddleware, equipmentController.list);
router.get('/:id', authMiddleware, equipmentController.getOne);
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['Admin', 'Technical_Officer']),
  equipmentController.create
);
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(['Admin', 'Technical_Officer']),
  equipmentController.update
);
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(['Admin', 'Technical_Officer']),
  equipmentController.remove
);

module.exports = router;
