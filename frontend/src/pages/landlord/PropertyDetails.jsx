import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Edit,
  IndianRupee,
  MapPin,
  User,
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import api from '../../services/api';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // --------------------------------------------------
  // LOAD PROPERTY + RENTALS
  // --------------------------------------------------
  const fetchProperty = async () => {
    setLoading(true);
    setError('');

    try {
      const [propertyResponse, rentalsResponse] =
        await Promise.all([
          api.get(`/properties/${id}`),
          api.get('/rentals/my-properties'),
        ]);

      const propertyData =
        propertyResponse.data?.property ||
        propertyResponse.data;

      const rentalData =
        rentalsResponse.data?.rentals ||
        rentalsResponse.data ||
        [];

      setProperty(propertyData);

      setRentals(
        Array.isArray(rentalData)
          ? rentalData
          : []
      );
    } catch (err) {
      console.error(
        'Failed to load property details:',
        err.response?.status,
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
        'Failed to load property details.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProperty();
    }
  }, [id]);

  // --------------------------------------------------
  // HELPERS
  // --------------------------------------------------
  const formatCurrency = (value) => {
    if (
      value === undefined ||
      value === null ||
      value === ''
    ) {
      return '—';
    }

    return `₹${Number(value).toLocaleString('en-IN')}`;
  };

  const formatDate = (date) => {
    if (!date) {
      return '—';
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return '—';
    }

    return parsedDate.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-50 text-green-700 border-green-200';

      case 'rented':
        return 'bg-blue-50 text-blue-700 border-blue-200';

      case 'inactive':
        return 'bg-gray-100 text-gray-600 border-gray-200';

      case 'active':
        return 'bg-green-50 text-green-700 border-green-200';

      case 'completed':
        return 'bg-blue-50 text-blue-700 border-blue-200';

      case 'cancelled':
        return 'bg-gray-100 text-gray-600 border-gray-200';

      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';

      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  // --------------------------------------------------
  // RENTALS FOR THIS PROPERTY
  // --------------------------------------------------
  const propertyRentals = rentals.filter(
    (rental) =>
      rental.property?._id === id ||
      rental.property === id
  );

  const activeRental =
    propertyRentals.find(
      (rental) => rental.status === 'active'
    ) || null;

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-ink mx-auto mb-4"></div>

          <p className="text-text-muted">
            Loading property details...
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // ERROR / NOT FOUND
  // --------------------------------------------------
  if (error || !property) {
    return (
      <div className="space-y-6 fade-in pb-8 max-w-5xl mx-auto">

        <button
          type="button"
          onClick={() =>
            navigate('/landlord/properties')
          }
          className="flex items-center gap-2 text-sm text-text-muted hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Properties
        </button>

        <div className="bg-risk-red-bg border border-risk-red/20 text-risk-red rounded-xl px-5 py-4">
          {error || 'Property not found.'}
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------
  return (
    <div className="space-y-6 fade-in pb-8 max-w-5xl mx-auto">

      {/* ==================================================
          HEADER
      ================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div>

          <button
            type="button"
            onClick={() =>
              navigate('/landlord/properties')
            }
            className="flex items-center gap-2 text-sm text-text-muted hover:text-ink transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to My Properties
          </button>

          <h1 className="text-2xl font-display font-bold text-ink">
            {property.title}
          </h1>

          <p className="text-text-muted mt-1 flex items-center gap-1">
            <MapPin className="w-4 h-4 shrink-0" />

            <span>
              {property.address || 'Address not specified'}

              {property.city &&
                `, ${property.city}`}

              {property.state &&
                `, ${property.state}`}

              {property.pincode &&
                ` - ${property.pincode}`}
            </span>
          </p>
        </div>

        <Link
          to={`/landlord/properties/add?edit=${property._id}`}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-lease-600 text-white rounded-lg text-sm font-medium hover:bg-lease-700 transition-colors"
        >
          <Edit className="w-4 h-4" />
          Edit Property
        </Link>
      </div>

      {/* ==================================================
          PROPERTY IMAGE
      ================================================== */}
      <div className="w-full h-[350px] rounded-xl overflow-hidden border border-border shadow-sm mb-6 bg-paper">
        <img
          src={
            property.images?.length > 0
              ? (property.images[0].startsWith('http') ? property.images[0] : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${property.images[0]}`)
              : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
          }
          alt={property.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';
          }}
        />
      </div>

      {/* ==================================================
          PROPERTY INFORMATION
      ================================================== */}
      <div className="bg-white border border-border rounded-xl shadow-sm p-6">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">

          <div className="flex items-center gap-3">

            <div className="w-12 h-12 rounded-xl bg-paper flex items-center justify-center">
              <Building2 className="w-6 h-6 text-lease-600" />
            </div>

            <div>
              <h2 className="font-semibold text-ink">
                Property Information
              </h2>

              <p className="text-xs text-text-faint">
                Complete property details
              </p>
            </div>

          </div>

          <span
            className={`inline-flex items-center px-3 py-1.5 rounded-full border text-xs font-medium capitalize ${getStatusClass(
              property.status
            )}`}
          >
            {property.status || 'unknown'}
          </span>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

          {/* Property Type */}
          <div>
            <p className="text-xs text-text-faint mb-1">
              Property Type
            </p>

            <p className="text-sm font-medium text-ink capitalize">
              {property.propertyType || '—'}
            </p>
          </div>

          {/* Bedrooms */}
          <div>
            <p className="text-xs text-text-faint mb-1">
              Bedrooms
            </p>

            <p className="text-sm font-medium text-ink">
              {property.bedrooms ?? '—'}
            </p>
          </div>

          {/* Bathrooms */}
          <div>
            <p className="text-xs text-text-faint mb-1">
              Bathrooms
            </p>

            <p className="text-sm font-medium text-ink">
              {property.bathrooms ?? '—'}
            </p>
          </div>

          {/* Area */}
          <div>
            <p className="text-xs text-text-faint mb-1">
              Area
            </p>

            <p className="text-sm font-medium text-ink">
              {property.area
                ? `${property.area} sq.ft.`
                : '—'}
            </p>
          </div>

          {/* Furnishing */}
          <div>
            <p className="text-xs text-text-faint mb-1">
              Furnishing
            </p>

            <p className="text-sm font-medium text-ink capitalize">
              {property.furnishing || '—'}
            </p>
          </div>

          {/* Pincode */}
          <div>
            <p className="text-xs text-text-faint mb-1">
              Pincode
            </p>

            <p className="text-sm font-medium text-ink">
              {property.pincode || '—'}
            </p>
          </div>

          {/* Landmark */}
          <div>
            <p className="text-xs text-text-faint mb-1">
              Landmark
            </p>

            <p className="text-sm font-medium text-ink">
              {property.landmark || '—'}
            </p>
          </div>

          {/* Available From */}
          <div>
            <p className="text-xs text-text-faint mb-1">
              Available From
            </p>

            <p className="text-sm font-medium text-ink">
              {formatDate(property.availableFrom)}
            </p>
          </div>

        </div>

        {/* Description */}
        {property.description && (
          <div className="mt-6 pt-6 border-t border-border">

            <p className="text-xs text-text-faint mb-2">
              Description
            </p>

            <p className="text-sm text-text-muted leading-relaxed">
              {property.description}
            </p>

          </div>
        )}

        {/* Amenities */}
        {Array.isArray(property.amenities) &&
          property.amenities.length > 0 && (
            <div className="mt-6 pt-6 border-t border-border">

              <p className="text-xs text-text-faint mb-3">
                Amenities
              </p>

              <div className="flex flex-wrap gap-2">

                {property.amenities.map(
                  (amenity, index) => (
                    <span
                      key={`${amenity}-${index}`}
                      className="px-3 py-1.5 bg-paper border border-border rounded-full text-xs text-text-muted"
                    >
                      {amenity}
                    </span>
                  )
                )}

              </div>
            </div>
          )}

      </div>

      {/* ==================================================
          RENTAL INFORMATION
      ================================================== */}
      <div className="bg-white border border-border rounded-xl shadow-sm p-6">

        <div className="flex items-center gap-3 mb-6">

          <div className="w-10 h-10 rounded-lg bg-paper flex items-center justify-center">
            <IndianRupee className="w-5 h-5 text-lease-600" />
          </div>

          <div>
            <h2 className="font-semibold text-ink">
              Rental Information
            </h2>

            <p className="text-xs text-text-faint">
              Pricing and current rental status
            </p>
          </div>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

          {/* Monthly Rent */}
          <div>
            <p className="text-xs text-text-faint mb-1">
              Monthly Rent
            </p>

            <p className="text-lg font-semibold text-ink">
              {formatCurrency(
                property.monthlyRent
              )}
            </p>
          </div>

          {/* Security Deposit */}
          <div>
            <p className="text-xs text-text-faint mb-1">
              Security Deposit
            </p>

            <p className="text-lg font-semibold text-ink">
              {formatCurrency(
                property.securityDeposit
              )}
            </p>
          </div>

          {/* Status */}
          <div>
            <p className="text-xs text-text-faint mb-1">
              Property Status
            </p>

            <p className="text-sm font-medium text-ink capitalize">
              {property.status || '—'}
            </p>
          </div>

        </div>

      </div>

      {/* ==================================================
          CURRENT TENANT
      ================================================== */}
      {activeRental && (
        <div className="bg-white border border-border rounded-xl shadow-sm p-6">

          <div className="flex items-center gap-3 mb-6">

            <div className="w-10 h-10 rounded-lg bg-paper flex items-center justify-center">
              <User className="w-5 h-5 text-lease-600" />
            </div>

            <div>
              <h2 className="font-semibold text-ink">
                Current Tenant
              </h2>

              <p className="text-xs text-text-faint">
                Active rental associated with this property
              </p>
            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

            {/* Tenant */}
            <div>
              <p className="text-xs text-text-faint mb-1">
                Tenant
              </p>

              <p className="text-sm font-medium text-ink">
                {activeRental.tenant?.name ||
                  activeRental.tenantName ||
                  '—'}
              </p>
            </div>

            {/* Email */}
            <div>
              <p className="text-xs text-text-faint mb-1">
                Email
              </p>

              <p className="text-sm text-text-muted break-all">
                {activeRental.tenant?.email ||
                  '—'}
              </p>
            </div>

            {/* Start Date */}
            <div>
              <p className="text-xs text-text-faint mb-1">
                Start Date
              </p>

              <p className="text-sm font-medium text-ink">
                {formatDate(
                  activeRental.startDate
                )}
              </p>
            </div>

            {/* End Date */}
            <div>
              <p className="text-xs text-text-faint mb-1">
                End Date
              </p>

              <p className="text-sm font-medium text-ink">
                {formatDate(
                  activeRental.endDate
                )}
              </p>
            </div>

          </div>

          {/* Tenant Details */}
          {activeRental.tenant?._id && (
            <div className="mt-5 pt-5 border-t border-border">

              <Link
                to={`/landlord/tenants/${activeRental.tenant._id}`}
                className="text-sm font-medium text-lease-600 hover:text-lease-700"
              >
                View Tenant Details →
              </Link>

            </div>
          )}

        </div>
      )}

      {/* ==================================================
          RENTAL HISTORY
      ================================================== */}
      {propertyRentals.length > 0 && (
        <div className="bg-white border border-border rounded-xl shadow-sm p-6">

          <div className="flex items-center gap-3 mb-5">

            <Calendar className="w-5 h-5 text-lease-600" />

            <h2 className="font-semibold text-ink">
              Rental History
            </h2>

          </div>

          <div className="space-y-3">

            {propertyRentals.map(
              (rental) => (
                <div
                  key={rental._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-paper/50 border border-border rounded-lg"
                >

                  {/* Rental Tenant + Dates */}
                  <div>

                    <p className="text-sm font-medium text-ink">
                      {rental.tenant?.name ||
                        rental.tenantName ||
                        'Tenant'}
                    </p>

                    <p className="text-xs text-text-muted mt-1">
                      {formatDate(
                        rental.startDate
                      )}

                      {' → '}

                      {formatDate(
                        rental.endDate
                      )}
                    </p>

                  </div>

                  {/* Rent + Status */}
                  <div className="flex items-center gap-3">

                    <span className="text-sm font-medium text-ink">
                      {formatCurrency(
                        rental.monthlyRent
                      )}
                    </span>

                    <span
                      className={`px-2.5 py-1 rounded-full border text-xs font-medium capitalize ${getStatusClass(
                        rental.status
                      )}`}
                    >
                      {rental.status}
                    </span>

                  </div>

                </div>
              )
            )}

          </div>

        </div>
      )}

    </div>
  );
};

export default PropertyDetails;