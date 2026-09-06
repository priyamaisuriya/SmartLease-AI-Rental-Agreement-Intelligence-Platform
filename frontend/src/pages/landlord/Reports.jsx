import React, { useEffect, useMemo, useState } from 'react';
import {
  Download,
  FileText,
  TrendingUp,
  Building,
  Users,
  X,
} from 'lucide-react';

import api from '../../services/api';

const ReportCard = ({
  title,
  desc,
  icon: Icon,
  date,
  onDownload,
  disabled,
}) => (
  <div className="bg-white rounded-xl shadow-sm border border-border p-6 flex flex-col hover:shadow-md transition-shadow">
    <div className="w-12 h-12 rounded-full bg-lease-50 text-lease-600 flex items-center justify-center mb-4">
      <Icon className="w-6 h-6" />
    </div>

    <h3 className="font-semibold text-lg text-ink">
      {title}
    </h3>

    <p className="text-sm text-text-muted mt-1 flex-1">
      {desc}
    </p>

    <div className="mt-4 pt-4 border-t border-border flex items-center justify-between gap-3">
      <span className="text-xs text-text-faint">
        Generated: {date}
      </span>

      <button
        type="button"
        onClick={onDownload}
        disabled={disabled}
        className="flex items-center gap-1 text-sm font-medium text-lease-600 hover:text-lease-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Download className="w-4 h-4" />

        Download
      </button>
    </div>
  </div>
);

