import type { ReactNode } from 'react';
export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div className="flex-1 min-w-0"><h1 className="text-2xl font-black tracking-[-.035em] text-brand-900">{title}</h1>{description && <p className="mt-1 text-sm font-medium text-brand-400">{description}</p>}</div>{actions && <div className="flex flex-wrap items-center justify-start sm:justify-end gap-2 shrink-0">{actions}</div>}</div>;
}
