import React, { useState } from 'react';
import { useWedding } from '../contexts/WeddingContext';
import { Task, TaskCategory, TaskPriority, TaskStatus } from '../types';
import { getDeadlineDisplay } from '../utils/dateUtils';
import {
  Calendar as CalendarIcon,
  List,
  Columns,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Filter,
  Trash2,
  Edit2,
  X,
} from 'lucide-react';

export const Timeline: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask, toggleTaskComplete } = useWedding();
  const [viewMode, setViewMode] = useState<'calendar' | 'list' | 'kanban'>('kanban');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('Venue');
  const [customCategory, setCustomCategory] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');

  const baseCategories: TaskCategory[] = [
    'Venue',
    'Catering',
    'Photography',
    'Flowers',
    'Music',
    'Attire',
    'Ceremony',
    'Decor',
    'Logistics',
    'Invitations',
    'Other',
  ];

  const categories = Array.from(
    new Set([...baseCategories.filter((c) => c !== 'Other'), ...tasks.map((t) => t.category)])
  );
  if (!categories.includes('Other')) categories.push('Other');

  const handleOpenModal = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setTitle(task.title);
      setDescription(task.description || '');
      const isBase = baseCategories.includes(task.category) && task.category !== 'Other';
      setCategory(isBase ? task.category : 'Other');
      setCustomCategory(!isBase && task.category !== 'Other' ? task.category : '');
      setDueDate(task.dueDate);
      setPriority(task.priority);
    } else {
      setEditingTask(null);
      setTitle('');
      setDescription('');
      setCategory('Venue');
      setCustomCategory('');
      setDueDate(new Date().toISOString().split('T')[0]);
      setPriority('medium');
    }
    setShowTaskModal(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const finalCategory = category === 'Other' && customCategory.trim() ? customCategory.trim() : category;

    if (editingTask) {
      updateTask(editingTask.id, {
        title,
        description,
        category: finalCategory as TaskCategory,
        dueDate,
        priority,
      });
    } else {
      addTask({
        title,
        description,
        category: finalCategory as TaskCategory,
        dueDate,
        status: 'todo',
        priority,
      });
    }
    setShowTaskModal(false);
  };

  const filteredTasks = tasks.filter((t) => {
    if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="p-3 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-bold text-lg sm:text-2xl md:text-3xl text-slate-900 dark:text-slate-100">
            Timeline & Calendar
          </h1>
          <p className="text-xs text-slate-500">
            Manage checklist items, set due date reminders, and view critical path dependencies.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Columns className="w-3.5 h-3.5" /> Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" /> List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'calendar'
                  ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" /> Calendar
            </button>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-md shadow-rose-500/20 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </div>
      </div>

      {/* Category Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs font-medium">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3.5 py-1.5 rounded-full transition-all shrink-0 ${
            selectedCategory === 'all'
              ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
          }`}
        >
          All Categories ({tasks.length})
        </button>
        {categories.map((cat) => {
          const count = tasks.filter((t) => t.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full transition-all shrink-0 ${
                selectedCategory === cat
                  ? 'bg-rose-500 text-white font-semibold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* KANBAN BOARD VIEW */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(['todo', 'in_progress', 'done'] as TaskStatus[]).map((status) => {
            const columnTasks = filteredTasks.filter((t) => t.status === status);
            const statusLabels = {
              todo: 'To Do',
              in_progress: 'In Progress',
              done: 'Completed',
            };

            return (
              <div
                key={status}
                className="glass-panel rounded-3xl p-5 flex flex-col space-y-4 min-h-[500px]"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="font-serif font-bold text-base flex items-center gap-2 text-slate-900 dark:text-slate-100">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        status === 'done'
                          ? 'bg-emerald-500'
                          : status === 'in_progress'
                          ? 'bg-amber-500'
                          : 'bg-slate-400'
                      }`}
                    />
                    {statusLabels[status]}
                  </h3>
                  <span className="text-xs font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                    {columnTasks.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                  {columnTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 px-4 text-center rounded-2xl bg-slate-50/50 dark:bg-slate-800/20 border border-dashed border-slate-200 dark:border-slate-800 animate-fade-in my-auto text-xs text-slate-400 space-y-2">
                      <span className="text-3xl animate-bounce" style={{ animationDuration: '2s' }}>
                        {status === 'todo' ? '📌' : status === 'in_progress' ? '⚡' : '🏆'}
                      </span>
                      <span>No tasks in {statusLabels[status]}</span>
                    </div>
                  ) : (
                    columnTasks.map((task) => (
                      <div
                        key={task.id}
                      className="glass-card rounded-2xl p-4 space-y-3 cursor-pointer group hover:border-rose-300 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                          {task.category}
                        </span>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          <button
                            onClick={() => handleOpenModal(task)}
                            className="p-1 text-slate-400 hover:text-slate-700"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="p-1 text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h4
                        onClick={() => toggleTaskComplete(task.id)}
                        className={`text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug ${
                          task.status === 'done' ? 'line-through text-slate-400' : ''
                        }`}
                      >
                        {task.title}
                      </h4>

                      {task.description && (
                        <p className="text-xs text-slate-500 line-clamp-2">{task.description}</p>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                        <span className="flex items-center gap-1 text-[11px]">
                          {task.status === 'done' ? null : <Clock className="w-3 h-3 text-slate-400" />}
                          {(() => {
                            const dl = getDeadlineDisplay(task.dueDate, task.status === 'done');
                            return dl.isCompleted ? (
                              <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">{dl.text}</span>
                            ) : dl.isUrgent ? (
                              <span className="font-bold text-amber-600 dark:text-amber-400 animate-pulse">{dl.text}</span>
                            ) : dl.isOverdue ? (
                              <span className="font-bold text-rose-600 dark:text-rose-400">{dl.text}</span>
                            ) : (
                              <span>{dl.text}</span>
                            );
                          })()}
                        </span>

                        {/* Status Mover Buttons */}
                        <div className="flex items-center gap-1">
                          {status !== 'todo' && (
                            <button
                              onClick={() =>
                                updateTask(task.id, {
                                  status: status === 'done' ? 'in_progress' : 'todo',
                                })
                              }
                              className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] hover:bg-slate-200"
                            >
                              ← Move
                            </button>
                          )}
                          {status !== 'done' && (
                            <button
                              onClick={() =>
                                updateTask(task.id, {
                                  status: status === 'todo' ? 'in_progress' : 'done',
                                })
                              }
                              className="px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950 text-[10px] text-rose-600 hover:bg-rose-100"
                            >
                              Move →
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === 'list' && (
        <div className="glass-panel rounded-3xl p-6 space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center rounded-2xl bg-slate-50/50 dark:bg-slate-800/20 border border-dashed border-slate-200 dark:border-slate-800 animate-fade-in text-xs text-slate-400 space-y-3">
              <span className="text-4xl animate-bounce" style={{ animationDuration: '2s' }}>✨</span>
              <div>
                <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">No matching timeline tasks found</p>
                <p className="text-xs text-slate-400">Try adjusting your filters or click 'Add Timeline Task' to get started!</p>
              </div>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
              className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 hover:border-rose-300 transition-all"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleTaskComplete(task.id)}
                  className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                    task.status === 'done'
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-slate-300 dark:border-slate-600 hover:border-rose-500'
                  }`}
                >
                  {task.status === 'done' && <CheckCircle2 className="w-4 h-4" />}
                </button>
                <div>
                  <h4
                    className={`text-sm font-semibold text-slate-900 dark:text-slate-100 ${
                      task.status === 'done' ? 'line-through text-slate-400' : ''
                    }`}
                  >
                    {task.title}
                  </h4>
                  <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                    <span className="font-semibold text-rose-600">{task.category}</span>
                    <span>•</span>
                    {(() => {
                      const dl = getDeadlineDisplay(task.dueDate, task.status === 'done');
                      return dl.isCompleted ? (
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 text-[11px]">
                          {dl.text}
                        </span>
                      ) : dl.isUrgent ? (
                        <span className="font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 animate-pulse text-[11px]">
                          {dl.text}
                        </span>
                      ) : dl.isOverdue ? (
                        <span className="font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20 text-[11px]">
                          {dl.text}
                        </span>
                      ) : (
                        <span>{dl.text}</span>
                      );
                    })()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-semibold uppercase px-2.5 py-1 rounded-full ${
                    task.priority === 'urgent'
                      ? 'bg-rose-100 text-rose-700'
                      : task.priority === 'high'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {task.priority}
                </span>
                <button
                  onClick={() => handleOpenModal(task)}
                  className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-1.5 rounded-lg hover:bg-rose-100 text-slate-400 hover:text-rose-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )))}
        </div>
      )}

      {/* CALENDAR GRID VIEW MOCK */}
      {viewMode === 'calendar' && (
        <div className="glass-panel rounded-3xl p-4 sm:p-6 text-center space-y-4 overflow-x-auto">
          <h3 className="font-serif font-bold text-lg">Interactive Monthly Calendar Grid</h3>
          <p className="text-xs text-slate-500">
            Tasks color-coded by category mapped onto monthly schedule.
          </p>
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold py-2 border-b min-w-[500px]">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2 h-96 min-w-[500px]">
            {Array.from({ length: 31 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-200 dark:border-slate-800 p-2 text-left text-xs space-y-1 bg-slate-50/50 dark:bg-slate-900/50"
              >
                <span className="font-semibold text-slate-400">{i + 1}</span>
                {i % 4 === 0 && (
                  <div className="text-[10px] bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 p-1 rounded font-medium truncate">
                    Vendor Meeting
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TASK MODAL */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full mx-3 sm:mx-auto p-4 sm:p-6 space-y-5 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif font-bold text-lg">
                {editingTask ? 'Edit Task' : 'Create New Timeline Task'}
              </h3>
              <button
                onClick={() => setShowTaskModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Confirm wedding cake design"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TaskCategory)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  {category === 'Other' && (
                    <div className="mt-2">
                      <input
                        type="text"
                        placeholder="Enter custom category name..."
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-rose-300 dark:border-rose-700 bg-rose-50/50 dark:bg-rose-950/30 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent Priority</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add notes, contact numbers, or specific requirements..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold shadow-md shadow-rose-500/20"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
