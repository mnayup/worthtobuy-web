import React from 'react';
import {
  ReceiptText,
  Plus,
  User,
  Store,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { money, number } from '~/lib/format';
import type { FeeRule } from '../types';
import { SettingsFeeRuleRow } from './settings-fee-rule-row';

interface SettingsFeeScheduleSectionProps {
  feeTab: 'customer' | 'reseller';
  setFeeTab: (tab: 'customer' | 'reseller') => void;
  feeRulesCustomer: FeeRule[];
  feeRulesReseller: FeeRule[];
  currentRules: FeeRule[];
  sortedFeeRules: FeeRule[];
  sortKey: keyof FeeRule | null;
  sortDirection: 'asc' | 'desc' | null;
  toggleSort: (key: keyof FeeRule) => void;
  updateRule: (id: string, patch: Partial<FeeRule>) => void;
  addRule: () => void;
  deleteRule: (id: string) => void;
}

export function SettingsFeeScheduleSection({
  feeTab,
  setFeeTab,
  feeRulesCustomer,
  feeRulesReseller,
  currentRules,
  sortedFeeRules,
  sortKey,
  sortDirection,
  toggleSort,
  updateRule,
  addRule,
  deleteRule,
}: SettingsFeeScheduleSectionProps) {
  const renderSortIndicator = (key: keyof FeeRule) => {
    if (sortKey !== key || !sortDirection) {
      return (
        <ArrowUpDown
          size={12}
          className="opacity-40 group-hover:opacity-100 transition-opacity"
        />
      );
    }
    if (sortDirection === 'asc') {
      return <ArrowUp size={12} className="text-cherry-600 dark:text-cherry-400" />;
    }
    return <ArrowDown size={12} className="text-cherry-600 dark:text-cherry-400" />;
  };

  const activeCount = currentRules.filter((r) => r.active).length;

  return (
    <section className="card overflow-hidden">
      <div
        className={
          'flex flex-col gap-4 border-b border-brand-100 p-6 sm:flex-row ' +
          'sm:items-center sm:justify-between bg-brand-50/20'
        }
      >
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-amber-50 p-3 text-amber-700">
            <ReceiptText size={21} />
          </div>
          <div>
            <h2 className="section-title">Concierge Fee Schedule</h2>
            <p className="text-sm font-medium text-brand-500">
              Automated service fees tiered by each item price and calculated per item. Can be overridden on orders.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={addRule}
          className="btn-secondary w-fit cursor-pointer"
        >
          <Plus size={17} /> Add {feeTab === 'customer' ? 'Customer' : 'Reseller'} Tier
        </button>
      </div>

      {/* Sub-tabs for Customer vs Reseller */}
      <div className="flex border-b border-brand-100 bg-brand-50/50 px-6 pt-3 gap-2">
        <button
          type="button"
          onClick={() => setFeeTab('customer')}
          className={
            'flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase ' +
            'tracking-wider rounded-t-xl transition-all border-b-2 cursor-pointer ' +
            (feeTab === 'customer'
              ? 'bg-white text-cherry-600 border-cherry-600 shadow-sm'
              : 'text-brand-500 hover:text-brand-800 border-transparent hover:bg-brand-100/50')
          }
        >
          <User size={15} />
          Automatic (Customer)
          <span
            className={
              'ml-1.5 rounded-full bg-brand-100 px-2 py-0.5 ' +
              'text-[10px] font-bold text-brand-700'
            }
          >
            {feeRulesCustomer.length} tiers
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFeeTab('reseller')}
          className={
            'flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase ' +
            'tracking-wider rounded-t-xl transition-all border-b-2 cursor-pointer ' +
            (feeTab === 'reseller'
              ? 'bg-white text-indigo-600 border-indigo-600 shadow-sm'
              : 'text-brand-500 hover:text-brand-800 border-transparent hover:bg-brand-100/50')
          }
        >
          <Store size={15} />
          Automatic (Reseller)
          <span
            className={
              'ml-1.5 rounded-full bg-indigo-100 px-2 py-0.5 ' +
              'text-[10px] font-bold text-indigo-700'
            }
          >
            {feeRulesReseller.length} tiers
          </span>
        </button>
      </div>

      <div
        className={
          'bg-brand-50/20 px-6 py-2.5 text-xs font-semibold text-brand-500 ' +
          'border-b border-brand-100 flex items-center justify-between'
        }
      >
        <span>
          {feeTab === 'customer'
            ? 'Configuring fee tiers for regular customers (Automatic - Customer).'
            : 'Configuring fee tiers for reseller clients (Automatic - Reseller).'}
        </span>
        <span className="font-bold text-brand-700">
          Active: {activeCount} / {currentRules.length} tiers
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[980px] w-full">
          <thead className="table-head">
            <tr>
              <th className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => toggleSort('active')}
                  className={
                    'group inline-flex items-center gap-1.5 font-bold ' +
                    'uppercase tracking-wider text-xs hover:text-brand-900 cursor-pointer'
                  }
                >
                  <span>Active</span>
                  {renderSortIndicator('active')}
                </button>
              </th>
              <th className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => toggleSort('label')}
                  className={
                    'group inline-flex items-center gap-1.5 font-bold ' +
                    'uppercase tracking-wider text-xs hover:text-brand-900 cursor-pointer'
                  }
                >
                  <span>Tier Label</span>
                  {renderSortIndicator('label')}
                </button>
              </th>
              <th className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => toggleSort('min')}
                  className={
                    'group inline-flex items-center gap-1.5 font-bold ' +
                    'uppercase tracking-wider text-xs hover:text-brand-900 cursor-pointer'
                  }
                >
                  <span>Min Price</span>
                  {renderSortIndicator('min')}
                </button>
              </th>
              <th className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => toggleSort('max')}
                  className={
                    'group inline-flex items-center gap-1.5 font-bold ' +
                    'uppercase tracking-wider text-xs hover:text-brand-900 cursor-pointer'
                  }
                >
                  <span>Max Price</span>
                  {renderSortIndicator('max')}
                </button>
              </th>
              <th className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => toggleSort('type')}
                  className={
                    'group inline-flex items-center gap-1.5 font-bold ' +
                    'uppercase tracking-wider text-xs hover:text-brand-900 cursor-pointer'
                  }
                >
                  <span>Type</span>
                  {renderSortIndicator('type')}
                </button>
              </th>
              <th className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => toggleSort('value')}
                  className={
                    'group inline-flex items-center gap-1.5 font-bold ' +
                    'uppercase tracking-wider text-xs hover:text-brand-900 cursor-pointer'
                  }
                >
                  <span>Fee Value</span>
                  {renderSortIndicator('value')}
                </button>
              </th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-50">
            {sortedFeeRules.map((rule) => (
              <SettingsFeeRuleRow
                key={rule.id}
                rule={rule}
                onUpdateRule={updateRule}
                onDeleteRule={deleteRule}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div
        className={
          'flex flex-col gap-3 border-t border-brand-100 bg-brand-50/50 ' +
          'px-6 py-4 sm:flex-row sm:items-center sm:justify-between'
        }
      >
        <p className="text-sm font-bold text-brand-600">
          {activeCount} active tiers in {feeTab === 'customer' ? 'Customer' : 'Reseller'}{' '}
          schedule. Sorted ascending by minimum price upon saving.
        </p>
        <div className="flex flex-wrap gap-2">
          {currentRules
            .filter((r) => r.active)
            .slice(0, 4)
            .map((rule) => (
              <span
                key={rule.id}
                className={
                  'pill bg-white border border-brand-200 text-brand-700 shadow-xs'
                }
              >
                {rule.label}:{' '}
                <strong className="ml-1 text-brand-900">
                  {rule.type === 'PERCENT'
                    ? `${number(rule.value)}%`
                    : money(rule.value)}
                </strong>
              </span>
            ))}
        </div>
      </div>
    </section>
  );
}
