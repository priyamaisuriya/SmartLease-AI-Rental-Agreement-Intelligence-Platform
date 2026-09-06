import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { properties } from '../data/mockData';
import { Search as SearchIcon, MapPin } from 'lucide-react';

const Properties = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('recommended');
  const [minRent, setMinRent] = useState('');
  const [maxRent, setMaxRent] = useState('');
  const [filters, setFilters] = useState({
    bhk: new Set(),
    furnishing: new Set(),
    type: new Set(),
  });
  const [favorites, setFavorites] = useState(
    new Set(properties.filter(p => p.favorite).map(p => p.id))
  );

  const toggleFilter = (category, value) => {
    setFilters(prev => {
      const newSet = new Set(prev[category]);
      if (newSet.has(value)) newSet.delete(value);
      else newSet.add(value);
      return { ...prev, [category]: newSet };
    });
  };

  const resetFilters = () => {
    setSearch('');
    setMinRent('');
    setMaxRent('');
    setFilters({ bhk: new Set(), furnishing: new Set(), type: new Set() });
  };

  const toggleFavorite = (e, id) => {
    e.stopPropagation();
    setFavorites(prev => {
      const newFav = new Set(prev);
      if (newFav.has(id)) newFav.delete(id);
      else newFav.add(id);
      return newFav;
    });
  };

  const filteredProperties = useMemo(() => {
    let list = properties.filter(p => {
      const q = search.toLowerCase();
      const matchesQ = !q || p.title.toLowerCase().includes(q) || p.location.toLowerCase().includes(q);
      const min = parseFloat(minRent) || 0;
      const max = parseFloat(maxRent) || Infinity;
      const matchesRent = p.rent >= min && p.rent <= max;
      const matchesBhk = filters.bhk.size === 0 || filters.bhk.has(p.bhk);
      const matchesFurn = filters.furnishing.size === 0 || filters.furnishing.has(p.furnishing);
      const matchesType = filters.type.size === 0 || filters.type.has(p.type);
      return matchesQ && matchesRent && matchesBhk && matchesFurn && matchesType;
    });

    if (sort === 'low-high') list = [...list].sort((a,b)=>a.rent-b.rent);
    if (sort === 'high-low') list = [...list].sort((a,b)=>b.rent-a.rent);
    if (sort === 'newest') list = [...list].reverse();
    return list;
  }, [search, sort, minRent, maxRent, filters]);

  const FilterGroup = ({ title, options, category }) => (
    <div>
      <label className="text-xs font-medium text-ink-soft">{title}</label>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map(opt => {
          const active = filters[category].has(opt);
          return (
            <button
              key={opt}
              onClick={() => toggleFilter(category, opt)}
              className={`rounded-full border border-line px-3 py-1.5 text-xs transition hover:bg-canvas ${active ? 'bg-lease-600 text-white border-lease-600 hover:bg-lease-700' : 'text-ink-soft'}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="fade-in">
      <h1 className="font-display text-2xl font-semibold text-ink">Find your perfect rental home</h1>
      <p className="mt-1 text-sm text-ink-soft">Search by city, area, or property name.</p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-line bg-surface px-4 py-3">
          <SearchIcon size={18} className="text-ink-faint shrink-0" />
          <input 
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none" 
            placeholder="Search by city, area or property name" 
          />
        </div>
        <select value={sort} onChange={e => setSort(e.target.value)} className="rounded-lg border border-line bg-surface px-4 py-3 text-sm text-ink focus:outline-none">
          <option value="recommended">Recommended</option>
          <option value="newest">Newest</option>
          <option value="low-high">Rent: Low to High</option>
          <option value="high-low">Rent: High to Low</option>
        </select>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
        {/* filters */}
        <aside className="h-fit rounded-xl2 border border-line bg-surface p-5">
          <p className="font-display text-sm font-semibold text-ink">Filters</p>
          <div className="mt-4 space-y-5 text-sm">
            <div>
              <label className="text-xs font-medium text-ink-soft">Rent range (₹/mo)</label>
              <div className="mt-2 flex items-center gap-2">
                <input type="number" value={minRent} onChange={e => setMinRent(e.target.value)} placeholder="Min" className="w-full rounded-lg border border-line px-2.5 py-2 text-xs focus:outline-none" />
                <span className="text-ink-faint">–</span>
                <input type="number" value={maxRent} onChange={e => setMaxRent(e.target.value)} placeholder="Max" className="w-full rounded-lg border border-line px-2.5 py-2 text-xs focus:outline-none" />
              </div>
            </div>
            
            <FilterGroup title="BHK" options={['1 BHK','2 BHK','3 BHK','4 BHK']} category="bhk" />
            <FilterGroup title="Furnishing" options={['Furnished','Semi-Furnished','Unfurnished']} category="furnishing" />
            <FilterGroup title="Property type" options={['Apartment','Villa']} category="type" />
            
            <button onClick={resetFilters} className="w-full rounded-lg border border-line py-2 text-xs font-medium text-ink-soft hover:bg-canvas">Reset filters</button>
          </div>
        </aside>

        {/* results */}
        <div>
          <p className="mb-4 text-sm text-ink-faint">
            {filteredProperties.length} propert{filteredProperties.length === 1 ? 'y' : 'ies'} found
          </p>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredProperties.length > 0 ? filteredProperties.map(p => (
              <div key={p.id} onClick={() => navigate(`/properties/${p.id}`)} className="group cursor-pointer overflow-hidden rounded-xl2 border border-line bg-surface shadow-soft transition hover:shadow-lift">
                <div className="relative">
                  <img src={p.image} className="h-44 w-full object-cover transition duration-300 group-hover:scale-[1.03]" alt={p.title} />
                  <button onClick={(e) => toggleFavorite(e, p.id)} className={`absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/90 backdrop-blur ${favorites.has(p.id) ? 'text-bad-500' : 'text-ink-faint'}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill={favorites.has(p.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.6Z"/></svg>
                  </button>
                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-ink backdrop-blur">{p.availability}</span>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-display text-sm font-semibold text-ink">{p.title}</p>
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-xs text-ink-faint">
                    <MapPin size={12} />
                    {p.location}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-ink-soft">
                    <span className="rounded-full bg-canvas px-2 py-1">{p.bhk}</span>
                    <span className="rounded-full bg-canvas px-2 py-1">{p.area}</span>
                    <span className="rounded-full bg-canvas px-2 py-1">{p.furnishing}</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <p><span className="font-display text-base font-semibold text-ink">₹{p.rent.toLocaleString('en-IN')}</span><span className="text-xs text-ink-faint">/mo</span></p>
                    <button className="rounded-lg bg-lease-600 px-3 py-2 text-xs font-medium text-white hover:bg-lease-700">View Details</button>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full flex flex-col items-center justify-center rounded-xl2 border border-dashed border-line bg-surface/60 px-6 py-14 text-center">
                <span className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-lease-50 text-lease-600">
                  <SearchIcon size={20} />
                </span>
                <p className="font-display text-base font-semibold text-ink">No properties match your filters</p>
                <p className="mt-1.5 max-w-sm text-sm text-ink-faint">Try widening your rent range or clearing a filter.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Properties;
