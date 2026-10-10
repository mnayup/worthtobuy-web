import XLSX from 'xlsx-js-style';
import type { MasterDataEntity, TemplateOptions } from './templates/template-types';
import { buildCustomersWorkbook } from './templates/customer-template';
import { buildProductsWorkbook } from './templates/product-template';
import { buildEventsWorkbook } from './templates/event-template';

export type { MasterDataEntity, TemplateOptions };

/**
 * Downloads a rich, colorful Excel template matching the Elnusa Petrofin AMT Upload design:
 * - Sheet 1: `Template Upload` (Banner Navy, Subtitle, Header, Data)
 * - Sheet 2: `Instructions` (Judul, Section Banner Kuning, Penjelasan, Contoh, Catatan)
 */
export function downloadMasterDataTemplate(
  entity: MasterDataEntity,
  options?: TemplateOptions
) {
  const wb = XLSX.utils.book_new();

  if (entity === 'customers') {
    buildCustomersWorkbook(wb);
    XLSX.writeFile(wb, 'Template_Upload_Customers_WorthToBuy.xlsx');
  } else if (entity === 'products') {
    buildProductsWorkbook(wb, options?.activeEvents || []);
    XLSX.writeFile(wb, 'Template_Upload_Products_WorthToBuy.xlsx');
  } else if (entity === 'events') {
    buildEventsWorkbook(wb);
    XLSX.writeFile(wb, 'Template_Upload_Events_WorthToBuy.xlsx');
  }
}
