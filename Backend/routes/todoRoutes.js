const express = require('express');
const router = express.Router();
const { getTodos, addTodo, updateTodo, deleteTodo, toggleTodo } = require('../controllers/todoController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getTodos);
router.post('/', protect, addTodo);
router.put('/:id', protect, updateTodo);
router.delete('/:id', protect, deleteTodo);
router.patch('/:id/toggle', protect, toggleTodo);

module.exports = router;
