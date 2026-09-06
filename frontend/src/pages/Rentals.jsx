import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import api from '../services/api';

const Rentals = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchRentals = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await api.get('/rentals/my-rentals');

        console.log('My rentals response:', response.data);

        setRentals(response.data.rentals || []);
      } catch (err) {
        console.error('Failed to load rentals:', err);

        setError(
          err.response?.data?.message ||
          'Failed to load your rentals.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRentals();
  }, []);

  const statusBadge = (status) => {
    const statusClasses = {
      active: 'bg-good-50 text-good-600',
      completed: 'bg-gray-100 text-gray-600',
      pending: 'bg-lease-50 text-lease-700',
      cancelled: 'bg-red-50 text-red-600',
    };

    return (
      <span
        className={`inline - flex shrink - 0 items - center gap - 1.5 rounded - full px - 2.5 py - 1 text - xs font - medium ${statusClasses[status] || 'bg-gray-100 text-gray-600'
          } `}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
        {status}
      </span>
    );
  };

  const formatDate = (date) => {
    if (!date) return 'Not set';

    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString('en-IN');
  };

  if (loading) {
    return (
      <div className="fade-in">
        <h1 className="font-display text-2xl font-semibold text-ink">
          My rentals
        </h1>

        <p className="mt-1 text-sm text-text-muted">
          Your current rental at a glance.
        </p>

        <div className="mt-6 flex items-center justify-center rounded-xl2 border border-border bg-white/60 px-6 py-14">
          <p className="text-sm text-text-faint">
            Loading your rentals...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fade-in">
        <h1 className="font-display text-2xl font-semibold text-ink">
          My rentals
        </h1>

        <p className="mt-1 text-sm text-text-muted">
          Your current rental at a glance.
        </p>

        <div className="mt-6 rounded-xl2 border border-border bg-white px-6 py-10 text-center">
          <p className="text-sm text-red-600">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <h1 className="font-display text-2xl font-semibold text-ink">
        My rentals
      </h1>

      <p className="mt-1 text-sm text-text-muted">
        Your current rental at a glance.
      </p>

      {/* Tabs */}
      <div className="mt-6 flex border-b border-border space-x-6">
        {[
          { id: 'all', label: 'All Requests' },
          { id: 'pending', label: 'Pending' },
          { id: 'active', label: 'Approved' },
          { id: 'cancelled', label: 'Rejected / Cancelled' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'border-b-2 border-lease-600 text-lease-600'
                : 'text-text-muted hover:text-ink'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-6">
        {rentals.length > 0 ? (
          (() => {
            const filteredRentals = rentals.filter(r => activeTab === 'all' || r.status === activeTab);
            
            if (filteredRentals.length === 0) {
              return (
                <div className="p-10 text-center text-text-muted bg-white border border-border rounded-xl2">
                  No requests found for this status.
                </div>
              );
            }

            return filteredRentals.map((r) => {
              const property = r.property || {};
              const landlord = r.landlord || {};

              const getImageUrl = (imagePath) => {
                if (!imagePath) return null;
                if (imagePath.startsWith('http')) return imagePath;
                const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
                return `${baseUrl}${cleanPath}`;
              };

              const image = property.images && property.images.length > 0 
                ? getImageUrl(property.images[0]) 
                : null;

              return (
                <div
                  key={r._id}
                  className="overflow-hidden rounded-xl2 border border-border bg-white shadow-soft"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr]">

                    {/* Property Image */}
                    <div className="h-52 w-full bg-paper lg:h-full">
                      {image ? (
                        <img
                          src={image}
                          className="h-full w-full object-cover"
                          alt={property.title}
                        />
                      ) : (
                        <div className="flex h-full min-h-52 items-center justify-center text-text-faint">
                          <div className="text-center">
                            <Home
                              size={36}
                              className="mx-auto mb-2"
                            />
                            <p className="text-xs">
                              No property image
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-6">

                      {/* Header */}
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-display text-lg font-semibold text-ink">
                            {property.title || 'Rental Property'}
                          </p>

                          <p className="mt-1 text-sm text-text-faint">
                            {property.address || 'Address not available'}
                            {property.city
                              ? `, ${property.city}`
                              : ''}
                            {property.state
                              ? `, ${property.state}`
                              : ''}
                          </p>
                        </div>

                        {statusBadge(r.status)}
                      </div>

                      {/* Rental Information */}
                      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">

                        <div>
                          <p className="text-xs text-text-faint">
                            Landlord
                          </p>

                          <p className="mt-1 text-sm font-medium text-ink">
                            {landlord.name || 'Not available'}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-text-faint">
                            Start Date
                          </p>

                          <p className="mt-1 text-sm font-medium text-ink">
                            {formatDate(r.startDate)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-text-faint">
                            Contractual Rent
                          </p>

                          <p className="mt-1 text-sm font-medium text-ink">
                            ₹{formatCurrency(r.monthlyRent)}/mo
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-text-faint">
                            Deposit
                          </p>

                          <p className="mt-1 text-sm font-medium text-ink">
                            ₹{formatCurrency(r.securityDeposit)}
                          </p>
                        </div>

                      </div>

                      {/* Rental Note */}
                      <p className="mt-4 rounded-lg bg-lease-50 px-3 py-2 text-xs text-lease-700">
                        Contractual rent above reflects the rent recorded
                        for this rental and may differ from the property's
                        original listed rent.
                      </p>

                      {/* Actions */}
                      <div className="mt-5 flex flex-wrap gap-2">

                        <Link
                          to={`/properties/${property._id}`}
                          className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-ink hover:bg-paper"
                        >
                          View Property
                        </Link>

                        <Link
                          to="/agreements"
                          className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-ink hover:bg-paper"
                        >
                          View Agreement
                        </Link>

                        <Link
                          to="/analysis"
                          className="rounded-lg bg-lease-600 px-3 py-2 text-xs font-medium text-white hover:bg-lease-700"
                        >
                          Analyze Agreement
                        </Link>

                        <button
                          onClick={() =>
                            alert(
                              `Opening chat with ${landlord.name || 'landlord'
                              }`
                            )
                          }
                          className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-ink hover:bg-paper"
                        >
                          Contact Landlord
                        </button>

                      </div>
                    </div>
                  </div>
                </div>
              );
            });
          })()
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl2 border border-dashed border-border bg-white/60 px-6 py-14 text-center">

            <span className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-lease-50 text-lease-600">
              <Home size={20} />
            </span>

            <p className="font-display text-base font-semibold text-ink">
              No rentals
            </p>

            <p className="mt-1.5 max-w-sm text-sm text-text-faint">
              Once you book a property, it will appear here.
            </p>

            <Link
              to="/properties"
              className="mt-5 rounded-lg bg-lease-600 px-4 py-2 text-xs font-medium text-white hover:bg-lease-700"
            >
              Browse Properties
            </Link>

          </div>
        )}
      </div >
    </div >
  );
};

export default Rentals;