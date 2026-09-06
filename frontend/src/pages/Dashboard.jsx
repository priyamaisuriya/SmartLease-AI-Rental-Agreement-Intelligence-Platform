import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Dashboard = () => {
  const [agreements, setAgreements] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [risks, setRisks] = useState([]);
  const [chatQuestions, setChatQuestions] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const formatDate = (date) => {
    if (!date) return '—';

    return new Date(date).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDaysRemaining = (date) => {
    if (!date) return null;

    const today = new Date();
    const target = new Date(date);

    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);

    return Math.ceil(
      (target - today) / (1000 * 60 * 60 * 24)
    );
  };

  const getReminderText = (reminder) => {
    const days = getDaysRemaining(reminder.dueDate);

    if (days === null) return '—';

    if (days < 0) {
      return `${Math.abs(days)} days overdue`;
    }

    if (days === 0) {
      return 'Due today';
    }

    if (days === 1) {
      return 'In 1 day';
    }

    return `In ${days} days`;
  };

  const getRiskTitle = (riskText) => {
    if (!riskText) {
      return 'Agreement risk detected';
    }

    const text = riskText.toLowerCase();

    if (text.includes('termination')) {
      return 'Termination clause';
    }

    if (text.includes('deposit')) {
      return 'Security deposit concern';
    }

    if (text.includes('rent')) {
      return 'Rent-related concern';
    }

    if (text.includes('notice')) {
      return 'Notice clause concern';
    }

    if (text.includes('sublet')) {
      return 'Subletting restriction';
    }

    return 'Agreement risk detected';
  };

  const getPropertyTitle = (agreement) => {
    if (agreement?.property?.title) {
      return agreement.property.title;
    }

    return agreement?.title || 'Rental Agreement';
  };

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');

      const [
        agreementsResponse,
        rentalsResponse,
        remindersResponse,
      ] = await Promise.all([
        api.get('/agreements/my-agreements'),
        api.get('/rentals/my-rentals'),
        api.get('/rent-reminders/my-reminders'),
      ]);

      const agreementData =
        agreementsResponse.data.agreements ||
        agreementsResponse.data ||
        [];

      const rentalData =
        rentalsResponse.data.rentals ||
        rentalsResponse.data ||
        [];

      const reminderData =
        remindersResponse.data.reminders ||
        remindersResponse.data ||
        [];

      setAgreements(
        Array.isArray(agreementData)
          ? agreementData
          : []
      );

      setRentals(
        Array.isArray(rentalData)
          ? rentalData
          : []
      );

      setReminders(
        Array.isArray(reminderData)
          ? reminderData
          : []
      );

      // Load latest AI risk analysis for the tenant's agreements.
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
              agreement,
              ...riskData,
            };
          } catch (riskError) {
            // No risk analysis yet is not a dashboard error.
            return null;
          }
        })
      );

      setRisks(
        riskResults.filter(Boolean)
      );

      // Count question-type AI analyses.
      let questionCount = 0;

      await Promise.all(
        (Array.isArray(agreementData)
          ? agreementData
          : []
        ).map(async (agreement) => {
          try {
            const response = await api.get(
              `/ai/agreements/${agreement._id}/history`
            );

            const history =
              response.data.history ||
              response.data ||
              [];

            if (Array.isArray(history)) {
              questionCount += history.filter(
                (item) => item.type === 'question'
              ).length;
            }
          } catch (historyError) {
            // History is optional for dashboard loading.
          }
        })
      );

      setChatQuestions(questionCount);

    } catch (err) {
      console.error(
        'Failed to load tenant dashboard:',
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
        'Failed to load dashboard data.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const activeRentals = rentals.filter(
    (rental) => rental.status === 'active'
  );

  const upcomingReminders = reminders
    .filter(
      (reminder) =>
        reminder.status !== 'paid' &&
        reminder.status !== 'cancelled'
    )
    .sort(
      (a, b) =>
        new Date(a.dueDate) -
        new Date(b.dueDate)
    )
    .slice(0, 5);

  const recentAgreements = [...agreements]
    .sort(
      (a, b) =>
        new Date(b.uploadedAt || b.createdAt) -
        new Date(a.uploadedAt || a.createdAt)
    )
    .slice(0, 5);

  const recentRisks = risks.slice(0, 3);

  return (
    <div className="fade-in space-y-6">

      {/* Loading */}
      {loading && (
        <div className="bg-white border border-border rounded-[8px] p-[20px]">
          <p className="text-[13px] text-text-muted">
            Loading your SmartLease dashboard...
          </p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="bg-white border border-[#C24343]/30 rounded-[8px] p-[20px]">
          <p className="text-[13px] text-[#C24343]">
            {error}
          </p>
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[1px] bg-border border border-border rounded-[8px] mb-[26px] overflow-hidden">

        <div className="bg-white p-[22px]">
          <span className="font-mono text-[10.5px] tracking-[0.1em] text-text-muted uppercase block font-semibold">
            Agreements
          </span>

          <div className="font-serif text-[36px] font-medium my-[8px] text-ink">
            {loading ? '—' : agreements.length}
          </div>

          <span className="font-mono text-[11.5px] text-text-faint">
            Your uploaded agreements
          </span>
        </div>

        <div className="bg-white p-[22px]">
          <span className="font-mono text-[10.5px] tracking-[0.1em] text-text-muted uppercase block font-semibold">
            Flagged risks
          </span>

          <div className="font-serif text-[36px] font-medium my-[8px] text-ink">
            {loading ? '—' : recentRisks.length}
          </div>

          <span className="font-mono text-[11.5px] text-text-faint">
            From analyzed agreements
          </span>
        </div>

        <div className="bg-white p-[22px]">
          <span className="font-mono text-[10.5px] tracking-[0.1em] text-text-muted uppercase block font-semibold">
            Upcoming deadlines
          </span>

          <div className="font-serif text-[36px] font-medium my-[8px] text-ink">
            {loading ? '—' : upcomingReminders.length}
          </div>

          <span className="font-mono text-[11.5px] text-text-faint">
            Rent and agreement reminders
          </span>
        </div>

        <div className="bg-white p-[22px]">
          <span className="font-mono text-[10.5px] tracking-[0.1em] text-text-muted uppercase block font-semibold">
            Chat questions
          </span>

          <div className="font-serif text-[36px] font-medium my-[8px] text-ink">
            {loading ? '—' : chatQuestions}
          </div>

          <span className="font-mono text-[11.5px] text-text-faint">
            Questions asked to AI
          </span>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-[26px] mb-[26px] items-start">

        {/* Recent Agreements */}
        <div className="bg-white border border-border rounded-[8px]">

          <div className="p-[20px] px-[24px] border-b border-border flex items-center justify-between">

            <h3 className="font-serif font-medium text-[17px] text-ink m-0">
              Recent agreements
            </h3>

            <Link
              to="/agreements"
              className="font-semibold text-[12.5px] text-ink underline underline-offset-4 hover:text-gold-deep transition-colors"
            >
              View all
            </Link>

          </div>

          {recentAgreements.length === 0 ? (

            <div className="p-[24px] text-[13px] text-text-muted">
              No agreements available yet.
            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full text-left border-collapse">

                <thead>
                  <tr>

                    <th className="font-mono text-[10.5px] tracking-[0.1em] uppercase text-text-muted font-bold p-[14px] px-[24px] border-b border-border bg-paper">
                      Title
                    </th>

                    <th className="font-mono text-[10.5px] tracking-[0.1em] uppercase text-text-muted font-bold p-[14px] px-[24px] border-b border-border bg-paper">
                      Uploaded
                    </th>

                    <th className="font-mono text-[10.5px] tracking-[0.1em] uppercase text-text-muted font-bold p-[14px] px-[24px] border-b border-border bg-paper">
                      Status
                    </th>

                    <th className="font-mono text-[10.5px] tracking-[0.1em] uppercase text-text-muted font-bold p-[14px] px-[24px] border-b border-border bg-paper">
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {recentAgreements.map((agreement) => {

                    const hasRisk = risks.some(
                      (risk) =>
                        risk.agreement?._id ===
                        agreement._id
                    );

                    return (
                      <tr
                        key={agreement._id}
                        className="hover:bg-paper-card transition-colors"
                      >

                        <td className="p-[14px] px-[24px] text-[13.5px] border-b border-border text-ink">
                          {getPropertyTitle(agreement)}
                        </td>

                        <td className="p-[14px] px-[24px] text-[13.5px] border-b border-border text-text-muted">
                          {formatDate(
                            agreement.uploadedAt ||
                            agreement.createdAt
                          )}
                        </td>

                        <td className="p-[14px] px-[24px] text-[13.5px] border-b border-border">

                          <span
                            className={`font-mono text-[10px] font-bold tracking-[0.05em] px-[10px] py-[4px] rounded-[20px] uppercase inline-block ${hasRisk
                                ? 'bg-risk-amber-bg text-risk-amber'
                                : 'bg-risk-green-bg text-risk-green'
                              }`}
                          >
                            {hasRisk
                              ? 'Risk Found'
                              : 'Active'}
                          </span>

                        </td>

                        <td className="p-[14px] px-[24px] text-[13.5px] border-b border-border">

                          <Link
                            to={`/analysis/${agreement._id}`}
                            className="font-semibold text-[13px] text-ink underline underline-offset-4 hover:text-gold-deep transition-colors"
                          >
                            Open
                          </Link>

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>

          )}

        </div>

        {/* Risk Alerts */}
        <div className="bg-white border border-border rounded-[8px]">

          <div className="p-[20px] px-[24px] border-b border-border">
            <h3 className="font-serif font-medium text-[17px] text-ink m-0">
              Risk alerts
            </h3>
          </div>

          {recentRisks.length === 0 ? (

            <div className="p-[24px] text-[13px] text-text-muted">
              No analyzed risks found.
            </div>

          ) : (

            <div>

              {recentRisks.map((risk, index) => {

                const agreementTitle =
                  getPropertyTitle(
                    risk.agreement
                  );

                return (
                  <div
                    key={
                      risk.analysisId ||
                      risk._id ||
                      index
                    }
                    className="flex gap-[16px] p-[18px] px-[24px] border-b border-border last:border-b-0 items-start"
                  >

                    <span className="w-[28px] h-[28px] rounded-[4px] bg-[#C24343]/10 text-[#C24343] flex items-center justify-center flex-none text-[15px] font-serif font-bold">
                      !
                    </span>

                    <div>

                      <b className="text-[14px] font-semibold text-ink block mb-[4px]">
                        {getRiskTitle(risk.risks)}
                      </b>

                      <p className="text-[13px] text-text-muted m-0 leading-relaxed">
                        {agreementTitle}
                      </p>

                      <Link
                        to={`/analysis/${risk.agreement?._id}`}
                        className="inline-block mt-[7px] font-semibold text-[12px] text-ink underline underline-offset-4 hover:text-gold-deep"
                      >
                        Review analysis
                      </Link>

                    </div>

                  </div>
                );
              })}

            </div>

          )}

        </div>

      </div>

      {/* Reminders */}
      <div className="bg-white border border-border rounded-[8px]">

        <div className="p-[20px] px-[24px] border-b border-border">
          <h3 className="font-serif font-medium text-[17px] text-ink m-0">
            Upcoming reminders
          </h3>
        </div>

        {upcomingReminders.length === 0 ? (

          <div className="p-[24px] text-[13px] text-text-muted">
            No upcoming rent reminders.
          </div>

        ) : (

          <div>

            {upcomingReminders.map((reminder) => {

              const propertyTitle =
                reminder.property?.title ||
                reminder.rental?.property?.title ||
                'Rental Property';

              return (
                <div
                  key={reminder._id}
                  className="flex justify-between items-center p-[16px] px-[24px] border-b border-border last:border-b-0"
                >

                  <div className="text-[14px] font-medium text-ink">

                    {reminder.status === 'overdue'
                      ? 'Rent overdue'
                      : 'Rent due'}{' '}

                    — {propertyTitle}

                  </div>

                  <span
                    className={`font-mono text-[11.5px] font-medium px-[10px] py-[5px] rounded-[4px] whitespace-nowrap ${reminder.status === 'overdue'
                        ? 'bg-[#C24343]/10 text-[#C24343]'
                        : 'bg-paper border border-border text-text-muted'
                      }`}
                  >
                    {getReminderText(reminder)}
                  </span>

                </div>
              );
            })}

          </div>

        )}

      </div>

      {/* Active Rental Summary */}
      {activeRentals.length > 0 && (
        <div className="bg-white border border-border rounded-[8px]">

          <div className="p-[20px] px-[24px] border-b border-border flex items-center justify-between">

            <h3 className="font-serif font-medium text-[17px] text-ink m-0">
              Current rental
            </h3>

            <Link
              to="/rentals"
              className="font-semibold text-[12.5px] text-ink underline underline-offset-4 hover:text-gold-deep transition-colors"
            >
              View rentals
            </Link>

          </div>

          {activeRentals.slice(0, 1).map((rental) => (

            <div
              key={rental._id}
              className="p-[20px] px-[24px] grid grid-cols-1 md:grid-cols-3 gap-[18px]"
            >

              <div>
                <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-text-muted block font-semibold">
                  Property
                </span>

                <p className="text-[14px] font-medium text-ink mt-[6px]">
                  {rental.property?.title ||
                    'Rental Property'}
                </p>
              </div>

              <div>
                <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-text-muted block font-semibold">
                  Monthly rent
                </span>

                <p className="text-[14px] font-medium text-ink mt-[6px]">
                  ₹{Number(
                    rental.monthlyRent || 0
                  ).toLocaleString('en-IN')}
                </p>
              </div>

              <div>
                <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-text-muted block font-semibold">
                  Rental status
                </span>

                <p className="text-[14px] font-medium text-risk-green mt-[6px] capitalize">
                  {rental.status}
                </p>
              </div>

            </div>

          ))}

        </div>
      )}

    </div>
  );
};

export default Dashboard;