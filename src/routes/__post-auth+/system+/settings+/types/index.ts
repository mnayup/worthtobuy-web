export interface FeeRule {
  id: string;
  label: string;
  min: number;
  max: number | null;
  type: 'FIXED' | 'PERCENT';
  value: number;
  active: boolean;
}

export interface BrandSettings {
  name: string;
  tagline: string;
  whatsapp: string;
  instagram: string;
  instagramUrl: string;
  primaryColor: string;
  logoUrl: string;
}

export interface InvoiceSettings {
  businessName: string;
  prefix: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  whatsapp: string;
  email: string;
  address: string;
  footer: string;
}

export interface DatabaseBackupLog {
  id: number;
  operation_type: 'BACKUP' | 'RESTORE';
  filename: string;
  file_size_bytes: number;
  status: 'SUCCESS' | 'FAILED';
  triggered_by?: string;
  notes?: string;
  error_message?: string;
  created_at: string;
}

export interface SettingsData {
  brand: BrandSettings;
  invoice: InvoiceSettings;
  feeRules: FeeRule[];
  feeRulesReseller?: FeeRule[];
}


