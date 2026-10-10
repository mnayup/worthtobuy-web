import type { RowIssue } from './validator-types';
import { parseExcelDate } from './validator-utils';

export function validateEventRow(
  raw: Record<string, any>,
  rowNum: number,
  seenKeys: Map<string, number>
): { payload: Record<string, any>; issues: RowIssue[] } {
  const issues: RowIssue[] = [];
  const payload: Record<string, any> = {};

  // 1. Name
  const name = String(raw.name || '').trim();
  if (!name) {
    issues.push({
      field: 'name',
      fieldLabel: 'Nama Event',
      error: 'Nama event shopping wajib diisi.',
      fixHint: 'Isi nama shopping event minimal 3 karakter.',
      enteredValue: raw.name,
    });
  } else {
    payload.name = name;
  }

  // 2. City / Destination
  const city = String(raw.city || '').trim();
  if (!city) {
    issues.push({
      field: 'city',
      fieldLabel: 'Kota Tujuan',
      error: 'Kota / Negara tujuan belanja wajib diisi.',
      fixHint: 'Isi destinasi trip (contoh: Bangkok, Thailand).',
      enteredValue: raw.city,
    });
  } else {
    payload.city = city;
  }

  // 3. Type
  const rawType = String(raw.type || '').trim().toUpperCase();
  if (!rawType || rawType.includes('LOCAL') || rawType.includes('LOKAL')) {
    payload.type = 'LOCAL';
  } else if (rawType.includes('INTER')) {
    payload.type = 'INTERNATIONAL';
  } else {
    issues.push({
      field: 'type',
      fieldLabel: 'Type Event',
      error: `Type event '${raw.type}' tidak valid.`,
      fixHint: "Pilih: 'LOCAL' atau 'INTERNATIONAL'.",
      enteredValue: raw.type,
    });
  }

  // 4. Status
  const rawStatus = String(raw.status || '').trim().toUpperCase();
  const validStatuses = ['DRAFT', 'OPEN', 'CLOSED', 'COMPLETED', 'CANCELLED'];
  if (!rawStatus) {
    payload.status = 'DRAFT';
  } else if (validStatuses.includes(rawStatus)) {
    payload.status = rawStatus;
  } else {
    issues.push({
      field: 'status',
      fieldLabel: 'Status Event',
      error: `Status event '${raw.status}' tidak valid.`,
      fixHint: 'Gunakan: DRAFT, OPEN, CLOSED, COMPLETED, atau CANCELLED.',
      enteredValue: raw.status,
    });
  }

  // 5. Code
  const rawCode = String(raw.code || '').trim();
  if (rawCode) {
    const codeKey = `code_${rawCode.toLowerCase()}`;
    if (seenKeys.has(codeKey)) {
      const prevRow = seenKeys.get(codeKey);
      issues.push({
        field: 'code',
        fieldLabel: 'Kode Event',
        error: `Kode event '${rawCode}' duplikat dengan Row ${prevRow} dalam file ini.`,
        fixHint: 'Gunakan kode event unik atau kosongkan agar dibuatkan otomatis.',
        enteredValue: rawCode,
      });
    } else {
      seenKeys.set(codeKey, rowNum);
      payload.code = rawCode;
    }
  } else {
    const date = new Date();
    const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const year = date.getFullYear().toString().slice(-2);
    const random = Math.floor(1000 + Math.random() * 9000);
    payload.code = `EVT-${month}${year}-${random}`;
  }

  // 6. Dates Validation
  const departureParsed = parseExcelDate(raw.departureAt);
  const returnParsed = parseExcelDate(raw.returnAt);

  if (!departureParsed) {
    issues.push({
      field: 'departureAt',
      fieldLabel: 'Tgl Berangkat Trip',
      error: 'Tanggal keberangkatan trip wajib diisi dengan format tanggal valid.',
      fixHint: 'Use YYYY-MM-DD format (contoh: 2026-11-20) atau YYYY-MM-DD HH:mm.',
      enteredValue: raw.departureAt,
    });
  } else {
    payload.departureAt = departureParsed.iso;
  }

  if (!returnParsed) {
    issues.push({
      field: 'returnAt',
      fieldLabel: 'Tgl Kepulangan Trip',
      error: 'Tanggal kepulangan trip wajib diisi dengan format tanggal valid.',
      fixHint: 'Use YYYY-MM-DD format (contoh: 2026-11-27) atau YYYY-MM-DD HH:mm.',
      enteredValue: raw.returnAt,
    });
  } else {
    payload.returnAt = returnParsed.iso;
  }

  if (departureParsed && returnParsed && departureParsed.date > returnParsed.date) {
    issues.push({
      field: 'returnAt',
      fieldLabel: 'Tgl Kepulangan Trip',
      error: 'Tanggal kepulangan tidak boleh lebih awal dari tanggal keberangkatan.',
      fixHint: 'Ubah tanggal kepulangan agar sama dengan atau setelah keberangkatan.',
      enteredValue: `${raw.departureAt} s/d ${raw.returnAt}`,
    });
  }

  // Order Open & Order Close Dates
  const openParsed = parseExcelDate(raw.orderOpenAt);
  const closeParsed = parseExcelDate(raw.orderCloseAt);

  if (!openParsed) {
    issues.push({
      field: 'orderOpenAt',
      fieldLabel: 'Tgl Buka Order',
      error: 'Tanggal buka order wajib diisi dengan format tanggal valid.',
      fixHint: 'Use YYYY-MM-DD format (contoh: 2026-10-25) atau YYYY-MM-DD HH:mm.',
      enteredValue: raw.orderOpenAt,
    });
  } else {
    payload.orderOpenAt = openParsed.iso;
  }

  if (!closeParsed) {
    issues.push({
      field: 'orderCloseAt',
      fieldLabel: 'Tgl Tutup Order',
      error: 'Tanggal tutup order wajib diisi dengan format tanggal valid.',
      fixHint: 'Use YYYY-MM-DD format (contoh: 2026-11-18) atau YYYY-MM-DD HH:mm.',
      enteredValue: raw.orderCloseAt,
    });
  } else {
    payload.orderCloseAt = closeParsed.iso;
  }

  if (openParsed && closeParsed && openParsed.date > closeParsed.date) {
    issues.push({
      field: 'orderCloseAt',
      fieldLabel: 'Tgl Tutup Order',
      error: 'Tanggal tutup order tidak boleh lebih awal dari tanggal buka order.',
      fixHint: 'Ubah tanggal tutup order agar sama dengan atau setelah tanggal buka order.',
      enteredValue: `${raw.orderOpenAt} s/d ${raw.orderCloseAt}`,
    });
  }

  // Optional fields
  const shippingParsed = parseExcelDate(raw.estimatedShippingAt);
  payload.estimatedShippingAt = shippingParsed ? shippingParsed.iso : null;

  const rawMax = raw.maxItems;
  payload.maxItems =
    rawMax !== '' && rawMax !== undefined && !isNaN(Number(rawMax))
      ? Number(rawMax)
      : null;

  const rawBaggage = raw.baggageCapacityKg;
  payload.baggageCapacityKg =
    rawBaggage !== '' && rawBaggage !== undefined && !isNaN(Number(rawBaggage))
      ? Number(rawBaggage)
      : null;

  payload.notes = String(raw.notes || '').trim() || null;

  return { payload, issues };
}
