import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Download,
  BrainCircuit,
  UploadCloud,
  MessageSquare,
  RefreshCw,
  FileText,
} from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import api from '../../services/api';

const Agreements = () => {
  const [agreements, setAgreements] = useState([]);
  const [riskData, setRiskData] = useState({});

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [loading, setLoading] = useState(true);
  const [riskLoading, setRiskLoading] = useState({});
  const [error, setError] = useState('');

  /*
   * Load landlord agreements from backend.
   */
  const fetchAgreements = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/agreements/my-agreements');

      const data =
        response.data.agreements ||
        response.data ||
        [];

      setAgreements(Array.isArray(data) ? data : []);

    } catch (err) {
      console.error('Failed to load landlord agreements:', err);

      setError(
        err.response?.data?.message ||
        'Failed to load agreements.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgreements();
  }, []);

  /*
   * Load the latest stored risk analysis for each agreement.
   *
   * These are GET requests only.
   * They do NOT call Gemini.
   */
  useEffect(() => {
    if (!agreements.length) {
      return;
    }

    const loadRiskData = async () => {
      const results = {};

      await Promise.all(
        agreements.map(async (agreement) => {
          try {
            const response = await api.get(
              `/ai/agreements/${agreement._id}/risks/latest`
            );

            if (response.data?.risks) {
              results[agreement._id] = response.data;
            }
          } catch (err) {
            /*
             * A missing previous AI analysis is not an error
             * for the agreement list.
             */
            if (err.response?.status !== 404) {
              console.error(
                `Failed to load risk for agreement ${agreement._id}:`,
                err
              );
            }
          }
        })
      );

      setRiskData(results);
    };

    loadRiskData();
  }, [agreements]);

  /*
   * Extract LOW / MEDIUM / HIGH from stored AI result.
   */
  const getRiskLevel = (agreementId) => {
    const riskText =
      riskData[agreementId]?.risks || '';

    if (/HIGH/i.test(riskText)) {
      return 'High';
    }

    if (/MEDIUM/i.test(riskText)) {
      return 'Medium';
    }

    if (/LOW/i.test(riskText)) {
      return 'Low';
    }

    return 'Not Analyzed';
  };

  /*
   * Format agreement uploaded date.
   */
  const formatDate = (date) => {
    if (!date) {
      return '—';
    }

    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  /*
   * Download the original agreement.
   */
  const handleDownload = (agreement) => {
    if (!agreement.fileUrl) {
      alert('Agreement file is not available.');
      return;
    }

    window.open(agreement.fileUrl, '_blank', 'noopener,noreferrer');
  };

  /*
   * Search + status filtering.
   */
  const filteredData = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return agreements.filter((agreement) => {
      const tenantName =
        agreement.tenant?.name ||
        agreement.tenant?.fullName ||
        '';

      const propertyName =
        agreement.property?.title ||
        agreement.property?.name ||
        '';

      const title =
        agreement.title ||
        agreement.originalFileName ||
        '';

      const matchesSearch =
        !search ||
        title.toLowerCase().includes(search) ||
        tenantName.toLowerCase().includes(search) ||
        propertyName.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === 'all' ||
        agreement.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [
    agreements,
    searchTerm,
    statusFilter,
  ]);

  /*
   * Refresh stored risk data for one agreement.
   *
   * GET only — no Gemini usage.
   */
  const refreshRisk = async (agreementId) => {
    setRiskLoading((previous) => ({
      ...previous,
      [agreementId]: true,
    }));

    try {
      const response = await api.get(
        `/ai/agreements/${agreementId}/risks/latest`
      );

      if (response.data?.risks) {
        setRiskData((previous) => ({
          ...previous,
          [agreementId]: response.data,
        }));
      }
    } catch (err) {
      console.error(
        'Failed to refresh risk:',
        err
      );
    } finally {
      setRiskLoading((previous) => ({
        ...previous,
        [agreementId]: false,
      }));
    }
  };

  const columns = [
    {
      header: 'Agreement',
      accessor: 'title',

      render: (row) => (
        <div className="flex items-center gap-3 min-w-0">

          <div className="w-9 h-9 rounded-lg bg-lease-50 flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4 text-lease-600" />
          </div>

          <div className="min-w-0">
            <span className="font-medium text-ink block truncate max-w-[220px]">
              {row.title ||
                row.originalFileName ||
                'Untitled Agreement'}
            </span>

            {row.originalFileName &&
              row.originalFileName !== row.title && (
                <span className="text-xs text-text-muted block truncate max-w-[220px]">
                  {row.originalFileName}
                </span>
              )}
          </div>

        </div>
      ),
    },

    {
      header: 'Tenant',
      accessor: 'tenant',

      render: (row) => (
        <span>
          {row.tenant?.name ||
            row.tenant?.fullName ||
            '—'}
        </span>
      ),
    },

    {
      header: 'Property',
      accessor: 'property',

      render: (row) => (
        <span>
          {row.property?.title ||
            row.property?.name ||
            '—'}
        </span>
      ),
    },

    {
      header: 'Uploaded Date',
      accessor: 'uploadedAt',

      render: (row) => (
        <span>
          {formatDate(row.uploadedAt)}
        </span>
      ),
    },

    {
      header: 'Status',
      accessor: 'status',

      render: (row) => (
        <StatusBadge
          status={
            row.status
              ? row.status.charAt(0).toUpperCase() +
              row.status.slice(1)
              : 'Unknown'
          }
        />
      ),
    },

    {
      header: 'Risk',
      accessor: 'risk',

      render: (row) => {
        const risk = getRiskLevel(row._id);

        if (risk === 'Not Analyzed') {
          return (
            <span className="text-xs text-text-muted">
              Not analyzed
            </span>
          );
        }

        return (
          <StatusBadge
            status={`${risk} Risk`}
          />
        );
      },
    },

    {
      header: 'Actions',
      accessor: 'actions',

      render: (row) => (
        <div className="flex items-center gap-2">

          {/* AI Analysis */}
          <Link
            to={`/landlord/analysis/${row._id}`}
            className="p-1 text-lease-600 hover:text-lease-700 transition-colors"
            title="View AI Analysis"
          >
            <BrainCircuit className="w-5 h-5" />
          </Link>

          {/* AI Chat */}
          <Link
            to={`/landlord/chat/${row._id}`}
            className="p-1 text-text-muted hover:text-lease-600 transition-colors"
            title="Chat with AI"
          >
            <MessageSquare className="w-5 h-5" />
          </Link>

          {/* Download */}
          <button
            onClick={() => handleDownload(row)}
            className="p-1 text-text-muted hover:text-ink transition-colors"
            title="Download Document"
          >
            <Download className="w-5 h-5" />
          </button>

          {/* Refresh stored risk */}
          <button
            onClick={() => refreshRisk(row._id)}
            disabled={riskLoading[row._id]}
            className="p-1 text-text-muted hover:text-ink transition-colors disabled:opacity-50"
            title="Refresh Risk Result"
          >
            <RefreshCw
              className={`w-4 h-4 ${riskLoading[row._id]
                  ? 'animate-spin'
                  : ''
                }`}
            />
          </button>

        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 fade-in pb-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div>
          <h1 className="text-2xl font-display font-bold text-ink">
            Rental Agreements
          </h1>

          <p className="text-text-muted mt-1">
            Manage and analyze your rental contracts.
          </p>
        </div>

        {/* Landlord is allowed to upload agreements */}
        <Link
          to="/landlord/agreements/upload"
          className="flex items-center gap-2 px-4 py-2 bg-lease-600 text-white rounded-lg text-sm font-medium hover:bg-lease-700 transition-colors shadow-sm"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Agreement</span>
        </Link>

      </div>

      {/* Error */}
      {error && (
        <div className="bg-bad-50 border border-bad-500/20 rounded-xl p-4">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

            <p className="text-sm text-bad-700">
              {error}
            </p>

            <button
              onClick={fetchAgreements}
              className="px-3 py-2 bg-white border border-bad-500/20 rounded-lg text-sm font-medium text-bad-700 hover:bg-bad-50"
            >
              Try Again
            </button>

          </div>

        </div>
      )}

      {/* Main Table */}
      <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">

        {/* Search / Filters */}
        <div className="p-4 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-4">

          <div className="relative w-full sm:w-80">

            <Search className="w-4 h-4 text-text-faint absolute left-3 top-1/2 -translate-y-1/2" />

            <input
              type="text"
              placeholder="Search agreements, tenants or properties..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              className="w-full pl-9 pr-4 py-2 bg-paper border border-border rounded-lg text-sm focus:outline-none focus:border-lease-500 focus:ring-1 focus:ring-lease-500 transition-all"
            />

          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">

            <div className="relative flex-1 sm:flex-none">

              <Filter className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
                className="appearance-none w-full sm:w-40 pl-9 pr-8 py-2 bg-paper border border-border rounded-lg text-sm font-medium text-ink focus:outline-none focus:border-lease-500 focus:ring-1 focus:ring-lease-500"
              >
                <option value="all">
                  All Status
                </option>

                <option value="active">
                  Active
                </option>

                <option value="expired">
                  Expired
                </option>

                <option value="terminated">
                  Terminated
                </option>
              </select>

            </div>

          </div>

        </div>

        {/* Loading */}
        {loading ? (
          <div className="py-16 text-center">

            <RefreshCw className="w-8 h-8 text-lease-600 animate-spin mx-auto mb-3" />

            <p className="text-sm text-text-muted">
              Loading agreements...
            </p>

          </div>
        ) : filteredData.length === 0 ? (
          <div className="py-16 text-center">

            <FileText className="w-10 h-10 text-text-faint mx-auto mb-3" />

            <h3 className="font-semibold text-ink">
              No agreements found
            </h3>

            <p className="text-sm text-text-muted mt-1">
              {agreements.length === 0
                ? 'You have not uploaded any rental agreements yet.'
                : 'Try changing your search or filter.'}
            </p>

          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredData}
          />
        )}

      </div>

      {/* Footer information */}
      {!loading && agreements.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-text-muted">

          <span>
            Showing {filteredData.length} of{' '}
            {agreements.length} agreements
          </span>

          <span>
            AI risk results shown here are previously generated
            analyses.
          </span>

        </div>
      )}

    </div>
  );
};

export default Agreements;