export type MasterDataEntity = 'customers' | 'products' | 'events';

export interface TemplateOptions {
  activeEvents?: Array<{ id?: number; code: string; name: string; city?: string }>;
}
