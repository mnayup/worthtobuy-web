import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env?.VITE_API_URL || 'http://localhost:3100/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jastipflow_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('jastipflow_token');
      localStorage.removeItem('jastipflow_user');
      const path = window.location.pathname;
      const isPublic =
        path === '/' ||
        path.startsWith('/events') ||
        path.startsWith('/ready-stock') ||
        path.startsWith('/track') ||
        path === '/login';
      if (!isPublic) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Helper to format common validation messages into user-friendly English
function translateValidationText(text: string): string {
  if (typeof text !== 'string') return String(text);

  const fieldDict: Record<string, string> = {
    orderOpenAt: 'Orders Period Start',
    orderCloseAt: 'Orders Period End',
    departureAt: 'Event Period Start',
    returnAt: 'Event Period End',
    estimatedShippingAt: 'Estimated Shipping Date',
    code: 'Code',
    name: 'Name',
    title: 'Title',
    price: 'Price',
    costPrice: 'Cost Price',
    sellingPrice: 'Selling Price',
    exchangeRate: 'Exchange Rate',
    maxItems: 'Max Items',
    baggageCapacityKg: 'Baggage Capacity (kg)',
    email: 'Email',
    phone: 'Phone Number',
    whatsapp: 'WhatsApp Number',
    address: 'Address',
    password: 'Password',
    status: 'Status',
    notes: 'Notes',
    type: 'Type',
  };

  let translated = text;
  for (const [key, label] of Object.entries(fieldDict)) {
    translated = translated.replace(new RegExp(`\\b${key}\\b`, 'g'), label);
  }

  return translated
    .replace(/should not be empty/gi, 'is required and cannot be empty')
    .replace(/must not be empty/gi, 'is required and cannot be empty')
    .replace(/must be a string/gi, 'must be valid text')
    .replace(/must be a number conforming to the specified constraints/gi, 'must be a valid number')
    .replace(/must be a number/gi, 'must be a valid number')
    .replace(/must be an integer/gi, 'must be a whole number')
    .replace(/must be a valid ISO 8601 date string/gi, 'must be a valid date & time format')
    .replace(/must be a valid date/gi, 'must be a valid date')
    .replace(/must be a valid email/gi, 'must be a valid email address')
    .replace(/must be an email/gi, 'must be a valid email address')
    .replace(/must be a boolean value/gi, 'must be a boolean (yes/no) value')
    .replace(/must be shorter than or equal to (\d+) characters/gi, 'must be at most $1 characters')
    .replace(/must be longer than or equal to (\d+) characters/gi, 'must be at least $1 characters');
}

function sanitizeString(str: string): string {
  if (
    str.includes('prisma') ||
    str.includes('PrismaClient') ||
    str.includes('invocation in') ||
    str.includes('Invalid `') ||
    str.includes('Unique constraint failed') ||
    str.includes('Foreign key constraint failed')
  ) {
    if (str.includes('Unknown argument')) {
      const fieldMatch = str.match(/Unknown argument `?([^`\.]+)`?/);
      if (fieldMatch && fieldMatch[1]) {
        return `Unrecognized field: ${fieldMatch[1]}. Please verify your inputs.`;
      }
      return 'Unrecognized form field provided. Please check your inputs.';
    }
    if (str.includes('Provided String, expected Int') || str.includes('Expected Int')) {
      return 'Invalid number format. Please ensure all numeric inputs contain valid numbers.';
    }
    if (
      str.includes('premature end of input') ||
      str.includes('expected DateTime') ||
      str.includes('Provided String, expected DateTime') ||
      str.includes('Unable to fit') ||
      str.includes('ISO-8601')
    ) {
      return 'Invalid date or time format. Please check all date and time inputs.';
    }
    if (str.includes('Unique constraint failed')) {
      const fieldMatch = str.match(/fields:\s*\(`?([^`\)]+)`?\)/);
      if (fieldMatch && fieldMatch[1]) {
        return `A record with this ${fieldMatch[1]} already exists (duplicate). Please use a different value.`;
      }
      return 'This record already exists in the system (duplicate). Please check your inputs.';
    }
    if (str.includes('Foreign key constraint failed')) {
      return 'Referenced record was not found or is currently linked to other records in the system.';
    }
    if (str.includes('Record to update not found') || str.includes('Record to delete does not exist')) {
      return 'The target record was not found or has already been removed.';
    }
    if (str.includes('Argument') && (str.includes('is missing') || str.includes('missing'))) {
      return 'Please complete all required fields.';
    }
    if (str.includes('Value out of range')) {
      return 'Number value is out of permitted range.';
    }
    return 'A database structure error occurred on the server. Please verify your form inputs.';
  }

  if (
    str.includes('/Users/') ||
    str.includes('/home/') ||
    str.includes('node_modules') ||
    str.includes('\n    at ') ||
    str.includes('at async') ||
    str.includes('SyntaxError') ||
    str.includes('TypeError')
  ) {
    return 'A system error occurred while processing your request. Please check the form or try again later.';
  }

  return translateValidationText(str);
}

export const errorMessage = (error: any): string => {
  if (!error) return 'An unknown error occurred.';

  if (typeof error === 'string') {
    return sanitizeString(error);
  }

  let raw: any = error?.response?.data?.message || error?.response?.data?.error || error?.message || error;

  if (Array.isArray(raw)) {
    const cleaned = raw.map((item) => (typeof item === 'string' ? translateValidationText(item) : String(item)));
    return cleaned.join('\n');
  }

  if (typeof raw === 'object' && raw !== null) {
    if (typeof raw.message === 'string') {
      raw = raw.message;
    } else if (Array.isArray(raw.message)) {
      return raw.message.map((item: any) => translateValidationText(String(item))).join('\n');
    } else {
      raw = error?.message || 'A data error occurred.';
    }
  }

  const str = String(raw);

  // Network / Connection errors
  if (
    error?.code === 'ERR_NETWORK' ||
    error?.code === 'ECONNREFUSED' ||
    str.includes('Network Error') ||
    str.includes('Failed to fetch')
  ) {
    return 'Unable to connect to server. Please check your internet connection and ensure the backend is running.';
  }

  if (error?.code === 'ECONNABORTED' || str.includes('timeout')) {
    return 'Request timed out. Please check your connection and try again shortly.';
  }

  // HTTP status codes
  const status = error?.response?.status;
  if (str === 'Internal server error' || str === 'Internal Server Error' || (status === 500 && str.length < 5)) {
    return 'Internal server error. Please try again in a few moments.';
  }
  if (status === 401 || str.includes('Unauthorized')) {
    return 'Your session has expired or you are not signed in. Please sign in again.';
  }
  if (status === 403 || str.includes('Forbidden')) {
    return 'Access denied. You do not have permission to perform this action.';
  }
  if (status === 404 && (str.includes('Not Found') || str.includes('Cannot GET') || str.includes('Cannot POST'))) {
    return 'The requested resource or endpoint was not found.';
  }
  if (status === 409 || str.includes('Conflict')) {
    if (str && str !== 'Conflict' && str !== 'ConflictException') {
      return sanitizeString(str);
    }
    return 'A data conflict occurred. The record may have been updated by another user.';
  }
  if (status === 502 || status === 503 || status === 504) {
    return 'The backend server is temporarily unavailable. Please try again later.';
  }

  if (str.trim().startsWith('<!DOCTYPE html>') || str.trim().startsWith('<html')) {
    return 'Server encountered an issue and did not return a valid response.';
  }

  return sanitizeString(str);
};
