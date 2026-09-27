const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const userController = require('../controllers/userController');

router.get('/', authMiddleware, roleMiddleware(['Admin']), userController.list);
router.get('/:id', authMiddleware, roleMiddleware(['Admin']), userController.getOne);
router.post('/', authMiddleware, roleMiddleware(['Admin']), userController.create);
router.put('/:id', authMiddleware, roleMiddleware(['Admin']), userController.update);
router.delete('/:id', authMiddleware, roleMiddleware(['Admin']), userController.remove);

module.exports = router;
