import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import axios from 'axios';
import confetti from 'canvas-confetti';
import { format, startOfDay } from 'date-fns';
import {
  Calendar, CheckCircle,
  ChevronDown, ChevronUp,
  Circle, Edit2, Plus, Search, Trash2
} from 'lucide-react';
import { useContext, useEffect, useRef, useState } from 'react';
import AuthContext from '../context/AuthContext';

const CATEGORIES = ['Work', 'Personal', 'Health', 'Learning', 'Shopping', 'Other'];
const CATEGORY_COLORS = {
  Work: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  Personal: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  Health: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  Learning: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  Shopping: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  Other: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
};

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [category, setCategory] = useState('Work');
  const [dueDate, setDueDate] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [expandedForm, setExpandedForm] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState(new Set()); 

  const { logout } = useContext(AuthContext);
  const inputRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (formRef.current && !formRef.current.contains(e.target)) {
        setExpandedForm(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  useEffect(() => {
    // Dispatch custom event to notify Navbar
    window.dispatchEvent(new Event('tasksUpdated'));
  }, [tasks]);

  useEffect(() => {
    if (!title && !description && !dueDate && category === 'Work') {
      setExpandedForm(false);
    }
  }, [title, description, dueDate, category]);

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      const res = await axios.get('/api/tasks');
      setTasks(res.data.sort((a, b) => a.order - b.order));
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch =
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(search.toLowerCase()));
    const matchesFilter =
      filter === 'all' ||
      (filter === 'active' && !task.completed) ||
      (filter === 'completed' && task.completed);
    return matchesSearch && matchesFilter;
  });

  const addTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const res = await axios.post('/api/tasks', {
        title: title.trim(),
        description: description.trim() || null,
        category,
        dueDate: dueDate || null,
        order: tasks.length
      });
      setTasks(prev => [...prev, res.data]);
      setTitle('');
      setDescription('');
      setDueDate('');
      setCategory('Work');
      setExpandedForm(false);
      inputRef.current?.focus();
    } catch (err) {
      console.error('Add task failed:', err);
    }
  };

  const toggleTask = async (id, completed) => {
    try {
      const res = await axios.put(`/api/tasks/${id}`, { completed: !completed });
      setTasks(tasks.map(t => t._id === id ? res.data : t));
      if (!completed) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
    } catch (err) {
      console.error('Toggle failed:', err);
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`/api/tasks/${id}`);
      setTasks(tasks.filter(t => t._id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const startEditing = (task) => {
    setEditingId(task._id);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
  };

  const updateTask = async (id) => {
    if (!editTitle.trim()) return;
    try {
      const res = await axios.put(`/api/tasks/${id}`, {
        title: editTitle.trim(),
        description: editDescription.trim() || null
      });
      setTasks(tasks.map(t => t._id === id ? res.data : t));
      setEditingId(null);
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  const toggleTaskExpand = (id) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const items = Array.from(tasks);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    const updated = items.map((task, idx) => ({ ...task, order: idx }));
    setTasks(updated);
    try {
      await axios.put('/api/tasks/reorder', updated.map(t => ({ id: t._id, order: t.order })));
    } catch (err) {
      fetchTasks();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* FILTERS */}
      <div className="max-w-7xl mx-auto px-6 pt-8">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
          <div className="flex gap-8">
            {['all', 'active', 'completed'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`font-medium capitalize pb-2 border-b-2 transition-colors ${filter === f
                  ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400'
                  }`}
              >
                {f === 'all' ? 'All' : f === 'active' ? 'Active' : 'Done'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* CREATE TASK - COLLAPSIBLE */}
        <div ref={formRef} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 mb-8">
          <form onSubmit={addTask}>
            <input
              ref={inputRef}
              type="text"
              placeholder="Add a new task..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onFocus={() => setExpandedForm(true)}
              className="w-full text-lg font-medium bg-transparent outline-none placeholder-gray-500"
              required
            />

            {/* Expanded Options */}
            {expandedForm && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-5">
                <textarea
                  placeholder="Description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl resize-none focus:ring-2 focus:ring-purple-500 outline-none"
                />

                <div className="flex flex-wrap gap-4">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    {CATEGORIES.map(cat => <option key={cat}>{cat}</option>)}
                  </select>

                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />

                  <button
                    type="submit"
                    className="ml-auto px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" /> Add Task
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* SEARCH */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-3 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-6 py-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>

        {/* TASK LIST - MINIMALIST & EXPANDABLE */}
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="tasks">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                {filteredTasks.map((task, index) => {
                  const isExpanded = expandedTasks.has(task._id);
                  const isOverdue = task.dueDate && startOfDay(new Date(task.dueDate)) < startOfDay(new Date()) && !task.completed;

                  return (
                    <Draggable key={task._id} draggableId={task._id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all ${snapshot.isDragging ? 'shadow-xl' : ''
                            } ${isOverdue ? 'ring-2 ring-red-400' : ''}`}
                        >
                          <div
                            className="p-5 flex items-center justify-between cursor-pointer"
                            onClick={() => toggleTaskExpand(task._id)}
                          >
                            <div className="flex items-center gap-4 flex-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleTask(task._id, task.completed);
                                }}
                                className="shrink-0"
                              >
                                {task.completed ? (
                                  <CheckCircle className="w-6 h-6 text-green-600" />
                                ) : (
                                  <Circle className="w-6 h-6 text-gray-400" />
                                )}
                              </button>

                              <div className="flex-1">
                                <h3 className={`font-medium text-lg ${task.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>
                                  {task.title}
                                </h3>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${CATEGORY_COLORS[task.category]}`}>
                                    {task.category}
                                  </span>
                                  {task.dueDate && (
                                    <span className="flex items-center gap-1 text-xs text-gray-500">
                                      <Calendar className="w-3.5 h-3.5" />
                                      {format(new Date(task.dueDate), 'MMM dd')}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startEditing(task);
                                }}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                              >
                                <Edit2 className="w-4 h-4 text-gray-600" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteTask(task._id);
                                }}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </button>
                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5 text-gray-500" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-gray-500" />
                              )}
                            </div>
                          </div>

                          {/* Expanded Details */}
                          {isExpanded && (
                            <div className="px-5 pb-5 border-t border-gray-200 dark:border-gray-700 pt-4">
                              {editingId === task._id ? (
                                <div className="space-y-4">
                                  <input
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 font-medium"
                                    autoFocus
                                  />
                                  <textarea
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    rows="3"
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                                  />
                                  <div className="flex gap-2">
                                    <button onClick={() => updateTask(task._id)} className="px-4 py-2 bg-purple-600 text-white rounded-lg">
                                      Save
                                    </button>
                                    <button onClick={() => setEditingId(null)} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-lg">
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                task.description && (
                                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed pl-14">
                                    {task.description}
                                  </p>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {filteredTasks.length === 0 && (
          <div className="text-center py-24">
            <div className="text-8xl mb-8">
              {filter === 'active' ? '✨' : filter === 'completed' ? '🏆' : '📋'}
            </div>
            <p className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
              {search
                ? 'Hmm... nothing matches your search 🤔'
                : filter === 'all'
                  ? 'Your task list is empty!'
                  : filter === 'active'
                    ? 'Wow! Everything is done 🎉'
                    : 'No completed tasks yet'}
            </p>
            <p className="text-lg text-gray-500 dark:text-gray-400">
              {search
                ? 'Try different keywords'
                : filter === 'all'
                  ? 'Time to add your first task!'
                  : filter === 'active'
                    ? 'Enjoy the moment — you deserve it 😌'
                    : 'Complete a task to build your streak 🔥'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}