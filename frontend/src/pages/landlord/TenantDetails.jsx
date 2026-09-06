import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Phone,
  Mail,
  FileText,
  Calendar,
  Building,
  AlertCircle,
  Download,
} from 'lucide-react';

import StatusBadge from '../../components/admin/StatusBadge';
import api from '../../services/api';

const TenantDetails = () => {
  const { id } = useParams();

  const [rentals, setRentals] = useState([]);
  const [agreements, setAgreements] = useState([]);
  const [reminders, setReminders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ============================================================
  // FETCH DATA
  // ============================================================

  useEffect(() => {
    const fetchTenantData = async () => {
      try {
        setLoading(true);
        setError('');

        const [
          rentalsResponse,
          agreementsResponse,
          remindersResponse,
        ] = await Promise.all([
          api.get('/rentals/my-properties'),
          api.get('/agreements/my-agreements'),
          api.get('/rent-reminders/my-reminders'),
        ]);

        const rentalData =
          rentalsResponse.data.rentals ||
          rentalsResponse.data ||
          [];

        const agreementData =
          agreementsResponse.data.agreements ||
          agreementsResponse.data ||
          [];

        const reminderData =
          remindersResponse.data.reminders ||
          remindersResponse.data ||
          [];

        setRentals(
          Array.isArray(rentalData)
            ? rentalData
            : []
        );

        setAgreements(
          Array.isArray(agreementData)
            ? agreementData
            : []
        );

        setReminders(
          Array.isArray(reminderData)
            ? reminderData
            : []
        );

      } catch (err) {
        console.error(
          'Failed to load tenant details:',
          err.response?.data || err.message
        );

        setError(
          err.response?.data?.message ||
          'Failed to load tenant details.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTenantData();
  }, [id]);

  // ============================================================
  // HELPERS
  // ============================================================

  const getObjectId = (value) => {
    if (!value) {
      return null;
    }

    if (typeof value === 'object') {
      return value._id || null;
    }

    return value;
  };

  const getTenant = (rental) => {
    if (
      rental?.tenant &&
      typeof rental.tenant === 'object'
    ) {
      return rental.tenant;
    }

    return null;
  };

  const getProperty = (rental) => {
    if (
      rental?.property &&
      typeof rental.property === 'object'
    ) {
      return rental.property;
    }

    return null;
  };

  const getTenantId = (rental) => {
    return getObjectId(rental?.tenant);
  };

  const getPropertyId = (rental) => {
    return getObjectId(rental?.property);
  };

  const formatDate = (date) => {
    if (!date) {
      return '—';
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return '—';
    }

    return parsed.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount) => {
    if (
      amount === undefined ||
      amount === null ||
      amount === ''
    ) {
      return '₹0';
    }

    return `₹${Number(amount).toLocaleString(
      'en-IN'
    )}`;
  };

  // ============================================================
  // FIND TENANT RENTALS
  // ============================================================

  const tenantRentals = useMemo(() => {
    return rentals.filter((rental) => {
      const rentalTenantId =
        getTenantId(rental);

      return (
        rentalTenantId &&
        rentalTenantId.toString() ===
        id.toString()
      );
    });
  }, [rentals, id]);

  // ============================================================
  // ACTIVE RENTAL
  // ============================================================

  const activeRental = useMemo(() => {
    return (
      tenantRentals.find(
        (rental) =>
          rental.status === 'active'
      ) ||
      tenantRentals[0] ||
      null
    );
  }, [tenantRentals]);

  // ============================================================
  // TENANT INFORMATION
  // ============================================================

  const tenant = useMemo(() => {
    const populatedTenant =
      tenantRentals.find(
        (rental) =>
          getTenant(rental)
      );

    return (
      getTenant(populatedTenant) ||
      {}
    );
  }, [tenantRentals]);

  const tenantName =
    tenant.name ||
    activeRental?.tenantName ||
    'Tenant';

  const tenantEmail =
    tenant.email ||
    activeRental?.tenantEmail ||
    '';

  const tenantPhone =
    tenant.phone ||
    activeRental?.tenantPhone ||
    '';

  // ============================================================
  // PROPERTY INFORMATION
  // ============================================================

  const property = getProperty(
    activeRental
  );

  const propertyId =
    getPropertyId(activeRental);

  const propertyName =
    property?.title ||
    activeRental?.propertyName ||
    'Property';

  const monthlyRent =
    activeRental?.monthlyRent ??
    property?.monthlyRent ??
    0;

  const securityDeposit =
    activeRental?.securityDeposit ??
    property?.securityDeposit ??
    0;

  // ============================================================
  // TENANT AGREEMENT
  // ============================================================

  const activeAgreement = useMemo(() => {
    if (!activeRental) {
      return null;
    }

    const rentalId =
      getObjectId(activeRental._id);

    const rentalPropertyId =
      getPropertyId(activeRental);

    return (
      agreements.find((agreement) => {
        const agreementTenantId =
          getObjectId(agreement.tenant);

        const agreementRentalId =
          getObjectId(agreement.rental);

        const agreementPropertyId =
          getObjectId(agreement.property);

        const tenantMatches =
          agreementTenantId &&
          agreementTenantId.toString() ===
          id.toString();

        const rentalMatches =
          rentalId &&
          agreementRentalId &&
          agreementRentalId.toString() ===
          rentalId.toString();

        const propertyMatches =
          rentalPropertyId &&
          agreementPropertyId &&
          agreementPropertyId.toString() ===
          rentalPropertyId.toString();

        return (
          tenantMatches &&
          (rentalMatches ||
            propertyMatches)
        );
      }) ||
      null
    );
  }, [
    agreements,
    activeRental,
    id,
  ]);

  // ============================================================
  // REMINDERS
  // ============================================================

  const tenantReminders = useMemo(() => {
    return reminders
      .filter((reminder) => {
        const reminderTenantId =
          getObjectId(reminder.tenant);

        const reminderRentalId =
          getObjectId(reminder.rental);

        const tenantMatches =
          reminderTenantId &&
          reminderTenantId.toString() ===
          id.toString();

        const rentalMatches =
          activeRental?._id &&
          reminderRentalId &&
          reminderRentalId.toString() ===
          activeRental._id.toString();

        return (
          tenantMatches ||
          rentalMatches
        );
      })
      .filter(
        (reminder) =>
          reminder.status !== 'paid' &&
          reminder.status !== 'cancelled'
      )
      .sort(
        (a, b) =>
          new Date(a.dueDate || a.date) -
          new Date(b.dueDate || b.date)
      );
  }, [
    reminders,
    activeRental,
    id,
  ]);

  const upcomingReminder =
    tenantReminders[0] || null;

  // ============================================================
  // AGREEMENT RISK
  // ============================================================

  const agreementRisk =
    activeAgreement?.latestRisk ||
    activeAgreement?.riskAnalysis ||
    null;

  // ============================================================
  // DOWNLOAD AGREEMENT
  // ============================================================

  const handleDownload = () => {
    if (!activeAgreement?.fileUrl) {
      return;
    }

    window.open(
      activeAgreement.fileUrl,
      '_blank',
      'noopener,noreferrer'
    );
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="space-y-6 fade-in pb-8">
        <div className="p-10 text-center text-text-muted">
          Loading tenant details...
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error) {
    return (
      <div className="space-y-6 fade-in pb-8">
        <div className="flex items-center gap-4">
          <Link
            to="/landlord/tenants"
            className="p-2 text-text-muted hover:bg-white rounded-lg border border-transparent hover:border-border transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div>
            <h1 className="text-2xl font-display font-bold text-ink">
              Tenant Details
            </h1>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  // ============================================================
  // TENANT NOT FOUND
  // ============================================================

  if (!activeRental && tenantRentals.length === 0) {
    return (
      <div className="space-y-6 fade-in pb-8">

        <div className="flex items-center gap-4">
          <Link
            to="/landlord/tenants"
            className="p-2 text-text-muted hover:bg-white rounded-lg border border-transparent hover:border-border transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div>
            <h1 className="text-2xl font-display font-bold text-ink">
              Tenant Details
            </h1>

            <p className="text-text-muted mt-1">
              Tenant Details & Rental History
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-border p-10 text-center">
          <AlertCircle className="w-10 h-10 text-warn-500 mx-auto mb-3" />

          <h2 className="font-semibold text-ink">
            Tenant information not found
          </h2>

          <p className="text-sm text-text-muted mt-1">
            This tenant does not have a rental associated with your properties.
          </p>
        </div>

      </div>
    );
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="space-y-6 fade-in pb-8">

      {/* HEADER */}
      <div className="flex items-center gap-4">

        <Link
          to="/landlord/tenants"
          className="p-2 text-text-muted hover:bg-white rounded-lg border border-transparent hover:border-border transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-bold text-ink">
              {tenantName}
            </h1>

            <StatusBadge
              status={
                activeRental?.status === 'active'
                  ? 'Active'
                  : formatStatus(
                    activeRental?.status
                  )
              }
            />
          </div>

          <p className="text-text-muted mt-1">
            Tenant Details & Rental History
          </p>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ====================================================
            LEFT COLUMN
        ==================================================== */}

        <div className="lg:col-span-1 space-y-6">

          {/* PROFILE */}
          <div className="bg-white rounded-xl shadow-sm border border-border p-6 text-center">

            <div className="w-24 h-24 bg-lease-100 text-lease-700 rounded-full flex items-center justify-center text-4xl font-display font-bold mx-auto mb-4">
              {tenantName
                .charAt(0)
                .toUpperCase()}
            </div>

            <h2 className="text-xl font-bold text-ink">
              {tenantName}
            </h2>

            <p className="text-text-muted text-sm">
              Tenant since{' '}
              {formatDate(
                activeRental?.startDate ||
                activeRental?.bookingDate
              )}
            </p>

            {/* CONTACT */}
            <div className="flex justify-center gap-4 mt-6">

              {tenantPhone ? (
                <a
                  href={`tel:${tenantPhone}`}
                  className="flex items-center gap-2 px-4 py-2 bg-paper border border-border rounded-lg text-sm font-medium text-ink hover:bg-border/50 transition-colors"
                >
                  <Phone className="w-4 h-4 text-good-600" />
                  Call
                </a>
              ) : (
                <button
                  disabled
                  className="flex items-center gap-2 px-4 py-2 bg-paper border border-border rounded-lg text-sm font-medium text-text-muted opacity-50 cursor-not-allowed"
                >
                  <Phone className="w-4 h-4" />
                  Call
                </button>
              )}

              {tenantEmail ? (
                <a
                  href={`mailto:${tenantEmail}`}
                  className="flex items-center gap-2 px-4 py-2 bg-paper border border-border rounded-lg text-sm font-medium text-ink hover:bg-border/50 transition-colors"
                >
                  <Mail className="w-4 h-4 text-signal-600" />
                  Email
                </a>
              ) : (
                <button
                  disabled
                  className="flex items-center gap-2 px-4 py-2 bg-paper border border-border rounded-lg text-sm font-medium text-text-muted opacity-50 cursor-not-allowed"
                >
                  <Mail className="w-4 h-4" />
                  Email
                </button>
              )}

            </div>
          </div>

          {/* REMINDERS */}
          <div className="bg-white rounded-xl shadow-sm border border-border p-6">

            <h3 className="font-semibold text-ink mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-warn-500" />
              Upcoming Reminders
            </h3>

            {upcomingReminder ? (
              <div className="p-3 bg-warn-50 border border-warn-500/20 rounded-lg">

                <p className="text-sm font-medium text-warn-800">
                  {upcomingReminder.title ||
                    upcomingReminder.type ||
                    'Rent Due'}
                </p>

                <p className="text-xs text-warn-700 mt-1">
                  {formatDate(
                    upcomingReminder.dueDate ||
                    upcomingReminder.date
                  )}
                </p>

                {upcomingReminder.amount !==
                  undefined && (
                    <p className="text-sm font-semibold text-warn-800 mt-2">
                      {formatCurrency(
                        upcomingReminder.amount
                      )}
                    </p>
                  )}

              </div>
            ) : (
              <div className="p-3 bg-paper rounded-lg">
                <p className="text-sm text-text-muted">
                  No upcoming reminders.
                </p>
              </div>
            )}

          </div>
        </div>

        {/* ====================================================
            RIGHT COLUMN
        ==================================================== */}

        <div className="lg:col-span-2 space-y-6">

          {/* RENTAL INFORMATION */}
          <div className="bg-white rounded-xl shadow-sm border border-border p-6">

            <h3 className="font-semibold text-ink mb-6 flex items-center gap-2">
              <Building className="w-5 h-5 text-lease-600" />
              Rental Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

              <div>
                <p className="text-sm text-text-muted">
                  Property
                </p>

                <p className="font-medium text-ink mt-1">
                  {propertyName}
                </p>

                {propertyId && (
                  <Link
                    to={`/landlord/properties/${propertyId}`}
                    className="text-xs text-lease-600 hover:underline mt-1 inline-block"
                  >
                    View Property Details
                  </Link>
                )}
              </div>

              <div>
                <p className="text-sm text-text-muted">
                  Contractual Rent
                </p>

                <p className="font-medium text-ink mt-1">
                  {formatCurrency(monthlyRent)}
                  {' / month'}
                </p>
              </div>

              <div>
                <p className="text-sm text-text-muted">
                  Security Deposit
                </p>

                <p className="font-medium text-ink mt-1">
                  {formatCurrency(
                    securityDeposit
                  )}
                </p>
              </div>

              <div>
                <p className="text-sm text-text-muted">
                  Rental Start Date
                </p>

                <p className="font-medium text-ink mt-1">
                  {formatDate(
                    activeRental?.startDate
                  )}
                </p>
              </div>

              <div>
                <p className="text-sm text-text-muted">
                  Rental End Date
                </p>

                <p className="font-medium text-ink mt-1">
                  {formatDate(
                    activeRental?.endDate
                  )}
                </p>
              </div>

              <div>
                <p className="text-sm text-text-muted">
                  Rental Status
                </p>

                <div className="mt-1">
                  <StatusBadge
                    status={formatStatus(
                      activeRental?.status
                    )}
                  />
                </div>
              </div>

            </div>
          </div>

          {/* AGREEMENT */}
          <div className="bg-white rounded-xl shadow-sm border border-border p-6">

            <div className="flex items-center justify-between mb-6">

              <h3 className="font-semibold text-ink flex items-center gap-2">
                <FileText className="w-5 h-5 text-lease-600" />
                Active Agreement
              </h3>

              {activeAgreement && (
                <StatusBadge
                  status={
                    agreementRisk
                      ? String(
                        agreementRisk
                      ).includes('HIGH')
                        ? 'High Risk'
                        : String(
                          agreementRisk
                        ).includes('MEDIUM')
                          ? 'Medium Risk'
                          : 'Low Risk'
                      : activeAgreement.status ||
                      'Active'
                  }
                />
              )}

            </div>

            {activeAgreement ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">

                  <div>
                    <p className="text-sm text-text-muted">
                      Agreement
                    </p>

                    <p className="font-medium text-ink mt-1">
                      {activeAgreement.title ||
                        activeAgreement.originalFileName ||
                        'Rental Agreement'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-text-muted">
                      Agreement Status
                    </p>

                    <p className="font-medium text-ink mt-1">
                      {formatStatus(
                        activeAgreement.status
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-text-muted">
                      Uploaded Date
                    </p>

                    <p className="font-medium text-ink mt-1">
                      {formatDate(
                        activeAgreement.uploadedAt ||
                        activeAgreement.createdAt
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-text-muted">
                      File Type
                    </p>

                    <p className="font-medium text-ink mt-1 uppercase">
                      {activeAgreement.fileType ||
                        '—'}
                    </p>
                  </div>

                </div>

                <div className="flex flex-wrap gap-3">

                  <Link
                    to={`/landlord/analysis/${activeAgreement._id}`}
                    className="px-4 py-2 bg-lease-600 text-white rounded-lg text-sm font-medium hover:bg-lease-700 transition-colors shadow-sm"
                  >
                    View Analysis Report
                  </Link>

                  {activeAgreement.fileUrl && (
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-2 px-4 py-2 bg-paper border border-border text-ink rounded-lg text-sm font-medium hover:bg-border/50 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  )}

                </div>
              </>
            ) : (
              <div className="p-4 bg-paper rounded-lg">
                <p className="text-sm text-text-muted">
                  No agreement is associated with this tenant's current rental.
                </p>

                <Link
                  to="/landlord/agreements"
                  className="inline-block mt-3 text-sm text-lease-600 hover:underline"
                >
                  View all agreements
                </Link>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* RENTAL HISTORY */}
      {tenantRentals.length > 1 && (
        <div className="bg-white rounded-xl shadow-sm border border-border p-6">

          <h3 className="font-semibold text-ink mb-5 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-lease-600" />
            Rental History
          </h3>

          <div className="space-y-3">

            {tenantRentals.map((rental) => {

              const rentalProperty =
                getProperty(rental);

              return (
                <div
                  key={rental._id}
                  className="p-4 bg-paper rounded-lg border border-border"
                >

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

                    <div>
                      <p className="font-medium text-ink">
                        {rentalProperty?.title ||
                          rental.propertyName ||
                          'Property'}
                      </p>

                      <p className="text-sm text-text-muted mt-1">
                        {formatDate(
                          rental.startDate
                        )}
                        {' → '}
                        {formatDate(
                          rental.endDate
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">

                      <span className="font-medium text-ink">
                        {formatCurrency(
                          rental.monthlyRent
                        )}
                      </span>

                      <StatusBadge
                        status={formatStatus(
                          rental.status
                        )}
                      />

                    </div>

                  </div>

                </div>
              );
            })}

          </div>
        </div>
      )}

    </div>
  );
};

// ============================================================
// STATUS HELPER
// ============================================================

const formatStatus = (status) => {
  if (!status) {
    return 'Unknown';
  }

  return (
    status.charAt(0).toUpperCase() +
    status.slice(1)
  );
};

export default TenantDetails;