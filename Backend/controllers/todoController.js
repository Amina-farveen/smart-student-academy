const Todo = require('../models/Todo');
const Notification = require('../models/Notification');

// @desc    Get all todos
// @route   GET /api/todos
// @access  Private
const getTodos = async (req, res) => {
  try {
    const { completed, priority, type } = req.query;
    const filter = { userId: req.user._id };

    if (completed !== undefined) filter.completed = completed === 'true';
    if (priority) filter.priority = priority;
    if (type) filter.type = type;

    const todos = await Todo.find(filter).sort({ dueDate: 1, createdAt: -1 });
    res.json({ success: true, data: todos });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching todos' });
  }
};

// @desc    Add todo
// @route   POST /api/todos
// @access  Private
const addTodo = async (req, res) => {
  try {
    const { title, description, dueDate, priority, type } = req.body;

    if (!title || !dueDate) {
      return res.status(400).json({ success: false, message: 'Title and due date are required' });
    }

    const todo = await Todo.create({
      userId: req.user._id,
      title,
      description,
      dueDate: new Date(dueDate),
      priority: priority || 'medium',
      type: type || 'task'
    });

    // Create notification for assignment
    if (type === 'assignment') {
      await Notification.create({
        userId: req.user._id,
        title: 'New Assignment Added',
        message: `Assignment "${title}" is due on ${new Date(dueDate).toDateString()}`,
        type: 'assignment'
      });
    }

    res.status(201).json({ success: true, message: 'Task added successfully', data: todo });
  } catch (error) {
    console.error('Add todo error:', error);
    res.status(500).json({ success: false, message: 'Error adding task' });
  }
};

// @desc    Update todo
// @route   PUT /api/todos/:id
// @access  Private
const updateTodo = async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, userId: req.user._id });
    if (!todo) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const { title, description, dueDate, priority, completed, type } = req.body;
    if (title !== undefined) todo.title = title;
    if (description !== undefined) todo.description = description;
    if (dueDate !== undefined) todo.dueDate = new Date(dueDate);
    if (priority !== undefined) todo.priority = priority;
    if (completed !== undefined) todo.completed = completed;
    if (type !== undefined) todo.type = type;

    await todo.save();
    res.json({ success: true, message: 'Task updated successfully', data: todo });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating task' });
  }
};

// @desc    Delete todo
// @route   DELETE /api/todos/:id
// @access  Private
const deleteTodo = async (req, res) => {
  try {
    const todo = await Todo.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!todo) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting task' });
  }
};

// @desc    Toggle todo completion
// @route   PATCH /api/todos/:id/toggle
// @access  Private
const toggleTodo = async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, userId: req.user._id });
    if (!todo) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    todo.completed = !todo.completed;
    await todo.save();
    res.json({ success: true, message: `Task marked as ${todo.completed ? 'completed' : 'pending'}`, data: todo });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error toggling task' });
  }
};

module.exports = { getTodos, addTodo, updateTodo, deleteTodo, toggleTodo };
