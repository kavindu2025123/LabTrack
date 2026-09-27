const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const departmentController = require('../controllers/departmentController');

router.get('/', authMiddleware, departmentController.list);
router.post('/', authMiddleware, roleMiddleware(['Admin']), departmentController.create);
router.put('/:id', authMiddleware, roleMiddleware(['Admin']), departmentController.update);
router.delete('/:id', authMiddleware, roleMiddleware(['Admin']), departmentController.remove);

module.exports = router;
