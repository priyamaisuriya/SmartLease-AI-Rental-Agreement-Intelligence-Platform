import React, { useEffect, useState } from 'react';
import { FileText, Download, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Reports = () => {
  const navigate = useNavigate();

  const [rentals, setRentals] = useState([]);
  const [agreements, setAgreements] = useState([]);
  const [reports, setReports] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const riskBadge = (level) => {
    if (!level) return null;

    const normalized = String(level).toLowerCase();

    const map = {
      low: 'bg-good-50 text-good-600 border-good-500/20',
      medium: 'bg-warn-50 text-warn-600 border-warn-500/20',
      high: 'bg-bad-50 text-bad-600 border-bad-500/20',
    };

    const labelMap = {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
    };

    return (
      <span
        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${map[normalized] ||
          'bg-paper text-text-muted border-border'
          }`}
      >
        {labelMap[normalized] || level} Risk
      </span>
    );
  };

  const formatDate = (date) => {
    if (!date) return 'Not specified';

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return 'Not specified';
    }

    return parsedDate.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getAgreementTitle = (agreement) => {
    return (
      agreement?.title ||
      agreement?.originalFileName ||
      'Rental Agreement'
    );
  };

  const getPropertyTitle = (agreement) => {
    return (
      agreement?.property?.title ||
      'Rental Property'
    );
  };

  const getRentalPropertyTitle = (rental) => {
    return (
      rental?.property?.title ||
      rental?.property?.name ||
      'Rental Property'
    );
  };

  const extractRiskLevel = (riskText) => {
    if (!riskText) return null;

    const text = String(riskText).toLowerCase();

    if (
      text.includes('high risk') ||
      text.includes('severity: high')
    ) {
      return 'High';
    }

    if (
      text.includes('medium risk') ||
      text.includes('severity: medium')
    ) {
      return 'Medium';
    }

    if (
      text.includes('low risk') ||
      text.includes('severity: low')
    ) {
      return 'Low';
    }

    return null;
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError('');

      const [
        rentalsResponse,
        agreementsResponse,
      ] = await Promise.all([
        api.get('/rentals/my-rentals'),
        api.get('/agreements/my-agreements'),
      ]);

      const rentalData =
        rentalsResponse.data?.rentals ||
        rentalsResponse.data?.data ||
        [];

      const agreementData =
        agreementsResponse.data?.agreements ||
        agreementsResponse.data?.data ||
        [];

      const safeRentals = Array.isArray(rentalData)
        ? rentalData
        : [];

      const safeAgreements = Array.isArray(agreementData)
        ? agreementData
        : [];

      setRentals(safeRentals);
      setAgreements(safeAgreements);

      /*
       * Get existing AI analysis history for each agreement.
       *
       * This only reads MongoDB.
       * It does NOT call Gemini.
       */
      const historyResults = await Promise.all(
        safeAgreements.map(async (agreement) => {
          try {
            const response = await api.get(
              `/ai/agreements/${agreement._id}/history`
            );

            const analyses =
              response.data?.analyses || [];

            return {
              agreement,
              analyses: Array.isArray(analyses)
                ? analyses
                : [],
            };
          } catch (err) {
            console.error(
              `Failed to load analysis history for ${agreement._id}:`,
              err
            );

            return {
              agreement,
              analyses: [],
            };
          }
        })
      );

      const generatedReports = [];

      historyResults.forEach(
        ({ agreement, analyses }) => {
          analyses.forEach((analysis) => {
            const type = analysis.type;

            let reportName = 'AI Analysis Report';

            if (type === 'summary') {
              reportName = 'Agreement Summary Report';
            } else if (type === 'risk') {
              reportName = 'Agreement Risk Analysis Report';
            } else if (type === 'clause_explanation') {
              reportName = 'Clause Explanation Report';
            } else if (type === 'question') {
              reportName = 'Agreement Q&A Report';
            }

            generatedReports.push({
              id: analysis._id,
              agreementId: agreement._id,
              name: reportName,
              agreement: getAgreementTitle(agreement),
              property: getPropertyTitle(agreement),
              type,
              result:
                analysis.result ||
                analysis.input ||
                '',
              input: analysis.input || '',
              riskLevel:
                type === 'risk'
                  ? extractRiskLevel(analysis.result)
                  : null,
              date:
                analysis.createdAt ||
                analysis.updatedAt,
              generatedBy:
                analysis.user?.name ||
                analysis.generatedBy?.name ||
                'SmartLease AI',
            });
          });
        }
      );

      generatedReports.sort(
        (a, b) =>
          new Date(b.date || 0).getTime() -
          new Date(a.date || 0).getTime()
      );

      setReports(generatedReports);
    } catch (err) {
      console.error(
        'Failed to load reports:',
        err
      );

      setError(
        err.response?.data?.message ||
        'Failed to load reports.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const downloadReport = (report) => {
    const content = [
      'SMARTLEASE AI REPORT',
      '====================',
      '',
      `Report: ${report.name}`,
      `Agreement: ${report.agreement}`,
      `Property: ${report.property}`,
      `Type: ${report.type}`,
      `Generated: ${formatDate(report.date)}`,
      `Generated By: ${report.generatedBy}`,
      '',
      'REPORT CONTENT',
      '--------------',
      '',
      report.result || 'No report content available.',
      '',
      '====================',
      'SmartLease - AI Rental Agreement Intelligence Platform',
      '',
      'This report is generated from SmartLease agreement analysis.',
      'AI analysis is informational and should not be considered legal advice.',
    ].join('\n');

    const blob = new Blob([content], {
      type: 'text/plain;charset=utf-8',
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');

    link.href = url;
    link.download = `${report.name
      .replace(/[^a-z0-9]+/gi, '_')
      .toLowerCase()}.txt`;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const activeRentals = rentals.filter(
    (rental) => rental.status === 'active'
  );

  const pastRentals = rentals.filter(
    (rental) =>
      rental.status === 'completed' ||
      rental.status === 'cancelled'
  );

  const summaryReports = reports.filter(
    (report) => report.type === 'summary'
  );

  const riskReports = reports.filter(
    (report) => report.type === 'risk'
  );

  return (
    <div className="fade-in">

      {/* Header */}
      <h1 className="font-display text-2xl font-semibold text-ink">
        Reports
      </h1>

      <p className="mt-1 text-sm text-text-muted">
        Download and review your rental and agreement history.
      </p>

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-lg border border-bad-500/20 bg-bad-50 px-4 py-3 text-sm text-bad-600">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="mt-6 rounded-xl2 border border-border bg-white p-10 text-center">
          <p className="text-sm text-text-muted">
            Loading reports...
          </p>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">

            <div className="rounded-xl2 border border-border bg-white p-6">
              <p className="font-display text-sm font-semibold text-ink">
                Rental history
              </p>

              <p className="mt-2 text-sm text-text-muted">
                {activeRentals.length} active rental
                {activeRentals.length !== 1 ? 's' : ''},{' '}
                {pastRentals.length} past rental
                {pastRentals.length !== 1 ? 's' : ''} recorded.
              </p>
            </div>

            <div className="rounded-xl2 border border-border bg-white p-6">
              <p className="font-display text-sm font-semibold text-ink">
                Agreement history
              </p>

              <p className="mt-2 text-sm text-text-muted">
                {agreements.length} agreement
                {agreements.length !== 1 ? 's' : ''} available
                for review.
              </p>
            </div>

            <div className="rounded-xl2 border border-border bg-white p-6">
              <p className="font-display text-sm font-semibold text-ink">
                Agreement analysis reports
              </p>

              <p className="mt-2 text-sm text-text-muted">
                {reports.length} AI report
                {reports.length !== 1 ? 's' : ''} generated
                across your agreements.
              </p>
            </div>

          </div>

          {/* Report statistics */}
          {reports.length > 0 && (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">

              <div className="rounded-xl2 border border-border bg-white p-5">
                <p className="text-xs font-medium text-text-faint">
                  Summary reports
                </p>

                <p className="mt-1 font-display text-2xl font-semibold text-ink">
                  {summaryReports.length}
                </p>
              </div>

              <div className="rounded-xl2 border border-border bg-white p-5">
                <p className="text-xs font-medium text-text-faint">
                  Risk reports
                </p>

                <p className="mt-1 font-display text-2xl font-semibold text-ink">
                  {riskReports.length}
                </p>
              </div>

            </div>
          )}

          {/* Reports */}
          <div className="mt-8">
            <p className="font-display text-base font-semibold text-ink">
              Agreement analysis reports
            </p>

            {reports.length > 0 ? (
              <div className="mt-4 space-y-3">

                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl2 border border-border bg-white p-4"
                  >

                    <div className="flex min-w-0 items-center gap-3">

                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-lease-50 text-lease-600">
                        <FileText size={18} />
                      </span>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">
                          {report.name}
                        </p>

                        <p className="mt-0.5 text-xs text-text-faint">
                          {report.agreement} ·{' '}
                          {report.property}
                        </p>

                        <p className="mt-0.5 text-xs text-text-faint">
                          Generated {formatDate(report.date)}
                        </p>
                      </div>

                    </div>

                    <div className="flex shrink-0 items-center gap-2">

                      {riskBadge(report.riskLevel)}

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/analysis/${report.agreementId}`
                          )
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-ink hover:bg-paper"
                      >
                        <ExternalLink size={14} />
                        View
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          downloadReport(report)
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-ink hover:bg-paper"
                      >
                        <Download size={14} />
                        Download
                      </button>

                    </div>

                  </div>
                ))}

              </div>
            ) : (
              <div className="mt-4 flex flex-col items-center justify-center rounded-xl2 border border-dashed border-border bg-white/60 px-6 py-14 text-center">

                <span className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-lease-50 text-lease-600">
                  <FileText size={20} />
                </span>

                <p className="font-display text-base font-semibold text-ink">
                  No analysis reports yet
                </p>

                <p className="mt-1.5 max-w-sm text-sm text-text-faint">
                  Generate an agreement summary or risk analysis
                  from the Analysis page and it will appear here.
                </p>

              </div>
            )}
          </div>

          {/* Rental history */}
          <div className="mt-8">
            <p className="font-display text-base font-semibold text-ink">
              Rental history
            </p>

            {rentals.length > 0 ? (
              <div className="mt-4 space-y-3">

                {rentals.map((rental) => (
                  <div
                    key={rental._id}
                    className="rounded-xl2 border border-border bg-white p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">

                      <div>
                        <p className="text-sm font-medium text-ink">
                          {getRentalPropertyTitle(rental)}
                        </p>

                        <p className="mt-1 text-xs text-text-faint">
                          {rental.startDate
                            ? `From ${formatDate(
                              rental.startDate
                            )}`
                            : 'Start date not specified'}
                          {' · '}
                          {rental.endDate
                            ? `To ${formatDate(
                              rental.endDate
                            )}`
                            : 'End date not specified'}
                        </p>
                      </div>

                      <span className="rounded-full bg-lease-50 px-2.5 py-1 text-xs font-medium capitalize text-lease-700">
                        {rental.status || 'Unknown'}
                      </span>

                    </div>
                  </div>
                ))}

              </div>
            ) : (
              <p className="mt-3 text-sm text-text-faint">
                No rental history available.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;