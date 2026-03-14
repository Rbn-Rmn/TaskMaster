// backend/routes/tasks.js
import express from 'express';
import { createTask, deleteTask, getTasks, updateTask } from '../controllers/tasks.js';
import { protect } from '../middleware/auth.js';
import Task from '../models/Task.js';

const router = express.Router();

router.use(protect);

router.route('/').get(getTasks).post(createTask);
router.route('/:id').put(updateTask).delete(deleteTask);

router.put('/reorder', async (req, res) => {
  try {
    const updates = req.body;
    const bulkOps = updates.map(({ id, order }) => ({
      updateOne: {
        filter: { _id: id, user: req.user._id },
        update: { order }
      }
    }));

    await Task.bulkWrite(bulkOps);
    res.json({ message: 'Tasks reordered successfully' });
  } catch (error) {
    console.error('Reorder error:', error);
    res.status(500).json({ message: 'Failed to reorder tasks' });
  }
});

export default router;