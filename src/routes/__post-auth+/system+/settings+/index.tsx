import React, { useState } from 'react';
import { Save, Building2, ReceiptText, Database, Calculator } from 'lucide-react';
import { api } from '~/lib/api';
import { PageHeader } from '~/components/PageHeader';
import { Toast } from '~/components/Toast';
import type { SettingsData, BrandSettings, InvoiceSettings, FeeRule } from './types';
import { useSystemSettings, saveSettingsAction } from './hooks/use-system-settings';
import { SettingsBrandSection } from './components/settings-brand-section';
import { SettingsInvoiceSection } from './components/settings-invoice-section';
import { SettingsFeeScheduleSection } from './components/settings-fee-schedule-section';
import { SettingsBackupSection } from './components/settings-backup-section';

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

type SettingsTab = 'brand' | 'invoice' | 'backup' | 'fees';

const TABS: { id: SettingsTab; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { id: 'brand', label: 'Brand & Public Identity', icon: Building2 },
  { id: 'invoice', label: 'Invoice Settings', icon: ReceiptText },
  { id: 'backup', label: 'Database Backup & Restore', icon: Database },
  { id: 'fees', label: 'Concierge Fee Schedule', icon: Calculator },
];

export default function SettingsRoute() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('brand');

  const {
    brand,
    setBrand,
    invoice,
    setInvoice,
    backupLogs,
    backupLogsTotal,
    loadingLogs,
    downloadingBackup,
    restoringBackup,
    downloadDatabaseBackup,
    restoreDatabaseBackup,
    fetchBackupLogs,
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
        description="Configure brand identity, invoice presets, tiered concierge fees, and manage database backup and restore operations."
        actions={
          activeTab !== 'backup' ? (
            <button
              className="btn-primary cursor-pointer flex items-center gap-2"
              onClick={saveAll}
              disabled={saving || loading}
            >
              <Save size={17} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          ) : undefined
        }
      />

      {/* Settings Navigation Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <nav className="-mb-px flex space-x-2 sm:space-x-4 overflow-x-auto" aria-label="Settings Tabs">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`group inline-flex items-center gap-2 border-b-2 py-3 px-3 sm:px-4 text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-cherry-600 text-cherry-600 dark:border-cherry-500 dark:text-cherry-400'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-700 dark:hover:text-gray-200'
                }`}
              >
                <Icon
                  size={18}
                  className={`transition-colors ${
                    isActive
                      ? 'text-cherry-600 dark:text-cherry-400'
                      : 'text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300'
                  }`}
                />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

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
        <div className="pt-2">
          {activeTab === 'brand' && (
            <div className="space-y-6">
              <SettingsBrandSection brand={brand} setBrand={setBrand} />
            </div>
          )}

          {activeTab === 'invoice' && (
            <div className="space-y-6">
              <SettingsInvoiceSection invoice={invoice} setInvoice={setInvoice} />
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="space-y-6">
              <SettingsBackupSection
                logs={backupLogs}
                logsTotal={backupLogsTotal}
                loadingLogs={loadingLogs}
                downloading={downloadingBackup}
                restoring={restoringBackup}
                onDownloadBackup={downloadDatabaseBackup}
                onRestoreBackup={restoreDatabaseBackup}
                onRefreshLogs={fetchBackupLogs}
              />
            </div>
          )}

          {activeTab === 'fees' && (
            <div className="space-y-6">
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
            </div>
          )}
        </div>
      )}

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
