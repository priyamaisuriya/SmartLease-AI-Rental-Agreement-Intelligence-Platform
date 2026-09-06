import React, { useState } from 'react';
import { Search, MapPin, Home, Info, Heart } from 'lucide-react';
import { properties as propertiesData } from '../data/mockData';
import { Link } from 'react-router-dom';

const Properties = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 8000, max: 25000 });
  const [selectedBhk, setSelectedBhk] = useState('2');
  const [selectedType, setSelectedType] = useState('Apartment');
  const [selectedFurnishing, setSelectedFurnishing] = useState('Semi-furnished');

  const filteredProperties = propertiesData.filter(prop => 
    (prop.title.toLowerCase().includes(searchTerm.toLowerCase()) || prop.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="fade-in max-w-[1400px] mx-auto">
      
      {/* Top Search Bar (positioned inside the main content flow as requested in the new design) */}
      <div className="flex items-center gap-[10px] bg-white border border-border rounded-[6px] p-[11px] px-[16px] max-w-[560px] mb-8">
        <Search className="w-[17px] h-[17px] stroke-[1.6] text-text-faint flex-shrink-0" />
        <input 
          type="text" 
          placeholder="Search by locality, city or landmark..." 
          className="w-full bg-transparent border-none outline-none text-[14px] font-sans text-ink placeholder:text-placeholder"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-[26px] items-start">
        {/* Filters Sidebar */}
        <aside className="w-full lg:w-[250px] flex-shrink-0 bg-white border border-border rounded-[8px] p-[22px] sticky top-[22px]">
          <div className="flex items-center justify-between mb-[18px]">
            <h3 className="font-serif font-medium text-[16px] m-0">Filters</h3>
            <button className="text-[12px] font-semibold text-gold-deep bg-transparent border-none cursor-pointer">Clear all</button>
          </div>

          <div className="mb-[20px] pb-[20px] border-b border-border">
            <label className="text-[11.5px] uppercase tracking-[0.07em] text-text-muted font-bold mb-[10px] block">City / State</label>
            <select className="w-full p-[9px] px-[10px] border border-border rounded-[4px] text-[13.5px] bg-paper text-ink outline-none focus:border-gold">
              <option>Surat, Gujarat</option>
              <option>Ahmedabad, Gujarat</option>
              <option>Mumbai, Maharashtra</option>
            </select>
          </div>

          <div className="mb-[20px] pb-[20px] border-b border-border">
            <label className="text-[11.5px] uppercase tracking-[0.07em] text-text-muted font-bold mb-[10px] block">Monthly Rent (₹)</label>
            <div className="flex items-center gap-[8px]">
              <input type="text" value={priceRange.min} onChange={(e)=>setPriceRange({...priceRange, min: e.target.value})} className="w-full p-[8px] px-[9px] border border-border rounded-[4px] text-[13px] bg-paper text-ink font-mono outline-none focus:border-gold" />
              <span className="text-text-faint text-[12px]">–</span>
              <input type="text" value={priceRange.max} onChange={(e)=>setPriceRange({...priceRange, max: e.target.value})} className="w-full p-[8px] px-[9px] border border-border rounded-[4px] text-[13px] bg-paper text-ink font-mono outline-none focus:border-gold" />
            </div>
          </div>

          <div className="mb-[20px] pb-[20px] border-b border-border">
            <label className="text-[11.5px] uppercase tracking-[0.07em] text-text-muted font-bold mb-[10px] block">BHK</label>
            <div className="flex flex-wrap gap-[7px]">
              {['1', '2', '3', '4+'].map(bhk => (
                <button 
                  key={bhk}
                  onClick={() => setSelectedBhk(bhk)}
                  className={`px-[12px] py-[6px] rounded-[20px] text-[12px] font-medium transition-colors border ${
                    selectedBhk === bhk 
                      ? 'border-gold bg-gold/10 text-ink font-semibold' 
                      : 'border-border bg-paper text-text-muted hover:border-gold-soft'
                  }`}
                >
                  {bhk}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-[20px] pb-[20px] border-b border-border">
            <label className="text-[11.5px] uppercase tracking-[0.07em] text-text-muted font-bold mb-[10px] block">Property Type</label>
            <div className="flex flex-wrap gap-[7px]">
              {['Apartment', 'Villa', 'Studio', 'PG'].map(type => (
                <button 
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-[12px] py-[6px] rounded-[20px] text-[12px] font-medium transition-colors border ${
                    selectedType === type 
                      ? 'border-gold bg-gold/10 text-ink font-semibold' 
                      : 'border-border bg-paper text-text-muted hover:border-gold-soft'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-[20px] pb-[20px] border-b border-border">
            <label className="text-[11.5px] uppercase tracking-[0.07em] text-text-muted font-bold mb-[10px] block">Furnishing</label>
            <div className="flex flex-wrap gap-[7px]">
              {['Furnished', 'Semi-furnished', 'Unfurnished'].map(furn => (
                <button 
                  key={furn}
                  onClick={() => setSelectedFurnishing(furn)}
                  className={`px-[12px] py-[6px] rounded-[20px] text-[12px] font-medium transition-colors border ${
                    selectedFurnishing === furn 
                      ? 'border-gold bg-gold/10 text-ink font-semibold' 
                      : 'border-border bg-paper text-text-muted hover:border-gold-soft'
                  }`}
                >
                  {furn}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-[20px] pb-[20px] border-b border-border">
            <label className="text-[11.5px] uppercase tracking-[0.07em] text-text-muted font-bold mb-[10px] block">Amenities</label>
            <div className="space-y-[9px]">
              {['Parking', 'Lift', 'Power backup', 'Gym'].map((amenity, idx) => (
                <div key={amenity} className="flex items-center gap-[9px]">
                  <input type="checkbox" id={`am${idx}`} className="w-[15px] h-[15px] accent-gold-deep cursor-pointer" defaultChecked={idx < 2} />
                  <label htmlFor={`am${idx}`} className="text-[13px] text-ink cursor-pointer">{amenity}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-[20px]">
            <label className="text-[11.5px] uppercase tracking-[0.07em] text-text-muted font-bold mb-[10px] block">Availability</label>
            <div className="space-y-[9px]">
              {['Available now', 'Available soon'].map((avail, idx) => (
                <div key={avail} className="flex items-center gap-[9px]">
                  <input type="checkbox" id={`av${idx}`} className="w-[15px] h-[15px] accent-gold-deep cursor-pointer" defaultChecked={idx === 0} />
                  <label htmlFor={`av${idx}`} className="text-[13px] text-ink cursor-pointer">{avail}</label>
                </div>
              ))}
            </div>
          </div>

          <button className="w-full mt-[22px] bg-ink text-paper-card py-[11px] rounded-[5px] font-semibold text-[13.5px] hover:bg-[#22355C] transition-colors">
            Apply filters
          </button>
        </aside>

        {/* Property Grid */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-[16px]">
            <p className="text-[13.5px] text-text-muted m-0"><b className="text-ink font-semibold">{filteredProperties.length}</b> properties in Surat, Gujarat</p>
            <select className="p-[8px] px-[12px] border border-border rounded-[5px] text-[13px] bg-white text-ink outline-none">
              <option>Sort: Newest first</option>
              <option>Sort: Rent — low to high</option>
              <option>Sort: Rent — high to low</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-[18px]">
            {filteredProperties.map((prop, idx) => {
              // Cycle through the specific linear gradients provided in the HTML
              const gradients = [
                'linear-gradient(135deg, #EDE7D6, #D9CBA3)',
                'linear-gradient(135deg, #E4EAE6, #B9CBC0)',
                'linear-gradient(135deg, #EDE2E0, #D3B3AC)',
                'linear-gradient(135deg, #E6E9EF, #B7C1D6)',
                'linear-gradient(135deg, #EFEAD8, #D8C58F)',
                'linear-gradient(135deg, #E8E4EE, #C3B7D6)'
              ];
              const gradient = gradients[idx % gradients.length];
              
              // Map icon colors based on gradient (approximate from HTML)
              const iconColors = ['#8A7658', '#4C7A5E', '#B8863B', '#1B2A4A', '#8A7658', '#5B4E7A'];
              const iconColor = iconColors[idx % iconColors.length];
              
              return (
                <Link to={`/properties/${prop.id}`} key={prop.id} className="bg-white border border-border rounded-[9px] overflow-hidden transition-all duration-150 hover:-translate-y-[3px] hover:shadow-[0_16px_32px_-18px_rgba(27,42,74,0.28)] flex flex-col group">
                  {/* Image Placeholder area */}
                  <div className="h-[148px] relative flex items-center justify-center overflow-hidden" style={{ background: gradient }}>
                    {/* Status Badge */}
                    <span className={`absolute top-[10px] left-[10px] font-sans text-[10.5px] font-bold tracking-[0.03em] uppercase px-[9px] py-[4px] rounded-[20px] text-white ${
                      prop.availability === 'Available' ? 'bg-risk-green/90' : 'bg-risk-amber/90'
                    }`}>
                      {prop.availability === 'Available' ? 'Available' : 'Available Soon'}
                    </span>
                    
                    {/* Price Tag */}
                    <span className="absolute bottom-[10px] right-[10px] bg-ink/90 text-paper-card font-serif text-[15px] font-medium px-[12px] py-[5px] rounded-[5px]">
                      ₹{prop.rent.toLocaleString()}
                      <span className="text-[10.5px] font-sans text-text-faint">/mo</span>
                    </span>
                    
                    {/* Placeholder Icon */}
                    <svg viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" className="w-[34px] h-[34px] opacity-50"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>
                  </div>
                  
                  {/* Content */}
                  <div className="p-[15px] px-[16px] pb-[17px] flex flex-col flex-1">
                    <p className="font-sans font-semibold text-[14.5px] text-ink m-0 mb-[4px] truncate">{prop.title}</p>
                    <p className="flex items-center gap-[5px] text-[12.5px] text-text-muted m-0 mb-[12px] truncate">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-[12px] h-[12px] stroke-text-faint flex-shrink-0"><path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 1 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {prop.location}
                    </p>
                    
                    <div className="flex items-center gap-[14px] pt-[12px] border-t border-border mt-auto">
                      <span className="flex items-center gap-[5px] text-[12px] text-text-muted">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-[14px] h-[14px] stroke-text-faint"><rect x="3" y="7" width="18" height="13" rx="2"/></svg>
                        {prop.bhk}
                      </span>
                      <span className="flex items-center gap-[5px] text-[12px] text-text-muted">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-[14px] h-[14px] stroke-text-faint"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>
                        {prop.furnishing.replace('Furnished', 'Furn.').replace('Semi-furnished', 'Semi-furn.')}
                      </span>
                      <span className="flex items-center gap-[5px] text-[12px] text-text-muted">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-[14px] h-[14px] stroke-text-faint"><rect x="1" y="6" width="18" height="10" rx="2"/><path d="M23 13v-2"/></svg>
                        Parking
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Properties;
