'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, Circle, Clock, FolderKanban, CalendarDays, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';

interface Project {
  id: string;
  name: string;
  status: string;
  due_date: string;
  is_public: boolean;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'To Do' | 'In Progress' | 'Done';
}

export default function SharePage() {
  const params = useParams();
  const token = params?.token as string;

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;

    const fetchSharedProject = async () => {
      // First: fetch project by share_token without auth (anon key)
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('id, name, status, due_date, is_public, share_token')
        .eq('share_token', token)
        .single();

      if (projectError) {
        console.error('[Share page] Supabase error:', projectError);
        if (projectError.code === 'PGRST116') {
          setError('No project found with this link. The owner may have disabled sharing.');
        } else {
          setError(`Could not load project (${projectError.code}). Please ensure public share policies are set up in Supabase.`);
        }
        setLoading(false);
        return;
      }

      if (!projectData?.is_public) {
        setError('The owner has disabled sharing for this project.');
        setLoading(false);
        return;
      }

      setProject(projectData);

      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .select('id, title, description, status')
        .eq('project_id', projectData.id)
        .order('created_at', { ascending: true });

      if (taskError) console.error('[Share page] Tasks error:', taskError);

      setTasks(taskData || []);
      setLoading(false);
    };

    fetchSharedProject();
  }, [token]);

  const todoTasks = tasks.filter(t => t.status === 'To Do');
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress');
  const doneTasks = tasks.filter(t => t.status === 'Done');
  const progress = tasks.length > 0 ? Math.round((doneTasks.length / tasks.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-navy-950 to-slate-900">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/30 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
            AriseOS
          </h1>
          <span className="text-xs text-slate-400 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700">
            Shared Project View
          </span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {loading ? (
          <div className="text-center py-24 text-slate-400 animate-pulse text-lg">Loading project...</div>
        ) : error ? (
          <div className="text-center py-24 space-y-4">
            <AlertTriangle className="w-12 h-12 text-orange-400 mx-auto" />
            <p className="text-white font-semibold text-lg">Project not found</p>
            <p className="text-slate-400 text-sm max-w-xs mx-auto">{error}</p>
          </div>
        ) : project ? (
          <div className="space-y-8">
            {/* Project Header */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                    <FolderKanban className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{project.name}</h2>
                    {project.due_date && (
                      <p className="text-sm text-slate-400 mt-1 flex items-center gap-1.5">
                        <CalendarDays className="w-3.5 h-3.5" />
                        Due {format(new Date(project.due_date), 'MMMM d, yyyy')}
                      </p>
                    )}
                  </div>
                </div>
                <span className={clsx(
                  'self-start sm:self-auto inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-semibold ring-1 ring-inset',
                  project.status === 'Planning' ? 'bg-blue-400/10 text-blue-400 ring-blue-400/30' :
                  project.status === 'Active' ? 'bg-cyan-400/10 text-cyan-400 ring-cyan-400/30' :
                  project.status === 'On Hold' ? 'bg-orange-400/10 text-orange-400 ring-orange-400/30' :
                  'bg-green-400/10 text-green-400 ring-green-400/30'
                )}>
                  {project.status}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-slate-400">Overall Progress</span>
                  <span className="text-white font-semibold">{doneTasks.length} / {tasks.length} tasks done ({progress}%)</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2.5">
                  <div
                    className="h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-700"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Task Columns */}
            {tasks.length === 0 ? (
              <p className="text-center text-slate-500 py-10">No tasks have been added to this project yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* To Do */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
                  <h3 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
                    <Circle className="w-4 h-4" /> To Do <span className="ml-auto bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded-full">{todoTasks.length}</span>
                  </h3>
                  <div className="space-y-2">
                    {todoTasks.map(task => (
                      <div key={task.id} className="bg-slate-800/50 rounded-lg px-3 py-2 border border-slate-700/50">
                        <div className="text-sm text-slate-300 font-medium">{task.title}</div>
                        {task.description && (
                          <div className="text-xs text-slate-500 mt-1 line-clamp-2">{task.description}</div>
                        )}
                      </div>
                    ))}
                    {todoTasks.length === 0 && <p className="text-xs text-slate-600 text-center py-2">Nothing here</p>}
                  </div>
                </div>

                {/* In Progress */}
                <div className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-4 backdrop-blur-sm">
                  <h3 className="text-sm font-semibold text-orange-400 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> In Progress <span className="ml-auto bg-orange-900/30 text-orange-300 text-xs px-2 py-0.5 rounded-full">{inProgressTasks.length}</span>
                  </h3>
                  <div className="space-y-2">
                    {inProgressTasks.map(task => (
                      <div key={task.id} className="bg-orange-900/20 rounded-lg px-3 py-2 border border-orange-700/30">
                        <div className="text-sm text-slate-200 font-medium">{task.title}</div>
                        {task.description && (
                          <div className="text-xs text-orange-900/60 mt-1 line-clamp-2">{task.description}</div>
                        )}
                      </div>
                    ))}
                    {inProgressTasks.length === 0 && <p className="text-xs text-slate-600 text-center py-2">Nothing here</p>}
                  </div>
                </div>

                {/* Done */}
                <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-4 backdrop-blur-sm">
                  <h3 className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Done <span className="ml-auto bg-green-900/30 text-green-300 text-xs px-2 py-0.5 rounded-full">{doneTasks.length}</span>
                  </h3>
                  <div className="space-y-2">
                    {doneTasks.map(task => (
                      <div key={task.id} className="bg-green-900/20 rounded-lg px-3 py-2 border border-green-700/30">
                        <div className="text-sm text-slate-400 font-medium line-through">{task.title}</div>
                        {task.description && (
                          <div className="text-xs text-green-900/40 mt-1 line-clamp-2 line-through">{task.description}</div>
                        )}
                      </div>
                    ))}
                    {doneTasks.length === 0 && <p className="text-xs text-slate-600 text-center py-2">Nothing here</p>}
                  </div>
                </div>
              </div>
            )}

            <p className="text-center text-xs text-slate-600 pt-4">
              Powered by AriseOS · Read-only shared view
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
