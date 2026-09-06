import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const QuickActionCard = ({
  title,
  desc,
  buttonText,
  icon,
  to,
}) => (
  <div className="bg-white border border-border p-[24px] rounded-[8px] flex flex-col hover:border-gold-soft transition-colors group cursor-pointer">
    <div className="w-[42px] h-[42px] rounded-[6px] border border-border bg-paper flex items-center justify-center font-mono text-[18px] mb-[18px] text-text-muted group-hover:bg-gold/10 group-hover:border-gold group-hover:text-gold-deep transition-colors">
      {icon}
    </div>

    <h3 className="font-serif font-medium text-[17px] mb-[6px] text-ink">
      {title}
    </h3>

    <p className="text-[13.5px] text-text-muted flex-1 mb-[18px] leading-relaxed">
      {desc}
    </p>

    <Link
      to={to}
      className="font-semibold text-[13px] text-ink underline underline-offset-4 hover:text-gold-deep transition-colors"
    >
      {buttonText}
    </Link>
  </div>
);

const LandlordDashboard = () => {
  const [properties, setProperties] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [agreements, setAgreements] = useState([]);
  const [reminders, setReminders] = useState([]);

  const [riskAlerts, setRiskAlerts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError('');

      try {
        const [
          propertiesResponse,
          rentalsResponse,
          agreementsResponse,
          remindersResponse,
        ] = await Promise.all([
          api.get('/properties/my-properties'),
          api.get('/rentals/my-properties'),
          api.get('/agreements/my-agreements'),
          api.get('/rent-reminders/my-reminders'),
        ]);

        const propertyData =
          propertiesResponse.data.properties ||
          propertiesResponse.data ||
          [];

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

        setProperties(
          Array.isArray(propertyData) ? propertyData : []
        );

        setRentals(
          Array.isArray(rentalData) ? rentalData : []
        );

        setAgreements(
          Array.isArray(agreementData) ? agreementData : []
        );

        setReminders(
          Array.isArray(reminderData) ? reminderData : []
        );

        /*
         * Fetch already-generated latest risk analysis.
         *
         * IMPORTANT:
         * This GET request does NOT call Gemini.
         * It only reads stored AI analysis from MongoDB.
         */
        const riskResults = await Promise.all(
          (Array.isArray(agreementData)
            ? agreementData
            : []
          ).map(async (agreement) => {
            try {
              const response = await api.get(
                `/ai/agreements/${agreement._id}/risks/latest`
              );

              const riskData = response.data;

              if (!riskData?.risks) {
                return null;
              }

              return {
                id:
                  riskData.analysisId ||
                  agreement._id,

                type: 'Agreement Risk',

                property:
                  agreement.property?.title ||
                  agreement.title ||
                  agreement.originalFileName ||
                  'Agreement',

                details: riskData.risks,

                agreementId: agreement._id,
              };
            } catch (riskError) {
              /*
               * A missing risk analysis should not break
               * the entire landlord dashboard.
               */
              return null;
            }
          })
        );

        const validRiskResults = riskResults
          .filter(Boolean)
          .slice(0, 5);

        setRiskAlerts(validRiskResults);

      } catch (dashboardError) {
        console.error(
          'Failed to load landlord dashboard:',
          dashboardError.response?.status,
          dashboardError.response?.data ||
          dashboardError.message
        );

        setError(
          dashboardError.response?.data?.message ||
          'Failed to load dashboard data.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  /*
   * KPI calculations
   */

  const totalProperties = properties.length;

  const availableProperties = properties.filter(
    (property) => property.status === 'available'
  ).length;

  const activeTenants = rentals.filter(
    (rental) => rental.status === 'active'
  ).length;

  const pendingRequests = rentals.filter(
    (rental) => rental.status === 'pending'
  );

  /*
   * Reminder formatting
   */

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return 'No date';
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const upcomingReminders = reminders
    .filter((reminder) => {
      return (
        reminder.status !== 'cancelled' &&
        reminder.status !== 'paid'
      );
    })
    .sort((a, b) => {
      const dateA = new Date(
        a.dueDate ||
        a.reminderDate ||
        a.date ||
        a.createdAt
      ).getTime();

      const dateB = new Date(
        b.dueDate ||
        b.reminderDate ||
        b.date ||
        b.createdAt
      ).getTime();

      return dateA - dateB;
    })
    .slice(0, 5)
    .map((reminder) => ({
      id: reminder._id,
      title:
        reminder.title ||
        reminder.type ||
        'Reminder',
      property:
        reminder.property?.title ||
        reminder.propertyName ||
        '',
      dueDate: formatDate(
        reminder.dueDate ||
        reminder.reminderDate ||
        reminder.date
      ),
    }));

  /*
   * Loading state
   */

  if (loading) {
    return (
      <div className="fade-in flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-ink mx-auto mb-4"></div>

          <p className="text-text-muted text-sm">
            Loading landlord dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in space-y-6">

      {/* Error */}
      {error && (
        <div className="bg-risk-red-bg border border-risk-red/20 text-risk-red rounded-[8px] px-[18px] py-[14px] text-[13px]">
          {error}
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[1px] bg-border border border-border rounded-[8px] mb-[26px] overflow-hidden">

        {/* Total Properties */}
        <div className="bg-white p-[22px]">
          <span className="font-mono text-[10.5px] tracking-[0.1em] text-text-muted uppercase block font-semibold">
            Total Properties
          </span>

          <div className="font-serif text-[36px] font-medium my-[8px] text-ink">
            {totalProperties}
          </div>

          <span className="font-mono text-[11.5px] text-text-faint">
            {availableProperties} available
          </span>
        </div>

        {/* Total Tenants */}
        <div className="bg-white p-[22px]">
          <span className="font-mono text-[10.5px] tracking-[0.1em] text-text-muted uppercase block font-semibold">
            Total Tenants
          </span>

          <div className="font-serif text-[36px] font-medium my-[8px] text-ink">
            {activeTenants}
          </div>

          <span className="font-mono text-[11.5px] text-text-faint">
            Active leases
          </span>
        </div>

        {/* Pending Requests */}
        <div className="bg-white p-[22px]">
          <span className="font-mono text-[10.5px] tracking-[0.1em] text-text-muted uppercase block font-semibold">
            Pending Requests
          </span>

          <div className="font-serif text-[36px] font-medium my-[8px] text-ink">
            {pendingRequests.length}
          </div>

          <span className="font-mono text-[11.5px] text-text-faint">
            Needs review
          </span>
        </div>

        {/* Flagged Risks */}
        <div className="bg-white p-[22px]">
          <span className="font-mono text-[10.5px] tracking-[0.1em] text-text-muted uppercase block font-semibold">
            Flagged Risks
          </span>

          <div className="font-serif text-[36px] font-medium my-[8px] text-ink">
            {riskAlerts.length}
          </div>

          <span className="font-mono text-[11.5px] text-text-faint">
            Across agreements
          </span>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-[26px] mb-[26px] items-start">

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-[18px]">

          <QuickActionCard
            title="Add Property"
            desc="List a new residential or commercial property."
            buttonText="Create Listing"
            icon="+"
            to="/landlord/properties/add"
          />

          <QuickActionCard
            title="Rental Requests"
            desc="Review new tenant applications."
            buttonText="View Requests"
            icon="◫"
            to="/landlord/rental-requests"
          />

          <QuickActionCard
            title="Agreements"
            desc="Analyze lease contracts for risks."
            buttonText="View Agreements"
            icon="≡"
            to="/landlord/agreements"
          />

          <QuickActionCard
            title="Set Reminder"
            desc="Create deadlines for rent or renewals."
            buttonText="Add Reminder"
            icon="⏰"
            to="/landlord/reminders"
          />

        </div>

        {/* Risk Alerts */}
        <div className="bg-white border border-border rounded-[8px]">

          <div className="p-[20px] px-[24px] border-b border-border">
            <h3 className="font-serif font-medium text-[17px] text-ink m-0">
              Risk alerts
            </h3>
          </div>

          <div>

            {riskAlerts.length === 0 ? (
              <div className="p-[24px] text-center">
                <p className="text-[13px] text-text-muted m-0">
                  No stored agreement risks found.
                </p>
              </div>
            ) : (
              riskAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex gap-[16px] p-[18px] px-[24px] border-b border-border last:border-b-0 items-start"
                >
                  <span className="w-[28px] h-[28px] rounded-[4px] bg-[#C24343]/10 text-[#C24343] flex items-center justify-center flex-none text-[15px] font-serif font-bold">
                    !
                  </span>

                  <div className="min-w-0">

                    <b className="text-[14px] font-semibold text-ink block mb-[4px]">
                      {alert.type}
                    </b>

                    <p className="text-[13px] text-text-muted m-0 leading-relaxed">
                      {alert.property}
                    </p>

                    <p className="text-[12px] text-text-faint mt-[5px] leading-relaxed line-clamp-3">
                      {alert.details}
                    </p>

                    <Link
                      to={`/landlord/analysis/${alert.agreementId}`}
                      className="inline-block mt-[8px] text-[12px] font-semibold text-ink underline underline-offset-4 hover:text-gold-deep"
                    >
                      View analysis
                    </Link>

                  </div>
                </div>
              ))
            )}

          </div>
        </div>
      </div>

      {/* Reminders */}
      <div className="bg-white border border-border rounded-[8px]">

        <div className="p-[20px] px-[24px] border-b border-border">
          <h3 className="font-serif font-medium text-[17px] text-ink m-0">
            Upcoming reminders
          </h3>
        </div>

        <div>

          {upcomingReminders.length === 0 ? (
            <div className="p-[24px] text-center">
              <p className="text-[13px] text-text-muted m-0">
                No upcoming reminders.
              </p>
            </div>
          ) : (
            upcomingReminders.map((reminder) => (
              <div
                key={reminder.id}
                className="flex justify-between items-center p-[16px] px-[24px] border-b border-border last:border-b-0 gap-4"
              >

                <div className="text-[14px] font-medium text-ink">
                  {reminder.title}

                  {reminder.property && (
                    <>
                      {' — '}
                      {reminder.property}
                    </>
                  )}
                </div>

                <span className="font-mono text-[11.5px] font-medium bg-paper border border-border text-text-muted px-[10px] py-[5px] rounded-[4px] whitespace-nowrap">
                  {reminder.dueDate}
                </span>

              </div>
            ))
          )}

        </div>
      </div>

    </div>
  );
};

export default LandlordDashboard;
