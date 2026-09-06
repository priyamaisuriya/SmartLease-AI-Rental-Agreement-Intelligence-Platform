import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
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
    <div className={`p-4 border rounded-xl flex items-start gap-4 ${styles}`}>
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

  const [agreement, setAgreement] = useState(null);
  const [summary, setSummary] = useState(null);
  const [risks, setRisks] = useState(null);

  const [loading, setLoading] = useState(true);
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
   * Load agreement information and previously generated AI results.
   *
   * IMPORTANT:
   * These are GET requests only.
   * They do NOT call Gemini.
   */
  useEffect(() => {
    const loadAnalysisData = async () => {
      setLoading(true);
      setError('');

      try {
        const agreementResponse = await api.get(
          `/agreements/${agreementId}`
        );

        setAgreement(
          agreementResponse.data.agreement ||
          agreementResponse.data
        );

        const [summaryResult, riskResult] = await Promise.allSettled([
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
        }

        if (riskResult.status === 'fulfilled') {
          const data = riskResult.value.data;

          setRisks(
            data?.risks
              ? data
              : null
          );
        }

      } catch (err) {
        console.error('Failed to load agreement analysis:', err);

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
   * Generate AI summary.
   *
   * THIS calls Gemini.
   * Only triggered by user button click.
   */
  const generateSummary = async () => {
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
      console.error('Failed to generate summary:', err);

      setSummaryError(
        err.response?.data?.message ||
        'Failed to generate AI summary.'
      );
    } finally {
      setSummaryLoading(false);
    }
  };

  /*
   * Generate AI risk analysis.
   *
   * THIS calls Gemini.
   * Only triggered by user button click.
   */
  const detectRisks = async () => {
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
      console.error('Failed to detect risks:', err);

      setRiskError(
        err.response?.data?.message ||
        'Failed to generate risk analysis.'
      );
    } finally {
      setRiskLoading(false);
    }
  };

  /*
   * Explain a selected clause.
   *
   * THIS calls Gemini.
   */
  const explainClause = async () => {
    if (!clause.trim()) {
      setClauseError('Please enter a clause to explain.');
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
      console.error('Failed to explain clause:', err);

      setClauseError(
        err.response?.data?.message ||
        'Failed to explain the clause.'
      );
    } finally {
      setClauseLoading(false);
    }
  };

  /*
   * Extract risk level from the AI risk response.
   *
   * Example:
   * "Risk assessment: MEDIUM..."
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

  const riskData = [
    {
      name: 'Risk',
      value: riskScore,
      fill: riskColor,
    },
    {
      name: 'Safe',
      value: 100 - riskScore,
      fill: '#F6F7FB',
    },
  ];

  /*
   * Try to get populated values from agreement/rental.
   */
  const tenantName =
    agreement?.tenant?.name ||
    agreement?.tenant?.fullName ||
    '—';

  const propertyTitle =
    agreement?.property?.title ||
    agreement?.property?.name ||
    '—';

  const rental = agreement?.rental;

  const startDate = rental?.startDate
    ? new Date(rental.startDate).toLocaleDateString()
    : '—';

  const endDate = rental?.endDate
    ? new Date(rental.endDate).toLocaleDateString()
    : '—';

  const monthlyRent =
    rental?.monthlyRent ??
    agreement?.property?.monthlyRent;

  const securityDeposit =
    rental?.securityDeposit ??
    agreement?.property?.securityDeposit;

  const formatCurrency = (value) => {
    if (value === undefined || value === null || value === '') {
      return '—';
    }

    return `₹${Number(value).toLocaleString('en-IN')}`;
  };

  /*
   * Download a local text report.
   *
   * This does not call Gemini.
   */
  const exportReport = () => {
    const report = `
SMARTLEASE - AGREEMENT INTELLIGENCE REPORT

Agreement:
${agreement?.title || '—'}

Tenant:
${tenantName}

Property:
${propertyTitle}

Agreement Status:
${agreement?.status || '—'}

Uploaded:
${agreement?.uploadedAt
        ? new Date(agreement.uploadedAt).toLocaleDateString()
        : '—'
      }

----------------------------------------
RENTAL DETAILS
----------------------------------------

Start Date:
${startDate}

End Date:
${endDate}

Monthly Rent:
${formatCurrency(monthlyRent)}

Security Deposit:
${formatCurrency(securityDeposit)}

----------------------------------------
RISK ANALYSIS
----------------------------------------

Risk Level:
${riskLabel}

Risk Analysis:
${risks?.risks || 'No risk analysis generated yet.'}

----------------------------------------
AI SUMMARY
----------------------------------------

${summary?.summary || 'No AI summary generated yet.'}

----------------------------------------
CLAUSE EXPLANATION
----------------------------------------

Clause:
${clause || 'No clause selected.'}

Explanation:
${clauseExplanation || 'No clause explanation generated.'}

----------------------------------------
Generated by SmartLease
----------------------------------------
`;

    const blob = new Blob([report], {
      type: 'text/plain;charset=utf-8',
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');

    link.href = url;
    link.download = `${agreement?.title || 'agreement'
      }_AI_Report.txt`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-6 fade-in pb-12 max-w-6xl mx-auto">
        <div className="bg-white border border-border rounded-xl p-10 text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-lease-600 mx-auto mb-4" />

          <p className="text-text-muted">
            Loading agreement analysis...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 fade-in pb-12 max-w-6xl mx-auto">
        <Link
          to="/landlord/agreements"
          className="inline-flex items-center gap-2 text-text-muted hover:text-ink"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Agreements
        </Link>

        <div className="bg-bad-50 border border-bad-500/20 rounded-xl p-6">
          <h2 className="font-semibold text-bad-800">
            Unable to load agreement
          </h2>

          <p className="text-sm text-bad-700 mt-2">
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!agreement) {
    return (
      <div className="space-y-6 fade-in pb-12 max-w-6xl mx-auto">
        <Link
          to="/landlord/agreements"
          className="inline-flex items-center gap-2 text-text-muted hover:text-ink"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Agreements
        </Link>

        <div className="bg-white border border-border rounded-xl p-8 text-center">
          <FileText className="w-10 h-10 text-text-muted mx-auto mb-3" />

          <p className="text-text-muted">
            Agreement not found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in pb-12 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div className="flex items-center gap-4">

          <Link
            to="/landlord/agreements"
            className="p-2 text-text-muted hover:bg-white rounded-lg border border-transparent hover:border-border transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT COLUMN */}
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
                  style={{
                    color: riskColor,
                  }}
                >
                  {riskScore}
                </span>

                <span
                  className="text-sm font-medium uppercase tracking-wider"
                  style={{
                    color: riskColor,
                  }}
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
              disabled={riskLoading}
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
                  {risks ? 'Re-analyze Risks' : 'Detect Risks'}
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

        {/* RIGHT COLUMN */}
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
                disabled={summaryLoading}
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
                    {summary ? 'Regenerate Summary' : 'Generate Summary'}
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
                    Click "Generate Summary" to analyze this agreement.
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
                  disabled={riskLoading}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-lease-600 text-white rounded-lg text-sm font-medium hover:bg-lease-700 disabled:opacity-60"
                >
                  <BrainCircuit className="w-4 h-4" />
                  Detect Risks
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
              onChange={(e) => setClause(e.target.value)}
              placeholder="Paste an agreement clause here..."
              rows={4}
              className="w-full px-4 py-3 bg-paper border border-border rounded-lg text-sm text-ink focus:outline-none focus:border-lease-500 focus:ring-1 focus:ring-lease-500 resize-none"
            />

            {clauseError && (
              <p className="text-sm text-bad-600 mt-2">
                {clauseError}
              </p>
            )}

            <div className="flex justify-end mt-3">

              <button
                onClick={explainClause}
                disabled={clauseLoading}
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

          {/* Important Clauses / Extracted Text */}
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

              {agreement.extractedText && (
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