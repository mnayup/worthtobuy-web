import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export function HeaderSearch() {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (location.pathname === '/search') {
      setQuery(new URLSearchParams(location.search).get('q') || '');
    }
  }, [location.pathname, location.search]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative hidden md:block">
      <Search
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        size={17}
      />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="w-[340px] rounded-xl border border-slate-200 bg-slate-50/80 py-2 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-rose-400 focus:bg-white focus:ring-4 focus:ring-rose-500/10 placeholder:text-slate-400"
        placeholder="Search orders, customers, items, events..."
      />
    </form>
  );
}
