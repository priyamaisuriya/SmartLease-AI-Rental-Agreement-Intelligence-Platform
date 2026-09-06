import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  PlusCircle,
  MapPin,
  Edit,
  Eye,
  Ban,
  CheckCircle,
  Trash2,
  Building,
  X,
} from 'lucide-react';

import api from '../../services/api';
import StatusBadge from '../../components/admin/StatusBadge';

const PropertyCard = ({
  property,
  onToggleStatus,
  onDelete,
  actionLoading,
}) => {
  const location = [
    property.address,
    property.city,
    property.state,
    property.pincode,
  ]
    .filter(Boolean)
    .join(', ');

  const bhk =
    property.bedrooms !== undefined &&
      property.bedrooms !== null &&
      property.bedrooms !== ''
      ? `${property.bedrooms} BHK`
      : property.propertyType || 'Property';

  const tenant =
    property.currentTenant?.name ||
    property.tenant?.name ||
    property.tenantName ||
    'None';

  const image =
    property.images?.length > 0
      ? (property.images[0].startsWith('http') ? property.images[0] : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${property.images[0]}`)
      : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';

  const formattedRent = Number(
    property.monthlyRent || 0
  ).toLocaleString('en-IN');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden flex flex-col hover:shadow-md transition-shadow group">
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-border">
        <img
          src={image}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';
          }}
        />

        {/* Status */}
        <div className="absolute top-3 left-3">
          <StatusBadge status={property.status} />
        </div>

        {/* BHK */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-semibold text-ink">
          {bhk}
        </div>
      </div>

      {/* Details */}
      <div className="p-5 flex-1 flex flex-col">
        <h3
          className="font-semibold text-lg text-ink truncate"
          title={property.title}
        >
          {property.title}
        </h3>

        <p
          className="text-sm text-text-muted flex items-center gap-1 mt-1"
          title={location}
        >
          <MapPin className="w-3.5 h-3.5 shrink-0" />

          <span className="truncate">
            {location || 'Location not specified'}
          </span>
        </p>

        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between gap-3">
          {/* Rent */}
          <div>
            <p className="text-xs text-text-faint">
              Listed Rent
            </p>

            <p className="font-semibold text-lease-600">
              ₹{formattedRent}
              <span className="text-xs text-text-muted font-normal">
                /mo
              </span>
            </p>
          </div>

          {/* Tenant */}
          <div className="text-right min-w-0">
            <p className="text-xs text-text-faint">
              Current Tenant
            </p>

            <p
              className="text-sm font-medium text-ink truncate w-24"
              title={tenant}
            >
              {tenant !== 'None' ? (
                tenant
              ) : (
                <span className="text-text-muted italic">
                  Vacant
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-3 bg-paper border-t border-border grid grid-cols-4 gap-1">
        {/* View */}
        <Link
          to={`/landlord/properties/${property._id}`}
          className="flex items-center justify-center py-1.5 rounded hover:bg-border transition-colors text-text-muted hover:text-lease-600"
          title="View Details"
        >
          <Eye className="w-4 h-4" />
        </Link>

        {/* Edit */}
        <Link
          to={`/landlord/properties/add?edit=${property._id}`}
          className="flex items-center justify-center py-1.5 rounded hover:bg-border transition-colors text-text-muted hover:text-ink"
          title="Edit Property"
        >
          <Edit className="w-4 h-4" />
        </Link>

        {/* Toggle Status */}
        <button
          type="button"
          onClick={() => onToggleStatus(property)}
          disabled={actionLoading || property.status === 'rented'}
          className={`flex items-center justify-center py-1.5 rounded hover:bg-border transition-colors text-text-muted disabled:opacity-40 disabled:cursor-not-allowed ${
            property.status === 'inactive' ? 'hover:text-green-600' : 'hover:text-warn-600'
          }`}
          title={
            property.status === 'rented'
              ? 'Rented property cannot be deactivated'
              : property.status === 'inactive'
                ? 'Activate Property'
                : 'Deactivate Property'
          }
        >
          {property.status === 'inactive' ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
        </button>

        {/* Delete / Soft Delete */}
        <button
          type="button"
          onClick={() => onDelete(property)}
          disabled={
            actionLoading ||
            property.status === 'rented' ||
            property.status === 'inactive'
          }
          className="flex items-center justify-center py-1.5 rounded hover:bg-border transition-colors text-text-muted hover:text-bad-600 disabled:opacity-40 disabled:cursor-not-allowed"
          title={
            property.status === 'rented'
              ? 'Rented property cannot be deleted'
              : property.status === 'inactive'
                ? 'Property is already inactive'
                : 'Delete Property'
          }
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const MyProperties = () => {
  const [properties, setProperties] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');

  const [showFilters, setShowFilters] = useState(false);

  const [statusFilter, setStatusFilter] = useState('all');

  const [propertyTypeFilter, setPropertyTypeFilter] =
    useState('all');

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  const [actionLoading, setActionLoading] =
    useState(false);

  const fetchProperties = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get(
        '/properties/my-properties'
      );

      const data =
        response.data?.properties ||
        response.data ||
        [];

      setProperties(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error(
        'Failed to load landlord properties:',
        err.response?.status,
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
        'Failed to load your properties.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleToggleStatus = async (property) => {
    if (property.status === 'rented') {
      alert(
        'This property is currently rented and its status cannot be changed.'
      );
      return;
    }

    const isCurrentlyInactive = property.status === 'inactive';
    const newStatus = isCurrentlyInactive ? 'available' : 'inactive';
    const actionText = isCurrentlyInactive ? 'Activate' : 'Deactivate';

    const confirmed = window.confirm(
      `${actionText} "${property.title}"?\n\nThe property will ${isCurrentlyInactive ? 'now appear' : 'no longer appear'} as an available listing.`
    );

    if (!confirmed) {
      return;
    }

    setActionLoading(true);
    setError('');

    try {
      await api.patch(
        `/properties/${property._id}/status`,
        { status: newStatus }
      );

      await fetchProperties();
    } catch (err) {
      console.error(
        'Failed to deactivate property:',
        err.response?.status,
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
        'Failed to update property status.'
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (property) => {
    if (property.status === 'rented') {
      alert('Rented property cannot be deleted.');
      return;
    }
    const confirmed = window.confirm(
      `Delete "${property.title}"?\n\nThis will permanently delete the property.`
    );
    if (!confirmed) return;
    setActionLoading(true);
    try {
      await api.delete(`/properties/${property._id}`);
      await fetchProperties();
    } catch (err) {
      console.error(err);
      alert('Failed to delete property');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredProperties = useMemo(() => {
    const search = searchTerm
      .trim()
      .toLowerCase();

    return properties.filter((property) => {
      const location = [
        property.address,
        property.city,
        property.state,
        property.pincode,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch =
        !search ||
        property.title
          ?.toLowerCase()
          .includes(search) ||
        location.includes(search);

      const matchesStatus =
        statusFilter === 'all' ||
        property.status === statusFilter;

      const matchesType =
        propertyTypeFilter === 'all' ||
        property.propertyType === propertyTypeFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType
      );
    });
  }, [
    properties,
    searchTerm,
    statusFilter,
    propertyTypeFilter,
  ]);

  const clearFilters = () => {
    setStatusFilter('all');
    setPropertyTypeFilter('all');
    setSearchTerm('');
  };

  return (
    <div className="space-y-6 fade-in pb-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">
            My Properties
          </h1>

          <p className="text-text-muted mt-1">
            Manage and track your listed rental properties.
          </p>
        </div>

        <Link
          to="/landlord/properties/add"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-lease-600 text-white rounded-lg font-medium hover:bg-lease-700 transition-colors shadow-sm w-full sm:w-auto"
        >
          <PlusCircle className="w-4 h-4" />

          <span>Add Property</span>
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-risk-red-bg border border-risk-red/20 text-risk-red rounded-lg px-4 py-3 text-sm flex items-center justify-between gap-4">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError('')}
            className="shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search + Filters */}
      <div className="bg-white border border-border rounded-xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

          {/* Search */}
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-text-faint absolute left-3 top-1/2 -translate-y-1/2" />

            <input
              type="text"
              placeholder="Search properties by name or location..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              className="w-full pl-9 pr-4 py-2 bg-paper border border-border rounded-lg text-sm focus:outline-none focus:border-lease-500 focus:ring-1 focus:ring-lease-500 transition-all"
            />
          </div>

          {/* Filter Button */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() =>
                setShowFilters(!showFilters)
              }
              className={`flex-1 sm:flex-none justify-center flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${showFilters
                ? 'bg-lease-50 border-lease-500 text-lease-600'
                : 'bg-paper border-border text-ink hover:bg-border/50'
                }`}
            >
              <Filter className="w-4 h-4" />

              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-2 uppercase tracking-wide">
                Status
              </label>

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
                className="w-full px-3 py-2 bg-paper border border-border rounded-lg text-sm focus:outline-none focus:border-lease-500"
              >
                <option value="all">
                  All Statuses
                </option>

                <option value="available">
                  Available
                </option>

                <option value="rented">
                  Rented
                </option>

                <option value="inactive">
                  Inactive
                </option>
              </select>
            </div>

            {/* Property Type */}
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-2 uppercase tracking-wide">
                Property Type
              </label>

              <select
                value={propertyTypeFilter}
                onChange={(e) =>
                  setPropertyTypeFilter(e.target.value)
                }
                className="w-full px-3 py-2 bg-paper border border-border rounded-lg text-sm focus:outline-none focus:border-lease-500"
              >
                <option value="all">
                  All Types
                </option>

                <option value="apartment">
                  Apartment
                </option>

                <option value="house">
                  House
                </option>

                <option value="villa">
                  Villa
                </option>

                <option value="room">
                  Room
                </option>

                <option value="studio">
                  Studio
                </option>

                <option value="office">
                  Office
                </option>

                <option value="shop">
                  Shop
                </option>

                <option value="other">
                  Other
                </option>
              </select>
            </div>

            {/* Clear */}
            <div className="sm:col-span-2 flex justify-end">
              <button
                type="button"
                onClick={clearFilters}
                className="px-4 py-2 text-sm font-medium text-text-muted hover:text-ink hover:bg-paper rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Loading */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-border p-12 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-ink mx-auto mb-4"></div>

          <p className="text-text-muted">
            Loading your properties...
          </p>
        </div>
      ) : filteredProperties.length > 0 ? (

        /* Property Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProperties.map((property) => (
            <PropertyCard
              key={property._id}
              property={property}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDelete}
              actionLoading={actionLoading}
            />
          ))}
        </div>

      ) : (

        /* Empty State */
        <div className="bg-white rounded-xl shadow-sm border border-border p-12 text-center">

          <Building className="w-12 h-12 text-text-faint mx-auto mb-4" />

          <h3 className="text-lg font-semibold text-ink">
            No properties found
          </h3>

          <p className="text-text-muted mt-1">
            We couldn't find any properties matching your search.
          </p>

          {properties.length === 0 ? (
            <Link
              to="/landlord/properties/add"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-lease-600 text-white font-medium rounded-lg hover:bg-lease-700 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />

              Add Property
            </Link>
          ) : (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 px-4 py-2 text-lease-600 font-medium hover:bg-lease-50 rounded-lg transition-colors"
            >
              Clear Search
            </button>
          )}
        </div>
      )}

      {/* Action Loading */}
      {actionLoading && (
        <div className="fixed bottom-5 right-5 z-50 bg-ink text-white px-4 py-3 rounded-lg shadow-lg text-sm">
          Updating property...
        </div>
      )}
    </div>
  );
};

export default MyProperties;