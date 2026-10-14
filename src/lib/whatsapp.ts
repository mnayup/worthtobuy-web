export const ADMIN_WA_NUMBER =
  import.meta.env?.VITE_WA_ADMIN_NUMBER || '6285186852535';
export const WA_GROUP_URL =
  import.meta.env?.VITE_WA_GROUP_URL ||
  'https://chat.whatsapp.com/EZoEchL2zv2KdNSzzLae1J?s=cl&p=a&mlu=4&ilr=4';

export const buildWhatsAppUrl = (message?: string, number: string = ADMIN_WA_NUMBER) => {
  if (!message) return `https://wa.me/${number}`;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
};
