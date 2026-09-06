import React, { useEffect, useMemo, useState } from 'react';
import {
  Link,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  UploadCloud,
  X,
  Image as ImageIcon,
} from 'lucide-react';
import api from '../../services/api';

const AMENITIES = [
  'Parking',
  'Wi-Fi',
  'AC',
  'Lift',
  'Security 24x7',
  'Balcony',
  'Gym',
  'Swimming Pool',
  'Power Backup',
  'Water Supply',
];

const PROPERTY_TYPES = [
  {
    value: 'apartment',
    label: 'Apartment',
  },
  {
    value: 'house',
    label: 'Independent House',
  },
  {
    value: 'villa',
    label: 'Villa',
  },
  {
    value: 'room',
    label: 'Room',
  },
  {
    value: 'studio',
    label: 'Studio',
  },
  {
    value: 'office',
    label: 'Office',
  },
  {
    value: 'shop',
    label: 'Shop',
  },
  {
    value: 'other',
    label: 'Other',
  },
];

const AddProperty = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const editPropertyId = searchParams.get('edit');
  const isEditMode = Boolean(editPropertyId);

  const totalSteps = 6;

  const [step, setStep] = useState(1);
  const [loadingProperty, setLoadingProperty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    propertyType: 'apartment',
    bedrooms: '',
    bathrooms: '',
    area: '',
    description: '',

    address: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',

    monthlyRent: '',
    securityDeposit: '',
    availableFrom: '',
    furnishing: 'furnished',

    amenities: [],
    images: [],
  });

  const stepTitles = [
    'Basic Information',
    'Location',
    'Rental Information',
    'Amenities',
    'Property Images',
    'Review & Publish',
  ];

  /*
   * Update form field
   */
  const updateField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setError('');
    setSuccessMessage('');
  };

  /*
   * Load property when editing
   */
  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    const loadProperty = async () => {
      setLoadingProperty(true);
      setError('');

      try {
        const response = await api.get(
          `/properties/${editPropertyId}`
        );

        const property =
          response.data.property ||
          response.data;

        if (!property) {
          throw new Error(
            'Property data was not returned.'
          );
        }

        setFormData({
          title: property.title || '',

          propertyType:
            property.propertyType || 'apartment',

          bedrooms:
            property.bedrooms ?? '',

          bathrooms:
            property.bathrooms ?? '',

          area:
            property.area ?? '',

          description:
            property.description || '',

          address:
            property.address || '',

          city:
            property.city || '',

          state:
            property.state || '',

          pincode:
            property.pincode || '',

          landmark:
            property.landmark || '',

          monthlyRent:
            property.monthlyRent ?? '',

          securityDeposit:
            property.securityDeposit ?? '',

          availableFrom:
            property.availableFrom
              ? new Date(property.availableFrom)
                .toISOString()
                .split('T')[0]
              : '',

          furnishing:
            property.furnishing || 'furnished',

          amenities:
            Array.isArray(property.amenities)
              ? property.amenities
              : [],

          images:
            Array.isArray(property.images)
              ? property.images
              : [],
        });
      } catch (err) {
        console.error(
          'Failed to load property:',
          err.response?.status,
          err.response?.data || err.message
        );

        setError(
          err.response?.data?.message ||
          'Failed to load property details.'
        );
      } finally {
        setLoadingProperty(false);
      }
    };

    loadProperty();
  }, [editPropertyId, isEditMode]);

  /*
   * Toggle amenities
   */
  const toggleAmenity = (amenity) => {
    setFormData((prev) => {
      const exists =
        prev.amenities.includes(amenity);

      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter(
            (item) => item !== amenity
          )
          : [...prev.amenities, amenity],
      };
    });

    setError('');
    setSuccessMessage('');
  };

  /*
   * Image selection
   */
  const handleImageSelection = (event) => {
    const files = Array.from(
      event.target.files || []
    );

    if (files.length === 0) {
      return;
    }

    const validFiles = files.filter((file) => {
      const validType =
        file.type === 'image/jpeg' ||
        file.type === 'image/png';

      const validSize =
        file.size <= 5 * 1024 * 1024;

      return validType && validSize;
    });

    if (validFiles.length !== files.length) {
      setError(
        'Only JPG and PNG images up to 5MB each are allowed.'
      );
    }

    const imagePreviews = validFiles.map(
      (file) => ({
        id: `${file.name}-${file.lastModified}-${Math.random()}`,
        name: file.name,
        file,
        preview: URL.createObjectURL(file),
      })
    );

    setFormData((prev) => ({
      ...prev,
      images: [
        ...prev.images,
        ...imagePreviews,
      ],
    }));

    event.target.value = '';
  };

  /*
   * Remove selected image
   */
  const removeImage = (imageId) => {
    setFormData((prev) => {
      const image = prev.images.find(
        (item) =>
          typeof item === 'object' &&
          item.id === imageId
      );

      if (
        image?.preview &&
        image.preview.startsWith('blob:')
      ) {
        URL.revokeObjectURL(image.preview);
      }

      return {
        ...prev,
        images: prev.images.filter(
          (item) => {
            if (typeof item === 'string') {
              return item !== imageId;
            }

            return item.id !== imageId;
          }
        ),
      };
    });
  };

  /*
   * BHK display
   */
  const bhkText = useMemo(() => {
    const bedrooms = Number(
      formData.bedrooms
    );

    if (!bedrooms) {
      return 'Property';
    }

    if (bedrooms === 1) {
      return '1 BHK';
    }

    if (bedrooms === 2) {
      return '2 BHK';
    }

    if (bedrooms === 3) {
      return '3 BHK';
    }

    return `${bedrooms} BHK`;
  }, [formData.bedrooms]);

  /*
   * Validate current step
   */
  const validateStep = () => {
    setError('');

    if (step === 1) {
      if (!formData.title.trim()) {
        setError(
          'Please enter the property name.'
        );
        return false;
      }

      if (!formData.propertyType) {
        setError(
          'Please select a property type.'
        );
        return false;
      }

      if (
        formData.bedrooms === '' ||
        Number(formData.bedrooms) < 0
      ) {
        setError(
          'Please enter a valid bedroom count.'
        );
        return false;
      }

      if (
        formData.area === '' ||
        Number(formData.area) <= 0
      ) {
        setError(
          'Please enter the built-up area.'
        );
        return false;
      }

      return true;
    }

    if (step === 2) {
      if (!formData.address.trim()) {
        setError(
          'Please enter the full address.'
        );
        return false;
      }

      if (!formData.city.trim()) {
        setError(
          'Please enter the city.'
        );
        return false;
      }

      if (!formData.state.trim()) {
        setError(
          'Please enter the state.'
        );
        return false;
      }

      if (!formData.pincode.trim()) {
        setError(
          'Please enter the pincode.'
        );
        return false;
      }

      return true;
    }

    if (step === 3) {
      if (
        formData.monthlyRent === '' ||
        Number(formData.monthlyRent) < 0
      ) {
        setError(
          'Please enter a valid monthly rent.'
        );
        return false;
      }

      if (
        formData.securityDeposit === '' ||
        Number(formData.securityDeposit) < 0
      ) {
        setError(
          'Please enter a valid security deposit.'
        );
        return false;
      }

      if (!formData.furnishing) {
        setError(
          'Please select the furnishing status.'
        );
        return false;
      }

      return true;
    }

    return true;
  };

  /*
   * Next step
   */
  const nextStep = () => {
    if (!validateStep()) {
      return;
    }

    setStep((prev) =>
      Math.min(
        prev + 1,
        totalSteps
      )
    );
  };

  /*
   * Previous step
   */
  const prevStep = () => {
    setError('');

    setStep((prev) =>
      Math.max(prev - 1, 1)
    );
  };

  const buildPayload = () => {
    const formDataObj = new FormData();
    
    formDataObj.append('title', formData.title.trim());
    formDataObj.append('propertyType', formData.propertyType);
    formDataObj.append('address', formData.address.trim());
    formDataObj.append('city', formData.city.trim());
    formDataObj.append('state', formData.state.trim());
    formDataObj.append('pincode', formData.pincode.trim());
    formDataObj.append('bedrooms', Number(formData.bedrooms || 0));
    formDataObj.append('bathrooms', Number(formData.bathrooms || 0));
    formDataObj.append('area', Number(formData.area || 0));
    formDataObj.append('furnishing', formData.furnishing);
    formDataObj.append('monthlyRent', Number(formData.monthlyRent || 0));
    formDataObj.append('securityDeposit', Number(formData.securityDeposit || 0));
    formDataObj.append('description', formData.description.trim());

    if (formData.landmark.trim()) {
      formDataObj.append('landmark', formData.landmark.trim());
    }

    if (formData.availableFrom) {
      formDataObj.append('availableFrom', formData.availableFrom);
    }

    if (formData.amenities.length > 0) {
      formData.amenities.forEach(amenity => {
         formDataObj.append('amenities', amenity);
      });
    }

    formData.images.forEach(image => {
       if (typeof image === 'string') {
          formDataObj.append('images', image);
       } else if (image.file) {
          formDataObj.append('images', image.file);
       }
    });

    return formDataObj;
  };

  /*
   * Submit property
   */
  const handleSubmit = async () => {
    if (!validateStep()) {
      return;
    }

    setSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      const payload =
        buildPayload();

      if (isEditMode) {
        await api.put(
          `/properties/${editPropertyId}`,
          payload
        );

        setSuccessMessage(
          'Property updated successfully.'
        );
      } else {
        await api.post(
          '/properties',
          payload
        );

        setSuccessMessage(
          'Property published successfully.'
        );
      }

      setTimeout(() => {
        navigate(
          '/landlord/properties'
        );
      }, 800);
    } catch (err) {
      console.error(
        'Failed to save property:',
        err.response?.status,
        err.response?.data ||
        err.message
      );

      setError(
        err.response?.data?.message ||
        (isEditMode
          ? 'Failed to update property.'
          : 'Failed to publish property.')
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * Loading state for edit mode
   */
  if (loadingProperty) {
    return (
      <div className="space-y-6 fade-in pb-12 max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-border p-12 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-ink mx-auto mb-4"></div>

          <p className="text-text-muted">
            Loading property details...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in pb-12 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/landlord/properties"
          className="p-2 text-text-muted hover:bg-white rounded-lg border border-transparent hover:border-border transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <div>
          <h1 className="text-2xl font-display font-bold text-ink">
            {isEditMode
              ? 'Edit Property'
              : 'List a New Property'}
          </h1>

          <p className="text-text-muted mt-1">
            {isEditMode
              ? 'Update your property listing details.'
              : 'Fill in the details to list your property on SmartLease AI.'}
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-risk-red-bg border border-risk-red/20 text-risk-red rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Success */}
      {successMessage && (
        <div className="bg-good-50 border border-good-500/20 text-good-700 rounded-lg px-4 py-3 text-sm flex items-center gap-2">
          <Check className="w-4 h-4" />
          {successMessage}
        </div>
      )}

      {/* Progress */}
      <div className="bg-white rounded-xl shadow-sm border border-border p-6">
        <div className="flex items-center justify-between relative">

          <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-border -z-10 -translate-y-1/2"></div>

          <div
            className="absolute left-0 top-1/2 h-0.5 bg-lease-600 -z-10 -translate-y-1/2 transition-all duration-300"
            style={{
              width: `${((step - 1) /
                  (totalSteps - 1)) *
                100
                }%`,
            }}
          ></div>

          {[...Array(totalSteps)].map(
            (_, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-2 bg-white px-2"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step > i + 1
                      ? 'bg-lease-600 text-white'
                      : step === i + 1
                        ? 'bg-lease-600 text-white ring-4 ring-lease-100'
                        : 'bg-paper text-text-muted border border-border'
                    }`}
                >
                  {step > i + 1 ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    i + 1
                  )}
                </div>

                <span
                  className={`text-xs font-medium hidden sm:block ${step === i + 1
                      ? 'text-ink'
                      : 'text-text-muted'
                    }`}
                >
                  {stepTitles[i]}
                </span>
              </div>
            )
          )}
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm border border-border p-6 sm:p-8 min-h-[400px]">

        <h2 className="text-xl font-semibold text-ink mb-6">
          {stepTitles[step - 1]}
        </h2>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4">

            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                Property Name{' '}
                <span className="text-bad-500">*</span>
              </label>

              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  updateField(
                    'title',
                    e.target.value
                  )
                }
                placeholder="e.g. Sunset Apartments 4B"
                className="w-full px-4 py-2 bg-paper border border-border rounded-lg focus:outline-none focus:border-lease-500 focus:ring-1 focus:ring-lease-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              <div>
                <label className="block text-sm font-medium text-ink mb-1">
                  Property Type{' '}
                  <span className="text-bad-500">*</span>
                </label>

                <select
                  value={formData.propertyType}
                  onChange={(e) =>
                    updateField(
                      'propertyType',
                      e.target.value
                    )
                  }
                  className="w-full px-4 py-2 bg-paper border border-border rounded-lg focus:outline-none focus:border-lease-500"
                >
                  {PROPERTY_TYPES.map(
                    (type) => (
                      <option
                        key={type.value}
                        value={type.value}
                      >
                        {type.label}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-1">
                  BHK Configuration{' '}
                  <span className="text-bad-500">*</span>
                </label>

                <select
                  value={formData.bedrooms}
                  onChange={(e) =>
                    updateField(
                      'bedrooms',
                      e.target.value
                    )
                  }
                  className="w-full px-4 py-2 bg-paper border border-border rounded-lg focus:outline-none focus:border-lease-500"
                >
                  <option value="">
                    Select BHK
                  </option>

                  <option value="0">
                    1 RK / Studio
                  </option>

                  <option value="1">
                    1 BHK
                  </option>

                  <option value="2">
                    2 BHK
                  </option>

                  <option value="3">
                    3 BHK
                  </option>

                  <option value="4">
                    4 BHK
                  </option>

                  <option value="5">
                    5+ BHK
                  </option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              <div>
                <label className="block text-sm font-medium text-ink mb-1">
                  Built-up Area (sq.ft){' '}
                  <span className="text-bad-500">*</span>
                </label>

                <input
                  type="number"
                  min="0"
                  value={formData.area}
                  onChange={(e) =>
                    updateField(
                      'area',
                      e.target.value
                    )
                  }
                  placeholder="e.g. 1200"
                  className="w-full px-4 py-2 bg-paper border border-border rounded-lg focus:outline-none focus:border-lease-500 focus:ring-1 focus:ring-lease-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-1">
                  Bathrooms
                </label>

                <input
                  type="number"
                  min="0"
                  value={formData.bathrooms}
                  onChange={(e) =>
                    updateField(
                      'bathrooms',
                      e.target.value
                    )
                  }
                  placeholder="e.g. 2"
                  className="w-full px-4 py-2 bg-paper border border-border rounded-lg focus:outline-none focus:border-lease-500 focus:ring-1 focus:ring-lease-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                Description
              </label>

              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  updateField(
                    'description',
                    e.target.value
                  )
                }
                placeholder="Describe the property..."
                className="w-full px-4 py-2 bg-paper border border-border rounded-lg focus:outline-none focus:border-lease-500 focus:ring-1 focus:ring-lease-500 resize-none"
              />
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4">

            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                Full Address{' '}
                <span className="text-bad-500">*</span>
              </label>

              <textarea
                rows={2}
                value={formData.address}
                onChange={(e) =>
                  updateField(
                    'address',
                    e.target.value
                  )
                }
                placeholder="Building, Street, Area..."
                className="w-full px-4 py-2 bg-paper border border-border rounded-lg focus:outline-none focus:border-lease-500 focus:ring-1 focus:ring-lease-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              <div>
                <label className="block text-sm font-medium text-ink mb-1">
                  City{' '}
                  <span className="text-bad-500">*</span>
                </label>

                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) =>
                    updateField(
                      'city',
                      e.target.value
                    )
                  }
                  placeholder="e.g. Surat"
                  className="w-full px-4 py-2 bg-paper border border-border rounded-lg focus:outline-none focus:border-lease-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-1">
                  State{' '}
                  <span className="text-bad-500">*</span>
                </label>

                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) =>
                    updateField(
                      'state',
                      e.target.value
                    )
                  }
                  placeholder="e.g. Gujarat"
                  className="w-full px-4 py-2 bg-paper border border-border rounded-lg focus:outline-none focus:border-lease-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              <div>
                <label className="block text-sm font-medium text-ink mb-1">
                  Pincode{' '}
                  <span className="text-bad-500">*</span>
                </label>

                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) =>
                    updateField(
                      'pincode',
                      e.target.value
                    )
                  }
                  placeholder="e.g. 395007"
                  className="w-full px-4 py-2 bg-paper border border-border rounded-lg focus:outline-none focus:border-lease-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-1">
                  Landmark
                </label>

                <input
                  type="text"
                  value={formData.landmark}
                  onChange={(e) =>
                    updateField(
                      'landmark',
                      e.target.value
                    )
                  }
                  placeholder="e.g. Near Metro Station"
                  className="w-full px-4 py-2 bg-paper border border-border rounded-lg focus:outline-none focus:border-lease-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4">

            <div className="p-4 bg-lease-50 border border-lease-200 rounded-lg mb-6">
              <p className="text-sm text-lease-800">
                <strong>Important:</strong>{' '}
                The rent specified here is the{' '}
                <strong>Listed Rent</strong>{' '}
                used for display on the platform.
                The actual contractual rent will
                be extracted automatically from the
                uploaded rental agreement during AI
                analysis.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              <div>
                <label className="block text-sm font-medium text-ink mb-1">
                  Listed Monthly Rent (₹){' '}
                  <span className="text-bad-500">*</span>
                </label>

                <input
                  type="number"
                  min="0"
                  value={formData.monthlyRent}
                  onChange={(e) =>
                    updateField(
                      'monthlyRent',
                      e.target.value
                    )
                  }
                  placeholder="e.g. 45000"
                  className="w-full px-4 py-2 bg-paper border border-border rounded-lg focus:outline-none focus:border-lease-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-1">
                  Security Deposit (₹){' '}
                  <span className="text-bad-500">*</span>
                </label>

                <input
                  type="number"
                  min="0"
                  value={
                    formData.securityDeposit
                  }
                  onChange={(e) =>
                    updateField(
                      'securityDeposit',
                      e.target.value
                    )
                  }
                  placeholder="e.g. 200000"
                  className="w-full px-4 py-2 bg-paper border border-border rounded-lg focus:outline-none focus:border-lease-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              <div>
                <label className="block text-sm font-medium text-ink mb-1">
                  Available From
                </label>

                <input
                  type="date"
                  value={
                    formData.availableFrom
                  }
                  onChange={(e) =>
                    updateField(
                      'availableFrom',
                      e.target.value
                    )
                  }
                  className="w-full px-4 py-2 bg-paper border border-border rounded-lg focus:outline-none focus:border-lease-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-1">
                  Furnishing Status{' '}
                  <span className="text-bad-500">*</span>
                </label>

                <select
                  value={
                    formData.furnishing
                  }
                  onChange={(e) =>
                    updateField(
                      'furnishing',
                      e.target.value
                    )
                  }
                  className="w-full px-4 py-2 bg-paper border border-border rounded-lg focus:outline-none focus:border-lease-500"
                >
                  <option value="furnished">
                    Fully Furnished
                  </option>

                  <option value="semi_furnished">
                    Semi Furnished
                  </option>

                  <option value="unfurnished">
                    Unfurnished
                  </option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-bottom-4">

            <p className="text-sm text-text-muted mb-4">
              Select all amenities available in
              the property.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">

              {AMENITIES.map(
                (amenity) => {
                  const selected =
                    formData.amenities.includes(
                      amenity
                    );

                  return (
                    <label
                      key={amenity}
                      className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${selected
                          ? 'border-lease-500 bg-lease-50'
                          : 'border-border hover:bg-paper'
                        }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() =>
                          toggleAmenity(
                            amenity
                          )
                        }
                        className="w-4 h-4 text-lease-600 rounded border-border focus:ring-lease-500"
                      />

                      <span className="text-sm font-medium text-ink">
                        {amenity}
                      </span>
                    </label>
                  );
                }
              )}
            </div>

            {formData.amenities.length >
              0 && (
                <p className="text-xs text-text-muted mt-5">
                  {formData.amenities.length}{' '}
                  amenit
                  {formData.amenities.length ===
                    1
                    ? 'y'
                    : 'ies'}{' '}
                  selected.
                </p>
              )}
          </div>
        )}

        {/* STEP 5 */}
        {step === 5 && (
          <div className="animate-in fade-in slide-in-from-bottom-4">

            <div className="border-2 border-dashed border-border rounded-xl p-10 text-center bg-paper hover:bg-border/30 transition-colors">

              <UploadCloud className="w-12 h-12 text-text-faint mx-auto mb-4" />

              <h3 className="text-lg font-medium text-ink">
                Drag & Drop Images
              </h3>

              <p className="text-sm text-text-muted mt-1">
                or click to browse from your
                computer
              </p>

              <label className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-white border border-border rounded-lg text-sm font-medium shadow-sm hover:bg-paper transition-colors cursor-pointer">

                <ImageIcon className="w-4 h-4" />

                Select Files

                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  multiple
                  onChange={
                    handleImageSelection
                  }
                  className="hidden"
                />
              </label>
            </div>

            <p className="text-xs text-text-muted mt-4 text-center">
              Supports JPG, PNG up to 5MB each.
              Minimum 3 images recommended.
            </p>

            {formData.images.length >
              0 && (
                <div className="mt-6">

                  <div className="flex items-center justify-between mb-3">

                    <h4 className="text-sm font-semibold text-ink">
                      Selected Images
                    </h4>

                    <span className="text-xs text-text-muted">
                      {formData.images.length}{' '}
                      image
                      {formData.images.length !==
                        1
                        ? 's'
                        : ''}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">

                    {formData.images.map(
                      (image, index) => {

                        let preview = typeof image === 'string' ? image : image.preview;
                        if (typeof preview === 'string' && !preview.startsWith('http') && !preview.startsWith('blob:')) {
                           preview = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${preview}`;
                        }

                        const imageId =
                          typeof image ===
                            'string'
                            ? image
                            : image.id;

                        return (
                          <div
                            key={
                              imageId ||
                              index
                            }
                            className="relative aspect-square rounded-lg overflow-hidden border border-border bg-paper group"
                          >
                            <img
                              src={preview}
                              alt={`Property ${index + 1
                                }`}
                              className="w-full h-full object-cover"
                            />

                            <button
                              type="button"
                              onClick={() =>
                                removeImage(
                                  imageId
                                )
                              }
                              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 text-risk-red flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Remove image"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              )}
          </div>
        )}

        {/* STEP 6 */}
        {step === 6 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6">

            <div className="bg-paper border border-border rounded-xl p-6 text-center">

              <Check className="w-16 h-16 text-good-500 mx-auto mb-4 bg-good-50 rounded-full p-2" />

              <h3 className="text-xl font-bold text-ink">
                {isEditMode
                  ? 'Property Ready to Update'
                  : 'Property Ready to Publish'}
              </h3>

              <p className="text-text-muted mt-2 max-w-md mx-auto">
                Review the details before{' '}
                {isEditMode
                  ? 'updating'
                  : 'publishing'}{' '}
                your property.
              </p>
            </div>

            <div className="p-5 border border-border rounded-lg bg-white">

              <h4 className="font-semibold text-ink mb-4">
                Summary
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">

                <div>
                  <span className="text-text-faint">
                    Property
                  </span>

                  <p className="font-medium text-ink mt-0.5">
                    {formData.title ||
                      'Not specified'}
                  </p>
                </div>

                <div>
                  <span className="text-text-faint">
                    Type
                  </span>

                  <p className="font-medium text-ink mt-0.5">
                    {bhkText}{' '}
                    {PROPERTY_TYPES.find(
                      (type) =>
                        type.value ===
                        formData.propertyType
                    )?.label || ''}
                  </p>
                </div>

                <div>
                  <span className="text-text-faint">
                    Area
                  </span>

                  <p className="font-medium text-ink mt-0.5">
                    {formData.area
                      ? `${Number(
                        formData.area
                      ).toLocaleString(
                        'en-IN'
                      )} sq.ft`
                      : 'Not specified'}
                  </p>
                </div>

                <div>
                  <span className="text-text-faint">
                    Furnishing
                  </span>

                  <p className="font-medium text-ink mt-0.5">
                    {formData.furnishing ===
                      'furnished'
                      ? 'Fully Furnished'
                      : formData.furnishing ===
                        'semi_furnished'
                        ? 'Semi Furnished'
                        : 'Unfurnished'}
                  </p>
                </div>

                <div>
                  <span className="text-text-faint">
                    Listed Rent
                  </span>

                  <p className="font-medium text-ink mt-0.5">
                    ₹
                    {Number(
                      formData.monthlyRent ||
                      0
                    ).toLocaleString(
                      'en-IN'
                    )}
                    /month
                  </p>
                </div>

                <div>
                  <span className="text-text-faint">
                    Security Deposit
                  </span>

                  <p className="font-medium text-ink mt-0.5">
                    ₹
                    {Number(
                      formData.securityDeposit ||
                      0
                    ).toLocaleString(
                      'en-IN'
                    )}
                  </p>
                </div>

                <div>
                  <span className="text-text-faint">
                    Location
                  </span>

                  <p className="font-medium text-ink mt-0.5">
                    {formData.city ||
                      'City'}
                    ,{' '}
                    {formData.state ||
                      'State'}
                  </p>
                </div>

                <div>
                  <span className="text-text-faint">
                    Amenities
                  </span>

                  <p className="font-medium text-ink mt-0.5">
                    {formData.amenities.length >
                      0
                      ? `${formData.amenities.length} selected`
                      : 'None selected'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER BUTTONS */}
      <div className="flex items-center justify-between pt-4">

        {/* Back */}
        <button
          type="button"
          onClick={prevStep}
          disabled={step === 1 || saving}
          className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${step === 1
              ? 'opacity-0 cursor-default'
              : 'bg-paper border border-border text-ink hover:bg-border/50'
            }`}
        >
          Back
        </button>

        {/* Continue */}
        {step < totalSteps ? (
          <button
            type="button"
            onClick={nextStep}
            disabled={saving}
            className="px-6 py-2.5 bg-lease-600 text-white rounded-lg text-sm font-medium hover:bg-lease-700 transition-colors shadow-sm disabled:opacity-50"
          >
            Continue
          </button>
        ) : (
          <div className="flex gap-3">

            <Link
              to="/landlord/properties"
              className="px-6 py-2.5 bg-paper border border-border text-ink rounded-lg text-sm font-medium hover:bg-border/50 transition-colors"
            >
              Cancel
            </Link>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="px-6 py-2.5 bg-lease-600 text-white rounded-lg text-sm font-medium hover:bg-lease-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              {saving && (
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
              )}

              {saving
                ? isEditMode
                  ? 'Updating...'
                  : 'Publishing...'
                : isEditMode
                  ? 'Update Property'
                  : 'Publish Property'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddProperty;