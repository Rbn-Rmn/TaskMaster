import axios from 'axios';
import { isThisWeek, isToday } from 'date-fns';
import { Flame, Moon, Sun, Target } from 'lucide-react';
import { useContext, useEffect, useMemo, useState } from 'react';
import AuthContext from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (user) {
      axios.get('/api/tasks')
        .then(res => setTasks(res.data))
        .catch(err => console.error('Failed to fetch tasks for navbar:', err));
    }
  }, [user]);

  useEffect(() => {
    const handleUpdate = () => {
      if (user) {
        axios.get('/api/tasks').then(res => setTasks(res.data));
      }
    };

    window.addEventListener('tasksUpdated', handleUpdate);
    return () => window.removeEventListener('tasksUpdated', handleUpdate);
  }, [user]);
  const stats = useMemo(() => {
    const completedToday = tasks.filter(t => t.completed && isToday(new Date(t.updatedAt))).length;
    const activeTasks = tasks.filter(t => !t.completed).length;
    const hasStreak = tasks.some(t => t.completed && isThisWeek(new Date(t.updatedAt)));
    const streakDays = hasStreak ? 7 : 0;

    return { completedToday, activeTasks, streakDays };
  }, [tasks]);

  // Dark mode toggle + Ctrl+D shortcut
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'd' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleTheme();
      }
    };

    const toggleTheme = () => {
      document.documentElement.classList.toggle('dark');
      localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const isDark = document.documentElement.classList.contains('dark');

  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-white">TaskMaster</h1>
        {user && (
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-3 bg-white/20 backdrop-blur-lg px-5 py-3 rounded-full">
              <Target className="w-6 h-6 text-white" />
              <span className="text-white font-semibold">
                {stats.completedToday} / 5 <span className="text-sm opacity-80">Today</span>
              </span>
            </div>

            <div className="flex items-center gap-3 bg-white/20 backdrop-blur-lg px-5 py-3 rounded-full">
              <span className="text-white font-medium text-lg">{stats.activeTasks}</span>
              <span className="text-white/80 text-sm">Active Tasks</span>
            </div>

            <div className="flex items-center gap-3 bg-white/20 backdrop-blur-lg px-5 py-3 rounded-full">
              <Flame className={`w-6 h-6 ${stats.streakDays > 0 ? 'text-orange-300' : 'text-white/50'}`} />
              <span className="text-white font-semibold">
                {stats.streakDays} <span className="text-sm opacity-80">Day Streak</span>
              </span>
            </div>
          </div>
        )}
        {user && (
          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                document.documentElement.classList.toggle('dark');
                localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
              }}
              className="p-3 bg-white/20 backdrop-blur-lg rounded-full hover:bg-white/30 transition"
            >
              {isDark ? <Sun className="w-5 h-5 text-yellow-300" /> : <Moon className="w-5 h-5 text-white" />}
            </button>

            <span className="text-white/90 text-lg hidden sm:block font-medium">
              Hi, {user.name || 'User'}!
            </span>
            <button
              onClick={logout}
              className="bg-white/20 backdrop-blur-lg text-white px-6 py-3 rounded-full font-semibold hover:bg-white/30 transition-all duration-300"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}