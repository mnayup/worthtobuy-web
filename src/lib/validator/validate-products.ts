import type { RowIssue } from './validator-types';

export function validateProductRow(
  raw: Record<string, any>,
  rowNum: number,
  seenKeys: Map<string, number>,
  activeEvents: Array<{ id: number; code: string; name: string }>
): { payload: Record<string, any>; issues: RowIssue[] } {
  const issues: RowIssue[] = [];
  const payload: Record<string, any> = {};

  // 1. Name
  const name = String(raw.name || '').trim();
  if (!name) {
    issues.push({
      field: 'name',
      fieldLabel: 'Nama Produk',
      error: 'Nama produk wajib diisi.',
      fixHint: 'Isi nama produk barang minimal 2 karakter.',
      enteredValue: raw.name,
    });
  } else {
    payload.name = name;
  }

  // 2. Stock Mode
  const rawMode = String(raw.stockMode || '').trim().toUpperCase();
  let stockMode: 'EVENT' | 'READY_STOCK' = 'EVENT';

  if (!rawMode) {
    stockMode = 'EVENT';
  } else if (rawMode.includes('READY') || rawMode.includes('STOK') || rawMode === 'READY_STOCK') {
    stockMode = 'READY_STOCK';
  } else if (rawMode.includes('EVENT') || rawMode.includes('TRIP') || rawMode.includes('JASTIP')) {
    stockMode = 'EVENT';
  } else {
    issues.push({
      field: 'stockMode',
      fieldLabel: 'Type Produk',
      error: `Type produk '${raw.stockMode}' tidak valid.`,
      fixHint: "Pilih salah satu: 'EVENT' atau 'READY_STOCK'.",
      enteredValue: raw.stockMode,
    });
  }
  payload.stockMode = stockMode;

  // 3. Event Binding
  const rawEvent = String(raw.period || '').trim();
  if (stockMode === 'EVENT') {
    if (!rawEvent) {
      issues.push({
        field: 'period',
        fieldLabel: 'Event Shopping',
        error: 'Event wajib diisi untuk produk bertipe EVENT.',
        fixHint: 'Masukkan Kode Event (contoh: EVT-xxx) atau Nama Event yang aktif.',
        enteredValue: raw.period,
      });
    } else {
      const match = activeEvents.find(
        (e) =>
          e.code.toLowerCase() === rawEvent.toLowerCase() ||
          e.name.toLowerCase() === rawEvent.toLowerCase() ||
          String(e.id) === rawEvent
      );
      if (match) {
        payload.periodId = match.id;
        payload._eventDisplay = `${match.code} • ${match.name}`;
      } else {
        issues.push({
          field: 'period',
          fieldLabel: 'Event Shopping',
          error: `Event '${rawEvent}' tidak ditemukan dalam daftar event aktif.`,
          fixHint: 'Periksa kembali Kode Event atau Nama Event pada sheet Panduan.',
          enteredValue: rawEvent,
        });
      }
    }
  } else {
    payload.periodId = null;
  }

  // 4. SKU
  const rawSku = String(raw.sku || '').trim();
  if (rawSku) {
    const skuKey = `sku_${rawSku.toLowerCase()}`;
    if (seenKeys.has(skuKey)) {
      const prevRow = seenKeys.get(skuKey);
      issues.push({
        field: 'sku',
        fieldLabel: 'SKU Produk',
        error: `SKU '${rawSku}' duplikat dengan Row ${prevRow} dalam file ini.`,
        fixHint: 'Pastikan setiap produk memiliki SKU unik, atau kosongkan kolom SKU.',
        enteredValue: rawSku,
      });
    } else {
      seenKeys.set(skuKey, rowNum);
      payload.sku = rawSku;
    }
  } else {
    payload.sku = null;
  }

  // 5. Stock Quantity
  const rawQty = raw.stockQuantity;
  if (stockMode === 'READY_STOCK') {
    if (rawQty === '' || rawQty === undefined || rawQty === null) {
      issues.push({
        field: 'stockQuantity',
        fieldLabel: 'Stok Fisik Gudang',
        error: 'Stok fisik gudang wajib diisi untuk produk READY_STOCK.',
        fixHint: 'Masukkan angka stok fisik yang tersedia (contoh: 10).',
        enteredValue: rawQty,
      });
    } else {
      const num = Number(rawQty);
      if (isNaN(num) || num < 0 || !Number.isInteger(num)) {
        issues.push({
          field: 'stockQuantity',
          fieldLabel: 'Stok Fisik Gudang',
          error: `Jumlah stok '${rawQty}' tidak valid.`,
          fixHint: 'Stok harus berupa bilangan bulat >= 0 (contoh: 0, 5, 20).',
          enteredValue: rawQty,
        });
      } else {
        payload.stockQuantity = num;
      }
    }
  } else {
    payload.stockQuantity = 0;
  }

  // 6. Buy Price
  const rawBuy = raw.buyPrice;
  if (rawBuy !== '' && rawBuy !== undefined && rawBuy !== null) {
    const cleaned = String(rawBuy).replace(/[Rp\s\.,]/g, '');
    const num = Number(cleaned);
    if (isNaN(num) || num < 0) {
      issues.push({
        field: 'buyPrice',
        fieldLabel: 'Harga Beli (Modal)',
        error: `Harga beli '${rawBuy}' tidak valid.`,
        fixHint: 'Masukkan angka harga modal IDR tanpa titik atau simbol Rp.',
        enteredValue: rawBuy,
      });
    } else {
      payload.buyPrice = num;
    }
  } else {
    payload.buyPrice = 0;
  }

  // 7. Selling Price
  const rawSell = raw.sellingPrice;
  if (rawSell !== '' && rawSell !== undefined && rawSell !== null) {
    const cleaned = String(rawSell).replace(/[Rp\s\.,]/g, '');
    const num = Number(cleaned);
    if (isNaN(num) || num < 0) {
      issues.push({
        field: 'sellingPrice',
        fieldLabel: 'Harga Jual',
        error: `Harga jual '${rawSell}' tidak valid.`,
        fixHint: 'Masukkan angka harga jual IDR tanpa titik atau simbol Rp.',
        enteredValue: rawSell,
      });
    } else {
      payload.sellingPrice = num;
    }
  } else {
    payload.sellingPrice = 0;
  }

  // 8. Low Stock Threshold
  const rawThresh = raw.lowStockThreshold;
  if (rawThresh !== '' && rawThresh !== undefined && rawThresh !== null) {
    const num = Number(rawThresh);
    payload.lowStockThreshold = isNaN(num) || num < 0 ? 3 : Math.floor(num);
  } else {
    payload.lowStockThreshold = 3;
  }

  // 9. Other fields
  payload.category = String(raw.category || '').trim() || null;
  payload.brandName = String(raw.brandName || '').trim() || null;
  payload.storeLocation = String(raw.storeLocation || '').trim() || null;
  payload.productUrl = String(raw.productUrl || '').trim() || null;
  payload.imageUrl = String(raw.imageUrl || '').trim() || null;
  payload.notes = String(raw.notes || '').trim() || null;

  return { payload, issues };
}
