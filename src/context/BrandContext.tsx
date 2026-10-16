import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { api } from '~/lib/api';
import { BRAND_NAME, INSTAGRAM_HANDLE, INSTAGRAM_URL } from '~/lib/brand';
import { ADMIN_WA_NUMBER } from '~/lib/whatsapp';

export interface BrandContextValue {
  brandName: string;
  tagline: string;
  whatsapp: string;
  instagram: string;
  instagramUrl: string;
  primaryColor: string;
  logoUrl: string;
  bankSettings: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
}

const defaultBrandContext: BrandContextValue = {
  brandName: BRAND_NAME,
  tagline: 'Your Trusted Jastip Bestie & Personal Shopper Nasional',
  whatsapp: ADMIN_WA_NUMBER,
  instagram: INSTAGRAM_HANDLE,
  instagramUrl: INSTAGRAM_URL,
  primaryColor: '#b7332b',
  logoUrl: '/worthtobuy-logo.png',
  bankSettings: {
    bankName: 'BCA (Bank Central Asia)',
    accountNumber: '1234567890',
    accountHolder: 'WORTHTOBUY',
  },
};

const BrandContext = createContext<BrandContextValue>(defaultBrandContext);

export function BrandProvider({ children }: { children: ReactNode }) {
  const [brand, setBrand] = useState<BrandContextValue>(defaultBrandContext);

  useEffect(() => {
    let isMounted = true;
    api
      .get('/public/overview')
      .then((res) => {
        if (!isMounted || !res.data?.brand) return;
        const b = res.data.brand;
        setBrand({
          brandName: b.name || BRAND_NAME,
          tagline: b.tagline || defaultBrandContext.tagline,
          whatsapp: b.whatsapp || ADMIN_WA_NUMBER,
          instagram: b.instagram || INSTAGRAM_HANDLE,
          instagramUrl: b.instagramUrl || INSTAGRAM_URL,
          primaryColor: b.primaryColor || defaultBrandContext.primaryColor,
          logoUrl: b.logoUrl || defaultBrandContext.logoUrl,
          bankSettings: {
            bankName: b.bank?.bankName || defaultBrandContext.bankSettings.bankName,
            accountNumber: b.bank?.accountNumber || defaultBrandContext.bankSettings.accountNumber,
            accountHolder: b.bank?.accountHolder || defaultBrandContext.bankSettings.accountHolder,
          },
        });
      })
      .catch((err) => {
        // Fall back quietly to defaults if backend is unreachable
        console.debug('Failed loading dynamic brand overview:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return <BrandContext.Provider value={brand}>{children}</BrandContext.Provider>;
}

export function useBrand() {
  return useContext(BrandContext);
}
