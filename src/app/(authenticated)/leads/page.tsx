'use client';

import { useState } from 'react';
import { useAppStore, Lead } from '@/store';
import { Plus, MoreVertical, Edit2, Trash2, Mail, Phone } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useForm as useRHForm } from 'react-hook-form';
import clsx from 'clsx';
import { format } from 'date-fns';

export default function LeadsPage() {
  const { leads, addLead, updateLead, deleteLead } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  const openAddModal = () => {
    setEditingLead(null);
    setIsModalOpen(true);
  };

  const openEditModal = (lead: Lead) => {
    setEditingLead(lead);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this lead?')) {
      deleteLead(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Leads</h2>
          <p className="text-sm text-navy-300 mt-1">Manage your contacts and sales pipeline.</p>
        </div>
        <div className="mt-4 sm:ml-4 sm:mt-0">
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-x-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 transition-colors shadow-[0_0_15px_rgba(6,182,212,0.4)]"
          >
            <Plus className="-ml-0.5 h-5 w-5" aria-hidden="true" />
            Add Lead
          </button>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-navy-700/50">
            <thead className="bg-navy-900/50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-6">Name</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Contact</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Status</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Value</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Added</th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-700/50 bg-transparent">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-navy-800/30 transition-colors">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-6">
                    {lead.name}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-navy-200">
                    <div className="flex flex-col gap-1">
                      {lead.email && (
                        <div className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-navy-400" />
                          <span>{lead.email}</span>
                        </div>
                      )}
                      {lead.phone && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-navy-400" />
                          <span>{lead.phone}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-navy-200">
                    <span className={clsx(
                      'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset',
                      lead.status === 'New' ? 'bg-blue-400/10 text-blue-400 ring-blue-400/30' :
                      lead.status === 'Contacted' ? 'bg-orange-400/10 text-orange-400 ring-orange-400/30' :
                      lead.status === 'Negotiation' ? 'bg-cyan-400/10 text-cyan-400 ring-cyan-400/30' :
                      'bg-green-400/10 text-green-400 ring-green-400/30'
                    )}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-navy-200">
                    ${(lead.revenue_value || 0).toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-navy-300">
                    {format(new Date(lead.created_at), 'MMM d, yyyy')}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEditModal(lead)} className="text-navy-300 hover:text-cyan-400 transition-colors">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(lead.id)} className="text-navy-300 hover:text-red-400 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-navy-400">
                    No leads yet — add your first lead.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingLead ? 'Edit Lead' : 'Add New Lead'}
      >
        <LeadForm 
          lead={editingLead} 
          onClose={() => setIsModalOpen(false)} 
          onSubmit={(data) => {
            if (editingLead) {
              updateLead(editingLead.id, data);
            } else {
              addLead({
                ...data,
                id: Math.random().toString(),
                created_at: new Date().toISOString(),
              } as Lead);
            }
            setIsModalOpen(false);
          }}
        />
      </Modal>
    </div>
  );
}

function LeadForm({ lead, onClose, onSubmit }: { lead: Lead | null, onClose: () => void, onSubmit: (data: any) => void }) {
  const { register, handleSubmit } = useRHForm({
    defaultValues: lead || { status: 'New', revenue_value: 0 }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-navy-200">Name</label>
        <input
          {...register('name', { required: true })}
          type="text"
          className="mt-1 block w-full rounded-xl border-0 bg-navy-900/50 py-2 px-3 text-white shadow-sm ring-1 ring-inset ring-navy-700 focus:ring-2 focus:ring-inset focus:ring-cyan-500 sm:text-sm sm:leading-6"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-navy-200">Email</label>
          <input
            {...register('email')}
            type="email"
            className="mt-1 block w-full rounded-xl border-0 bg-navy-900/50 py-2 px-3 text-white shadow-sm ring-1 ring-inset ring-navy-700 focus:ring-2 focus:ring-inset focus:ring-cyan-500 sm:text-sm sm:leading-6"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-navy-200">Phone</label>
          <input
            {...register('phone')}
            type="tel"
            className="mt-1 block w-full rounded-xl border-0 bg-navy-900/50 py-2 px-3 text-white shadow-sm ring-1 ring-inset ring-navy-700 focus:ring-2 focus:ring-inset focus:ring-cyan-500 sm:text-sm sm:leading-6"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-navy-200">Status</label>
          <select
            {...register('status')}
            className="mt-1 block w-full rounded-xl border-0 bg-navy-900/50 py-2 px-3 text-white shadow-sm ring-1 ring-inset ring-navy-700 focus:ring-2 focus:ring-inset focus:ring-cyan-500 sm:text-sm sm:leading-6"
          >
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Negotiation">Negotiation</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
        <div>
          <label htmlFor="revenue_value" className="block text-sm font-medium text-navy-200">Value ($)</label>
          <input
            {...register('revenue_value', { valueAsNumber: true })}
            type="number"
            className="mt-1 block w-full rounded-xl border-0 bg-navy-900/50 py-2 px-3 text-white shadow-sm ring-1 ring-inset ring-navy-700 focus:ring-2 focus:ring-inset focus:ring-cyan-500 sm:text-sm sm:leading-6"
          />
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-navy-200">Notes</label>
        <textarea
          {...register('notes')}
          rows={3}
          className="mt-1 block w-full rounded-xl border-0 bg-navy-900/50 py-2 px-3 text-white shadow-sm ring-1 ring-inset ring-navy-700 focus:ring-2 focus:ring-inset focus:ring-cyan-500 sm:text-sm sm:leading-6"
        />
      </div>

      <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
        <button
          type="submit"
          className="inline-flex w-full justify-center rounded-xl bg-cyan-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 sm:col-start-2 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
        >
          {lead ? 'Save Changes' : 'Add Lead'}
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
