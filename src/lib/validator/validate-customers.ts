import type { RowIssue } from './validator-types';

export function validateCustomerRow(
  raw: Record<string, any>,
  rowNum: number,
  seenKeys: Map<string, number>
): { payload: Record<string, any>; issues: RowIssue[] } {
  const issues: RowIssue[] = [];
  const payload: Record<string, any> = {};

  // 1. Full Name
  const fullName = String(raw.fullName || '').trim();
  if (!fullName) {
    issues.push({
      field: 'fullName',
      fieldLabel: 'Nama Lengkap',
      error: 'Nama lengkap wajib diisi.',
      fixHint: 'Isi nama lengkap customer minimal 2 karakter.',
      enteredValue: raw.fullName,
    });
  } else if (fullName.length < 2) {
    issues.push({
      field: 'fullName',
      fieldLabel: 'Nama Lengkap',
      error: 'Nama lengkap terlalu pendek (minimal 2 karakter).',
      fixHint: 'Lengkapi nama customer dengan benar.',
      enteredValue: fullName,
    });
  } else {
    payload.fullName = fullName;
  }

  // 2. WhatsApp Number
  const rawWa = String(raw.whatsapp || '').trim();
  if (!rawWa) {
    issues.push({
      field: 'whatsapp',
      fieldLabel: 'No WhatsApp',
      error: 'Nomor WhatsApp wajib diisi.',
      fixHint: 'Masukkan nomor WhatsApp aktif dengan format 08xxx atau 628xxx.',
      enteredValue: raw.whatsapp,
    });
  } else {
    let cleanWa = rawWa.replace(/[^\d+]/g, '');
    if (cleanWa.startsWith('0')) cleanWa = '62' + cleanWa.substring(1);
    else if (cleanWa.startsWith('+62')) cleanWa = '62' + cleanWa.substring(3);
    else if (cleanWa.startsWith('+')) cleanWa = cleanWa.substring(1);

    if (cleanWa.length < 9 || cleanWa.length > 15 || !/^\d+$/.test(cleanWa)) {
      issues.push({
        field: 'whatsapp',
        fieldLabel: 'No WhatsApp',
        error: `Format nomor WhatsApp tidak valid (${rawWa}).`,
        fixHint: 'Nomor HP/WA harus berupa 9-15 digit angka (contoh: 081234567890).',
        enteredValue: rawWa,
      });
    } else {
      const waKey = `wa_${cleanWa}`;
      if (seenKeys.has(waKey)) {
        const prevRow = seenKeys.get(waKey);
        issues.push({
          field: 'whatsapp',
          fieldLabel: 'No WhatsApp',
          error: `Nomor WhatsApp ${rawWa} duplikat dengan Row ${prevRow} dalam file ini.`,
          fixHint: 'Pastikan nomor WhatsApp tidak berulang dalam satu file Excel.',
          enteredValue: rawWa,
        });
      } else {
        seenKeys.set(waKey, rowNum);
        payload.whatsapp = cleanWa;
      }
    }
  }

  // 3. Email (Optional)
  const rawEmail = String(raw.email || '').trim();
  if (rawEmail) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(rawEmail)) {
      issues.push({
        field: 'email',
        fieldLabel: 'Email',
        error: `Invalid email format (${rawEmail}).`,
        fixHint: 'Perbaiki format email (contoh: nama@domain.com) atau kosongkan.',
        enteredValue: rawEmail,
      });
    } else {
      payload.email = rawEmail.toLowerCase();
    }
  } else {
    payload.email = null;
  }

  // 4. Social Media Username
  payload.socialUsername = String(raw.socialUsername || '').trim() || null;

  // 5. City
  payload.city = String(raw.city || '').trim() || null;

  // 6. Address
  payload.address = String(raw.address || '').trim() || null;

  // 7. Postal Code
  const rawPostal = String(raw.postalCode || '').trim();
  payload.postalCode = rawPostal ? rawPostal.replace(/\D/g, '') : null;

  // 8. Segment
  const rawSegment = String(raw.segment || '').trim().toUpperCase();
  const validSegments = ['REGULAR', 'PRIORITY', 'PROBLEM', 'INACTIVE'];
  if (!rawSegment) {
    payload.segment = 'REGULAR';
  } else if (validSegments.includes(rawSegment)) {
    payload.segment = rawSegment;
  } else if (rawSegment.includes('PRIORITAS') || rawSegment.includes('VIP')) {
    payload.segment = 'PRIORITY';
  } else {
    issues.push({
      field: 'segment',
      fieldLabel: 'Segmen Customer',
      error: `Pilihan segmen '${raw.segment}' tidak dikenali.`,
      fixHint: 'Gunakan: REGULAR, PRIORITY, PROBLEM, atau INACTIVE.',
      enteredValue: raw.segment,
    });
  }

  // 9. Status
  const rawStatus = String(raw.status || '').trim().toUpperCase();
  if (
    !rawStatus ||
    rawStatus === 'AKTIF' ||
    rawStatus === 'ACTIVE' ||
    rawStatus === 'TRUE' ||
    rawStatus === '1'
  ) {
    payload.status = 'active';
  } else if (
    rawStatus === 'NONAKTIF' ||
    rawStatus === 'INACTIVE' ||
    rawStatus === 'FALSE' ||
    rawStatus === '0'
  ) {
    payload.status = 'inactive';
  } else {
    payload.status = 'active';
  }

  // 10. Notes
  payload.notes = String(raw.notes || '').trim() || null;

  return { payload, issues };
}
