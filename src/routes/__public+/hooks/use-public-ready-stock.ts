import { useEffect, useMemo, useState } from 'react';
import { api } from '~/lib/api';

export function usePublicReadyStock() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  useEffect(() => {
    async function fetchReadyStock() {
      try {
        setLoading(true);
        const res = await api.get('/public/products/ready-stock?limit=60');
        setProducts(res.data.items || []);
        if (res.data.filters?.categories) {
          setCategories(res.data.filters.categories);
        }
      } catch (err) {
        console.error('Failed to load ready stock', err);
      } finally {
        setLoading(false);
      }
    }
    fetchReadyStock();
  }, []);

  const filteredProducts = useMemo(() => {
    return products
      .filter((prod) => {
        const matchesCategory =
          selectedCategory === 'ALL' ||
          prod.category?.toLowerCase() === selectedCategory.toLowerCase();
        const term = search.trim().toLowerCase();
        const matchesSearch =
          !term ||
          prod.name?.toLowerCase().includes(term) ||
          prod.brandName?.toLowerCase().includes(term) ||
          prod.sku?.toLowerCase().includes(term) ||
          prod.notes?.toLowerCase().includes(term);

        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') {
          return Number(a.sellingPrice) - Number(b.sellingPrice);
        }
        if (sortBy === 'price_desc') {
          return Number(b.sellingPrice) - Number(a.sellingPrice);
        }
        if (sortBy === 'name_asc') {
          return a.name.localeCompare(b.name);
        }
        return b.id - a.id;
      });
  }, [products, selectedCategory, search, sortBy]);

  return {
    products,
    categories,
    loading,
    search,
    setSearch,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    selectedProduct,
    setSelectedProduct,
    filteredProducts,
  };
}
