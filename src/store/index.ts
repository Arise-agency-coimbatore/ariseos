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

export interface Campaign {
  id: string;
  name: string;
  platform: string;
  budget: number;
  clicks: number;
  conversions: number;
  start_date: string;
  created_at: string;
}

export interface Activity {
  id: string;
  type: 'LEAD_ADDED' | 'CAMPAIGN_CREATED' | 'STATUS_UPDATED';
  description: string;
  created_at: string;
}

interface AppState {
  leads: Lead[];
  campaigns: Campaign[];
  activities: Activity[];
  isInitialized: boolean;
  
  initialize: () => Promise<void>;
  
  // Actions
  addLead: (lead: Omit<Lead, 'id' | 'created_at'>) => Promise<void>;
  updateLead: (id: string, updatedFields: Partial<Lead>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;

  addCampaign: (campaign: Omit<Campaign, 'id' | 'created_at'>) => Promise<void>;
  updateCampaign: (id: string, updatedFields: Partial<Campaign>) => Promise<void>;
  deleteCampaign: (id: string) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  leads: [],
  campaigns: [],
  activities: [],
  isInitialized: false,
  
  initialize: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [
      { data: leads },
      { data: campaigns },
      { data: activities }
    ] = await Promise.all([
      supabase.from('leads').select('*').order('created_at', { ascending: false }),
      supabase.from('campaigns').select('*').order('created_at', { ascending: false }),
      supabase.from('activities').select('*').order('created_at', { ascending: false })
    ]);

    set({
      leads: leads || [],
      campaigns: campaigns || [],
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

    if (error) {
      console.error(error);
      return;
    }

    const { data: activity } = await supabase
      .from('activities')
      .insert([{ 
        user_id: user.id, 
        type: 'LEAD_ADDED', 
        description: `${leadData.name} was added as a new lead` 
      }])
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

    if (error) {
      console.error(error);
      return;
    }

    if (updatedFields.status) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: activity } = await supabase
          .from('activities')
          .insert([{ 
            user_id: user.id, 
            type: 'STATUS_UPDATED', 
            description: `Lead status updated to ${updatedFields.status}` 
          }])
          .select()
          .single();

        if (activity) {
          set((state) => ({ activities: [activity, ...state.activities] }));
        }
      }
    }

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

  addCampaign: async (campaignData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: campaign, error } = await supabase
      .from('campaigns')
      .insert([{ ...campaignData, user_id: user.id }])
      .select()
      .single();

    if (error) {
      console.error(error);
      return;
    }

    const { data: activity } = await supabase
      .from('activities')
      .insert([{ 
        user_id: user.id, 
        type: 'CAMPAIGN_CREATED', 
        description: `Started ${campaignData.name} campaign` 
      }])
      .select()
      .single();

    set((state) => ({ 
      campaigns: [campaign, ...state.campaigns],
      activities: activity ? [activity, ...state.activities] : state.activities
    }));
  },

  updateCampaign: async (id, updatedFields) => {
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .update(updatedFields)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(error);
      return;
    }

    set((state) => ({
      campaigns: state.campaigns.map(c => c.id === id ? campaign : c)
    }));
  },

  deleteCampaign: async (id) => {
    const { error } = await supabase.from('campaigns').delete().eq('id', id);
    if (!error) {
      set((state) => ({ campaigns: state.campaigns.filter(c => c.id !== id) }));
    }
  }
}));
