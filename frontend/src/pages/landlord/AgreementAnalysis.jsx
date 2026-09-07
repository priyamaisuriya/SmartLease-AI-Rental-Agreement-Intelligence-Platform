import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BrainCircuit,
  AlertTriangle,
  ShieldCheck,
  HelpCircle,
  AlertCircle,
  FileText,
  Download,
  RefreshCw,
  MessageSquare,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import api from '../../services/api';

const RiskCard = ({ type, title, desc, action }) => {
  let styles = '';
  let Icon = AlertCircle;

  if (type === 'high') {
    styles = 'bg-bad-50 border-bad-500/20 text-bad-800';
    Icon = AlertTriangle;
  } else if (type === 'medium') {
    styles = 'bg-warn-50 border-warn-500/20 text-warn-800';
    Icon = AlertCircle;
  } else {
    styles = 'bg-good-50 border-good-500/20 text-good-800';
    Icon = ShieldCheck;
  }

  return (
    <div
      className={`p-4 border rounded-xl flex items-start gap-4 ${styles}`}
    >
      <Icon
        className={`w-6 h-6 flex-shrink-0 mt-0.5 ${type === 'high'
            ? 'text-bad-600'
            : type === 'medium'
              ? 'text-warn-600'
              : 'text-good-600'
          }`}
      />

      <div>
        <h4 className="font-semibold">{title}</h4>

        <p className="text-sm mt-1 opacity-90 whitespace-pre-line">
          {desc}
        </p>

        {action && (
          <p className="text-xs font-medium mt-3 uppercase tracking-wider opacity-80">
            Suggested Action: {action}
          </p>
        )}
      </div>
    </div>
  );
};

