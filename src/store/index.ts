import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

// Types
export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'New' | 'Contacted' | 'Negotiation' | 'Closed';
  notes: string;
  revenue_value: number;
  created_at: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  created_at: string;
}

export interface Project {
  id: string;
  client_id: string;
  name: string;
  status: 'Planning' | 'Active' | 'Completed' | 'On Hold';
  due_date: string;
  created_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  status: 'To Do' | 'In Progress' | 'Done';
  created_at: string;
}

export interface Activity {
  id: string;
  type: 'LEAD_ADDED' | 'PROJECT_CREATED' | 'TASK_COMPLETED' | 'STATUS_UPDATED';
  description: string;
  created_at: string;
}

interface AppState {
  leads: Lead[];
  clients: Client[];
  projects: Project[];
  tasks: Task[];
  activities: Activity[];
  isInitialized: boolean;
  
  initialize: () => Promise<void>;
  
  // Lead Actions
  addLead: (lead: Omit<Lead, 'id' | 'created_at'>) => Promise<void>;
  updateLead: (id: string, updatedFields: Partial<Lead>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;

  // Client Actions
  addClient: (client: Omit<Client, 'id' | 'created_at'>) => Promise<void>;
  updateClient: (id: string, updatedFields: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;

  // Project Actions
  addProject: (project: Omit<Project, 'id' | 'created_at'>) => Promise<void>;
  updateProject: (id: string, updatedFields: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;

  // Task Actions
  addTask: (task: Omit<Task, 'id' | 'created_at'>) => Promise<void>;
  updateTask: (id: string, updatedFields: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  leads: [],
  clients: [],
  projects: [],
  tasks: [],
  activities: [],
  isInitialized: false,
  
  initialize: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [
      { data: leads },
      { data: clients },
      { data: projects },
      { data: tasks },
      { data: activities }
    ] = await Promise.all([
      supabase.from('leads').select('*').order('created_at', { ascending: false }),
      supabase.from('clients').select('*').order('created_at', { ascending: false }),
      supabase.from('projects').select('*').order('created_at', { ascending: false }),
      supabase.from('tasks').select('*').order('created_at', { ascending: false }),
      supabase.from('activities').select('*').order('created_at', { ascending: false })
    ]);

    set({
      leads: leads || [],
      clients: clients || [],
      projects: projects || [],
      tasks: tasks || [],
      activities: activities || [],
      isInitialized: true
    });
  },
  
  addLead: async (leadData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: lead, error } = await supabase
      .from('leads')
      .insert([{ ...leadData, user_id: user.id }])
      .select()
      .single();

    if (error) { console.error(error); return; }

    const { data: activity } = await supabase
      .from('activities')
      .insert([{ user_id: user.id, type: 'LEAD_ADDED', description: `${leadData.name} was added as a new lead` }])
      .select()
      .single();

    set((state) => ({ 
      leads: [lead, ...state.leads],
      activities: activity ? [activity, ...state.activities] : state.activities
    }));
  },

  updateLead: async (id, updatedFields) => {
    const { data: lead, error } = await supabase
      .from('leads')
      .update(updatedFields)
      .eq('id', id)
      .select()
      .single();

    if (error) { console.error(error); return; }

    set((state) => ({
      leads: state.leads.map(l => l.id === id ? lead : l)
    }));
  },

  deleteLead: async (id) => {
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (!error) {
      set((state) => ({ leads: state.leads.filter(l => l.id !== id) }));
    }
  },

  addClient: async (clientData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: client, error } = await supabase
      .from('clients')
      .insert([{ ...clientData, user_id: user.id }])
      .select()
      .single();

    if (error) { console.error(error); return; }

    set((state) => ({ clients: [client, ...state.clients] }));
  },

  updateClient: async (id, updatedFields) => {
    const { data: client, error } = await supabase
      .from('clients')
      .update(updatedFields)
      .eq('id', id)
      .select()
      .single();

    if (error) { console.error(error); return; }

    set((state) => ({
      clients: state.clients.map(c => c.id === id ? client : c)
    }));
  },

  deleteClient: async (id) => {
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (!error) {
      set((state) => ({ clients: state.clients.filter(c => c.id !== id) }));
    }
  },

  addProject: async (projectData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: project, error } = await supabase
      .from('projects')
      .insert([{ ...projectData, user_id: user.id }])
      .select()
      .single();

    if (error) { console.error(error); return; }

    const { data: activity } = await supabase
      .from('activities')
      .insert([{ user_id: user.id, type: 'PROJECT_CREATED', description: `Started new project: ${projectData.name}` }])
      .select()
      .single();

    set((state) => ({ 
      projects: [project, ...state.projects],
      activities: activity ? [activity, ...state.activities] : state.activities
    }));
  },

  updateProject: async (id, updatedFields) => {
    const { data: project, error } = await supabase
      .from('projects')
      .update(updatedFields)
      .eq('id', id)
      .select()
      .single();

    if (error) { console.error(error); return; }

    set((state) => ({
      projects: state.projects.map(p => p.id === id ? project : p)
    }));
  },

  deleteProject: async (id) => {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (!error) {
      set((state) => ({ projects: state.projects.filter(p => p.id !== id) }));
    }
  },

  addTask: async (taskData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: task, error } = await supabase
      .from('tasks')
      .insert([{ ...taskData, user_id: user.id }])
      .select()
      .single();

    if (error) { console.error(error); return; }

    set((state) => ({ tasks: [task, ...state.tasks] }));
  },

  updateTask: async (id, updatedFields) => {
    const { data: task, error } = await supabase
      .from('tasks')
      .update(updatedFields)
      .eq('id', id)
      .select()
      .single();

    if (error) { console.error(error); return; }

    if (updatedFields.status === 'Done') {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: activity } = await supabase
          .from('activities')
          .insert([{ user_id: user.id, type: 'TASK_COMPLETED', description: `Completed task: ${task.title}` }])
          .select()
          .single();
        if (activity) {
          set((state) => ({ activities: [activity, ...state.activities] }));
        }
      }
    }

    set((state) => ({
      tasks: state.tasks.map(t => t.id === id ? task : t)
    }));
  },

  deleteTask: async (id) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (!error) {
      set((state) => ({ tasks: state.tasks.filter(t => t.id !== id) }));
    }
  }
}));
