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

export interface SettingsData {
  brand: BrandSettings;
  invoice: InvoiceSettings;
  feeRules: FeeRule[];
  feeRulesReseller?: FeeRule[];
}
