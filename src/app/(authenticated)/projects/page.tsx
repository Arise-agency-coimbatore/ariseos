'use client';

import { useState } from 'react';
import { useAppStore, Project, Task, Client } from '@/store';
import { Plus, Edit2, Trash2, CheckCircle2, Circle, Clock, ChevronRight, Briefcase, FolderKanban, Share2, Link2, X } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useForm as useRHForm } from 'react-hook-form';
import clsx from 'clsx';
import { format, formatDistanceToNow } from 'date-fns';

export default function ProjectsPage() {
  const { projects, clients, tasks, addProject, updateProject, deleteProject, toggleProjectShare, addTask, updateTask, deleteTask } = useAppStore();
  
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [shareToast, setShareToast] = useState('');

  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const projectTasks = tasks.filter(t => t.project_id === selectedProjectId);

  const openAddProjectModal = () => {
    setEditingProject(null);
    setIsProjectModalOpen(true);
  };

  const openEditProjectModal = (project: Project) => {
    setEditingProject(project);
    setIsProjectModalOpen(true);
  };

  const handleProjectDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this project? All associated tasks will be removed.')) {
      deleteProject(id);
      if (selectedProjectId === id) setSelectedProjectId(null);
    }
  };

  const openAddTaskModal = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const openEditTaskModal = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleTaskDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTask(id);
    }
  };

  const toggleTaskStatus = (task: Task) => {
    const nextStatus = task.status === 'Done' ? 'To Do' : task.status === 'To Do' ? 'In Progress' : 'Done';
    updateTask(task.id, { status: nextStatus });
  };

  const handleShare = async (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    const token = await toggleProjectShare(project.id);
    if (token) {
      const url = `${window.location.origin}/share/${token}`;
      await navigator.clipboard.writeText(url);
      setShareToast('Share link copied to clipboard!');
    } else {
      setShareToast('Sharing disabled for this project.');
    }
    setTimeout(() => setShareToast(''), 3000);
  };

  return (
    <div className="flex h-full flex-col lg:flex-row gap-6 relative">
      {/* Toast */}
      {shareToast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 glass-card border border-cyan-500/30 px-4 py-3 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.2)] text-sm text-white animate-fade-in">
          <Link2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          {shareToast}
          <button onClick={() => setShareToast('')}><X className="w-4 h-4 text-navy-400 hover:text-white" /></button>
        </div>
      )}

      {/* Projects List (Left Column) */}
      <div className={clsx("flex-1 lg:max-w-md flex flex-col space-y-4", selectedProjectId ? "hidden lg:flex" : "flex")}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Projects</h2>
            <p className="text-sm text-navy-300 mt-1">Manage client deliverables.</p>
          </div>
          <button
            onClick={openAddProjectModal}
            className="inline-flex items-center gap-x-2 rounded-xl bg-cyan-600 px-3 py-2 text-sm font-semibold text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:bg-cyan-500 transition-colors"
          >
            <Plus className="-ml-0.5 h-4 w-4" aria-hidden="true" />
            New
          </button>
        </div>

        <div className="space-y-3 flex-1 overflow-y-auto pr-2">
          {projects.map((project) => {
            const client = clients.find(c => c.id === project.client_id);
            const pTasks = tasks.filter(t => t.project_id === project.id);
            const completedTasks = pTasks.filter(t => t.status === 'Done').length;
            const progress = pTasks.length > 0 ? (completedTasks / pTasks.length) * 100 : 0;

            return (
              <div
                key={project.id}
                onClick={() => setSelectedProjectId(project.id)}
                className={clsx(
                  "cursor-pointer rounded-xl border p-4 transition-all duration-200",
                  selectedProjectId === project.id
                    ? "bg-navy-800/80 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                    : "glass-card hover:bg-navy-800/50"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-white truncate">{project.name}</h3>
                    {client && (
                      <p className="text-sm text-navy-300 truncate mt-0.5 flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5" />
                        {client.name}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className={clsx(
                      'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset',
                      project.status === 'Planning' ? 'bg-blue-400/10 text-blue-400 ring-blue-400/30' :
                      project.status === 'Active' ? 'bg-cyan-400/10 text-cyan-400 ring-cyan-400/30' :
                      project.status === 'On Hold' ? 'bg-orange-400/10 text-orange-400 ring-orange-400/30' :
                      'bg-green-400/10 text-green-400 ring-green-400/30'
                    )}>
                      {project.status}
                    </span>
                    {/* Share toggle button */}
                    <button
                      onClick={(e) => handleShare(project, e)}
                      title={project.is_public ? 'Sharing on — click to disable' : 'Share this project'}
                      className={clsx(
                        'p-1.5 rounded-lg transition-colors',
                        project.is_public
                          ? 'text-cyan-400 bg-cyan-400/10 hover:bg-red-500/10 hover:text-red-400'
                          : 'text-navy-400 bg-navy-800/50 hover:text-cyan-400'
                      )}
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-navy-300 mb-1.5">
                    <span>Progress ({completedTasks}/{pTasks.length})</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-navy-900 rounded-full h-1.5">
                    <div className="bg-cyan-500 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>
              </div>
            );
          })}
          {projects.length === 0 && (
            <div className="text-center py-10 text-sm text-navy-400 border border-dashed border-navy-700 rounded-xl">
              No projects yet. Create one to get started!
            </div>
          )}
        </div>
      </div>

      {/* Task Management (Right Column) */}
      <div className={clsx("flex-1 glass-card flex flex-col", !selectedProjectId && "hidden lg:flex items-center justify-center")}>
        {!selectedProjectId ? (
          <div className="text-center text-navy-400">
            <FolderKanban className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>Select a project to view and manage its tasks.</p>
          </div>
        ) : (
          <>
            <div className="p-6 border-b border-navy-700/50 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <button 
                  onClick={() => setSelectedProjectId(null)}
                  className="lg:hidden text-cyan-400 text-sm mb-2 flex items-center hover:text-cyan-300"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  Back to Projects
                </button>
                <h3 className="text-xl font-bold text-white">{selectedProject?.name}</h3>
                <p className="text-sm text-navy-300 mt-1">
                  Due: {selectedProject?.due_date ? format(new Date(selectedProject.due_date), 'MMM d, yyyy') : 'No due date'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {selectedProject?.is_public && (
                  <a
                    href={`/share/${selectedProject.share_token}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors"
                    title="Preview share page"
                  >
                    <Link2 className="w-4 h-4" />
                  </a>
                )}
                <button onClick={() => openEditProjectModal(selectedProject!)} className="p-2 rounded-lg bg-navy-800 text-navy-300 hover:text-white transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleProjectDelete(selectedProject!.id)} className="p-2 rounded-lg bg-navy-800 text-navy-300 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={openAddTaskModal}
                  className="inline-flex items-center gap-x-2 rounded-xl bg-cyan-600/20 text-cyan-400 px-3 py-2 text-sm font-semibold hover:bg-cyan-600/30 transition-colors"
                >
                  <Plus className="-ml-0.5 h-4 w-4" aria-hidden="true" />
                  Add Task
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {projectTasks.length === 0 ? (
                <div className="text-center py-10 text-sm text-navy-400">
                  No tasks assigned to this project yet.
                </div>
              ) : (
                projectTasks.map(task => (
                  <div key={task.id} className="group flex items-start gap-3 p-3 rounded-xl hover:bg-navy-800/50 transition-colors border border-transparent hover:border-navy-700/50">
                    <button onClick={() => toggleTaskStatus(task)} className="mt-0.5 flex-shrink-0">
                      {task.status === 'Done' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                      ) : task.status === 'In Progress' ? (
                        <Clock className="w-5 h-5 text-orange-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-navy-400" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={clsx("text-sm font-medium", task.status === 'Done' ? "text-navy-300 line-through" : "text-white")}>
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-xs text-navy-400 mt-0.5 line-clamp-2">{task.description}</p>
                      )}
                      <p className="text-xs text-navy-500 mt-1">
                        {task.status}
                        {task.updated_at && task.updated_at !== task.created_at && (
                          <span className="ml-2 text-navy-600">· updated {formatDistanceToNow(new Date(task.updated_at), { addSuffix: true })}</span>
                        )}
                      </p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <button onClick={() => openEditTaskModal(task)} className="p-1.5 text-navy-400 hover:text-cyan-400"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleTaskDelete(task.id)} className="p-1.5 text-navy-400 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Project Modal */}
      <Modal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} title={editingProject ? 'Edit Project' : 'New Project'}>
        <ProjectForm 
          project={editingProject} 
          clients={clients}
          onClose={() => setIsProjectModalOpen(false)} 
          onSubmit={(data) => {
            if (editingProject) {
              updateProject(editingProject.id, data);
            } else {
              addProject(data as Omit<Project, 'id' | 'created_at' | 'share_token'>);
            }
            setIsProjectModalOpen(false);
          }}
        />
      </Modal>

      {/* Task Modal */}
      <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title={editingTask ? 'Edit Task' : 'New Task'}>
        <TaskForm 
          task={editingTask} 
          onClose={() => setIsTaskModalOpen(false)} 
          onSubmit={(data) => {
            if (editingTask) {
              updateTask(editingTask.id, data);
            } else {
              addTask({ ...data, project_id: selectedProjectId } as Omit<Task, 'id' | 'created_at'>);
            }
            setIsTaskModalOpen(false);
          }}
        />
      </Modal>
    </div>
  );
}

function ProjectForm({ project, clients, onClose, onSubmit }: { project: Project | null, clients: Client[], onClose: () => void, onSubmit: (data: any) => void }) {
  const { register, handleSubmit } = useRHForm({
    defaultValues: project || { status: 'Planning' }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-navy-200">Project Name</label>
        <input {...register('name', { required: true })} type="text" className="mt-1 block w-full rounded-xl border-0 bg-navy-900/50 py-2 px-3 text-white shadow-sm ring-1 ring-inset ring-navy-700 focus:ring-2 focus:ring-cyan-500 sm:text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-navy-200">Client</label>
        <select {...register('client_id')} className="mt-1 block w-full rounded-xl border-0 bg-navy-900/50 py-2 px-3 text-white shadow-sm ring-1 ring-inset ring-navy-700 focus:ring-2 focus:ring-cyan-500 sm:text-sm">
          <option value="">No Client (Internal)</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.company || 'Ind.'})</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-navy-200">Status</label>
          <select {...register('status')} className="mt-1 block w-full rounded-xl border-0 bg-navy-900/50 py-2 px-3 text-white shadow-sm ring-1 ring-inset ring-navy-700 focus:ring-2 focus:ring-cyan-500 sm:text-sm">
            <option value="Planning">Planning</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="On Hold">On Hold</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-navy-200">Due Date</label>
          <input {...register('due_date')} type="date" className="mt-1 block w-full rounded-xl border-0 bg-navy-900/50 py-2 px-3 text-white shadow-sm ring-1 ring-inset ring-navy-700 focus:ring-2 focus:ring-cyan-500 sm:text-sm" />
        </div>
      </div>
      <div className="mt-5 sm:grid sm:grid-cols-2 sm:gap-3">
        <button type="submit" className="w-full rounded-xl bg-cyan-600 px-3 py-2 text-sm font-semibold text-white hover:bg-cyan-500 sm:col-start-2 shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-colors">
          {project ? 'Save Changes' : 'Create Project'}
        </button>
        <button type="button" onClick={onClose} className="mt-3 w-full rounded-xl bg-navy-800 px-3 py-2 text-sm font-semibold text-white hover:bg-navy-700 sm:col-start-1 sm:mt-0 transition-colors border border-navy-700">
          Cancel
        </button>
      </div>
    </form>
  );
}

function TaskForm({ task, onClose, onSubmit }: { task: Task | null, onClose: () => void, onSubmit: (data: any) => void }) {
  const { register, handleSubmit } = useRHForm({
    defaultValues: task || { status: 'To Do', description: '' }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-navy-200">Task Title</label>
        <input {...register('title', { required: true })} type="text" className="mt-1 block w-full rounded-xl border-0 bg-navy-900/50 py-2 px-3 text-white shadow-sm ring-1 ring-inset ring-navy-700 focus:ring-2 focus:ring-cyan-500 sm:text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-navy-200">Description <span className="text-navy-500">(optional)</span></label>
        <textarea
          {...register('description')}
          rows={3}
          placeholder="Add details, notes, or acceptance criteria..."
          className="mt-1 block w-full rounded-xl border-0 bg-navy-900/50 py-2 px-3 text-white shadow-sm ring-1 ring-inset ring-navy-700 focus:ring-2 focus:ring-cyan-500 sm:text-sm resize-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-navy-200">Status</label>
        <select {...register('status')} className="mt-1 block w-full rounded-xl border-0 bg-navy-900/50 py-2 px-3 text-white shadow-sm ring-1 ring-inset ring-navy-700 focus:ring-2 focus:ring-cyan-500 sm:text-sm">
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>
      </div>
      <div className="mt-5 sm:grid sm:grid-cols-2 sm:gap-3">
        <button type="submit" className="w-full rounded-xl bg-cyan-600 px-3 py-2 text-sm font-semibold text-white hover:bg-cyan-500 sm:col-start-2 shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-colors">
          {task ? 'Save Changes' : 'Add Task'}
        </button>
        <button type="button" onClick={onClose} className="mt-3 w-full rounded-xl bg-navy-800 px-3 py-2 text-sm font-semibold text-white hover:bg-navy-700 sm:col-start-1 sm:mt-0 transition-colors border border-navy-700">
          Cancel
        </button>
      </div>
    </form>
  );
}
