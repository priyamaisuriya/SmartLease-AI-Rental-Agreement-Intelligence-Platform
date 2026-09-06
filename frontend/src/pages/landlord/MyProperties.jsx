import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, PlusCircle, MapPin, Edit, Eye, Ban, Trash2 } from 'lucide-react';
import { myPropertiesData } from '../../data/landlordMockData';
import StatusBadge from '../../components/admin/StatusBadge';

const PropertyCard = ({ property }) => (
  <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden flex flex-col hover:shadow-md transition-shadow group">
    <div className="relative h-48 overflow-hidden bg-border">
      <img 
        src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
        alt={property.title} 
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute top-3 left-3">
        <StatusBadge status={property.status} />
      </div>
      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-semibold text-ink">
        {property.bhk}
      </div>
    </div>
    
    <div className="p-5 flex-1 flex flex-col">
      <h3 className="font-semibold text-lg text-ink truncate" title={property.title}>
        {property.title}
      </h3>
      <p className="text-sm text-text-muted flex items-center gap-1 mt-1">
        <MapPin className="w-3.5 h-3.5" />
        <span className="truncate">{property.location}</span>
      </p>
      
      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
        <div>
          <p className="text-xs text-text-faint">Listed Rent</p>
          <p className="font-semibold text-lease-600">₹{property.rent.toLocaleString()}<span className="text-xs text-text-muted font-normal">/mo</span></p>
        </div>
        <div className="text-right">
          <p className="text-xs text-text-faint">Current Tenant</p>
          <p className="text-sm font-medium text-ink truncate w-24" title={property.tenant}>
            {property.tenant !== 'None' ? property.tenant : <span className="text-text-muted italic">Vacant</span>}
          </p>
        </div>
      </div>
    </div>
    
    <div className="p-3 bg-paper border-t border-border grid grid-cols-4 gap-1">
      <button className="flex items-center justify-center py-1.5 rounded hover:bg-border transition-colors text-text-muted hover:text-lease-600" title="View Details">
        <Eye className="w-4 h-4" />
      </button>
      <button className="flex items-center justify-center py-1.5 rounded hover:bg-border transition-colors text-text-muted hover:text-ink" title="Edit Property">
        <Edit className="w-4 h-4" />
      </button>
      <button className="flex items-center justify-center py-1.5 rounded hover:bg-border transition-colors text-text-muted hover:text-warn-600" title="Deactivate">
        <Ban className="w-4 h-4" />
      </button>
      <button className="flex items-center justify-center py-1.5 rounded hover:bg-border transition-colors text-text-muted hover:text-bad-600" title="Delete">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  </div>
);

const MyProperties = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProperties = myPropertiesData.filter(prop => 
    prop.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    prop.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 fade-in pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">My Properties</h1>
          <p className="text-text-muted mt-1">Manage and track your listed rental properties.</p>
        </div>
        <Link to="/landlord/properties/add" className="flex items-center justify-center gap-2 px-4 py-2 bg-lease-600 text-white rounded-lg font-medium hover:bg-lease-700 transition-colors shadow-sm w-full sm:w-auto">
          <PlusCircle className="w-4 h-4" />
          <span>Add Property</span>
        </Link>
      </div>

      <div className="bg-white border border-border rounded-xl shadow-sm p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-text-faint absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search properties by name or location..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-paper border border-border rounded-lg text-sm focus:outline-none focus:border-lease-500 focus:ring-1 focus:ring-lease-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button className="flex flex-1 sm:flex-none justify-center items-center gap-2 px-4 py-2 bg-paper border border-border rounded-lg text-sm font-medium text-ink hover:bg-border/50 transition-colors">
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProperties.map(property => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-border p-12 text-center">
          <Building className="w-12 h-12 text-text-faint mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-ink">No properties found</h3>
          <p className="text-text-muted mt-1">We couldn't find any properties matching your search.</p>
          <button 
            onClick={() => setSearchTerm('')}
            className="mt-4 px-4 py-2 text-lease-600 font-medium hover:bg-lease-50 rounded-lg transition-colors"
          >
            Clear Search
          </button>
        </div>
      )}
    </div>
  );
};

export default MyProperties;
