import { useEffect, useMemo, useState } from 'react';
import { ShieldCheck, ShieldAlert, User as UserIcon } from 'lucide-react';
import { CrudPage } from '~/components/CrudPage';
import { StatusBadge } from '~/components/StatusBadge';
import { api } from '~/lib/api';
import { titleCase } from '~/lib/format';
import type { FieldConfig, Option } from '~/types';

export async function loader() {
  const response = await api.get('/roles');
  return {
    roles: response.data.map((row: any) => ({
      value: row.id,
      label: `${titleCase(row.name)}${row.description ? ` (${row.description})` : ''}`,
    })),
  };
}

export default function UsersRoute() {
  const [roles, setRoles] = useState<Option[]>([]);

  useEffect(() => {
    loader()
      .then((data) => setRoles(data.roles))
      .catch(() => setRoles([]));
  }, []);

  const fields = useMemo<FieldConfig[]>(
    () => [
      {
        name: 'name',
        label: 'Full Name',
        placeholder: 'e.g. John Doe',
        required: true,
      },
      {
        name: 'username',
        label: 'Username (Unique)',
        placeholder: 'e.g. johndoe',
        required: true,
      },
      {
        name: 'email',
        label: 'Email Address (Optional)',
        type: 'email',
        placeholder: 'john@worthtobuy.local (Optional)',
        required: false,
      },
      {
        name: 'phone',
        label: 'WhatsApp / Phone',
        placeholder: 'e.g. 08123456789',
        required: true,
      },
      {
        name: 'password',
        label: 'Password (Min. 6 chars)',
        placeholder: 'Enter password (leave blank when editing if unchanged)',
        required: false,
      },
      {
        name: 'roleId',
        label: 'Access Role',
        type: 'select',
        options: roles,
        required: true,
      },
    ],
    [roles]
  );

  return (
    <CrudPage
      title="Users & Team Management"
      description="Manage team member accounts with custom usernames, optional emails, role assignments, and MFA security status."
      endpoint="/users"
      fields={fields}
      searchPlaceholder="Search by username, full name, email, or role..."
      prepareInitial={(row) => ({
        ...row,
        roleId: row.role?.id || row.roleId,
        password: '',
      })}
      prepareSubmit={(form) => {
        const payload = { ...form };
        if (!payload.password) {
          delete payload.password;
        }
        if (!payload.email || !String(payload.email).trim()) {
          payload.email = null;
        }
        return payload;
      }}
      filters={[
        {
          key: 'role',
          label: 'Filter Role',
          placeholder: 'All Roles',
          options: [
            { label: 'Owner', value: 'OWNER' },
            { label: 'Admin', value: 'ADMIN' },
            { label: 'Shopper', value: 'SHOPPER' },
            { label: 'Finance', value: 'FINANCE' },
          ],
        },
      ]}
      columns={[
        {
          key: 'username',
          label: 'Username',
          render: (row) => (
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-100 text-brand-700 font-bold text-xs shrink-0">
                <UserIcon size={14} />
              </div>
              <div>
                <span className="font-mono font-bold text-brand-900 text-xs">@{row.username || '—'}</span>
                <p className="text-[11px] text-brand-500 font-medium">{row.name}</p>
              </div>
            </div>
          ),
        },
        {
          key: 'email',
          label: 'Email',
          render: (row) => (
            <span className="text-xs text-brand-600">
              {row.email ? row.email : <span className="text-brand-300 italic font-medium">None</span>}
            </span>
          ),
        },
        {
          key: 'phone',
          label: 'Phone / WA',
          render: (row) => (
            <span className="text-xs font-mono text-brand-600">
              {row.phone || <span className="text-brand-300 italic">—</span>}
            </span>
          ),
        },
        {
          key: 'role',
          label: 'Role',
          render: (row) => <StatusBadge value={row.role?.name || 'USER'} />,
        },
        {
          key: 'mfaEnabled',
          label: '2FA Security',
          render: (row) =>
            row.mfaEnabled ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck size={13} className="text-emerald-600" />
                MFA Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-50 text-slate-500 border border-slate-200">
                <ShieldAlert size={13} className="text-slate-400" />
                Disabled
              </span>
            ),
        },
      ]}
      canCreate={true}
      canEdit={true}
      canDelete={true}
      canDeleteRow={(row) => row.role?.name !== 'OWNER'}
    />
  );
}
