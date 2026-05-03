'use client';

import { useState } from 'react';
import { useAppStore, Client } from '@/store';
import { Plus, Edit2, Trash2, Mail, Phone, Building } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useForm as useRHForm } from 'react-hook-form';
import { format } from 'date-fns';

export default function ClientsPage() {
  const { clients, addClient, updateClient, deleteClient } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const openAddModal = () => {
    setEditingClient(null);
    setIsModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this client? This will also delete all their projects.')) {
      deleteClient(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Clients</h2>
          <p className="text-sm text-navy-300 mt-1">Manage your active clients and their contact details.</p>
        </div>
        <div className="mt-4 sm:ml-4 sm:mt-0">
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-x-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:bg-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 transition-colors"
          >
            <Plus className="-ml-0.5 h-5 w-5" aria-hidden="true" />
            Add Client
          </button>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-navy-700/50">
            <thead className="bg-navy-900/50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-6">Client Name</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Company</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Contact</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Added On</th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-700/50 bg-transparent">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-navy-800/30 transition-colors">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-6">
                    {client.name}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-navy-200">
                    {client.company ? (
                      <div className="flex items-center gap-1.5">
                        <Building className="h-3.5 w-3.5 text-navy-400" />
                        <span>{client.company}</span>
                      </div>
                    ) : (
                      <span className="text-navy-400">-</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-navy-200">
                    <div className="flex flex-col gap-1">
                      {client.email && (
                        <div className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-navy-400" />
                          <span>{client.email}</span>
                        </div>
                      )}
                      {client.phone && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-navy-400" />
                          <span>{client.phone}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-navy-300">
                    {format(new Date(client.created_at), 'MMM d, yyyy')}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEditModal(client)} className="text-navy-300 hover:text-cyan-400 transition-colors">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(client.id)} className="text-navy-300 hover:text-red-400 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {clients.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-navy-400">
                    No clients found. Add your first client to get started.
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
        title={editingClient ? 'Edit Client' : 'Add New Client'}
      >
        <ClientForm 
          client={editingClient} 
          onClose={() => setIsModalOpen(false)} 
          onSubmit={(data) => {
            if (editingClient) {
              updateClient(editingClient.id, data);
            } else {
              addClient(data as Omit<Client, 'id' | 'created_at'>);
            }
            setIsModalOpen(false);
          }}
        />
      </Modal>
    </div>
  );
}

function ClientForm({ client, onClose, onSubmit }: { client: Client | null, onClose: () => void, onSubmit: (data: any) => void }) {
  const { register, handleSubmit } = useRHForm({
    defaultValues: client || {}
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
      <div>
        <label htmlFor="company" className="block text-sm font-medium text-navy-200">Company</label>
        <input
          {...register('company')}
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
      <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
        <button
          type="submit"
          className="inline-flex w-full justify-center rounded-xl bg-cyan-600 px-3 py-2 text-sm font-semibold text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:bg-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 sm:col-start-2 transition-colors"
        >
          {client ? 'Save Changes' : 'Add Client'}
        </button>
        <button
          type="button"
          className="mt-3 inline-flex w-full justify-center rounded-xl bg-navy-800 px-3 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-navy-700 hover:bg-navy-700 sm:col-start-1 sm:mt-0 transition-colors"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
