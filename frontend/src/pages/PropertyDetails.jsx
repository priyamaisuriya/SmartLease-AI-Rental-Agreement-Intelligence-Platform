import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Home,
  User,
} from 'lucide-react';
import api from '../services/api';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [booking, setBooking] = useState(false);
  const [bookingMessage, setBookingMessage] = useState('');

  // Rental dates
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Minimum date = today
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        setError('');

        console.log('Property ID:', id);

        const response = await api.get(`/properties/${id}`);

        console.log('Property API response:', response.data);

        setProperty(response.data);
      } catch (err) {
        console.error('Property details error:', err);

        setError(
          err.response?.data?.message ||
          'Failed to load property details.'
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProperty();
    }
  }, [id]);

  // ============================================================
  // BOOK PROPERTY
  // ============================================================

  const handleBookProperty = async () => {
    setBookingMessage('');

    // Validate start date
    if (!startDate) {
      setBookingMessage('Please select a rental start date.');
      return;
    }

    // Validate end date
    if (!endDate) {
      setBookingMessage('Please select a rental end date.');
      return;
    }

    // Validate date order
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      setBookingMessage('Please select valid rental dates.');
      return;
    }

    if (end <= start) {
      setBookingMessage(
        'Rental end date must be after the start date.'
      );
      return;
    }

    try {
      setBooking(true);

      const response = await api.post('/rentals/book', {
        propertyId: property._id,
        startDate,
        endDate,
      });

      console.log('Booking response:', response.data);

      setBookingMessage(
        'Property booked successfully!'
      );

      // Go to My Rentals after successful booking
      setTimeout(() => {
        navigate('/rentals');
      }, 1000);

    } catch (err) {
      console.error('Booking error:', err);

      setBookingMessage(
        err.response?.data?.message ||
        'Failed to book property.'
      );
    } finally {
      setBooking(false);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <p className="text-ink-muted">
          Loading property...
        </p>
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error || !property) {
    return (
      <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-6">
        <h2 className="text-2xl font-semibold text-ink mb-2">
          Property Not Found
        </h2>

        <p className="text-ink-muted mb-6">
          {error ||
            'The requested property could not be found.'}
        </p>

        <button
          onClick={() => navigate('/properties')}
          className="px-5 py-2.5 bg-ink text-white rounded-lg"
        >
          Back to Properties
        </button>
      </div>
    );
  }

  // ============================================================
  // IMAGE
  // ============================================================

  const imageUrl =
    property.images &&
      property.images.length > 0
      ? property.images[0].startsWith('http')
        ? property.images[0]
        : `http://localhost:5000${property.images[0]}`
      : null;

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="min-h-screen bg-paper px-6 py-8">
      <div className="max-w-6xl mx-auto">

        {/* Back */}
        <button
          onClick={() => navigate('/properties')}
          className="flex items-center gap-2 text-ink-muted hover:text-ink mb-6"
        >
          <ArrowLeft size={18} />
          Back to Properties
        </button>

        {/* Property Image */}
        <div className="bg-white rounded-2xl overflow-hidden mb-8">
          <div className="h-[380px] bg-gray-100 flex items-center justify-center">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={property.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center text-ink-muted">
                <Home
                  size={48}
                  className="mx-auto mb-3"
                />
                <p>
                  No property image available
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Main Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* =================================================
              LEFT
          ================================================== */}

          <div className="lg:col-span-2">

            {/* Basic Information */}
            <div className="bg-white rounded-2xl p-7 mb-6">

              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-semibold text-ink">
                    {property.title}
                  </h1>

                  <div className="flex items-center gap-2 text-ink-muted mt-2">
                    <MapPin size={17} />

                    <span>
                      {property.address}
                      {property.city
                        ? `, ${property.city}`
                        : ''}
                      {property.state
                        ? `, ${property.state}`
                        : ''}
                    </span>
                  </div>
                </div>

                <span
                  className={`px-3 py-1.5 rounded-full text-sm ${property.status === 'available'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                    }`}
                >
                  {property.status}
                </span>
              </div>

              <p className="text-ink-muted leading-7">
                {property.description ||
                  'No description available.'}
              </p>
            </div>

            {/* Property Details */}
            <div className="bg-white rounded-2xl p-7 mb-6">

              <h2 className="text-xl font-semibold text-ink mb-5">
                Property Details
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">

                <div>
                  <p className="text-sm text-ink-muted">
                    Property Type
                  </p>

                  <p className="font-medium capitalize">
                    {property.propertyType}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-ink-muted">
                    Bedrooms
                  </p>

                  <p className="font-medium">
                    {property.bedrooms}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-ink-muted">
                    Bathrooms
                  </p>

                  <p className="font-medium">
                    {property.bathrooms}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-ink-muted">
                    Area
                  </p>

                  <p className="font-medium">
                    {property.area} sq.ft.
                  </p>
                </div>

                <div>
                  <p className="text-sm text-ink-muted">
                    Furnishing
                  </p>

                  <p className="font-medium capitalize">
                    {property.furnishing
                      ? property.furnishing.replace('_', ' ')
                      : 'Not specified'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-ink-muted">
                    Pincode
                  </p>

                  <p className="font-medium">
                    {property.pincode}
                  </p>
                </div>

              </div>
            </div>

            {/* Landlord */}
            <div className="bg-white rounded-2xl p-7">

              <h2 className="text-xl font-semibold text-ink mb-5">
                Landlord
              </h2>

              <div className="flex items-center gap-4">

                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <User size={22} />
                </div>

                <div>
                  <p className="font-medium text-ink">
                    {property.landlord?.name ||
                      'Landlord'}
                  </p>

                  <p className="text-sm text-ink-muted">
                    {property.landlord?.email || ''}
                  </p>

                  {property.landlord?.phone && (
                    <p className="text-sm text-ink-muted">
                      {property.landlord.phone}
                    </p>
                  )}
                </div>

              </div>
            </div>

          </div>

          {/* =================================================
              RIGHT - BOOKING CARD
          ================================================== */}

          <div>

            <div className="bg-white rounded-2xl p-7 sticky top-6">

              <p className="text-sm text-ink-muted mb-1">
                Monthly Rent
              </p>

              <p className="text-3xl font-semibold text-ink mb-6">
                ₹
                {property.monthlyRent?.toLocaleString(
                  'en-IN'
                )}
              </p>

              <div className="border-t border-gray-200 pt-5 mb-5">

                {/* Security Deposit */}
                <div className="flex justify-between mb-4">
                  <span className="text-ink-muted">
                    Security Deposit
                  </span>

                  <span className="font-medium">
                    ₹
                    {property.securityDeposit?.toLocaleString(
                      'en-IN'
                    )}
                  </span>
                </div>

                {/* Status */}
                <div className="flex justify-between">
                  <span className="text-ink-muted">
                    Status
                  </span>

                  <span className="font-medium capitalize">
                    {property.status}
                  </span>
                </div>

              </div>

              {/* =================================================
                  RENTAL DATES
              ================================================== */}

              {property.status === 'available' && (
                <div className="border-t border-gray-200 pt-5 mb-5">

                  <h3 className="text-sm font-semibold text-ink mb-4">
                    Rental Period
                  </h3>

                  {/* Start Date */}
                  <div className="mb-4">

                    <label
                      htmlFor="startDate"
                      className="flex items-center gap-2 text-sm text-ink-muted mb-2"
                    >
                      <Calendar size={15} />
                      Start Date
                    </label>

                    <input
                      id="startDate"
                      type="date"
                      value={startDate}
                      min={today}
                      onChange={(e) =>
                        setStartDate(e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-ink outline-none focus:border-lease-600 focus:ring-1 focus:ring-lease-600"
                    />

                  </div>

                  {/* End Date */}
                  <div>

                    <label
                      htmlFor="endDate"
                      className="flex items-center gap-2 text-sm text-ink-muted mb-2"
                    >
                      <Calendar size={15} />
                      End Date
                    </label>

                    <input
                      id="endDate"
                      type="date"
                      value={endDate}
                      min={startDate || today}
                      onChange={(e) =>
                        setEndDate(e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-ink outline-none focus:border-lease-600 focus:ring-1 focus:ring-lease-600"
                    />

                  </div>

                </div>
              )}

              {/* Booking Message */}
              {bookingMessage && (
                <div className="mb-4 p-3 rounded-lg bg-gray-100 text-sm text-ink">
                  {bookingMessage}
                </div>
              )}

              {/* Book Button */}
              <button
                onClick={handleBookProperty}
                disabled={
                  booking ||
                  property.status !== 'available'
                }
                className="w-full py-3 rounded-xl bg-ink text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {booking
                  ? 'Booking...'
                  : property.status === 'available'
                    ? 'Book Property'
                    : 'Property Not Available'}
              </button>

              <p className="text-xs text-ink-muted text-center mt-4">
                Select your rental period before booking.
                Booking will automatically mark this property
                as rented.
              </p>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;