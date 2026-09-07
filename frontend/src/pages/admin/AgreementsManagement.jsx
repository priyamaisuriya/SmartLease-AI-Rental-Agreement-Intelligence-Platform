import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Download, Trash2, Loader2 } from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import api from '../../services/api';

const AgreementsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAgreements();
  }, []);

  const fetchAgreements = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/agreements');
      // res.data.agreements is the array
      
      const backendUrl = api.defaults.baseURL.replace('/api', '');
      
      const formatted = res.data.agreements.map(item => ({
        id: item._id,
        agreement: item.originalFileName || item.title,
        tenant: item.tenant?.name || 'Unknown',
        landlord: item.landlord?.name || 'Unknown',
        property: item.property?.title || 'Not Linked',
        date: new Date(item.uploadedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        analysis: item.status === 'terminated' ? 'Terminated' : 'Completed',
        risk: null,
        fileUrl: item.fileUrl?.startsWith('http') ? item.fileUrl : `${backendUrl}${item.fileUrl}`
      }));
      
      setAgreements(formatted);
      setError(null);
    } catch (err) {
      console.error('Failed to load agreements:', err);
      setError('Failed to load agreements from the server.');
    } finally {
      setLoading(false);
    }
  };

  const filteredData = agreements.filter(item => 
    item.agreement.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.tenant.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to completely delete this agreement? This action cannot be undone.')) return;
    try {
      await api.delete(`/admin/agreements/${id}`);
      fetchAgreements();
    } catch (err) {
      console.error(err);
      alert('Failed to delete agreement');
    }
  };

  const handleView = (fileUrl) => {
    if (fileUrl) window.open(fileUrl, '_blank');
  };

  const columns = [
    { 
      header: 'Agreement', 
      accessor: 'agreement',
      render: (row) => <span className="font-medium text-ink">{row.agreement}</span>
    },
    { header: 'Tenant', accessor: 'tenant' },
    { header: 'Landlord', accessor: 'landlord' },
    { 
      header: 'Property', 
      accessor: 'property',
      render: (row) => (
        <span className={row.property === 'Not Linked' ? 'text-text-faint italic' : ''}>
          {row.property}
        </span>
      )
    },
    { header: 'Upload Date', accessor: 'date' },
    { 
      header: 'Analysis Status', 
      accessor: 'analysis',
      render: (row) => <StatusBadge status={row.analysis} />
    },
    { 
      header: 'Risk Level', 
      accessor: 'risk',
      render: (row) => row.risk ? <StatusBadge status={`${row.risk} Risk`} /> : <span className="text-text-faint">-</span>
    },
    { 
      header: 'Actions', 
      accessor: 'actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleView(row.fileUrl)}
            className="p-1 text-text-muted hover:text-lease-600 transition-colors" 
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleView(row.fileUrl)}
            className="p-1 text-text-muted hover:text-lease-600 transition-colors" 
            title="Download Report"
          >
            <Download className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleDelete(row.id)}
            className="p-1 text-text-muted hover:text-bad-600 transition-colors" 
            title="Delete Agreement"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 fade-in pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">Rental Agreements</h1>
          <p className="text-text-muted mt-1">Monitor uploaded agreements and AI analysis status.</p>
        </div>
      </div>

      <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-text-faint absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search agreements..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-paper border border-border rounded-lg text-sm focus:outline-none focus:border-lease-500 focus:ring-1 focus:ring-lease-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button className="flex flex-1 sm:flex-none justify-center items-center gap-2 px-4 py-2 bg-paper border border-border rounded-lg text-sm font-medium text-ink hover:bg-border/50 transition-colors">
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gold" />
          </div>
        ) : error ? (
          <div className="text-center py-10 text-bad-600">{error}</div>
        ) : (
          <DataTable columns={columns} data={filteredData} />
        )}
      </div>
    </div>
  );
};

export default AgreementsManagement;
