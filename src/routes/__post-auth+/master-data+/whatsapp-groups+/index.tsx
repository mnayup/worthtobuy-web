import { useMemo, useState } from 'react';
import {
  MessageCircle,
  Users,
  ExternalLink,
  Copy,
  Check,
  Eye,
  X,
  Phone,
  UserCheck,
} from 'lucide-react';
import { CrudPage } from '~/components/CrudPage';
import { StatusBadge } from '~/components/StatusBadge';
import { useAuth } from '~/context/AuthContext';
import { api } from '~/lib/api';
import type { FieldConfig } from '~/types';

export default function WhatsappGroupsRoute() {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('whatsapp-groups', 'create');
  const canEdit = hasPermission('whatsapp-groups', 'edit');
  const canDelete = hasPermission('whatsapp-groups', 'delete');

  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [selectedGroupForMembers, setSelectedGroupForMembers] = useState<any | null>(null);
  const [membersLoading, setMembersLoading] = useState(false);
  const [groupDetails, setGroupDetails] = useState<any | null>(null);

  const copyToClipboard = (url: string, id: number) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openMembersModal = async (group: any) => {
    setSelectedGroupForMembers(group);
    setMembersLoading(true);
    try {
      const res = await api.get(`/whatsapp-groups/${group.id}`);
      setGroupDetails(res.data);
    } catch {
      setGroupDetails(null);
    } finally {
      setMembersLoading(false);
    }
  };

  const fields = useMemo<FieldConfig[]>(
    () => [
      {
        name: 'name',
        label: 'Group Name',
        required: true,
        placeholder: 'e.g. VIP Singapore Nov 2026, PO Bangkok Batch 1',
      },
      {
        name: 'url',
        label: 'URL WA Group',
        type: 'url',
        required: true,
        placeholder: 'https://chat.whatsapp.com/...',
      },
      {
        name: 'isActive',
        label: 'Active Status',
        type: 'toggle',
        defaultValue: true,
      },
      {
        name: 'description',
        label: 'Description',
        type: 'textarea',
        colSpan: 2,
        placeholder: 'Enter group purpose, rules, or jastip target audience notes...',
      },
    ],
    []
  );

  return (
    <>
      <CrudPage
        title="Master WhatsApp Groups"
        entityName="WhatsApp Group"
        description="Organize WhatsApp groups, manage invite URLs, and track total customer distribution per group."
        endpoint="/whatsapp-groups"
        fields={fields}
        canCreate={canCreate}
        canEdit={canEdit}
        canDelete={canDelete}
        searchPlaceholder="Search WhatsApp group name, URL, description..."
        prepareInitial={(item) => ({
          name: item.name || '',
          url: item.url || item.url_wa_group || item.urlWaGroup || '',
          isActive: item.is_active ?? item.isActive ?? true,
          description: item.description || '',
        })}
        prepareSubmit={(values) => ({
          name: values.name?.trim(),
          url: values.url?.trim(),
          url_wa_group: values.url?.trim(),
          isActive: values.isActive !== false,
          description: values.description?.trim() || null,
        })}
        filters={[
          {
            key: 'isActive',
            label: 'Status',
            placeholder: 'All Status',
            options: [
              { label: 'Active', value: 'true' },
              { label: 'Inactive', value: 'false' },
            ],
          },
        ]}
        columns={[
          {
            key: 'name',
            label: 'WhatsApp Group',
            render: (row) => (
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 shadow-2xs">
                  <MessageCircle size={20} className="fill-emerald-50 text-emerald-600" />
                </div>
                <div>
                  <div className="font-bold text-brand-900 leading-snug">{row.name}</div>
                  {row.description ? (
                    <div className="text-xs text-brand-400 line-clamp-1 max-w-sm mt-0.5">
                      {row.description}
                    </div>
                  ) : (
                    <span className="text-[11px] text-brand-300 italic">No description</span>
                  )}
                </div>
              </div>
            ),
          },
          {
            key: 'url',
            label: 'Invite URL',
            render: (row) => {
              const url = row.url || row.url_wa_group || row.urlWaGroup || '';
              if (!url) return <span className="text-slate-400 text-xs italic">-</span>;
              const isCopied = copiedId === row.id;

              return (
                <div className="flex items-center gap-1.5 max-w-xs">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-emerald-50/80 hover:bg-emerald-100/80 text-emerald-700 border border-emerald-200/80 transition group shrink-0"
                    title={url}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="max-w-[150px] truncate">{url.replace(/^https?:\/\//, '')}</span>
                    <ExternalLink size={12} className="opacity-70 group-hover:opacity-100 shrink-0" />
                  </a>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(url, row.id);
                    }}
                    className="p-1.5 text-brand-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                    title="Copy invite URL"
                  >
                    {isCopied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  </button>
                </div>
              );
            },
          },
          {
            key: 'customerCount',
            label: 'Total Customers',
            render: (row) => {
              const count = row.customerCount ?? row.total_customers ?? row._count?.customers ?? 0;
              return (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openMembersModal(row);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brand-50 hover:bg-emerald-50 text-brand-700 hover:text-emerald-700 border border-brand-200/80 hover:border-emerald-300 transition shadow-2xs cursor-pointer group"
                  title="Click to view member customers"
                >
                  <Users size={13} className="text-brand-500 group-hover:text-emerald-600" />
                  <span>{count} Customers</span>
                  <Eye size={12} className="opacity-0 group-hover:opacity-100 transition ml-0.5" />
                </button>
              );
            },
          },
          {
            key: 'isActive',
            label: 'Status',
            render: (row) => {
              const active = row.is_active ?? row.isActive ?? true;
              return <StatusBadge value={active ? 'ACTIVE' : 'INACTIVE'} />;
            },
          },
        ]}
        renderActions={(row) => (
          <button
            type="button"
            onClick={() => openMembersModal(row)}
            className="inline-flex items-center justify-center px-2.5 py-1.5 h-8 min-w-[34px] rounded-xl border border-brand-200 bg-white text-brand-600 shadow-2xs hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 transition cursor-pointer"
            title="View Group Members"
            aria-label="View Group Members"
          >
            <Users size={15} />
          </button>
        )}
      />

      {/* Members Modal */}
      {selectedGroupForMembers && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-950/40 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-brand-100 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-5 border-b border-brand-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-2xs">
                  <MessageCircle size={20} className="fill-emerald-50 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-black text-brand-900 text-lg leading-tight">
                    {selectedGroupForMembers.name}
                  </h3>
                  <p className="text-xs text-brand-400 mt-0.5">
                    Member Customers List &middot;{' '}
                    <span className="font-bold text-emerald-700">
                      {groupDetails?.customerCount ?? selectedGroupForMembers.customerCount ?? 0} Total
                    </span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedGroupForMembers(null);
                  setGroupDetails(null);
                }}
                className="p-2 text-brand-400 hover:text-brand-700 hover:bg-brand-100/70 rounded-xl transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1 scrollbar-thin">
              {/* Group Link Header */}
              {selectedGroupForMembers.url && (
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100/80">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 truncate mr-3">
                    <span className="font-bold text-emerald-900">Invite Link:</span>
                    <span className="truncate">{selectedGroupForMembers.url}</span>
                  </div>
                  <a
                    href={selectedGroupForMembers.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition shrink-0"
                  >
                    <span>Open Group</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}

              {membersLoading ? (
                <div className="py-12 text-center text-brand-400 text-sm">
                  Loading member customers...
                </div>
              ) : groupDetails?.customers?.length ? (
                <div className="divide-y divide-brand-50 border border-brand-100 rounded-2xl overflow-hidden bg-white">
                  {groupDetails.customers.map((cust: any) => (
                    <div
                      key={cust.id}
                      className="p-3.5 flex items-center justify-between hover:bg-brand-50/50 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {cust.full_name?.charAt(0)?.toUpperCase() || 'C'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-brand-900">
                              {cust.full_name}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-brand-100 text-brand-600 font-semibold">
                              {cust.customer_code}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-brand-400 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Phone size={11} className="text-emerald-600" />
                              {cust.whatsapp}
                            </span>
                            {cust.city && <span>&bull; {cust.city}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <StatusBadge value={cust.segment} />
                        <a
                          href={`https://wa.me/${cust.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                          title="Chat on WhatsApp"
                        >
                          <MessageCircle size={15} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <div className="h-12 w-12 rounded-full bg-brand-50 text-brand-300 mx-auto flex items-center justify-center mb-3">
                    <UserCheck size={24} />
                  </div>
                  <p className="font-bold text-brand-700 text-sm">No customers mapped to this group yet</p>
                  <p className="text-xs text-brand-400 mt-1 max-w-xs mx-auto">
                    Assign customers to this WhatsApp group in Master Data &gt; Customers.
                  </p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-brand-100 flex justify-end bg-slate-50/50">
              <button
                type="button"
                onClick={() => {
                  setSelectedGroupForMembers(null);
                  setGroupDetails(null);
                }}
                className="btn-secondary text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
