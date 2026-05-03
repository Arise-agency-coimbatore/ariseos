'use client';

import { useState } from 'react';
import { useAppStore, Campaign } from '@/store';
import { Plus, MoreVertical, Edit2, Trash2, TrendingUp, DollarSign, MousePointerClick, Target } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useForm as useRHForm } from 'react-hook-form';
import { format } from 'date-fns';

export default function CampaignsPage() {
  const { campaigns, addCampaign, updateCampaign, deleteCampaign } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  const openAddModal = () => {
    setEditingCampaign(null);
    setIsModalOpen(true);
  };

  const openEditModal = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this campaign?')) {
      deleteCampaign(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Campaigns</h2>
          <p className="text-sm text-navy-300 mt-1">Track your marketing efforts and ROI.</p>
        </div>
        <div className="mt-4 sm:ml-4 sm:mt-0">
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-x-2 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 transition-colors shadow-[0_0_15px_rgba(249,115,22,0.4)]"
          >
            <Plus className="-ml-0.5 h-5 w-5" aria-hidden="true" />
            Add Campaign
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {campaigns.map((campaign) => (
          <CampaignCard 
            key={campaign.id} 
            campaign={campaign} 
            onEdit={() => openEditModal(campaign)} 
            onDelete={() => handleDelete(campaign.id)} 
          />
        ))}
        {campaigns.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-navy-700/50 rounded-2xl">
            <TrendingUp className="mx-auto h-12 w-12 text-navy-400" />
            <h3 className="mt-2 text-sm font-semibold text-white">No campaigns</h3>
            <p className="mt-1 text-sm text-navy-300">Get started by creating a new campaign.</p>
            <div className="mt-6">
              <button
                onClick={openAddModal}
                className="inline-flex items-center gap-x-2 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-500"
              >
                <Plus className="-ml-0.5 h-5 w-5" aria-hidden="true" />
                Add Campaign
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCampaign ? 'Edit Campaign' : 'Add New Campaign'}
      >
        <CampaignForm 
          campaign={editingCampaign} 
          onClose={() => setIsModalOpen(false)} 
          onSubmit={(data) => {
            if (editingCampaign) {
              updateCampaign(editingCampaign.id, data);
            } else {
              addCampaign(data);
            }
            setIsModalOpen(false);
          }}
        />
      </Modal>
    </div>
  );
}

