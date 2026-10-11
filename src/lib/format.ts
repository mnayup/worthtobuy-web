import dayjs from 'dayjs';

export const money = (v: unknown) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(v || 0));

export const number = (v: unknown) =>
  new Intl.NumberFormat('id-ID').format(Number(v || 0));

export const date = (v: unknown) =>
  v ? dayjs(String(v)).format('DD MMM YYYY') : '-';

export const dateTime = (v: unknown) =>
  v ? dayjs(String(v)).format('DD MMM YYYY, HH:mm') : '-';

export const titleCase = (v?: string | null) =>
  v
    ? String(v)
        .replaceAll('_', ' ')
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase())
    : '';
