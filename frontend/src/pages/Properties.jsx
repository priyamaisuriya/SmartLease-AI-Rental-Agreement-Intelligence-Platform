import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Properties = () => {
  const [properties, setProperties] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [city, setCity] = useState('Surat');
  const [state, setState] = useState('Gujarat');

  const [priceRange, setPriceRange] = useState({
    min: 8000,
    max: 25000,
  });

  const [selectedBhk, setSelectedBhk] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedFurnishing, setSelectedFurnishing] = useState('');

  const [sortBy, setSortBy] = useState('newest');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const gradients = [
    'linear-gradient(135deg, #EDE7D6, #D9CBA3)',
    'linear-gradient(135deg, #E4EAE6, #B9CBC0)',
    'linear-gradient(135deg, #EDE2E0, #D3B3AC)',
    'linear-gradient(135deg, #E6E9EF, #B7C1D6)',
    'linear-gradient(135deg, #EFEAD8, #D8C58F)',
    'linear-gradient(135deg, #E8E4EE, #C3B7D6)',
  ];

  const iconColors = [
    '#8A7658',
    '#4C7A5E',
    '#B8863B',
    '#1B2A4A',
    '#8A7658',
    '#5B4E7A',
  ];

  const loadProperties = async () => {
    try {
      setLoading(true);
      setError('');

      const params = {};

      if (city) {
        params.city = city;
      }

      if (state) {
        params.state = state;
      }

      if (priceRange.min !== '') {
        params.minRent = Number(priceRange.min);
      }

      if (priceRange.max !== '') {
        params.maxRent = Number(priceRange.max);
      }

      if (selectedType) {
        params.propertyType = selectedType;
      }

      if (selectedFurnishing) {
        params.furnishing = selectedFurnishing;
      }

      const response = await api.get('/properties', {
        params,
      });

      const data =
        response.data.properties ||
        response.data.data ||
        response.data ||
        [];

      setProperties(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error(
        'Failed to load properties:',
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
        'Failed to load available properties.'
      );

      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, [
    city,
    state,
    priceRange.min,
    priceRange.max,
    selectedType,
    selectedFurnishing,
  ]);

  const clearFilters = () => {
    setSearchTerm('');
    setCity('');
    setState('');
    setPriceRange({
      min: '',
      max: '',
    });
    setSelectedBhk('');
    setSelectedType('');
    setSelectedFurnishing('');
  };

  const getBhkValue = (property) => {
    if (
      property.bedrooms === undefined ||
      property.bedrooms === null
    ) {
      return '';
    }

    return Number(property.bedrooms);
  };

  const filteredProperties = properties
    .filter((property) => {
      const search = searchTerm
        .trim()
        .toLowerCase();

      if (!search) {
        return true;
      }

      const searchableText = [
        property.title,
        property.description,
        property.address,
        property.city,
        property.state,
        property.pincode,
        property.propertyType,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableText.includes(search);
    })
    .filter((property) => {
      if (!selectedBhk) {
        return true;
      }

      const bedrooms = getBhkValue(property);

      if (selectedBhk === '4+') {
        return bedrooms >= 4;
      }

      return bedrooms === Number(selectedBhk);
    })
    .sort((a, b) => {
      if (sortBy === 'rent-low') {
        return (
          Number(a.monthlyRent || 0) -
          Number(b.monthlyRent || 0)
        );
      }

      if (sortBy === 'rent-high') {
        return (
          Number(b.monthlyRent || 0) -
          Number(a.monthlyRent || 0)
        );
      }

      return (
        new Date(b.createdAt || 0) -
        new Date(a.createdAt || 0)
      );
    });

  const formatPropertyType = (type) => {
    if (!type) return 'Property';

    return type
      .replace('_', ' ')
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  const formatFurnishing = (furnishing) => {
    if (!furnishing) return '—';

    if (furnishing === 'semi_furnished') {
      return 'Semi-furn.';
    }

    if (furnishing === 'furnished') {
      return 'Furn.';
    }

    return 'Unfurn.';
  };

  return (
    <div className="fade-in max-w-[1400px] mx-auto">

      {/* Search */}
      <div className="flex items-center gap-[10px] bg-white border border-border rounded-[6px] p-[11px] px-[16px] max-w-[560px] mb-8">

        <Search className="w-[17px] h-[17px] stroke-[1.6] text-text-faint flex-shrink-0" />

        <input
          type="text"
          placeholder="Search by locality, city or landmark..."
          className="w-full bg-transparent border-none outline-none text-[14px] font-sans text-ink placeholder:text-placeholder"
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(e.target.value)
          }
        />

      </div>

      <div className="flex flex-col lg:flex-row gap-[26px] items-start">

        {/* Filters Sidebar */}
        <aside className="w-full lg:w-[250px] flex-shrink-0 bg-white border border-border rounded-[8px] p-[22px] sticky top-[22px]">

          <div className="flex items-center justify-between mb-[18px]">

            <h3 className="font-serif font-medium text-[16px] m-0">
              Filters
            </h3>

            <button
              type="button"
              onClick={clearFilters}
              className="text-[12px] font-semibold text-gold-deep bg-transparent border-none cursor-pointer"
            >
              Clear all
            </button>

          </div>

          {/* City / State */}
          <div className="mb-[20px] pb-[20px] border-b border-border">

            <label className="text-[11.5px] uppercase tracking-[0.07em] text-text-muted font-bold mb-[10px] block">
              City / State
            </label>

            <select
              value={`${city}, ${state}`}
              onChange={(e) => {
                const value = e.target.value;

                if (value === 'Surat, Gujarat') {
                  setCity('Surat');
                  setState('Gujarat');
                } else if (
                  value === 'Ahmedabad, Gujarat'
                ) {
                  setCity('Ahmedabad');
                  setState('Gujarat');
                } else if (
                  value === 'Mumbai, Maharashtra'
                ) {
                  setCity('Mumbai');
                  setState('Maharashtra');
                } else {
                  setCity('');
                  setState('');
                }
              }}
              className="w-full p-[9px] px-[10px] border border-border rounded-[4px] text-[13.5px] bg-paper text-ink outline-none focus:border-gold"
            >
              <option value="Surat, Gujarat">
                Surat, Gujarat
              </option>

              <option value="Ahmedabad, Gujarat">
                Ahmedabad, Gujarat
              </option>

              <option value="Mumbai, Maharashtra">
                Mumbai, Maharashtra
              </option>

              <option value=", ">
                All locations
              </option>
            </select>

          </div>

          {/* Rent */}
          <div className="mb-[20px] pb-[20px] border-b border-border">

            <label className="text-[11.5px] uppercase tracking-[0.07em] text-text-muted font-bold mb-[10px] block">
              Monthly Rent (₹)
            </label>

            <div className="flex items-center gap-[8px]">

              <input
                type="number"
                value={priceRange.min}
                onChange={(e) =>
                  setPriceRange({
                    ...priceRange,
                    min: e.target.value,
                  })
                }
                className="w-full p-[8px] px-[9px] border border-border rounded-[4px] text-[13px] bg-paper text-ink font-mono outline-none focus:border-gold"
                placeholder="Min"
              />

              <span className="text-text-faint text-[12px]">
                –
              </span>

              <input
                type="number"
                value={priceRange.max}
                onChange={(e) =>
                  setPriceRange({
                    ...priceRange,
                    max: e.target.value,
                  })
                }
                className="w-full p-[8px] px-[9px] border border-border rounded-[4px] text-[13px] bg-paper text-ink font-mono outline-none focus:border-gold"
                placeholder="Max"
              />

            </div>

          </div>

          {/* BHK */}
          <div className="mb-[20px] pb-[20px] border-b border-border">

            <label className="text-[11.5px] uppercase tracking-[0.07em] text-text-muted font-bold mb-[10px] block">
              BHK
            </label>

            <div className="flex flex-wrap gap-[7px]">

              {['1', '2', '3', '4+'].map(
                (bhk) => (
                  <button
                    type="button"
                    key={bhk}
                    onClick={() =>
                      setSelectedBhk(
                        selectedBhk === bhk
                          ? ''
                          : bhk
                      )
                    }
                    className={`px-[12px] py-[6px] rounded-[20px] text-[12px] font-medium transition-colors border ${selectedBhk === bhk
                        ? 'border-gold bg-gold/10 text-ink font-semibold'
                        : 'border-border bg-paper text-text-muted hover:border-gold-soft'
                      }`}
                  >
                    {bhk}
                  </button>
                )
              )}

            </div>

          </div>

          {/* Property Type */}
          <div className="mb-[20px] pb-[20px] border-b border-border">

            <label className="text-[11.5px] uppercase tracking-[0.07em] text-text-muted font-bold mb-[10px] block">
              Property Type
            </label>

            <div className="flex flex-wrap gap-[7px]">

              {[
                ['apartment', 'Apartment'],
                ['villa', 'Villa'],
                ['studio', 'Studio'],
                ['house', 'House'],
                ['room', 'Room'],
                ['office', 'Office'],
              ].map(([value, label]) => (
                <button
                  type="button"
                  key={value}
                  onClick={() =>
                    setSelectedType(
                      selectedType === value
                        ? ''
                        : value
                    )
                  }
                  className={`px-[12px] py-[6px] rounded-[20px] text-[12px] font-medium transition-colors border ${selectedType === value
                      ? 'border-gold bg-gold/10 text-ink font-semibold'
                      : 'border-border bg-paper text-text-muted hover:border-gold-soft'
                    }`}
                >
                  {label}
                </button>
              ))}

            </div>

          </div>

          {/* Furnishing */}
          <div className="mb-[20px] pb-[20px] border-b border-border">

            <label className="text-[11.5px] uppercase tracking-[0.07em] text-text-muted font-bold mb-[10px] block">
              Furnishing
            </label>

            <div className="flex flex-wrap gap-[7px]">

              {[
                ['furnished', 'Furnished'],
                ['semi_furnished', 'Semi-furnished'],
                ['unfurnished', 'Unfurnished'],
              ].map(([value, label]) => (
                <button
                  type="button"
                  key={value}
                  onClick={() =>
                    setSelectedFurnishing(
                      selectedFurnishing === value
                        ? ''
                        : value
                    )
                  }
                  className={`px-[12px] py-[6px] rounded-[20px] text-[12px] font-medium transition-colors border ${selectedFurnishing === value
                      ? 'border-gold bg-gold/10 text-ink font-semibold'
                      : 'border-border bg-paper text-text-muted hover:border-gold-soft'
                    }`}
                >
                  {label}
                </button>
              ))}

            </div>

          </div>

          {/* Amenities - UI only for now */}
          <div className="mb-[20px] pb-[20px] border-b border-border">

            <label className="text-[11.5px] uppercase tracking-[0.07em] text-text-muted font-bold mb-[10px] block">
              Amenities
            </label>

            <div className="space-y-[9px]">

              {[
                'Parking',
                'Lift',
                'Power backup',
                'Gym',
              ].map((amenity, idx) => (

                <div
                  key={amenity}
                  className="flex items-center gap-[9px]"
                >

                  <input
                    type="checkbox"
                    id={`am${idx}`}
                    disabled
                    className="w-[15px] h-[15px] accent-gold-deep cursor-pointer"
                  />

                  <label
                    htmlFor={`am${idx}`}
                    className="text-[13px] text-text-muted cursor-not-allowed"
                  >
                    {amenity}
                  </label>

                </div>

              ))}

            </div>

            <p className="text-[10.5px] text-text-faint mt-[10px] mb-0">
              Additional amenity filters will be
              available when amenity data is added.
            </p>

          </div>

          {/* Availability */}
          <div className="mb-[20px]">

            <label className="text-[11.5px] uppercase tracking-[0.07em] text-text-muted font-bold mb-[10px] block">
              Availability
            </label>

            <div className="flex items-center gap-[9px]">

              <input
                type="checkbox"
                checked
                readOnly
                className="w-[15px] h-[15px] accent-gold-deep"
              />

              <label className="text-[13px] text-ink">
                Available now
              </label>

            </div>

          </div>

          <button
            type="button"
            onClick={loadProperties}
            className="w-full mt-[22px] bg-ink text-paper-card py-[11px] rounded-[5px] font-semibold text-[13.5px] hover:bg-[#22355C] transition-colors"
          >
            Apply filters
          </button>

        </aside>

        {/* Property Grid */}
        <div className="flex-1 min-w-0">

          <div className="flex items-center justify-between mb-[16px]">

            <p className="text-[13.5px] text-text-muted m-0">

              <b className="text-ink font-semibold">
                {loading ? '—' : filteredProperties.length}
              </b>{' '}
              available properties

              {city && state
                ? ` in ${city}, ${state}`
                : ''}

            </p>

            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value)
              }
              className="p-[8px] px-[12px] border border-border rounded-[5px] text-[13px] bg-white text-ink outline-none"
            >
              <option value="newest">
                Sort: Newest first
              </option>

              <option value="rent-low">
                Sort: Rent — low to high
              </option>

              <option value="rent-high">
                Sort: Rent — high to low
              </option>
            </select>

          </div>

          {/* Loading */}
          {loading && (
            <div className="bg-white border border-border rounded-[8px] p-[30px] text-center">

              <p className="text-[13px] text-text-muted m-0">
                Loading available properties...
              </p>

            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="bg-white border border-[#C24343]/30 rounded-[8px] p-[24px]">

              <p className="text-[13px] text-[#C24343] m-0">
                {error}
              </p>

            </div>
          )}

          {/* Empty */}
          {!loading &&
            !error &&
            filteredProperties.length === 0 && (
              <div className="bg-white border border-border rounded-[8px] p-[40px] text-center">

                <p className="font-serif text-[18px] text-ink mb-[7px]">
                  No properties found
                </p>

                <p className="text-[13px] text-text-muted m-0">
                  Try changing your search or
                  filters.
                </p>

              </div>
            )}

          {/* Grid */}
          {!loading &&
            !error &&
            filteredProperties.length > 0 && (

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-[18px]">

                {filteredProperties.map(
                  (property, idx) => {

                    const gradient =
                      gradients[
                      idx %
                      gradients.length
                      ];

                    const iconColor =
                      iconColors[
                      idx %
                      iconColors.length
                      ];

                    const isAvailable =
                      property.status ===
                      'available';

                    return (
                      <Link
                        to={`/properties/${property._id}`}
                        key={property._id}
                        className="bg-white border border-border rounded-[9px] overflow-hidden transition-all duration-150 hover:-translate-y-[3px] hover:shadow-[0_16px_32px_-18px_rgba(27,42,74,0.28)] flex flex-col group"
                      >

                        {/* Image / Placeholder */}
                        <div
                          className="h-[148px] relative flex items-center justify-center overflow-hidden"
                          style={{
                            background:
                              gradient,
                          }}
                        >
                          {property.images && property.images.length > 0 ? (
                            <img
                              src={property.images[0].startsWith('http') ? property.images[0] : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${property.images[0]}`}
                              alt={property.title}
                              className="absolute inset-0 w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            /* Property Icon Fallback */
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke={iconColor}
                              strokeWidth="1.3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="w-[34px] h-[34px] opacity-50 z-0"
                            >
                              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                              <path d="M9 22V12h6v10" />
                            </svg>
                          )}

                          {/* Status */}
                          <span
                            className={`absolute top-[10px] left-[10px] font-sans text-[10.5px] font-bold tracking-[0.03em] uppercase px-[9px] py-[4px] rounded-[20px] text-white z-10 ${isAvailable
                                ? 'bg-risk-green/90'
                                : 'bg-risk-amber/90'
                              }`}
                          >
                            {isAvailable
                              ? 'Available'
                              : 'Unavailable'}
                          </span>

                          {/* Price */}
                          <span className="absolute bottom-[10px] right-[10px] bg-ink/90 text-paper-card font-serif text-[15px] font-medium px-[12px] py-[5px] rounded-[5px] z-10">

                            ₹
                            {Number(
                              property.monthlyRent ||
                              0
                            ).toLocaleString(
                              'en-IN'
                            )}

                            <span className="text-[10.5px] font-sans text-text-faint">
                              /mo
                            </span>

                          </span>

                        </div>

                        {/* Content */}
                        <div className="p-[15px] px-[16px] pb-[17px] flex flex-col flex-1">

                          <p className="font-sans font-semibold text-[14.5px] text-ink m-0 mb-[4px] truncate">
                            {property.title}
                          </p>

                          <p className="flex items-center gap-[5px] text-[12.5px] text-text-muted m-0 mb-[12px] truncate">

                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="w-[12px] h-[12px] stroke-text-faint flex-shrink-0"
                            >
                              <path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 1 1 18 0z" />
                              <circle
                                cx="12"
                                cy="10"
                                r="3"
                              />
                            </svg>

                            {property.city},{' '}
                            {property.state}

                          </p>

                          <div className="flex items-center gap-[14px] pt-[12px] border-t border-border mt-auto">

                            <span className="flex items-center gap-[5px] text-[12px] text-text-muted">

                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="w-[14px] h-[14px] stroke-text-faint"
                              >
                                <rect
                                  x="3"
                                  y="7"
                                  width="18"
                                  height="13"
                                  rx="2"
                                />
                              </svg>

                              {property.bedrooms || 0}{' '}
                              BHK

                            </span>

                            <span className="flex items-center gap-[5px] text-[12px] text-text-muted">

                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="w-[14px] h-[14px] stroke-text-faint"
                              >
                                <rect
                                  x="4"
                                  y="4"
                                  width="16"
                                  height="16"
                                  rx="2"
                                />
                              </svg>

                              {formatFurnishing(
                                property.furnishing
                              )}

                            </span>

                            <span className="text-[12px] text-text-muted truncate">
                              {formatPropertyType(
                                property.propertyType
                              )}
                            </span>

                          </div>

                        </div>

                      </Link>
                    );
                  }
                )}

              </div>

            )}

        </div>

      </div>

    </div>
  );
};

export default Properties;