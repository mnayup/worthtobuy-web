import React from 'react';
import { Trash2 } from 'lucide-react';
import type { FeeRule } from '../types';

interface SettingsFeeRuleRowProps {
  rule: FeeRule;
  onUpdateRule: (id: string, patch: Partial<FeeRule>) => void;
  onDeleteRule: (id: string) => void;
}

export function SettingsFeeRuleRow({
  rule,
  onUpdateRule,
  onDeleteRule,
}: SettingsFeeRuleRowProps) {
  return (
    <tr
      className={
        rule.active
          ? 'bg-white hover:bg-brand-50/50 transition'
          : 'bg-brand-50/60 opacity-65'
      }
    >
      <td className="px-4 py-3">
        <input
          type="checkbox"
          className="h-4 w-4 rounded accent-cherry-600 cursor-pointer"
          checked={rule.active}
          onChange={(e) => onUpdateRule(rule.id, { active: e.target.checked })}
        />
      </td>
      <td className="px-4 py-3">
        <input
          className="input min-w-52"
          value={rule.label}
          onChange={(e) => onUpdateRule(rule.id, { label: e.target.value })}
        />
      </td>
      <td className="px-4 py-3">
        <input
          className="input min-w-36"
          type="number"
          min="0"
          value={rule.min}
          onChange={(e) =>
            onUpdateRule(rule.id, { min: Number(e.target.value || 0) })
          }
        />
      </td>
      <td className="px-4 py-3">
        <input
          className="input min-w-36"
          type="number"
          min="0"
          value={rule.max ?? ''}
          placeholder="No upper limit"
          onChange={(e) =>
            onUpdateRule(rule.id, {
              max: e.target.value === '' ? null : Number(e.target.value),
            })
          }
        />
      </td>
      <td className="px-4 py-3">
        <select
          className="input min-w-36"
          value={rule.type}
          onChange={(e) =>
            onUpdateRule(rule.id, {
              type: e.target.value as FeeRule['type'],
            })
          }
        >
          <option value="FIXED">Fixed Amount</option>
          <option value="PERCENT">Percentage</option>
        </select>
      </td>
      <td className="px-4 py-3">
        <div className="relative min-w-36">
          <input
            className="input"
            type="number"
            min="0"
            value={rule.value}
            onChange={(e) =>
              onUpdateRule(rule.id, {
                value: Number(e.target.value || 0),
              })
            }
          />
          <span
            className={
              'pointer-events-none absolute right-3 top-1/2 ' +
              '-translate-y-1/2 text-xs font-black text-brand-400'
            }
          >
            {rule.type === 'PERCENT' ? '%' : 'IDR'}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 text-right">
        <button
          type="button"
          onClick={() => onDeleteRule(rule.id)}
          className={
            'rounded-xl p-2 text-brand-400 hover:bg-cherry-50 ' +
            'hover:text-cherry-600 transition cursor-pointer'
          }
          title="Delete tier"
        >
          <Trash2 size={17} />
        </button>
      </td>
    </tr>
  );
}
