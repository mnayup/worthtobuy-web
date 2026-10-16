import React, { useRef, useState } from 'react';
import {
  Database,
  Download,
  Upload,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  FileCode,
  HardDrive,
  User,
  Calendar,
} from 'lucide-react';
import type { DatabaseBackupLog } from '../types';

interface SettingsBackupSectionProps {
  logs: DatabaseBackupLog[];
  logsTotal: number;
  loadingLogs: boolean;
  downloading: boolean;
  restoring: boolean;
  onDownloadBackup: () => Promise<void>;
  onRestoreBackup: (file: File) => Promise<any>;
  onRefreshLogs: () => void;
}

function formatBytes(bytes: number, decimals = 2) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function SettingsBackupSection({
  logs,
  logsTotal,
  loadingLogs,
  downloading,
  restoring,
  onDownloadBackup,
  onRestoreBackup,
  onRefreshLogs,
}: SettingsBackupSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setConfirmModalOpen(true);
    }
    e.target.value = '';
  };

  const handleConfirmRestore = async () => {
    if (!selectedFile) return;
    setConfirmModalOpen(false);
    try {
      await onRestoreBackup(selectedFile);
    } finally {
      setSelectedFile(null);
    }
  };

  return (
    <section className="card p-6 space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600">
            <Database size={22} />
          </div>
          <div>
            <h2 className="section-title">Database Backup & Restore</h2>
            <p className="text-sm font-medium text-brand-500">
              Create instant full PostgreSQL backups (.sql.gz) or restore your database with complete audit logging.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRefreshLogs}
          disabled={loadingLogs}
          className="btn-secondary text-xs self-start sm:self-auto cursor-pointer inline-flex items-center gap-1.5"
        >
          <RefreshCw size={13} className={loadingLogs ? 'animate-spin' : ''} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Action Cards: Backup and Restore */}
      <div className="grid gap-5 md:grid-cols-2">
        {/* Backup Card */}
        <div className="rounded-2xl border border-brand-200 bg-brand-50/40 p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-white p-2 border border-brand-200 text-brand-700 shadow-2xs">
                <Download size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-brand-900">Download Database Backup</h3>
                <p className="text-xs text-brand-500">Generates a live gzip-compressed dump of your database.</p>
              </div>
            </div>
            <p className="text-xs text-brand-600 leading-relaxed pt-1">
              Creates a point-in-time PostgreSQL snapshot (.sql.gz) containing all tables, schema definitions, transactions, and user records.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={onDownloadBackup}
              disabled={downloading || restoring}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand-900 hover:bg-brand-800 text-white px-4 py-2.5 text-xs font-bold shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              {downloading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Generating & Downloading Backup...</span>
                </>
              ) : (
                <>
                  <Download size={15} />
                  <span>Download Backup Now (.sql.gz)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Restore Card */}
        <div className="rounded-2xl border border-rose-200 bg-rose-50/30 p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-white p-2 border border-rose-200 text-rose-600 shadow-2xs">
                <Upload size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-brand-900">Restore Database from File</h3>
                <p className="text-xs text-brand-500">Import a previously created .sql or .sql.gz backup file.</p>
              </div>
            </div>
            <div className="flex items-start gap-1.5 text-xs text-rose-700 bg-rose-50 border border-rose-200/80 rounded-xl p-2.5">
              <AlertTriangle size={15} className="shrink-0 mt-0.5 text-rose-600" />
              <span>
                <strong>Warning:</strong> Restoring will overwrite existing database records with the snapshot from your backup file.
              </span>
            </div>
          </div>

          <div className="pt-2">
            <input
              type="file"
              ref={fileInputRef}
              accept=".sql,.gz,.tar"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={downloading || restoring}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-rose-300 bg-white hover:bg-rose-50 text-rose-700 px-4 py-2.5 text-xs font-bold shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              {restoring ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Restoring Database...</span>
                </>
              ) : (
                <>
                  <Upload size={15} />
                  <span>Select Backup File to Restore</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Restore */}
      {confirmModalOpen && selectedFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-rose-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="rounded-2xl bg-rose-100 p-3">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-brand-950">Confirm Database Restore</h3>
                <p className="text-xs text-brand-500">This action will modify current database data.</p>
              </div>
            </div>

            <div className="rounded-xl border border-brand-200 bg-brand-50/50 p-3 text-xs space-y-1.5 font-medium text-brand-800">
              <p>
                <strong>Selected file:</strong> <span className="font-mono">{selectedFile.name}</span>
              </p>
              <p>
                <strong>Size:</strong> {formatBytes(selectedFile.size)}
              </p>
            </div>

            <p className="text-xs text-brand-600 leading-relaxed">
              Are you sure you want to proceed with restoring this backup? Ensure you have taken a fresh backup of the current database before restoring.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setConfirmModalOpen(false);
                  setSelectedFile(null);
                }}
                className="btn-secondary text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRestore}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 text-xs font-bold shadow-xs transition cursor-pointer"
              >
                <Upload size={14} />
                <span>Yes, Proceed Restore</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History & Audit Logs Table */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-brand-500" />
            <h3 className="text-xs font-bold text-brand-900 uppercase tracking-wider">
              Backup & Restore History Log ({logsTotal})
            </h3>
          </div>
        </div>

        {logs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-brand-200 bg-brand-50/30 p-8 text-center">
            <HardDrive size={32} className="mx-auto text-brand-300 mb-2" />
            <p className="text-xs font-bold text-brand-800">No backup or restore logs yet</p>
            <p className="text-[11px] text-brand-400 mt-0.5">
              Click &quot;Download Backup Now&quot; above to create your first backup.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-brand-200 shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-brand-50 text-brand-600 font-bold border-b border-brand-200">
                <tr>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Filename</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Triggered By</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100 bg-white font-medium text-brand-800">
                {logs.map((log) => {
                  const isBackup = log.operation_type === 'BACKUP';
                  const isSuccess = log.status === 'SUCCESS';

                  return (
                    <tr key={log.id} className="hover:bg-brand-50/50 transition">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-black tracking-wide uppercase ${
                            isBackup
                              ? 'bg-sky-50 text-sky-700 border border-sky-200'
                              : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}
                        >
                          {isBackup ? <Download size={11} /> : <Upload size={11} />}
                          <span>{log.operation_type}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] truncate max-w-xs" title={log.filename}>
                        <div className="flex items-center gap-1.5">
                          <FileCode size={13} className="text-brand-400 shrink-0" />
                          <span className="truncate">{log.filename}</span>
                        </div>
                        {log.error_message && (
                          <p className="text-[10px] text-rose-600 font-sans mt-0.5 truncate" title={log.error_message}>
                            {log.error_message}
                          </p>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-brand-500 font-mono text-[11px]">
                        {formatBytes(log.file_size_bytes)}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-brand-600">
                          <User size={12} className="text-brand-400" />
                          <span>{log.triggered_by || 'System'}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {isSuccess ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                            <CheckCircle2 size={13} className="text-emerald-600" />
                            <span>Success</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-700 font-bold text-[11px]">
                            <XCircle size={13} className="text-rose-600" />
                            <span>Failed</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-brand-500 text-[11px]">
                        {new Date(log.created_at).toLocaleString('id-ID', {
                          timeZone: 'Asia/Jakarta',
                          dateStyle: 'medium',
                          timeStyle: 'medium',
                        })} WIB
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
