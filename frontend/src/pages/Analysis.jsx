import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

const Analysis = () => {
  const { agreementId } = useParams();
  const navigate = useNavigate();

  const [agreement, setAgreement] = useState(null);
  const [summary, setSummary] = useState(null);
  const [riskAnalysis, setRiskAnalysis] = useState(null);

  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [riskLoading, setRiskLoading] = useState(false);

  const [selectedClause, setSelectedClause] = useState('');
  const [clauseExplanation, setClauseExplanation] = useState('');
  const [clauseLoading, setClauseLoading] = useState(false);
  const [clauseError, setClauseError] = useState('');

  const [error, setError] = useState('');

  useEffect(() => {
    const loadAnalysis = async () => {
      if (!agreementId) {
        setError('Agreement ID is missing.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const agreementResponse = await api.get(
          `/agreements/${agreementId}`
        );

        console.log(
          'Agreement response:',
          agreementResponse.data
        );

        const agreementData =
          agreementResponse.data.agreement ||
          agreementResponse.data.data ||
          agreementResponse.data;

        setAgreement(agreementData);

        // Load latest summary
        try {
          setSummaryLoading(true);

          const summaryResponse = await api.get(
            `/ai/agreements/${agreementId}/summary/latest`
          );

          console.log(
            'Latest summary:',
            summaryResponse.data
          );

          setSummary(
            summaryResponse.data.summary ||
            summaryResponse.data.analysis ||
            summaryResponse.data
          );
        } catch (summaryError) {
          console.log(
            'No existing summary found:',
            summaryError.response?.data || summaryError.message
          );
        } finally {
          setSummaryLoading(false);
        }

        // Load latest risk analysis
        try {
          setRiskLoading(true);

          const riskResponse = await api.get(
            `/ai/agreements/${agreementId}/risks/latest`
          );

          console.log(
            'Latest risk analysis:',
            riskResponse.data
          );

          setRiskAnalysis(
            riskResponse.data
          );
        } catch (riskError) {
          console.log(
            'No existing risk analysis found:',
            riskError.response?.data || riskError.message
          );
        } finally {
          setRiskLoading(false);
        }

      } catch (err) {
        console.error(
          'Failed to load agreement analysis:',
          err
        );

        setError(
          err.response?.data?.message ||
          'Failed to load agreement.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadAnalysis();
  }, [agreementId]);

  const generateSummary = async () => {
    try {
      setSummaryLoading(true);
      setError('');

      const response = await api.post(
        `/ai/agreements/${agreementId}/summary`
      );

      console.log('Generated summary:', response.data);

      setSummary(
        response.data.summary ||
        response.data.analysis ||
        response.data
      );
    } catch (err) {
      console.error('Summary generation error:', err);

      setError(
        err.response?.data?.message ||
        'Failed to generate AI summary.'
      );
    } finally {
      setSummaryLoading(false);
    }
  };

  const generateRisks = async () => {
    try {
      setRiskLoading(true);
      setError('');

      const response = await api.post(
        `/ai/agreements/${agreementId}/risks`
      );

      console.log('Generated risks:', response.data);

      setRiskAnalysis(
        response.data
      );
    } catch (err) {
      console.error('Risk analysis error:', err);

      setError(
        err.response?.data?.message ||
        'Failed to generate risk analysis.'
      );
    } finally {
      setRiskLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Not available';

    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount) => {
    if (
      amount === null ||
      amount === undefined ||
      amount === ''
    ) {
      return 'Not available';
    }

    return `₹${Number(amount).toLocaleString('en-IN')}`;
  };

  const getRiskLevel = () => {
    const riskText =
      riskAnalysis?.risks ||
      riskAnalysis?.result ||
      riskAnalysis?.analysis ||
      '';

    const text = String(riskText).toLowerCase();

    if (text.includes('high')) return 'High';
    if (text.includes('medium')) return 'Medium';
    if (text.includes('low')) return 'Low';

    return 'Not assessed';
  };

  const riskBadge = (level) => {
    if (!level || level === 'Not assessed') {
      return (
        <span className="inline-flex items-center rounded-full border border-border px-2.5 py-1 text-xs font-medium text-text-muted">
          Not assessed
        </span>
      );
    }

    const map = {
      Low: 'bg-good-50 text-good-600 border-good-500/20',
      Medium: 'bg-warn-50 text-warn-600 border-warn-500/20',
      High: 'bg-bad-50 text-bad-600 border-bad-500/20',
    };

    return (
      <span
        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${map[level]}`}
      >
        {level} Risk
      </span>
    );
  };

  const getSummaryText = () => {
    if (!summary) return '';

    if (typeof summary === 'string') {
      return summary;
    }

    return (
      summary.summary ||
      summary.result ||
      summary.analysis ||
      summary.content ||
      ''
    );
  };

  const getRiskText = () => {
    if (!riskAnalysis) return '';

    if (typeof riskAnalysis === 'string') {
      return riskAnalysis;
    }

    return (
      riskAnalysis.risks ||
      riskAnalysis.result ||
      riskAnalysis.analysis ||
      riskAnalysis.content ||
      ''
    );
  };

  if (loading) {
    return (
      <div className="fade-in">
        <h1 className="font-display text-2xl font-semibold text-ink">
          Agreement analysis
        </h1>

        <div className="mt-6 flex items-center justify-center rounded-xl2 border border-border bg-white/60 px-6 py-14">
          <p className="text-sm text-text-faint">
            Loading agreement...
          </p>
        </div>
      </div>
    );
  }

  if (error && !agreement) {
    return (
      <div className="fade-in">

        <div className="rounded-xl2 border border-border bg-white p-6">

          <div className="flex flex-col items-center justify-center py-12 text-center">

            <div className="grid h-14 w-14 place-items-center rounded-full bg-bad-50 text-bad-600">
              !
            </div>

            <h2 className="mt-4 font-display text-xl font-semibold text-ink">
              Unable to load agreement
            </h2>

            <p className="mt-2 max-w-md text-sm leading-relaxed text-text-muted">
              {error}
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">

              <button
                type="button"
                onClick={() => navigate('/agreements')}
                className="rounded-lg bg-lease-600 px-5 py-2.5 text-sm font-medium text-white shadow-soft hover:bg-lease-700"
              >
                Back to Agreements
              </button>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-lg border border-border bg-white px-5 py-2.5 text-sm font-medium text-ink hover:bg-paper"
              >
                Try Again
              </button>

            </div>

          </div>

        </div>

      </div>
    );
  }
  const property = agreement?.property || {};
  const landlord = agreement?.landlord || {};
  const tenant = agreement?.tenant || {};
  const rental = agreement?.rental || {};

  const riskLevel = getRiskLevel();
  const summaryText = getSummaryText();
  const riskText = getRiskText();

  const handleExplainClause = async () => {
    const clause = selectedClause.trim();

    if (!clause) {
      setClauseError('Please select or enter a clause first.');
      return;
    }

    setClauseLoading(true);
    setClauseError('');
    setClauseExplanation('');

    try {
      const response = await api.post(
        `/ai/agreements/${agreementId}/explain-clause`,
        {
          clause
        }
      );

      setClauseExplanation(
        response.data?.explanation || 'No explanation returned.'
      );
    } catch (error) {
      setClauseError(
        error.response?.data?.message ||
        'Failed to explain the clause.'
      );
    } finally {
      setClauseLoading(false);
    }
  };

  return (
    <div className="fade-in">

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            {agreement?.title ||
              agreement?.originalFileName ||
              'Rental Agreement'}
          </h1>

          <p className="mt-1 text-sm text-text-muted">
            {property?.title || 'Rental Agreement'}
            {property?.city
              ? ` · ${property.city}`
              : ''}
            {' · '}
            Uploaded {formatDate(agreement?.uploadedAt)}
          </p>
        </div>

        <button
          onClick={() =>
            navigate(`/chat/${agreementId}`)
          }
          className="rounded-lg bg-signal-500 px-4 py-2.5 text-sm font-medium text-white shadow-soft hover:bg-signal-600"
        >
          Ask AI about this agreement
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-warn-500/20 bg-warn-50 px-4 py-3 text-sm text-warn-600">
          {error}
        </div>
      )}

      {/* Agreement information */}
      <div className="mt-6 rounded-xl2 border border-border bg-white p-6">
        <p className="font-display text-base font-semibold text-ink">
          Agreement information
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div>
            <p className="text-xs text-text-faint">
              Status
            </p>

            <p className="mt-1.5 text-sm font-medium text-ink capitalize">
              {agreement?.status || 'Not available'}
            </p>
          </div>

          <div>
            <p className="text-xs text-text-faint">
              Property
            </p>

            <p className="mt-1.5 text-sm font-medium text-ink">
              {property?.title || 'Not available'}
            </p>
          </div>

          <div>
            <p className="text-xs text-text-faint">
              Landlord
            </p>

            <p className="mt-1.5 text-sm font-medium text-ink">
              {landlord?.name || 'Not available'}
            </p>
          </div>

          <div>
            <p className="text-xs text-text-faint">
              Tenant
            </p>

            <p className="mt-1.5 text-sm font-medium text-ink">
              {tenant?.name || 'Not available'}
            </p>
          </div>

        </div>
      </div>

      {/* Overall Risk */}
      <div className="mt-6 rounded-xl2 border border-border bg-white p-6">

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

          <div className="grid h-28 w-28 shrink-0 place-items-center rounded-full border-8 border-border">

            <div className="text-center">
              <p className="text-xs text-text-faint">
                Risk
              </p>

              <p className="font-display text-lg font-bold text-ink">
                {riskLevel}
              </p>
            </div>

          </div>

          <div className="flex-1">

            <div className="flex flex-wrap items-center gap-3">
              <p className="font-display text-base font-semibold text-ink">
                Overall Risk
              </p>

              {riskBadge(riskLevel)}
            </div>

            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-text-muted">
              {riskText ||
                'No AI risk assessment has been generated yet.'}
            </p>

            <button
              onClick={generateRisks}
              disabled={riskLoading}
              className="mt-4 rounded-lg border border-border px-3 py-2 text-xs font-medium text-ink hover:bg-paper disabled:opacity-50"
            >
              {riskLoading
                ? 'Analyzing risks...'
                : riskText
                  ? 'Run Risk Analysis Again'
                  : 'Analyze Risks'}
            </button>

          </div>

        </div>
      </div>

      {/* AI Summary */}
      <div className="mt-6 rounded-xl2 border border-border bg-white p-6">

        <div className="flex flex-wrap items-center justify-between gap-3">

          <p className="font-display text-base font-semibold text-ink">
            AI summary
          </p>

          <button
            onClick={generateSummary}
            disabled={summaryLoading}
            className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-ink hover:bg-paper disabled:opacity-50"
          >
            {summaryLoading
              ? 'Generating...'
              : summaryText
                ? 'Regenerate Summary'
                : 'Generate Summary'}
          </button>

        </div>

        <div className="mt-3">

          {summaryText ? (
            <p className="text-sm leading-relaxed text-text-muted whitespace-pre-line">
              {summaryText}
            </p>
          ) : (
            <p className="text-sm text-text-faint">
              No AI summary has been generated yet.
            </p>
          )}

        </div>

      </div>

      {/* Financial Terms */}
      <div className="mt-6">

        <p className="font-display text-base font-semibold text-ink">
          Financial terms
        </p>

        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-xl2 border border-border bg-white p-4">
            <p className="text-xs text-text-faint">
              Monthly Rent
            </p>

            <p className="mt-1.5 font-display text-sm font-semibold text-ink">
              {formatCurrency(
                rental?.monthlyRent ||
                property?.monthlyRent
              )}
            </p>
          </div>

          <div className="rounded-xl2 border border-border bg-white p-4">
            <p className="text-xs text-text-faint">
              Security Deposit
            </p>

            <p className="mt-1.5 font-display text-sm font-semibold text-ink">
              {formatCurrency(
                rental?.securityDeposit ||
                property?.securityDeposit
              )}
            </p>
          </div>

          <div className="rounded-xl2 border border-border bg-white p-4">
            <p className="text-xs text-text-faint">
              Property Type
            </p>

            <p className="mt-1.5 font-display text-sm font-semibold text-ink capitalize">
              {property?.propertyType ||
                'Not available'}
            </p>
          </div>

          <div className="rounded-xl2 border border-border bg-white p-4">
            <p className="text-xs text-text-faint">
              Agreement Status
            </p>

            <p className="mt-1.5 font-display text-sm font-semibold text-ink capitalize">
              {agreement?.status ||
                'Not available'}
            </p>
          </div>

        </div>
      </div>

      {/* Rental Details */}
      <div className="mt-6">

        <p className="font-display text-base font-semibold text-ink">
          Rental details
        </p>

        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-xl2 border border-border bg-white p-4">
            <p className="text-xs text-text-faint">
              Rental Start
            </p>

            <p className="mt-1.5 font-display text-sm font-semibold text-ink">
              {formatDate(rental?.startDate)}
            </p>
          </div>

          <div className="rounded-xl2 border border-border bg-white p-4">
            <p className="text-xs text-text-faint">
              Rental End
            </p>

            <p className="mt-1.5 font-display text-sm font-semibold text-ink">
              {formatDate(rental?.endDate)}
            </p>
          </div>

          <div className="rounded-xl2 border border-border bg-white p-4">
            <p className="text-xs text-text-faint">
              Booking Date
            </p>

            <p className="mt-1.5 font-display text-sm font-semibold text-ink">
              {formatDate(rental?.bookingDate)}
            </p>
          </div>

          <div className="rounded-xl2 border border-border bg-white p-4">
            <p className="text-xs text-text-faint">
              Rental Status
            </p>

            <p className="mt-1.5 font-display text-sm font-semibold text-ink capitalize">
              {rental?.status ||
                'Not available'}
            </p>
          </div>

        </div>
      </div>

      {/* AI Risk Detection */}
      <div className="mt-6">

        <div className="flex flex-wrap items-center justify-between gap-3">

          <p className="font-display text-base font-semibold text-ink">
            Risk detection
          </p>

          <button
            onClick={generateRisks}
            disabled={riskLoading}
            className="rounded-lg bg-lease-600 px-3 py-2 text-xs font-medium text-white hover:bg-lease-700 disabled:opacity-50"
          >
            {riskLoading
              ? 'Analyzing...'
              : 'Run AI Risk Detection'}
          </button>

        </div>

        <div className="mt-3 rounded-xl2 border border-border bg-white p-5">

          {riskText ? (
            <>
              <div className="mb-3">
                {riskBadge(riskLevel)}
              </div>

              <p className="whitespace-pre-line text-sm leading-relaxed text-text-muted">
                {riskText}
              </p>
            </>
          ) : (
            <p className="text-sm text-text-faint">
              No risk analysis available. Click
              "Run AI Risk Detection" to analyze this
              agreement.
            </p>
          )}

        </div>
      </div>

      {/* Extracted Agreement Text */}
      <div className="mt-6 rounded-xl2 border border-border bg-white p-6">

        <p className="font-display text-base font-semibold text-ink">
          Agreement document
        </p>

        <p className="mt-1 text-xs text-text-faint">
          Extracted text used for AI analysis
        </p>

        <div className="mt-4 max-h-96 overflow-y-auto rounded-lg bg-paper p-4">

          {agreement?.extractedText ? (
            <p className="whitespace-pre-line text-sm leading-relaxed text-text-muted">
              {agreement.extractedText}
            </p>
          ) : (
            <p className="text-sm text-text-faint">
              Extracted agreement text is not available.
            </p>
          )}

        </div>

      </div>

      <div className="mt-6 rounded-xl2 border border-border bg-white p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-ink">
            AI Clause Explanation
          </h2>

          <p className="mt-1 text-sm text-ink-muted">
            Select a clause from the agreement and SmartLease AI
            will explain it in simple language.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-ink">
            Select or enter a clause
          </label>

          <textarea
            value={selectedClause}
            onChange={(e) => {
              setSelectedClause(e.target.value);
              setClauseError('');
            }}
            placeholder="Example: The tenant shall provide 30 days written notice before termination..."
            rows={5}
            className="w-full rounded-xl border border-border bg-paper px-4 py-3 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
          />

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                setSelectedClause(
                  'Termination: Either party may terminate the agreement by providing 30 days written notice.'
                )
              }
              className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-ink-muted hover:bg-paper"
            >
              Termination Clause
            </button>

            <button
              type="button"
              onClick={() =>
                setSelectedClause(
                  'Subletting: The tenant may not transfer or sublet the property without written permission.'
                )
              }
              className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-ink-muted hover:bg-paper"
            >
              Subletting Clause
            </button>

            <button
              type="button"
              onClick={() =>
                setSelectedClause(
                  'Maintenance: The tenant is responsible for normal day-to-day maintenance while the landlord is responsible for structural repairs.'
                )
              }
              className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-ink-muted hover:bg-paper"
            >
              Maintenance Clause
            </button>
          </div>

          {clauseError && (
            <div className="mt-3 rounded-lg border border-bad-200 bg-bad-50 px-4 py-3 text-sm text-bad-700">
              {clauseError}
            </div>
          )}

          <button
            type="button"
            onClick={handleExplainClause}
            disabled={clauseLoading || !selectedClause.trim()}
            className="mt-4 rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {clauseLoading
              ? 'AI is analyzing...'
              : 'Explain Clause'}
          </button>
        </div>

        {clauseExplanation && (
          <div className="mt-6 rounded-xl border border-border bg-paper p-5">
            <div className="mb-3 flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-white text-sm font-bold text-ink">
                AI
              </div>

              <h3 className="font-semibold text-ink">
                AI Explanation
              </h3>
            </div>

            <div className="whitespace-pre-wrap text-sm leading-7 text-ink-muted">
              {clauseExplanation}
            </div>

            <div className="mt-4 border-t border-border pt-3 text-xs text-ink-muted">
              AI-generated explanation. This is not legal advice.
            </div>
          </div>
        )}
      </div>

      {/* AI Actions */}
      <div className="mt-6 rounded-xl2 border border-border bg-lease-50/60 p-6">

        <p className="font-display text-base font-semibold text-ink">
          AI agreement intelligence
        </p>

        <p className="mt-1 text-sm text-text-muted">
          Use AI to understand and review this rental agreement.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">

          <button
            onClick={generateSummary}
            disabled={summaryLoading}
            className="rounded-lg bg-lease-600 px-4 py-2 text-xs font-medium text-white hover:bg-lease-700 disabled:opacity-50"
          >
            {summaryLoading
              ? 'Generating Summary...'
              : 'Generate Summary'}
          </button>

          <button
            onClick={generateRisks}
            disabled={riskLoading}
            className="rounded-lg border border-border bg-white px-4 py-2 text-xs font-medium text-ink hover:bg-paper disabled:opacity-50"
          >
            {riskLoading
              ? 'Checking Risks...'
              : 'Detect Risks'}
          </button>

          <button
            onClick={() =>
              navigate(`/chat/${agreementId}`)
            }
            className="rounded-lg border border-border bg-white px-4 py-2 text-xs font-medium text-ink hover:bg-paper"
          >
            Ask AI
          </button>

        </div>

      </div>

    </div>
  );
};

export default Analysis;