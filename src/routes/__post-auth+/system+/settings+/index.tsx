import React from 'react';
import { Save } from 'lucide-react';
import { api } from '~/lib/api';
import { PageHeader } from '~/components/PageHeader';
import { Toast } from '~/components/Toast';
import type { SettingsData, BrandSettings, InvoiceSettings, FeeRule } from './types';
import { useSystemSettings, saveSettingsAction } from './hooks/use-system-settings';
import { SettingsBrandSection } from './components/settings-brand-section';
import { SettingsInvoiceSection } from './components/settings-invoice-section';
import { SettingsFeeScheduleSection } from './components/settings-fee-schedule-section';

export async function loader(): Promise<SettingsData> {
  const response = await api.get('/settings');
  return response.data;
}

export async function action(data: {
  brand: BrandSettings;
  invoice: InvoiceSettings;
  feeRulesCustomer: FeeRule[];
  feeRulesReseller: FeeRule[];
}) {
  return saveSettingsAction(data);
}

export default function SettingsRoute() {
  const {
    brand,
    setBrand,
    invoice,
    setInvoice,
    feeTab,
    setFeeTab,
    feeRulesCustomer,
    feeRulesReseller,
    currentRules,
    sortedFeeRules,
    loading,
    saving,
    toast,
    setToast,
    sortKey,
    sortDirection,
    toggleSort,
    updateRule,
    addRule,
    deleteRule,
    saveAll,
  } = useSystemSettings();

  return (
    <div className="animate-rise space-y-6">
      <PageHeader
        title="WORTHTOBUY Settings"
        description={
          'Configure brand identity, invoice presets, and tiered concierge fees ' +
          '(automatically calculated or overrideable per order).'
        }
        actions={
          <button
            className="btn-primary cursor-pointer"
            onClick={saveAll}
            disabled={saving || loading}
          >
            <Save size={17} />
            {saving ? 'Saving...' : 'Save All Changes'}
          </button>
        }
      />

      {loading ? (
        <div className="card grid min-h-56 place-items-center">
          <div
            className={
              'h-10 w-10 animate-spin rounded-full border-4 ' +
              'border-brand-100 border-t-cherry-500'
            }
          />
        </div>
      ) : (
        <>
          <SettingsBrandSection brand={brand} setBrand={setBrand} />

          <SettingsInvoiceSection invoice={invoice} setInvoice={setInvoice} />

          <SettingsFeeScheduleSection
            feeTab={feeTab}
            setFeeTab={setFeeTab}
            feeRulesCustomer={feeRulesCustomer}
            feeRulesReseller={feeRulesReseller}
            currentRules={currentRules}
            sortedFeeRules={sortedFeeRules}
            sortKey={sortKey}
            sortDirection={sortDirection}
            toggleSort={toggleSort}
            updateRule={updateRule}
            addRule={addRule}
            deleteRule={deleteRule}
          />
        </>
      )}

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