function CampaignCard({ campaign, onEdit, onDelete }: { campaign: Campaign, onEdit: () => void, onDelete: () => void }) {
  const cpa = campaign.conversions > 0 ? (campaign.budget / campaign.conversions).toFixed(2) : '0';
  const conversionRate = campaign.clicks > 0 ? ((campaign.conversions / campaign.clicks) * 100).toFixed(1) : '0';

  return (
    <div className="glass-card flex flex-col justify-between p-6">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-navy-800/80 px-2 py-1 text-xs font-medium text-navy-200 ring-1 ring-inset ring-navy-600/50">
              {campaign.platform}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onEdit} className="text-navy-300 hover:text-cyan-400 transition-colors">
              <Edit2 className="h-4 w-4" />
            </button>
            <button onClick={onDelete} className="text-navy-300 hover:text-red-400 transition-colors">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-white">{campaign.name}</h3>
          <p className="text-xs text-navy-400 mt-1">Started {format(new Date(campaign.start_date), 'MMM d, yyyy')}</p>
        </div>
        
        <dl className="mt-6 grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <dt className="flex items-center gap-1.5 text-xs font-medium text-navy-300">
              <DollarSign className="h-3.5 w-3.5" />
              Budget
            </dt>
            <dd className="text-lg font-semibold text-white tracking-tight">${campaign.budget.toLocaleString()}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="flex items-center gap-1.5 text-xs font-medium text-navy-300">
              <Target className="h-3.5 w-3.5" />
              CPA
            </dt>
            <dd className="text-lg font-semibold text-green-400 tracking-tight">${cpa}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="flex items-center gap-1.5 text-xs font-medium text-navy-300">
              <MousePointerClick className="h-3.5 w-3.5" />
              Clicks
            </dt>
            <dd className="text-lg font-semibold text-white tracking-tight">{campaign.clicks.toLocaleString()}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="flex items-center gap-1.5 text-xs font-medium text-navy-300">
              <TrendingUp className="h-3.5 w-3.5" />
              Conv. Rate
            </dt>
            <dd className="text-lg font-semibold text-cyan-400 tracking-tight">{conversionRate}%</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

function CampaignForm({ campaign, onClose, onSubmit }: { campaign: Campaign | null, onClose: () => void, onSubmit: (data: any) => void }) {
  const { register, handleSubmit } = useRHForm({
    defaultValues: campaign || { platform: 'LinkedIn', budget: 0, clicks: 0, conversions: 0, start_date: new Date().toISOString().split('T')[0] }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-navy-200">Campaign Name</label>
        <input
          {...register('name', { required: true })}
          type="text"
          className="mt-1 block w-full rounded-xl border-0 bg-navy-900/50 py-2 px-3 text-white shadow-sm ring-1 ring-inset ring-navy-700 focus:ring-2 focus:ring-inset focus:ring-orange-500 sm:text-sm sm:leading-6"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="platform" className="block text-sm font-medium text-navy-200">Platform</label>
          <select
            {...register('platform')}
            className="mt-1 block w-full rounded-xl border-0 bg-navy-900/50 py-2 px-3 text-white shadow-sm ring-1 ring-inset ring-navy-700 focus:ring-2 focus:ring-inset focus:ring-orange-500 sm:text-sm sm:leading-6"
          >
            <option value="LinkedIn">LinkedIn</option>
            <option value="Google Ads">Google Ads</option>
            <option value="Facebook">Facebook</option>
            <option value="Instagram">Instagram</option>
            <option value="Twitter">Twitter</option>
          </select>
        </div>
        <div>
          <label htmlFor="budget" className="block text-sm font-medium text-navy-200">Budget ($)</label>
          <input
            {...register('budget', { valueAsNumber: true })}
            type="number"
            className="mt-1 block w-full rounded-xl border-0 bg-navy-900/50 py-2 px-3 text-white shadow-sm ring-1 ring-inset ring-navy-700 focus:ring-2 focus:ring-inset focus:ring-orange-500 sm:text-sm sm:leading-6"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="clicks" className="block text-sm font-medium text-navy-200">Clicks</label>
          <input
            {...register('clicks', { valueAsNumber: true })}
            type="number"
            className="mt-1 block w-full rounded-xl border-0 bg-navy-900/50 py-2 px-3 text-white shadow-sm ring-1 ring-inset ring-navy-700 focus:ring-2 focus:ring-inset focus:ring-orange-500 sm:text-sm sm:leading-6"
          />
        </div>
        <div>
          <label htmlFor="conversions" className="block text-sm font-medium text-navy-200">Conversions</label>
          <input
            {...register('conversions', { valueAsNumber: true })}
            type="number"
            className="mt-1 block w-full rounded-xl border-0 bg-navy-900/50 py-2 px-3 text-white shadow-sm ring-1 ring-inset ring-navy-700 focus:ring-2 focus:ring-inset focus:ring-orange-500 sm:text-sm sm:leading-6"
          />
        </div>
      </div>

      <div>
        <label htmlFor="start_date" className="block text-sm font-medium text-navy-200">Start Date</label>
        <input
          {...register('start_date')}
          type="date"
          className="mt-1 block w-full rounded-xl border-0 bg-navy-900/50 py-2 px-3 text-white shadow-sm ring-1 ring-inset ring-navy-700 focus:ring-2 focus:ring-inset focus:ring-orange-500 sm:text-sm sm:leading-6"
        />
      </div>

      <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
        <button
          type="submit"
          className="inline-flex w-full justify-center rounded-xl bg-orange-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 sm:col-start-2 shadow-[0_0_15px_rgba(249,115,22,0.4)]"
        >
          {campaign ? 'Save Changes' : 'Add Campaign'}
        </button>
        <button
          type="button"
          className="mt-3 inline-flex w-full justify-center rounded-xl bg-navy-800 px-3 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-navy-700 hover:bg-navy-700 sm:col-start-1 sm:mt-0"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