const Reports = () => {
  const [properties, setProperties] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [agreements, setAgreements] = useState([]);
  const [reminders, setReminders] = useState([]);

  const [aiAnalyses, setAiAnalyses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [downloadLoading, setDownloadLoading] =
    useState(false);

  const generatedDate =
    new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  const fetchReportsData = async () => {
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
        propertiesResponse.data?.properties ||
        propertiesResponse.data ||
        [];

      const rentalData =
        rentalsResponse.data?.rentals ||
        rentalsResponse.data ||
        [];

      const agreementData =
        agreementsResponse.data?.agreements ||
        agreementsResponse.data ||
        [];

      const reminderData =
        remindersResponse.data?.reminders ||
        remindersResponse.data ||
        [];

      const safeProperties = Array.isArray(propertyData)
        ? propertyData
        : [];

      const safeRentals = Array.isArray(rentalData)
        ? rentalData
        : [];

      const safeAgreements = Array.isArray(
        agreementData
      )
        ? agreementData
        : [];

      const safeReminders = Array.isArray(
        reminderData
      )
        ? reminderData
        : [];

      setProperties(safeProperties);
      setRentals(safeRentals);
      setAgreements(safeAgreements);
      setReminders(safeReminders);

      /*
       * Fetch existing AI analysis history.
       *
       * GET requests do NOT generate new Gemini requests.
       */
      if (safeAgreements.length > 0) {
        const historyResponses =
          await Promise.all(
            safeAgreements.map((agreement) =>
              api
                .get(
                  `/ai/agreements/${agreement._id}/history`
                )
                .then((response) => ({
                  agreement,
                  history:
                    response.data?.analyses ||
                    [],
                }))
                .catch(() => ({
                  agreement,
                  history: [],
                }))
            )
          );

        const analyses = [];

        historyResponses.forEach(
          ({ agreement, history }) => {
            if (!Array.isArray(history)) {
              return;
            }

            history.forEach((analysis) => {
              analyses.push({
                ...analysis,
                agreement,
              });
            });
          }
        );

        setAiAnalyses(analyses);
      } else {
        setAiAnalyses([]);
      }
    } catch (err) {
      console.error(
        'Failed to load landlord reports:',
        err.response?.status,
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
        'Failed to load report data.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, []);

  const reportStats = useMemo(() => {
    const totalProperties =
      properties.length;

    const rentedProperties =
      properties.filter(
        (property) =>
          property.status === 'rented'
      ).length;

    const availableProperties =
      properties.filter(
        (property) =>
          property.status === 'available'
      ).length;

    const inactiveProperties =
      properties.filter(
        (property) =>
          property.status === 'inactive'
      ).length;

    const activeRentals =
      rentals.filter(
        (rental) =>
          rental.status === 'active'
      );

    const completedRentals =
      rentals.filter(
        (rental) =>
          rental.status === 'completed'
      );

    const totalMonthlyRent =
      activeRentals.reduce(
        (total, rental) =>
          total +
          Number(rental.monthlyRent || 0),
        0
      );

    const totalSecurityDeposits =
      activeRentals.reduce(
        (total, rental) =>
          total +
          Number(
            rental.securityDeposit || 0
          ),
        0
      );

    const uniqueTenants = new Set();

    rentals.forEach((rental) => {
      const tenantId =
        rental.tenant?._id ||
        rental.tenant;

      if (tenantId) {
        uniqueTenants.add(
          String(tenantId)
        );
      }
    });

    const activeReminders =
      reminders.filter((reminder) => {
        const status =
          String(
            reminder.status || ''
          ).toLowerCase();

        return (
          status !== 'completed' &&
          status !== 'paid' &&
          status !== 'cancelled'
        );
      }).length;

    const riskAnalyses =
      aiAnalyses.filter(
        (analysis) =>
          analysis.type === 'risk'
      );

    return {
      totalProperties,
      rentedProperties,
      availableProperties,
      inactiveProperties,
      activeRentals: activeRentals.length,
      completedRentals:
        completedRentals.length,
      totalMonthlyRent,
      totalSecurityDeposits,
      uniqueTenants:
        uniqueTenants.size,
      totalAgreements:
        agreements.length,
      activeReminders,
      riskAnalyses:
        riskAnalyses.length,
    };
  }, [
    properties,
    rentals,
    agreements,
    reminders,
    aiAnalyses,
  ]);

  const downloadFile = (
    filename,
    content
  ) => {
    const blob = new Blob(
      [content],
      {
        type: 'text/plain;charset=utf-8',
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement('a');

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const downloadFinancialReport = () => {
    setDownloadLoading(true);

    try {
      const lines = [
        'SMARTLEASE - FINANCIAL SUMMARY',
        '================================',
        '',
        `Generated: ${generatedDate}`,
        '',
        'PROPERTY PORTFOLIO',
        '------------------',
        `Total Properties: ${reportStats.totalProperties}`,
        `Rented Properties: ${reportStats.rentedProperties}`,
        `Available Properties: ${reportStats.availableProperties}`,
        `Inactive Properties: ${reportStats.inactiveProperties}`,
        '',
        'RENTAL FINANCIALS',
        '-----------------',
        `Active Rentals: ${reportStats.activeRentals}`,
        `Monthly Rental Income: ₹${reportStats.totalMonthlyRent.toLocaleString('en-IN')}`,
        `Security Deposits: ₹${reportStats.totalSecurityDeposits.toLocaleString('en-IN')}`,
        '',
        'AGREEMENTS',
        '----------',
        `Total Agreements: ${reportStats.totalAgreements}`,
        '',
        'REMINDERS',
        '---------',
        `Pending/Active Reminders: ${reportStats.activeReminders}`,
      ];

      downloadFile(
        'SmartLease_Financial_Summary.txt',
        lines.join('\n')
      );
    } finally {
      setDownloadLoading(false);
    }
  };

  const downloadOccupancyReport = () => {
    setDownloadLoading(true);

    try {
      const occupancy =
        reportStats.totalProperties > 0
          ? (
            (reportStats.rentedProperties /
              reportStats.totalProperties) *
            100
          ).toFixed(1)
          : '0.0';

      const lines = [
        'SMARTLEASE - PROPERTY OCCUPANCY REPORT',
        '=======================================',
        '',
        `Generated: ${generatedDate}`,
        '',
        `Total Properties: ${reportStats.totalProperties}`,
        `Rented: ${reportStats.rentedProperties}`,
        `Available: ${reportStats.availableProperties}`,
        `Inactive: ${reportStats.inactiveProperties}`,
        `Occupancy Rate: ${occupancy}%`,
        '',
        'PROPERTY DETAILS',
        '----------------',
      ];

      properties.forEach(
        (property, index) => {
          lines.push(
            `${index + 1}. ${property.title || 'Untitled Property'}`
          );

          lines.push(
            `   Location: ${[
              property.city,
              property.state,
            ]
              .filter(Boolean)
              .join(', ') ||
            'Not specified'
            }`
          );

          lines.push(
            `   Status: ${property.status || 'Unknown'
            }`
          );

          lines.push(
            `   Monthly Rent: ₹${Number(
              property.monthlyRent || 0
            ).toLocaleString('en-IN')}`
          );

          lines.push('');
        }
      );

      downloadFile(
        'SmartLease_Property_Occupancy_Report.txt',
        lines.join('\n')
      );
    } finally {
      setDownloadLoading(false);
    }
  };

  const downloadTenantRoster = () => {
    setDownloadLoading(true);

    try {
      const tenantMap =
        new Map();

      rentals.forEach((rental) => {
        const tenant =
          rental.tenant;

        if (!tenant) {
          return;
        }

        const tenantId =
          tenant._id ||
          tenant;

        const tenantName =
          tenant.name ||
          rental.tenantName ||
          'Tenant';

        const tenantEmail =
          tenant.email ||
          '';

        const tenantPhone =
          tenant.phone ||
          '';

        const propertyName =
          rental.property?.title ||
          rental.propertyName ||
          'Property';

        tenantMap.set(
          String(tenantId),
          {
            name: tenantName,
            email: tenantEmail,
            phone: tenantPhone,
            property:
              propertyName,
            status:
              rental.status || '',
            monthlyRent:
              rental.monthlyRent || 0,
          }
        );
      });

      const lines = [
        'SMARTLEASE - TENANT ROSTER',
        '==========================',
        '',
        `Generated: ${generatedDate}`,
        '',
        `Total Unique Tenants: ${tenantMap.size}`,
        '',
      ];

      Array.from(
        tenantMap.values()
      ).forEach(
        (tenant, index) => {
          lines.push(
            `${index + 1}. ${tenant.name}`
          );

          lines.push(
            `   Email: ${tenant.email || 'Not available'
            }`
          );

          lines.push(
            `   Phone: ${tenant.phone || 'Not available'
            }`
          );

          lines.push(
            `   Property: ${tenant.property}`
          );

          lines.push(
            `   Status: ${tenant.status || 'Unknown'
            }`
          );

          lines.push(
            `   Monthly Rent: ₹${Number(
              tenant.monthlyRent || 0
            ).toLocaleString('en-IN')}`
          );

          lines.push('');
        }
      );

      downloadFile(
        'SmartLease_Tenant_Roster.txt',
        lines.join('\n')
      );
    } finally {
      setDownloadLoading(false);
    }
  };

  const downloadRiskReport = () => {
    setDownloadLoading(true);

    try {
      const riskAnalyses =
        aiAnalyses.filter(
          (analysis) =>
            analysis.type === 'risk'
        );

      const lines = [
        'SMARTLEASE - AGREEMENT RISK ANALYSIS',
        '====================================',
        '',
        `Generated: ${generatedDate}`,
        '',
        `Total Agreements: ${agreements.length}`,
        `Analyzed Risk Reports: ${riskAnalyses.length}`,
        '',
      ];

      if (riskAnalyses.length === 0) {
        lines.push(
          'No stored AI risk analysis reports are available.'
        );
      } else {
        riskAnalyses.forEach(
          (analysis, index) => {
            const agreement =
              analysis.agreement;

            lines.push(
              `${index + 1}. ${agreement?.title ||
              agreement?.originalFileName ||
              'Agreement'
              }`
            );

            lines.push(
              `   Type: Risk Analysis`
            );

            lines.push(
              `   Generated: ${analysis.createdAt
                ? new Date(
                  analysis.createdAt
                ).toLocaleDateString(
                  'en-IN'
                )
                : 'Unknown'
              }`
            );

            lines.push(
              `   Result: ${analysis.result ||
              analysis.risks ||
              'No result available'
              }`
            );

            lines.push('');
          }
        );
      }

      downloadFile(
        'SmartLease_Agreement_Risk_Analysis.txt',
        lines.join('\n')
      );
    } finally {
      setDownloadLoading(false);
    }
  };

  return (
    <div className="space-y-6 fade-in pb-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">
            Rental Reports
          </h1>

          <p className="text-text-muted mt-1">
            Export data on property occupancy, rental income, and agreements.
          </p>
        </div>
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

      {/* Loading */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-border p-12 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-ink mx-auto mb-4"></div>

          <p className="text-text-muted">
            Loading reports...
          </p>
        </div>
      ) : (
        <>
          {/* Report Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            <ReportCard
              title="Financial Summary"
              desc={`Active rentals generate ₹${reportStats.totalMonthlyRent.toLocaleString('en-IN')} in monthly rent across ${reportStats.activeRentals} active rental(s).`}
              icon={TrendingUp}
              date={generatedDate}
              onDownload={
                downloadFinancialReport
              }
              disabled={downloadLoading}
            />

            <ReportCard
              title="Property Occupancy Report"
              desc={`${reportStats.rentedProperties} of ${reportStats.totalProperties} properties are currently rented, with ${reportStats.availableProperties} available listings.`}
              icon={Building}
              date={generatedDate}
              onDownload={
                downloadOccupancyReport
              }
              disabled={downloadLoading}
            />

            <ReportCard
              title="Tenant Roster"
              desc={`Current rental records contain ${reportStats.uniqueTenants} unique tenant(s) associated with your properties.`}
              icon={Users}
              date={generatedDate}
              onDownload={
                downloadTenantRoster
              }
              disabled={downloadLoading}
            />

            <ReportCard
              title="Agreement Risk Analysis"
              desc={`${reportStats.riskAnalyses} stored AI risk analysis report(s) are available across ${reportStats.totalAgreements} agreement(s).`}
              icon={FileText}
              date={generatedDate}
              onDownload={
                downloadRiskReport
              }
              disabled={downloadLoading}
            />
          </div>

          {/* Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-border p-6">

            <h2 className="text-lg font-semibold text-ink mb-4">
              Portfolio Summary
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

              <div className="bg-paper rounded-lg p-4">
                <p className="text-xs text-text-faint">
                  Properties
                </p>

                <p className="text-xl font-bold text-ink mt-1">
                  {reportStats.totalProperties}
                </p>
              </div>

              <div className="bg-paper rounded-lg p-4">
                <p className="text-xs text-text-faint">
                  Active Rentals
                </p>

                <p className="text-xl font-bold text-ink mt-1">
                  {reportStats.activeRentals}
                </p>
              </div>

              <div className="bg-paper rounded-lg p-4">
                <p className="text-xs text-text-faint">
                  Monthly Rent
                </p>

                <p className="text-xl font-bold text-lease-600 mt-1">
                  ₹{reportStats.totalMonthlyRent.toLocaleString(
                    'en-IN'
                  )}
                </p>
              </div>

              <div className="bg-paper rounded-lg p-4">
                <p className="text-xs text-text-faint">
                  Agreements
                </p>

                <p className="text-xl font-bold text-ink mt-1">
                  {reportStats.totalAgreements}
                </p>
              </div>

            </div>
          </div>
        </>
      )}

      {/* Download Loading */}
      {downloadLoading && (
        <div className="fixed bottom-5 right-5 z-50 bg-ink text-white px-4 py-3 rounded-lg shadow-lg text-sm">
          Preparing report...
        </div>
      )}
    </div>
  );
};

export default Reports;