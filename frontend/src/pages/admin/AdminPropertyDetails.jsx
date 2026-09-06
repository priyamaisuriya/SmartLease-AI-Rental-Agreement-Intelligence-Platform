import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Ban, Trash2, CheckCircle, Home, MapPin, User, FileText, Image as ImageIcon } from 'lucide-react';
import StatusBadge from '../../components/admin/StatusBadge';
import api from '../../services/api';

const AdminPropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [property, setProperty] = useState(null);
  const [stats, setStats] = useState({ rentalCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/admin/properties/${id}`);
        
        const prop = res.data.property;
        setProperty({
          id: prop._id,
          title: prop.title,
          description: prop.description,
          city: prop.city || '',
          state: prop.state || '',
          location: `${prop.city || ''}, ${prop.state || ''}`.replace(/^, | ,$/g, '') || 'No location',
          owner: prop.landlord?.name || 'Unknown',
          ownerEmail: prop.landlord?.email || 'N/A',
          ownerPhone: prop.landlord?.phone || 'N/A',
          rent: prop.price || 0,
          type: prop.propertyType ? prop.propertyType.charAt(0).toUpperCase() + prop.propertyType.slice(1) : 'Unknown',
          status: prop.status ? prop.status.charAt(0).toUpperCase() + prop.status.slice(1) : 'Unknown',
          created: new Date(prop.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          images: prop.images || []
        });
        
        setStats({
          rentalCount: res.data.rentalCount || 0,
          activeRental: res.data.activeRental || null
        });
      } catch (err) {
        console.error('Failed to load property details:', err);
        setError('Failed to load property details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPropertyDetails();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-text-muted fade-in">Loading property details...</div>;
  }

  if (error || !property) {
    return (
      <div className="p-8 text-center fade-in">
        <p className="text-risk-red mb-4">{error || 'Property not found'}</p>
        <button onClick={() => navigate('/admin/properties')} className="px-4 py-2 bg-ink text-white rounded-lg">
          Back to Properties
        </button>
      </div>
    );
  }

  const primaryImage = property.images && property.images.length > 0 
    ? (property.images[0].startsWith('http') ? property.images[0] : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${property.images[0]}`) 
    : "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80";

  return (
    <div className="space-y-6 fade-in pb-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/admin/properties" className="p-2 text-text-muted hover:bg-white rounded-lg border border-transparent hover:border-border transition-all">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-bold text-ink">Property Details</h1>
            <StatusBadge status={property.status} />
          </div>
          <p className="text-text-muted mt-1">View comprehensive information about this property.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left/Main Column: Image & Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="w-full h-64 md:h-80 bg-border relative">
              <img src={primaryImage} alt="Property" className="w-full h-full object-cover" />
              <div className="absolute bottom-4 left-4 flex gap-2">
                <div className="px-3 py-1.5 bg-ink/80 backdrop-blur-md text-white rounded-lg text-sm font-medium flex items-center gap-1.5 shadow-lg">
                  <ImageIcon className="w-4 h-4" /> {property.images.length || 0} Photos
                </div>
              </div>
            </div>
            
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-display font-bold text-ink leading-tight">{property.title}</h2>
                  <div className="flex items-center gap-1.5 text-text-muted mt-2">
                    <MapPin className="w-4 h-4" />
                    <span>{property.location}</span>
                  </div>
                </div>
                <div className="md:text-right">
                  <p className="text-3xl font-display font-bold text-lease-600">₹{property.rent.toLocaleString()}</p>
                  <p className="text-sm text-text-muted">per month</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-border mb-6">
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-1">Type</p>
                  <p className="font-medium text-ink flex items-center gap-2">
                    <Home className="w-4 h-4 text-text-faint" /> {property.type}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-1">Status</p>
                  <StatusBadge status={property.status} />
                </div>
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-1">Created On</p>
                  <p className="font-medium text-ink">{property.created}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-1">Total Rentals</p>
                  <p className="font-medium text-ink">{stats.rentalCount}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-ink text-lg mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-text-muted" /> Description
                </h3>
                <p className="text-text-muted leading-relaxed">
                  {property.description || 'No description provided for this property.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Owner & Admin Actions */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="p-5 border-b border-border bg-paper/50">
              <h3 className="font-semibold text-ink flex items-center gap-2">
                <User className="w-5 h-5 text-lease-500" /> Owner Information
              </h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-lease-100 text-lease-700 rounded-full flex items-center justify-center font-display font-bold text-lg">
                  {property.owner.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-ink text-lg">{property.owner}</p>
                  <span className="px-2 py-0.5 bg-paper border border-border rounded text-xs text-text-muted font-medium">Landlord</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-border space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Email</span>
                  <span className="font-medium text-ink">{property.ownerEmail}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Phone</span>
                  <span className="font-medium text-ink">{property.ownerPhone}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="p-5 border-b border-border">
              <h3 className="font-semibold text-ink">Admin Actions</h3>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-sm text-text-muted mb-4">
                Note: Admin property modification is restricted. Status updates are handled by landlords.
              </p>
              <button 
                disabled={true}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-paper border border-border rounded-lg text-sm font-medium text-text-muted cursor-not-allowed opacity-70"
              >
                <Ban className="w-4 h-4" /> Suspend Listing
              </button>
              
              <button 
                disabled={true}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-paper border border-border rounded-lg text-sm font-medium text-text-muted cursor-not-allowed opacity-70"
              >
                <Trash2 className="w-4 h-4" /> Delete Listing
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPropertyDetails;
