import type { MasterDataEntity } from '../master-data-templates';

export function normalizeHeader(value: string): string {
  return value
    .toLowerCase()
    .replace(/\*/g, '')
    .replace(/[^a-z0-9]+/g, '');
}

/**
 * Robust date parser supporting Excel serial numbers, ISO strings, YYYY-MM-DD, DD/MM/YYYY, etc.
 */
export function parseExcelDate(val: any): { iso: string; date: Date } | null {
  if (val === undefined || val === null || val === '') return null;

  // 1. If numeric Excel date serial number (e.g. 46346)
  if (typeof val === 'number') {
    const ms = Math.round((val - 25569) * 86400 * 1000);
    const d = new Date(ms);
    if (!isNaN(d.getTime())) return { iso: d.toISOString(), date: d };
  }

  const str = String(val).trim();

  // 2. Handle DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = str.match(
    /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})(?:\s+(\d{1,2}):(\d{2}))?$/
  );
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    const year = parseInt(dmyMatch[3], 10);
    const hour = dmyMatch[4] ? parseInt(dmyMatch[4], 10) : 0;
    const minute = dmyMatch[5] ? parseInt(dmyMatch[5], 10) : 0;
    const d = new Date(year, month, day, hour, minute);
    if (!isNaN(d.getTime())) return { iso: d.toISOString(), date: d };
  }

  // 3. Native date parse fallback
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    return { iso: d.toISOString(), date: d };
  }

  return null;
}

const CUSTOMER_ALIASES: Record<string, string[]> = {
  fullName: ['namalengkap', 'fullname', 'nama', 'name', 'customername', 'namapelanggan'],
  whatsapp: [
    'nowhatsapp', 'whatsapp', 'phone', 'telepon', 'nohp', 'nomorwa', 'nomorwhatsapp', 'wa'
  ],
  email: ['email', 'surel', 'mail', 'alamatemail'],
  socialUsername: ['usernamemedsos', 'medsos', 'sosmed', 'instagram', 'ig', 'username', 'tiktok'],
  city: ['kota', 'city', 'kotadomisili', 'kabupaten'],
  address: ['alamat', 'alamatpengiriman', 'address', 'alamatlengkap'],
  postalCode: ['kodepos', 'pos', 'postalcode', 'zip', 'zipcode'],
  segment: ['segmen', 'segmencustomer', 'segment', 'kategori', 'tier'],
  status: ['status', 'statusaktif', 'isactive', 'aktif'],
  notes: ['catatan', 'keterangan', 'notes', 'remarks', 'catatankhusus'],
};

const PRODUCT_ALIASES: Record<string, string[]> = {
  name: ['namaproduk', 'productname', 'nama', 'name', 'barang', 'item', 'itemname'],
  stockMode: ['tipeproduk', 'tipestock', 'stockmode', 'tipe', 'type', 'mode'],
  period: ['kodeataunamaevent', 'kodeevent', 'namaevent', 'event', 'period', 'periode', 'trip'],
  sku: ['sku', 'kodeproduk', 'kode', 'barcode', 'skuproduk', 'productcode'],
  category: ['kategori', 'category', 'kategoriproduk'],
  brandName: ['brand', 'merek', 'merk', 'brandname'],
  storeLocation: ['lokasitoko', 'toko', 'tenant', 'store', 'storelocation', 'lokasi'],
  stockQuantity: ['stokfisik', 'stokfisikgudang', 'stok', 'qty', 'jumlah', 'quantity'],
  buyPrice: ['hargabeli', 'hargabelimodalrp', 'modal', 'costprice', 'buyprice', 'modalbeli'],
  sellingPrice: ['hargajual', 'hargajualrp', 'price', 'sellingprice', 'harga'],
  lowStockThreshold: ['batasstok', 'minstok', 'batasminimum', 'lowstockthreshold', 'threshold'],
  productUrl: ['linkweb', 'linkproduk', 'producturl', 'url', 'link'],
  imageUrl: ['urlfotoproduk', 'linkfoto', 'foto', 'imageurl', 'gambar', 'photo'],
  notes: ['catatan', 'keterangan', 'notes', 'catatanproduk'],
};

const EVENT_ALIASES: Record<string, string[]> = {
  name: ['namaevent', 'eventname', 'nama', 'name', 'tripname', 'judulevent'],
  type: ['tipeevent', 'tipe', 'type', 'jenisevent'],
  city: ['kota', 'kotanegaratujuan', 'destination', 'tujuan', 'city', 'country'],
  code: ['kodeevent', 'code', 'kode', 'eventcode'],
  status: ['statusevent', 'status'],
  departureAt: ['tglberangkattrip', 'tglberangkat', 'departure', 'departureat', 'berangkat'],
  returnAt: ['tglkepulangantrip', 'tglpulang', 'return', 'returnat', 'kembali', 'pulang'],
  orderOpenAt: ['tglbukaorder', 'orderopen', 'orderopenat', 'bukaorder', 'openorder'],
  orderCloseAt: ['tgltutuporder', 'orderclose', 'ordercloseat', 'tutuporder', 'closeorder'],
  estimatedShippingAt: ['estimasitglpengiriman', 'estimasikirim', 'shippingest', 'pengiriman'],
  maxItems: ['kuotamaksimalitem', 'kuotaitem', 'maxitems', 'kuota', 'maxitem'],
  baggageCapacityKg: ['kapasitasbagasikg', 'kapasitasbagasi', 'bagasi', 'baggagecapacitykg'],
  notes: ['catatan', 'keterangan', 'notes', 'catatanevent'],
};

export function buildHeaderMap(
  entity: MasterDataEntity,
  headers: string[]
): Record<string, string> {
  const map: Record<string, string> = {};
  const aliases =
    entity === 'customers'
      ? CUSTOMER_ALIASES
      : entity === 'products'
        ? PRODUCT_ALIASES
        : EVENT_ALIASES;

  headers.forEach((raw) => {
    const norm = normalizeHeader(raw);
    for (const [field, aliasList] of Object.entries(aliases)) {
      if (aliasList.some((alias) => normalizeHeader(alias) === norm)) {
        map[raw] = field;
        break;
      }
    }
  });

  return map;
}