const AgreementAnalysis = () => {
  const { agreementId } = useParams();
  const navigate = useNavigate();

  const [agreement, setAgreement] = useState(null);
  const [summary, setSummary] = useState(null);
  const [risks, setRisks] = useState(null);

  // Rental selection
  const [rentals, setRentals] = useState([]);
  const [agreements, setAgreements] = useState([]);
  const [selectedRental, setSelectedRental] = useState('');
  const [rentalLoading, setRentalLoading] = useState(false);

  const [loading, setLoading] = useState(!!agreementId);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [riskLoading, setRiskLoading] = useState(false);

  const [error, setError] = useState('');
  const [summaryError, setSummaryError] = useState('');
  const [riskError, setRiskError] = useState('');

  const [clause, setClause] = useState('');
  const [clauseExplanation, setClauseExplanation] = useState('');
  const [clauseLoading, setClauseLoading] = useState(false);
  const [clauseError, setClauseError] = useState('');

  /*
   * ============================================================
   * HELPERS
   * ============================================================
   */

  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === '') {
      return '—';
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
      return '—';
    }

    return `₹${number.toLocaleString('en-IN')}`;
  };

  const formatDate = (value) => {
    if (!value) {
      return '—';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '—';
    }

    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  /*
   * ============================================================
   * FIND AGREEMENT FOR RENTAL
   * ============================================================
   *
   * Agreement.rental may be:
   *
   * 1. A plain ObjectId
   * 2. A populated rental object
   *
   * So we handle both cases.
   */

  const getAgreementForRental = (rentalId) => {
    if (!rentalId) {
      return null;
    }

    return agreements.find((a) => {
      const agreementRentalId =
        typeof a.rental === 'object'
          ? a.rental?._id
          : a.rental;

      return (
        String(agreementRentalId) ===
        String(rentalId)
      );
    });
  };

  /*
   * ============================================================
   * LOAD LANDLORD RENTALS FOR DROPDOWN
   * ============================================================
   *
   * Only runs when there is no agreementId.
   *
   * These are GET requests.
   * They do NOT call Gemini.
   */

  useEffect(() => {
    const loadRentalSelectionData = async () => {
      setRentalLoading(true);
      setError('');

      try {
        const [
          rentalsResponse,
          agreementsResponse,
        ] = await Promise.all([
          api.get('/rentals/my-properties'),
          api.get('/agreements/my-agreements'),
        ]);

        const rentalData =
          rentalsResponse.data?.rentals ||
          rentalsResponse.data ||
          [];

        const agreementData =
          agreementsResponse.data?.agreements ||
          agreementsResponse.data ||
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
      } catch (err) {
        console.error(
          'Failed to load landlord rentals:',
          err
        );

        setError(
          err.response?.data?.message ||
          'Failed to load rentals.'
        );
      } finally {
        setRentalLoading(false);
      }
    };

    if (!agreementId) {
      loadRentalSelectionData();
    }
  }, [agreementId]);

  /*
   * ============================================================
   * HANDLE RENTAL SELECTION
   * ============================================================
   */

  const handleRentalChange = (e) => {
    const rentalId = e.target.value;

    setSelectedRental(rentalId);

    if (!rentalId) {
      setError('');
      return;
    }

    const selectedAgreement =
      getAgreementForRental(rentalId);

    if (!selectedAgreement) {
      setError(
        'No agreement has been uploaded for this rental yet.'
      );
      return;
    }

    setError('');

    navigate(
      `/landlord/analysis/${selectedAgreement._id}`
    );
  };

  /*
   * ============================================================
   * LOAD AGREEMENT + PREVIOUS AI RESULTS
   * ============================================================
   *
   * GET requests do NOT call Gemini.
   *
   * If extractedText is empty, the backend returns 400 for
   * summary/latest and risks/latest. That is expected.
   * We treat that as "not analyzed yet" rather than a page error.
   */

  useEffect(() => {
    const loadAnalysisData = async () => {
      setLoading(true);
      setError('');
      setSummaryError('');
      setRiskError('');

      try {
        const agreementResponse = await api.get(
          `/agreements/${agreementId}`
        );

        const agreementData =
          agreementResponse.data?.agreement ||
          agreementResponse.data;

        setAgreement(agreementData);

        /*
         * Existing AI results.
         *
         * These requests may return 400 when extractedText is empty.
         * That should NOT break the page.
         */

        const [
          summaryResult,
          riskResult,
        ] = await Promise.allSettled([
          api.get(
            `/ai/agreements/${agreementId}/summary/latest`
          ),
          api.get(
            `/ai/agreements/${agreementId}/risks/latest`
          ),
        ]);

        if (summaryResult.status === 'fulfilled') {
          const data = summaryResult.value.data;

          setSummary(
            data?.summary
              ? data
              : null
          );
        } else {
          const status =
            summaryResult.reason?.response?.status;

          if (status !== 400) {
            console.error(
              'Failed to load latest summary:',
              summaryResult.reason
            );
          }
        }

        if (riskResult.status === 'fulfilled') {
          const data = riskResult.value.data;

          setRisks(
            data?.risks
              ? data
              : null
          );
        } else {
          const status =
            riskResult.reason?.response?.status;

          if (status !== 400) {
            console.error(
              'Failed to load latest risks:',
              riskResult.reason
            );
          }
        }
      } catch (err) {
        console.error(
          'Failed to load agreement analysis:',
          err
        );

        setError(
          err.response?.data?.message ||
          'Failed to load agreement analysis.'
        );
      } finally {
        setLoading(false);
      }
    };

    if (agreementId) {
      loadAnalysisData();
    }
  }, [agreementId]);

  /*
   * ============================================================
   * EXTRACTED TEXT STATUS
   * ============================================================
   */

  const hasExtractedText = Boolean(
    agreement?.extractedText &&
    agreement.extractedText.trim()
  );

  /*
   * ============================================================
   * GENERATE AI SUMMARY
   * ============================================================
   *
   * This is a POST request and DOES call Gemini.
   */

  const generateSummary = async () => {
    if (!hasExtractedText) {
      setSummaryError(
        'AI analysis is unavailable because no agreement text has been extracted from this file.'
      );
      return;
    }

    setSummaryLoading(true);
    setSummaryError('');

    try {
      const response = await api.post(
        `/ai/agreements/${agreementId}/summary`
      );

      const data = response.data;

      setSummary({
        agreementId,
        analysisId: data.analysisId,
        type: data.type || 'summary',
        summary: data.summary,
        generatedBy: data.generatedBy,
        createdAt: data.createdAt,
      });
    } catch (err) {
      console.error(
        'Failed to generate summary:',
        err
      );

      setSummaryError(
        err.response?.data?.message ||
        'Failed to generate AI summary.'
      );
    } finally {
      setSummaryLoading(false);
    }
  };

  /*
   * ============================================================
   * GENERATE AI RISKS
   * ============================================================
   */

  const detectRisks = async () => {
    if (!hasExtractedText) {
      setRiskError(
        'AI risk analysis is unavailable because no agreement text has been extracted from this file.'
      );
      return;
    }

    setRiskLoading(true);
    setRiskError('');

    try {
      const response = await api.post(
        `/ai/agreements/${agreementId}/risks`
      );

      const data = response.data;

      setRisks({
        agreementId,
        analysisId: data.analysisId,
        type: data.type || 'risk',
        risks: data.risks,
        generatedBy: data.generatedBy,
        createdAt: data.createdAt,
      });
    } catch (err) {
      console.error(
        'Failed to detect risks:',
        err
      );

      setRiskError(
        err.response?.data?.message ||
        'Failed to generate risk analysis.'
      );
    } finally {
      setRiskLoading(false);
    }
  };

  /*
   * ============================================================
   * EXPLAIN CLAUSE
   * ============================================================
   */

  const explainClause = async () => {
    if (!clause.trim()) {
      setClauseError(
        'Please enter a clause to explain.'
      );
      return;
    }

    if (!hasExtractedText) {
      setClauseError(
        'AI clause explanation is unavailable because no agreement text has been extracted from this file.'
      );
      return;
    }

    setClauseLoading(true);
    setClauseError('');
    setClauseExplanation('');

    try {
      const response = await api.post(
        `/ai/agreements/${agreementId}/explain-clause`,
        {
          clause: clause.trim(),
        }
      );

      setClauseExplanation(
        response.data.explanation ||
        response.data.result ||
        ''
      );
    } catch (err) {
      console.error(
        'Failed to explain clause:',
        err
      );

      setClauseError(
        err.response?.data?.message ||
        'Failed to explain the clause.'
      );
    } finally {
      setClauseLoading(false);
    }
  };

  /*
   * ============================================================
   * EXPORT REPORT
   * ============================================================
   */

  const exportReport = () => {
    window.print();
  };

  /*
   * ============================================================
   * AGREEMENT / RENTAL INFORMATION
   * ============================================================
   */

  const tenantName =
    agreement?.tenant?.name ||
    agreement?.tenant?.email ||
    '—';

  const propertyTitle =
    agreement?.property?.title ||
    agreement?.property?.name ||
    '—';

  const startDate = formatDate(
    agreement?.rental?.startDate
  );

  const endDate = formatDate(
    agreement?.rental?.endDate
  );

  const monthlyRent =
    agreement?.rental?.monthlyRent ??
    agreement?.monthlyRent ??
    agreement?.property?.monthlyRent;

  const securityDeposit =
    agreement?.rental?.securityDeposit ??
    agreement?.securityDeposit ??
    agreement?.property?.securityDeposit;

  /*
   * ============================================================
   * RISK LEVEL
   * ============================================================
   */

  const riskLevel = useMemo(() => {
    const text = risks?.risks || '';

    if (/HIGH/i.test(text)) {
      return 'high';
    }

    if (/MEDIUM/i.test(text)) {
      return 'medium';
    }

    if (/LOW/i.test(text)) {
      return 'low';
    }

    return null;
  }, [risks]);

  const riskScore = useMemo(() => {
    if (riskLevel === 'high') return 70;
    if (riskLevel === 'medium') return 35;
    if (riskLevel === 'low') return 10;

    return 0;
  }, [riskLevel]);

  const riskLabel = useMemo(() => {
    if (riskLevel === 'high') return 'High Risk';
    if (riskLevel === 'medium') return 'Medium Risk';
    if (riskLevel === 'low') return 'Low Risk';

    return 'Not Analyzed';
  }, [riskLevel]);

  const riskColor = useMemo(() => {
    if (riskLevel === 'high') return '#DC5A5A';
    if (riskLevel === 'medium') return '#E8A34F';
    if (riskLevel === 'low') return '#63A375';

    return '#94A3B8';
  }, [riskLevel]);

  const riskData = useMemo(() => {
    const score = riskScore;

    return [
      {
        name: 'Risk',
        value: score,
        fill: riskColor,
      },
      {
        name: 'Safe',
        value: Math.max(100 - score, 0),
        fill: '#F6F7FB',
      },
    ];
  }, [riskScore, riskColor]);

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center fade-in">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-paper border-t-ink"></div>

        <p className="mt-4 text-sm font-medium text-text-muted">
          Loading AI Analysis...
        </p>
      </div>
    );
  }

  /*
   * ============================================================
   * NO AGREEMENT ID
   * ============================================================
   *
   * Instead of "Go to My Agreements", landlord gets a rental
   * dropdown.
   */

  if (!agreementId) {
    return (
      <div className="fade-in max-w-6xl mx-auto space-y-6 pb-12">

        <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl2 border border-border bg-white mt-10 shadow-soft">

          <div className="grid h-16 w-16 place-items-center rounded-full bg-lease-50 text-lease-600 mb-5">
            <BrainCircuit className="w-8 h-8" />
          </div>

          <h2 className="font-display text-2xl font-semibold text-ink">
            Select a Rental to Analyze
          </h2>

          <p className="mt-3 max-w-md text-sm leading-relaxed text-text-muted">
            Select one of your rentals to open its linked
            rental agreement and use SmartLease AI analysis.
          </p>

          <div className="mt-8 w-full max-w-lg text-left">

            <label
              htmlFor="rental-select"
              className="block text-sm font-semibold text-ink mb-2"
            >
              Select Rental
            </label>

            {rentalLoading ? (
              <div className="flex items-center gap-2 px-4 py-3 border border-border rounded-lg bg-paper text-sm text-text-muted">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Loading your rentals...
              </div>
            ) : (
              <select
                id="rental-select"
                value={selectedRental}
                onChange={handleRentalChange}
                className="w-full px-4 py-3 bg-paper border border-border rounded-lg text-sm text-ink focus:outline-none focus:border-lease-500 focus:ring-1 focus:ring-lease-500"
              >
                <option value="">
                  Select a rental...
                </option>

                {rentals.map((rental) => {
                  const property =
                    rental.property || {};

                  const propertyTitle =
                    property.title ||
                    property.name ||
                    'Rental Property';

                  const agreement =
                    getAgreementForRental(
                      rental._id
                    );

                  return (
                    <option
                      key={rental._id}
                      value={rental._id}
                    >
                      {propertyTitle} — ₹
                      {Number(
                        rental.monthlyRent || 0
                      ).toLocaleString('en-IN')}
                      {!agreement
                        ? ' — No agreement'
                        : ''}
                    </option>
                  );
                })}
              </select>
            )}

            {error && (
              <div className="mt-4 bg-warn-50 border border-warn-500/20 rounded-lg p-4">
                <div className="flex items-start gap-3">

                  <AlertTriangle className="w-5 h-5 text-warn-600 flex-shrink-0 mt-0.5" />

                  <p className="text-sm text-warn-800">
                    {error}
                  </p>

                </div>
              </div>
            )}

            {!rentalLoading &&
              rentals.length === 0 &&
              !error && (
                <div className="mt-4 bg-paper border border-border rounded-lg p-4">

                  <p className="text-sm font-medium text-ink">
                    No rentals found
                  </p>

                  <p className="text-xs text-text-muted mt-1">
                    You do not currently have any rental
                    records associated with your properties.
                  </p>

                </div>
              )}

          </div>

        </div>

      </div>
    );
  }

  /*
   * ============================================================
   * ERROR
   * ============================================================
   */

  if (error || !agreement) {
    return (
      <div className="fade-in max-w-6xl mx-auto space-y-6 pb-12">

        <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl2 border border-border bg-white mt-10 shadow-soft">

          <div className="grid h-16 w-16 place-items-center rounded-full bg-bad-50 text-bad-600 mb-5">
            <AlertCircle className="w-8 h-8" />
          </div>

          <h2 className="font-display text-2xl font-semibold text-ink">
            Unable to load agreement
          </h2>

          <p className="mt-3 max-w-md text-sm leading-relaxed text-text-muted">
            {error ||
              'The requested agreement could not be found.'}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">

            <button
              type="button"
              onClick={() =>
                navigate('/landlord/analysis')
              }
              className="rounded-lg bg-paper border border-border px-6 py-2.5 text-sm font-semibold text-ink shadow-sm hover:bg-border/50 transition-colors"
            >
              Change Rental
            </button>

            <button
              type="button"
              onClick={() =>
                navigate('/landlord/agreements')
              }
              className="rounded-lg bg-lease-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-lease-700 transition-colors"
            >
              Back to Agreements
            </button>

          </div>

        </div>

      </div>
    );
  }

  /*
   * ============================================================
   * PAGE
   * ============================================================
   */

  return (
    <div className="space-y-6 fade-in pb-12 max-w-6xl mx-auto">

      {/* ========================================================
          HEADER
      ========================================================= */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div className="flex items-center gap-4">

          <button
            type="button"
            onClick={() =>
              navigate('/landlord/analysis')
            }
            className="p-2 text-text-muted hover:bg-white rounded-lg border border-transparent hover:border-border transition-all"
            title="Change Rental"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>

            <div className="flex items-center gap-2">

              <BrainCircuit className="w-6 h-6 text-lease-600" />

              <h1 className="text-2xl font-display font-bold text-ink">
                Agreement Intelligence
              </h1>

            </div>

            <p className="text-text-muted mt-1">
              AI-powered analysis for{' '}
              <span className="font-medium text-ink">
                {agreement.title}
              </span>
            </p>

          </div>

        </div>

        <div className="flex flex-wrap gap-2">

          <Link
            to={`/landlord/chat/${agreementId}`}
            className="flex items-center gap-2 px-4 py-2 bg-lease-600 text-white rounded-lg text-sm font-medium hover:bg-lease-700 transition-colors shadow-sm"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Ask AI</span>
          </Link>

          <button
            onClick={exportReport}
            className="flex items-center gap-2 px-4 py-2 bg-paper border border-border rounded-lg text-sm font-medium text-ink hover:bg-border/50 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>

        </div>

      </div>

      {/* ========================================================
          NO EXTRACTED TEXT WARNING
      ========================================================= */}

      {!hasExtractedText && (
        <div className="bg-warn-50 border border-warn-500/20 rounded-xl p-5">

          <div className="flex items-start gap-3">

            <AlertTriangle className="w-6 h-6 text-warn-600 flex-shrink-0 mt-0.5" />

            <div>

              <h3 className="font-semibold text-warn-800">
                Agreement text is not available for AI analysis
              </h3>

              <p className="text-sm text-warn-800/80 mt-1 leading-6">
                The agreement file was uploaded successfully, but
                SmartLease could not extract text from this document.
                AI summary, risk detection, and clause explanation
                require extracted agreement text.
              </p>

              <p className="text-xs text-warn-800/70 mt-2">
                File: {agreement.originalFileName || 'Agreement file'}
              </p>

            </div>

          </div>

        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ======================================================
            LEFT COLUMN
        ======================================================= */}

        <div className="lg:col-span-1 space-y-6">

          {/* Risk Score */}

          <div className="bg-white rounded-xl shadow-sm border border-border p-6 text-center">

            <h3 className="font-semibold text-ink mb-6">
              Overall Risk Score
            </h3>

            <div className="relative w-48 h-48 mx-auto">

              <ResponsiveContainer width="100%" height="100%">

                <PieChart>

                  <Pie
                    data={riskData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                    stroke="none"
                  >
                    {riskData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.fill}
                      />
                    ))}
                  </Pie>

                </PieChart>

              </ResponsiveContainer>

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">

                <span
                  className="text-4xl font-display font-bold"
                  style={{ color: riskColor }}
                >
                  {riskScore}
                </span>

                <span
                  className="text-sm font-medium uppercase tracking-wider"
                  style={{ color: riskColor }}
                >
                  {riskLabel}
                </span>

              </div>

            </div>

            {!risks && (
              <p className="text-xs text-text-muted mt-3">
                Generate risk analysis to calculate the score.
              </p>
            )}

            <button
              onClick={detectRisks}
              disabled={
                riskLoading ||
                !hasExtractedText
              }
              className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-2 bg-lease-600 text-white rounded-lg text-sm font-medium hover:bg-lease-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >

              {riskLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <BrainCircuit className="w-4 h-4" />
                  {risks
                    ? 'Re-analyze Risks'
                    : 'Detect Risks'}
                </>
              )}

            </button>

            {riskError && (
              <p className="text-xs text-bad-600 mt-3 text-left">
                {riskError}
              </p>
            )}

          </div>

          {/* Contract Summary */}

          <div className="bg-white rounded-xl shadow-sm border border-border p-6">

            <h3 className="font-semibold text-ink mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-lease-600" />
              Contract Summary
            </h3>

            <div className="space-y-4 text-sm">

              <div className="flex justify-between border-b border-border pb-2 gap-4">
                <span className="text-text-muted">
                  Tenant
                </span>

                <span className="font-medium text-ink text-right">
                  {tenantName}
                </span>
              </div>

              <div className="flex justify-between border-b border-border pb-2 gap-4">
                <span className="text-text-muted">
                  Property
                </span>

                <span className="font-medium text-ink text-right">
                  {propertyTitle}
                </span>
              </div>

              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-text-muted">
                  Start Date
                </span>

                <span className="font-medium text-ink">
                  {startDate}
                </span>
              </div>

              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-text-muted">
                  End Date
                </span>

                <span className="font-medium text-ink">
                  {endDate}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-text-muted">
                  Status
                </span>

                <span className="font-medium text-ink capitalize">
                  {agreement.status || '—'}
                </span>
              </div>

            </div>

          </div>

        </div>

        {/* ======================================================
            RIGHT COLUMN
        ======================================================= */}

        <div className="lg:col-span-2 space-y-6">

          {/* Financial Terms */}

          <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">

            <div className="p-4 bg-lease-50 border-b border-lease-100 flex items-center justify-between">

              <h3 className="font-semibold text-lease-900">
                Rental Financial Terms
              </h3>

              <span className="text-xs font-medium text-lease-600 bg-lease-100 px-2 py-1 rounded-full">
                Agreement Data
              </span>

            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">

              <div>
                <p className="text-sm text-text-muted">
                  Contractual Monthly Rent
                </p>

                <p className="text-xl font-bold text-ink mt-1">
                  {formatCurrency(monthlyRent)}
                </p>
              </div>

              <div>
                <p className="text-sm text-text-muted">
                  Security Deposit
                </p>

                <p className="text-xl font-bold text-ink mt-1">
                  {formatCurrency(securityDeposit)}
                </p>
              </div>

              <div>
                <p className="text-sm text-text-muted">
                  Agreement File
                </p>

                <p className="text-base font-semibold text-ink mt-1 break-all">
                  {agreement.originalFileName ||
                    agreement.title}
                </p>
              </div>

              <div>
                <p className="text-sm text-text-muted">
                  File Type
                </p>

                <p className="text-base font-semibold text-ink mt-1 uppercase">
                  {agreement.fileType || '—'}
                </p>
              </div>

            </div>

          </div>

          {/* AI Summary */}

          <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">

            <div className="p-4 bg-lease-50 border-b border-lease-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">

              <div className="flex items-center gap-2">

                <BrainCircuit className="w-5 h-5 text-lease-600" />

                <h3 className="font-semibold text-lease-900">
                  AI Contract Summary
                </h3>

              </div>

              <button
                onClick={generateSummary}
                disabled={
                  summaryLoading ||
                  !hasExtractedText
                }
                className="flex items-center justify-center gap-2 px-3 py-2 bg-lease-600 text-white rounded-lg text-xs font-medium hover:bg-lease-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >

                {summaryLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <BrainCircuit className="w-3.5 h-3.5" />
                    {summary
                      ? 'Regenerate Summary'
                      : 'Generate Summary'}
                  </>
                )}

              </button>

            </div>

            <div className="p-6">

              {summaryError && (
                <div className="bg-bad-50 border border-bad-500/20 rounded-lg p-4 mb-4">
                  <p className="text-sm text-bad-700">
                    {summaryError}
                  </p>
                </div>
              )}

              {summary?.summary ? (
                <div className="text-sm text-text-muted leading-7 whitespace-pre-line">
                  {summary.summary}
                </div>
              ) : (
                <div className="text-center py-6">

                  <BrainCircuit className="w-10 h-10 text-text-faint mx-auto mb-3" />

                  <p className="text-sm text-text-muted">
                    No AI summary has been generated yet.
                  </p>

                  <p className="text-xs text-text-faint mt-1">
                    {hasExtractedText
                      ? 'Click "Generate Summary" to analyze this agreement.'
                      : 'Extract agreement text before generating an AI summary.'}
                  </p>

                </div>
              )}

            </div>

          </div>

          {/* Risks */}

          <div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">

              <h3 className="font-semibold text-ink text-lg">
                Detected Risks & Anomalies
              </h3>

              {risks?.createdAt && (
                <span className="text-xs text-text-muted">
                  Last analyzed:{' '}
                  {new Date(
                    risks.createdAt
                  ).toLocaleString()}
                </span>
              )}

            </div>

            {risks?.risks ? (
              <RiskCard
                type={riskLevel || 'medium'}
                title={`${riskLabel} Assessment`}
                desc={risks.risks}
                action="Review the AI findings and verify important clauses against the original agreement."
              />
            ) : (
              <div className="bg-white border border-border rounded-xl p-6 text-center">

                <AlertCircle className="w-10 h-10 text-text-faint mx-auto mb-3" />

                <p className="text-sm text-text-muted">
                  No risk analysis has been generated yet.
                </p>

                <button
                  onClick={detectRisks}
                  disabled={
                    riskLoading ||
                    !hasExtractedText
                  }
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-lease-600 text-white rounded-lg text-sm font-medium hover:bg-lease-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <BrainCircuit className="w-4 h-4" />
                  {hasExtractedText
                    ? 'Detect Risks'
                    : 'Text Extraction Required'}
                </button>

              </div>
            )}

          </div>

          {/* Clause Explanation */}

          <div className="bg-white rounded-xl shadow-sm border border-border p-6">

            <div className="flex items-center gap-2 mb-4">

              <MessageSquare className="w-5 h-5 text-lease-600" />

              <h3 className="font-semibold text-ink">
                Explain a Clause
              </h3>

            </div>

            <p className="text-sm text-text-muted mb-4">
              Paste a clause from the agreement and let AI explain
              what it means in simple language.
            </p>

            <textarea
              value={clause}
              onChange={(e) =>
                setClause(e.target.value)
              }
              placeholder="Paste an agreement clause here..."
              rows={4}
              disabled={!hasExtractedText}
              className="w-full px-4 py-3 bg-paper border border-border rounded-lg text-sm text-ink focus:outline-none focus:border-lease-500 focus:ring-1 focus:ring-lease-500 resize-none disabled:opacity-60 disabled:cursor-not-allowed"
            />

            {clauseError && (
              <p className="text-sm text-bad-600 mt-2">
                {clauseError}
              </p>
            )}

            <div className="flex justify-end mt-3">

              <button
                onClick={explainClause}
                disabled={
                  clauseLoading ||
                  !hasExtractedText
                }
                className="flex items-center gap-2 px-4 py-2 bg-lease-600 text-white rounded-lg text-sm font-medium hover:bg-lease-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >

                {clauseLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Explaining...
                  </>
                ) : (
                  <>
                    <BrainCircuit className="w-4 h-4" />
                    Explain with AI
                  </>
                )}

              </button>

            </div>

            {clauseExplanation && (
              <div className="mt-5 p-4 bg-lease-50 border border-lease-100 rounded-xl">

                <h4 className="font-semibold text-lease-900 mb-2">
                  AI Explanation
                </h4>

                <p className="text-sm text-lease-900 leading-6 whitespace-pre-line">
                  {clauseExplanation}
                </p>

                <p className="text-xs text-text-muted mt-4">
                  AI-generated information is for understanding the
                  agreement and should not be treated as legal advice.
                </p>

              </div>
            )}

          </div>

          {/* Agreement Information */}

          <div className="bg-white rounded-xl shadow-sm border border-border p-6">

            <h3 className="font-semibold text-ink mb-4">
              Agreement Information
            </h3>

            <div className="space-y-4">

              <div className="flex flex-wrap gap-2">

                <span className="px-3 py-1.5 bg-paper border border-border rounded-lg text-sm text-ink">
                  {agreement.title}
                </span>

                <span className="px-3 py-1.5 bg-paper border border-border rounded-lg text-sm text-ink uppercase">
                  {agreement.fileType || 'Document'}
                </span>

                <span className="px-3 py-1.5 bg-paper border border-border rounded-lg text-sm text-ink capitalize">
                  {agreement.status || 'active'}
                </span>

              </div>

              {agreement.extractedText ? (
                <details className="border border-border rounded-lg">

                  <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-ink">
                    View Extracted Agreement Text
                  </summary>

                  <div className="px-4 py-4 border-t border-border">

                    <p className="text-sm text-text-muted leading-6 whitespace-pre-line max-h-80 overflow-y-auto">
                      {agreement.extractedText}
                    </p>

                  </div>

                </details>
              ) : (
                <div className="p-4 rounded-lg bg-paper border border-border">

                  <p className="text-sm font-medium text-ink">
                    No extracted text available
                  </p>

                  <p className="text-xs text-text-muted mt-1">
                    The uploaded document is available, but text
                    extraction did not produce any content.
                  </p>

                </div>
              )}

            </div>

          </div>

        </div>
      </div>

      {/* Disclaimer */}

      <div className="bg-paper border border-border rounded-xl p-4">

        <p className="text-xs text-text-muted leading-5">

          <strong className="text-ink">
            SmartLease AI Notice:
          </strong>{' '}

          AI-generated summaries, risk assessments, and explanations
          are intended to help users understand rental agreements.
          They are not a substitute for professional legal advice.
          Always verify important information against the original
          agreement.

        </p>

      </div>

    </div>
  );
};

export default AgreementAnalysis;