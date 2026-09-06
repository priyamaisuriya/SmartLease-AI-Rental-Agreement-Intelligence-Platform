import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload as UploadIcon,
  Check,
  File as FileIcon,
  ArrowUp,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';

import api from '../../services/api';

const Upload = () => {
  const navigate = useNavigate();

  const [rentals, setRentals] = useState([]);
  const [selectedRental, setSelectedRental] = useState('');
  const [title, setTitle] = useState('');

  const [file, setFile] = useState(null);

  const [step, setStep] = useState('idle');
  const [filename, setFilename] = useState('');
  const [progress, setProgress] = useState(0);

  const [agreement, setAgreement] = useState(null);

  const [loadingRentals, setLoadingRentals] =
    useState(true);

  const [uploading, setUploading] =
    useState(false);

  const [error, setError] = useState('');

  const [dragActive, setDragActive] =
    useState(false);

  /*
   * ---------------------------------------------------
   * LOAD LANDLORD RENTALS
   * ---------------------------------------------------
   */

  const fetchRentals = async () => {
    setLoadingRentals(true);
    setError('');

    try {
      const response =
        await api.get('/rentals/my-properties');

      const rentalData =
        response.data?.rentals ||
        response.data ||
        [];

      const availableRentals =
        Array.isArray(rentalData)
          ? rentalData.filter(
            (rental) =>
              rental.status === 'active' ||
              rental.status === 'pending'
          )
          : [];

      setRentals(availableRentals);
    } catch (err) {
      console.error(
        'Failed to load landlord rentals:',
        err.response?.status,
        err.response?.data ||
        err.message
      );

      setError(
        err.response?.data?.message ||
        'Failed to load rental records.'
      );
    } finally {
      setLoadingRentals(false);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, []);

  /*
   * ---------------------------------------------------
   * FILE VALIDATION
   * ---------------------------------------------------
   */

  const validateFile = (selectedFile) => {
    if (!selectedFile) {
      return 'Please select an agreement file.';
    }

    const extension =
      selectedFile.name
        .split('.')
        .pop()
        ?.toLowerCase();

    const allowedExtensions = [
      'pdf',
      'doc',
      'docx',
    ];

    if (
      !allowedExtensions.includes(
        extension
      )
    ) {
      return 'Only PDF, DOC, and DOCX files are allowed.';
    }

    if (
      selectedFile.size >
      10 * 1024 * 1024
    ) {
      return 'File size must be 10MB or less.';
    }

    return '';
  };

  /*
   * ---------------------------------------------------
   * SELECT FILE
   * ---------------------------------------------------
   */

  const handleFileSelect = (
    selectedFile
  ) => {
    if (!selectedFile) {
      return;
    }

    const validationError =
      validateFile(selectedFile);

    if (validationError) {
      setError(validationError);
      setFile(null);
      setFilename('');
      return;
    }

    setError('');
    setFile(selectedFile);
    setFilename(selectedFile.name);

    if (!title.trim()) {
      const nameWithoutExtension =
        selectedFile.name.replace(
          /\.[^/.]+$/,
          ''
        );

      setTitle(nameWithoutExtension);
    }
  };

  const handleInputChange = (event) => {
    const selectedFile =
      event.target.files?.[0];

    handleFileSelect(selectedFile);
  };

  /*
   * ---------------------------------------------------
   * DRAG & DROP
   * ---------------------------------------------------
   */

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setDragActive(false);

    const droppedFile =
      event.dataTransfer.files?.[0];

    handleFileSelect(droppedFile);
  };

  /*
   * ---------------------------------------------------
   * UPLOAD AGREEMENT
   * ---------------------------------------------------
   */

  const handleUpload = async () => {
    setError('');

    if (!selectedRental) {
      setError(
        'Please select the rental associated with this agreement.'
      );
      return;
    }

    if (!title.trim()) {
      setError(
        'Please enter an agreement title.'
      );
      return;
    }

    if (!file) {
      setError(
        'Please select an agreement file.'
      );
      return;
    }

    const validationError =
      validateFile(file);

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setUploading(true);
      setStep('processing');
      setProgress(0);

      const formData =
        new FormData();

      formData.append(
        'file',
        file
      );

      formData.append(
        'rentalId',
        selectedRental
      );

      formData.append(
        'title',
        title.trim()
      );

      const response =
        await api.post(
          '/agreements/upload',
          formData,
          {
            headers: {
              'Content-Type':
                'multipart/form-data',
            },

            onUploadProgress:
              (progressEvent) => {
                if (
                  progressEvent.total
                ) {
                  const percentage =
                    Math.round(
                      (progressEvent.loaded /
                        progressEvent.total) *
                      100
                    );

                  setProgress(
                    percentage
                  );
                }
              },
          }
        );

      const uploadedAgreement =
        response.data?.agreement;

      setAgreement(
        uploadedAgreement || null
      );

      setProgress(100);
      setStep('done');
    } catch (err) {
      console.error(
        'Agreement upload failed:',
        err.response?.status,
        err.response?.data ||
        err.message
      );

      setStep('idle');

      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to upload agreement.'
      );
    } finally {
      setUploading(false);
    }
  };

  /*
   * ---------------------------------------------------
   * RESET
   * ---------------------------------------------------
   */

  const resetUpload = () => {
    setStep('idle');
    setFile(null);
    setFilename('');
    setProgress(0);
    setAgreement(null);
    setError('');
  };

  /*
   * ---------------------------------------------------
   * HELPERS
   * ---------------------------------------------------
   */

  const selectedRentalData =
    rentals.find(
      (rental) =>
        rental._id ===
        selectedRental
    );

  const getPropertyName = (
    rental
  ) =>
    rental?.property?.title ||
    rental?.propertyName ||
    'Property';

  const getTenantName = (
    rental
  ) =>
    rental?.tenant?.name ||
    rental?.tenantName ||
    'Tenant';

  const getFileExtension = () => {
    if (!filename) {
      return 'FILE';
    }

    return (
      filename
        .split('.')
        .pop()
        ?.toUpperCase() ||
      'FILE'
    );
  };

  /*
   * ---------------------------------------------------
   * PROCESSING STEPS
   * ---------------------------------------------------
   */

  const processingSteps = [
    'Uploading agreement',
    'Extracting document text',
    'Saving agreement details',
    'Preparing AI-ready content',
  ];

  return (
    <div className="fade-in max-w-[1000px] mx-auto w-full pb-8">

      {/* HEADER */}
      <div className="mb-[32px]">
        <button
          type="button"
          onClick={() =>
            navigate(
              '/landlord/agreements'
            )
          }
          className="flex items-center gap-2 text-sm text-text-muted hover:text-ink transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Agreements
        </button>

        <p className="text-[12px] uppercase tracking-[0.12em] text-text-muted font-semibold mb-1">
          Agreement Workspace
        </p>

        <h1 className="font-serif text-[32px] text-ink m-0 font-medium">
          Upload Agreement
        </h1>

        <p className="text-[14px] text-text-muted mt-2">
          Upload an agreement and associate it
          with one of your active rentals.
        </p>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-6 flex items-start gap-3 bg-risk-red-bg border border-risk-red/20 text-risk-red rounded-lg px-4 py-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />

          <span>{error}</span>
        </div>
      )}

      {/* IDLE / FORM */}
      {step === 'idle' && (
        <div className="space-y-6">

          {/* RENTAL SELECTION */}
          <div className="bg-white rounded-lg border border-border p-6">

            <h2 className="font-semibold text-ink mb-1">
              Agreement Details
            </h2>

            <p className="text-xs text-text-muted mb-5">
              Select the rental this agreement
              belongs to.
            </p>

            <div className="space-y-5">

              {/* RENTAL */}
              <div>
                <label className="block text-sm font-medium text-ink mb-2">
                  Rental
                  <span className="text-risk-red">
                    {' '}*
                  </span>
                </label>

                {loadingRentals ? (
                  <div className="px-3 py-3 bg-paper border border-border rounded-lg text-sm text-text-muted">
                    Loading rentals...
                  </div>
                ) : rentals.length === 0 ? (
                  <div className="bg-paper border border-border rounded-lg p-4">
                    <p className="text-sm text-text-muted">
                      No active rentals are
                      available for agreement
                      upload.
                    </p>

                    <p className="text-xs text-text-faint mt-1">
                      An agreement must be
                      associated with an existing
                      rental.
                    </p>
                  </div>
                ) : (
                  <select
                    value={
                      selectedRental
                    }
                    onChange={(event) =>
                      setSelectedRental(
                        event.target.value
                      )
                    }
                    className="w-full px-3 py-3 bg-paper border border-border rounded-lg text-sm text-ink focus:outline-none focus:border-lease-500"
                  >
                    <option value="">
                      Select a rental
                    </option>

                    {rentals.map(
                      (rental) => (
                        <option
                          key={
                            rental._id
                          }
                          value={
                            rental._id
                          }
                        >
                          {getPropertyName(
                            rental
                          )}{' '}
                          —{' '}
                          {getTenantName(
                            rental
                          )}
                        </option>
                      )
                    )}
                  </select>
                )}

                {selectedRentalData && (
                  <div className="mt-3 bg-paper/60 border border-border rounded-lg p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-text-faint">
                          Property
                        </p>

                        <p className="text-sm font-medium text-ink mt-1">
                          {getPropertyName(
                            selectedRentalData
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-text-faint">
                          Tenant
                        </p>

                        <p className="text-sm font-medium text-ink mt-1">
                          {getTenantName(
                            selectedRentalData
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-text-faint">
                          Monthly Rent
                        </p>

                        <p className="text-sm font-medium text-ink mt-1">
                          {selectedRentalData.monthlyRent !==
                            undefined
                            ? `₹${Number(
                              selectedRentalData.monthlyRent
                            ).toLocaleString(
                              'en-IN'
                            )}`
                            : '—'}
                        </p>
                      </div>

                    </div>
                  </div>
                )}
              </div>

              {/* TITLE */}
              <div>
                <label className="block text-sm font-medium text-ink mb-2">
                  Agreement Title
                  <span className="text-risk-red">
                    {' '}*
                  </span>
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(
                      event.target.value
                    )
                  }
                  placeholder="e.g. Residential Rental Agreement 2026"
                  className="w-full px-3 py-3 bg-paper border border-border rounded-lg text-sm text-ink focus:outline-none focus:border-lease-500"
                />
              </div>

            </div>
          </div>

          {/* FILE UPLOAD */}
          <div className="bg-white rounded-lg border border-border p-6">

            <h2 className="font-semibold text-ink mb-1">
              Agreement File
            </h2>

            <p className="text-xs text-text-muted mb-5">
              Upload the signed rental agreement.
            </p>

            <label
              htmlFor="file-input"
              onDragOver={
                handleDragOver
              }
              onDragLeave={
                handleDragLeave
              }
              onDrop={
                handleDrop
              }
              className={`relative flex cursor-pointer flex-col items-center bg-white rounded-lg border-2 border-dashed p-[50px] text-center overflow-hidden transition-colors group ${dragActive
                  ? 'border-gold bg-gold/5'
                  : 'border-gold hover:border-gold-deep'
                }`}
            >

              {/* STRIPED BACKGROUND */}
              <div
                className="absolute inset-0 pointer-events-none transition-opacity group-hover:opacity-[0.06]"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(45deg, #C9A24B 0, #C9A24B 10px, transparent 10px, transparent 24px)',
                  opacity: '0.04',
                }}
              ></div>

              <div className="relative z-10 flex flex-col items-center w-full">

                <div className="w-[68px] h-[68px] rounded-full bg-gold/20 flex items-center justify-center mb-[20px]">
                  <div className="w-[50px] h-[50px] rounded-full bg-gold flex items-center justify-center shadow-[0_4px_12px_rgba(201,162,75,0.3)]">
                    <ArrowUp
                      className="w-[22px] h-[22px] text-ink-dark"
                      strokeWidth={2}
                    />
                  </div>
                </div>

                <h3 className="font-serif text-[25px] font-medium text-ink mb-[10px]">
                  {file
                    ? 'Agreement selected'
                    : 'Drop your agreement here'}
                </h3>

                <p className="text-[14px] text-text-muted mb-[24px]">
                  {file
                    ? filename
                    : 'Upload a PDF, DOC, or DOCX agreement.'}
                </p>

                <div className="flex flex-wrap justify-center items-center gap-3 mb-[28px]">

                  <span className="font-mono text-[11px] font-medium tracking-[0.05em] bg-paper border border-border px-3.5 py-1.5 rounded-full text-text-muted">
                    .PDF
                  </span>

                  <span className="font-mono text-[11px] font-medium tracking-[0.05em] bg-paper border border-border px-3.5 py-1.5 rounded-full text-text-muted">
                    .DOC
                  </span>

                  <span className="font-mono text-[11px] font-medium tracking-[0.05em] bg-paper border border-border px-3.5 py-1.5 rounded-full text-text-muted">
                    .DOCX
                  </span>

                  <span className="font-mono text-[11px] font-medium tracking-[0.05em] bg-paper border border-border px-3.5 py-1.5 rounded-full text-text-muted">
                    Max 10MB
                  </span>

                </div>

                <div className="bg-ink text-paper group-hover:bg-ink-dark transition-colors px-[22px] py-[10px] rounded-[6px] font-semibold text-[14px]">
                  {file
                    ? 'Choose another file'
                    : 'Choose a file'}
                </div>

              </div>

              <input
                id="file-input"
                type="file"
                className="hidden"
                onChange={
                  handleInputChange
                }
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              />
            </label>

            {/* SELECTED FILE */}
            {file && (
              <div className="mt-5 flex items-center gap-3 p-4 bg-paper border border-border rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-gold/10 text-gold-deep flex items-center justify-center border border-gold/20">
                  <FileIcon className="w-5 h-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink truncate">
                    {filename}
                  </p>

                  <p className="text-xs text-text-muted mt-1">
                    {getFileExtension()}{' '}
                    ·{' '}
                    {(
                      file.size /
                      (1024 * 1024)
                    ).toFixed(2)}{' '}
                    MB
                  </p>
                </div>
              </div>
            )}

          </div>

          {/* UPLOAD BUTTON */}
          <div className="flex flex-col sm:flex-row justify-end gap-3">

            <button
              type="button"
              onClick={() =>
                navigate(
                  '/landlord/agreements'
                )
              }
              className="px-5 py-3 border border-border rounded-lg text-sm font-medium text-text-muted hover:text-ink hover:bg-paper transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleUpload}
              disabled={
                uploading ||
                loadingRentals ||
                rentals.length === 0
              }
              className="flex items-center justify-center gap-2 px-6 py-3 bg-ink text-paper rounded-lg text-sm font-semibold hover:bg-ink-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UploadIcon className="w-4 h-4" />
              Upload Agreement
            </button>

          </div>

        </div>
      )}

      {/* PROCESSING */}
      {step === 'processing' && (
        <div className="rounded-lg border border-border bg-white p-8 max-w-[800px]">

          <div className="flex items-center gap-3">

            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[6px] bg-gold/10 text-gold-deep font-mono text-[11px] font-bold border border-gold/20">
              {getFileExtension()}
            </span>

            <div className="min-w-0 flex-1">

              <p className="truncate text-[14px] font-semibold text-ink">
                {filename}
              </p>

              <div className="mt-[10px] h-[6px] w-full rounded-full bg-paper border border-border overflow-hidden">
                <div
                  className="h-full rounded-full bg-gold transition-all duration-300"
                  style={{
                    width: `${progress}%`,
                  }}
                ></div>
              </div>

            </div>

            <span className="shrink-0 text-[13px] font-mono font-bold text-text-muted">
              {progress}%
            </span>

          </div>

          <div className="mt-[32px] space-y-[14px]">

            {processingSteps.map(
              (label, index) => {
                const completed =
                  progress === 100 ||
                  (progress >=
                    75 &&
                    index <= 2) ||
                  (progress >=
                    50 &&
                    index <= 1) ||
                  (progress > 0 &&
                    index === 0);

                return (
                  <div
                    key={label}
                    className="flex items-center gap-[14px]"
                  >
                    <span
                      className={`grid h-[22px] w-[22px] place-items-center rounded-full text-[11px] font-bold ${completed
                          ? 'bg-gold text-ink-dark shadow-sm'
                          : 'border border-border text-text-faint bg-paper'
                        }`}
                    >
                      {completed ? (
                        <Check
                          size={12}
                          strokeWidth={3}
                        />
                      ) : (
                        index + 1
                      )}
                    </span>

                    <span
                      className={`text-[14px] ${completed
                          ? 'font-semibold text-ink'
                          : 'text-text-faint'
                        }`}
                    >
                      {label}
                    </span>
                  </div>
                );
              }
            )}

          </div>

        </div>
      )}

      {/* DONE */}
      {step === 'done' && (
        <div className="rounded-lg border border-border bg-white p-12 text-center max-w-[800px]">

          <span className="mx-auto grid h-[64px] w-[64px] place-items-center rounded-full bg-[#4C7A5E]/10 text-[#4C7A5E] mb-[20px]">
            <Check
              size={28}
              strokeWidth={2.5}
            />
          </span>

          <p className="font-serif text-[24px] font-medium text-ink mb-[8px]">
            Agreement uploaded successfully
          </p>

          <p className="text-[14.5px] text-text-muted mb-[24px] max-w-md mx-auto leading-relaxed">
            The agreement has been saved and its
            text has been extracted. It is now ready
            for SmartLease AI analysis.
          </p>

          {agreement && (
            <div className="bg-paper border border-border rounded-lg p-4 max-w-md mx-auto mb-8 text-left">

              <p className="text-xs text-text-faint">
                Agreement
              </p>

              <p className="text-sm font-semibold text-ink mt-1">
                {agreement.title ||
                  title}
              </p>

              <p className="text-xs text-text-muted mt-2">
                {agreement.property?.title ||
                  selectedRentalData?.property
                    ?.title ||
                  'Property'}
              </p>

              <p className="text-xs text-text-muted mt-1">
                {agreement.tenant?.name ||
                  selectedRentalData?.tenant
                    ?.name ||
                  'Tenant'}
              </p>

            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-center gap-3">

            {agreement?._id && (
              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/landlord/analysis/${agreement._id}`
                  )
                }
                className="rounded-[6px] bg-ink px-[24px] py-[12px] text-[14px] font-semibold text-paper shadow-sm hover:bg-ink-dark transition-colors"
              >
                View AI Analysis
              </button>
            )}

            <button
              type="button"
              onClick={() =>
                navigate(
                  '/landlord/agreements'
                )
              }
              className="rounded-[6px] border border-border px-[24px] py-[12px] text-[14px] font-semibold text-ink hover:bg-paper transition-colors"
            >
              Back to Agreements
            </button>

            <button
              type="button"
              onClick={resetUpload}
              className="rounded-[6px] border border-border px-[24px] py-[12px] text-[14px] font-semibold text-text-muted hover:bg-paper transition-colors"
            >
              Upload Another
            </button>

          </div>

        </div>
      )}

    </div>
  );
};

export default Upload;