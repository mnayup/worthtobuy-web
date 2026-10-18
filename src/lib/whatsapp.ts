export const ADMIN_WA_NUMBER =
  import.meta.env?.VITE_WA_ADMIN_NUMBER || '6285186852535';
export const WA_GROUP_URL =
  import.meta.env?.VITE_WA_GROUP_URL ||
  'https://chat.whatsapp.com/EZoEchL2zv2KdNSzzLae1J?s=cl&p=a&mlu=4&ilr=4';

export const formatWhatsAppNumber = (number: string): string => {
  let clean = String(number || '').replace(/\D/g, '');
  if (clean.startsWith('0')) clean = `62${clean.slice(1)}`;
  else if (clean.startsWith('8')) clean = `62${clean}`;
  return clean;
};

export const buildWhatsAppUrl = (message?: string, number: string = ADMIN_WA_NUMBER) => {
  const cleanPhone = formatWhatsAppNumber(number);
  if (!message) {
    return cleanPhone ? `https://api.whatsapp.com/send/?phone=${cleanPhone}` : `https://api.whatsapp.com/send/`;
  }
  const encoded = encodeURIComponent(message);
  return cleanPhone
    ? `https://api.whatsapp.com/send/?phone=${cleanPhone}&text=${encoded}`
    : `https://api.whatsapp.com/send/?text=${encoded}`;
};

