import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Send, Bot, ArrowLeft, ChevronDown } from 'lucide-react';
import api from '../services/api';

const defaultSuggestions = [
  'What is the monthly rent?',
  'What is the security deposit?',
  'What is the notice period?',
  'Are there any risky clauses?',
];

const Chat = () => {
  const { agreementId } = useParams();
  const navigate = useNavigate();

  const [agreement, setAgreement] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const [rentals, setRentals] = useState([]);
  const [agreements, setAgreements] = useState([]);
  const [selectedRentalId, setSelectedRentalId] = useState('');

  const [loading, setLoading] = useState(true);
  const [loadingRentals, setLoadingRentals] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const chatEndRef = useRef(null);

  // =====================================================
  // LOAD RENTALS + AGREEMENTS FOR TENANT
  // =====================================================

  useEffect(() => {
    const loadTenantRentals = async () => {
      if (agreementId) {
        return;
      }

      try {
        setLoadingRentals(true);
        setError('');

        const [rentalsResponse, agreementsResponse] =
          await Promise.all([
            api.get('/rentals/my-rentals'),
            api.get('/agreements/my-agreements'),
          ]);

        console.log(
          'My rentals:',
          rentalsResponse.data
        );

        console.log(
          'My agreements:',
          agreementsResponse.data
        );

        const rentalData =
          rentalsResponse.data.rentals ||
          rentalsResponse.data.data ||
          [];

        const agreementData =
          agreementsResponse.data.agreements ||
          agreementsResponse.data.data ||
          [];

        setRentals(rentalData);
        setAgreements(agreementData);

      } catch (err) {
        console.error(
          'Failed to load tenant rentals:',
          err
        );

        setError(
          err.response?.data?.message ||
          'Failed to load your rentals.'
        );
      } finally {
        setLoadingRentals(false);
        setLoading(false);
      }
    };

    loadTenantRentals();
  }, [agreementId]);

  // =====================================================
  // LOAD AGREEMENT WHEN agreementId EXISTS
  // =====================================================

  useEffect(() => {
    const loadChat = async () => {
      if (!agreementId) {
        return;
      }

      try {
        setLoading(true);
        setError('');

        // -------------------------------------------------
        // Load agreement
        // -------------------------------------------------

        const agreementResponse = await api.get(
          `/ agreements / ${ agreementId } `
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

        // -------------------------------------------------
        // Find rental connected to this agreement
        // -------------------------------------------------

        if (agreementData?.rental) {
          const rentalId =
            typeof agreementData.rental === 'object'
              ? agreementData.rental._id
              : agreementData.rental;

          setSelectedRentalId(rentalId || '');
        }

        // -------------------------------------------------
        // Load previous AI conversation
        // -------------------------------------------------

        try {
          const historyResponse = await api.get(
            `/ ai / agreements / ${ agreementId }/history`
          );

console.log(
  'AI conversation history:',
  historyResponse.data
);

const analyses =
  historyResponse.data.analyses || [];

// Backend returns newest first.
// Reverse it so conversation displays oldest first.
const questionAnalyses = analyses
  .filter(
    (item) =>
      item.type === 'question' &&
      item.input &&
      item.result
  )
  .reverse();

const formattedMessages = [];

questionAnalyses.forEach((item) => {
  formattedMessages.push({
    role: 'user',
    text: item.input,
  });

  formattedMessages.push({
    role: 'assistant',
    text: item.result,
  });
});

setMessages(formattedMessages);

        } catch (historyError) {
  console.log(
    'No conversation history found:',
    historyError.response?.data ||
    historyError.message
  );

  setMessages([]);
}

      } catch (err) {
  console.error(
    'Failed to load agreement chat:',
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

loadChat();
  }, [agreementId]);

// =====================================================
// FIND AGREEMENT FOR SELECTED RENTAL
// =====================================================

const getAgreementForRental = (rentalId) => {
  if (!rentalId) {
    return null;
  }

  return (
    agreements.find((a) => {
      const agreementRentalId =
        typeof a.rental === 'object'
          ? a.rental?._id
          : a.rental;

      return (
        String(agreementRentalId) ===
        String(rentalId)
      );
    }) || null
  );
};

// =====================================================
// RENTAL SELECTION
// =====================================================

const handleRentalChange = (e) => {
  const rentalId = e.target.value;

  setSelectedRentalId(rentalId);
  setError('');

  if (!rentalId) {
    return;
  }

  const selectedAgreement =
    getAgreementForRental(rentalId);

  if (!selectedAgreement) {
    setAgreement(null);
    setMessages([]);
    return;
  }

  navigate(`/chat/${selectedAgreement._id}`);
};

// =====================================================
// AUTO SCROLL
// =====================================================

useEffect(() => {
  chatEndRef.current?.scrollIntoView({
    behavior: 'smooth',
  });
}, [messages, sending]);

// =====================================================
// EXTRACT AI ANSWER
// =====================================================

const getAIResponseText = (data) => {
  if (!data) return '';

  if (typeof data === 'string') {
    return data;
  }

  return (
    data.answer ||
    data.response ||
    data.result ||
    data.content ||
    data.text ||
    ''
  );
};

// =====================================================
// SEND QUESTION
// =====================================================

const handleSend = async (customText = null) => {
  const text = (
    customText !== null
      ? customText
      : inputValue
  ).trim();

  if (!text || sending || !agreementId) {
    return;
  }

  setInputValue('');
  setError('');

  // Show user's message immediately
  setMessages((prev) => [
    ...prev,
    {
      role: 'user',
      text,
    },
  ]);

  try {
    setSending(true);

    const response = await api.post(
      `/ai/agreements/${agreementId}/ask`,
      {
        question: text,
      }
    );

    console.log(
      'AI answer:',
      response.data
    );

    const answer = getAIResponseText(
      response.data
    );

    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        text:
          answer ||
          'I could not generate an answer for that question. Please try asking in a different way.',
      },
    ]);

  } catch (err) {
    console.error(
      'AI question error:',
      err
    );

    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        text:
          err.response?.data?.message ||
          'Sorry, I was unable to process your question. Please try again.',
      },
    ]);

  } finally {
    setSending(false);
  }
};

// =====================================================
// ENTER KEY
// =====================================================

const handleKeyDown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
};

// =====================================================
// DISPLAY DATA
// =====================================================

const agreementTitle =
  agreement?.title ||
  agreement?.originalFileName ||
  'Rental Agreement';

const propertyTitle =
  agreement?.property?.title ||
  'Rental Agreement';

const landlordName =
  agreement?.landlord?.name ||
  'Landlord';

// =====================================================
// FORMAT RENTAL LABEL
// =====================================================

const formatDate = (date) => {
  if (!date) return 'Not set';

  return new Date(date).toLocaleDateString(
    'en-IN',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }
  );
};

const getRentalLabel = (rental) => {
  const propertyName =
    rental?.property?.title ||
    'Rental Property';

  const rent = rental?.monthlyRent
    ? `₹${Number(
      rental.monthlyRent
    ).toLocaleString('en-IN')}/month`
    : '';

  const startDate =
    formatDate(rental?.startDate);

  const endDate =
    formatDate(rental?.endDate);

  return `${propertyName} • ${rent} • ${startDate} – ${endDate}`;
};

// =====================================================
// LOADING
// =====================================================

if (loading || loadingRentals) {
  return (
    <div className="fade-in">
      <div className="flex min-h-[500px] items-center justify-center">
        <p className="text-sm text-text-faint">
          Loading AI chat...
        </p>
      </div>
    </div>
  );
}

// =====================================================
// NO AGREEMENT SELECTED
// =====================================================

if (!agreementId) {
  return (
    <div className="fade-in">

      <div className="rounded-xl2 border border-border bg-white px-6 py-10">

        <div className="mx-auto max-w-2xl">

          {/* Header */}
          <div className="text-center">

            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-gold/10 text-gold-deep">
              <Bot size={24} />
            </div>

            <h2 className="font-display text-xl font-semibold text-ink">
              Select a rental to chat
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-text-muted">
              Select one of your rentals and SmartLease
              will open the agreement linked to that
              rental.
            </p>

          </div>

          {/* Rental Dropdown */}
          <div className="mt-8">

            <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-text-faint">
              Select Rental
            </label>

            <div className="relative">

              <select
                value={selectedRentalId}
                onChange={handleRentalChange}
                className="w-full appearance-none rounded-lg border border-border bg-white px-4 py-3 pr-10 text-sm text-ink outline-none transition focus:border-lease-500"
              >
                <option value="">
                  Select one of your rentals...
                </option>

                {rentals.map((rental) => {
                  const rentalId =
                    rental?._id;

                  const rentalAgreement =
                    getAgreementForRental(
                      rentalId
                    );

                  return (
                    <option
                      key={rentalId}
                      value={rentalId}
                    >
                      {getRentalLabel(rental)}
                      {!rentalAgreement
                        ? ' — No agreement'
                        : ''}
                    </option>
                  );
                })}

              </select>

              <ChevronDown
                size={17}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-faint"
              />

            </div>

          </div>

          {/* Selected rental information */}
          {selectedRentalId && (
            <div className="mt-4">

              {(() => {
                const selectedRental =
                  rentals.find(
                    (rental) =>
                      String(rental._id) ===
                      String(selectedRentalId)
                  );

                const selectedAgreement =
                  getAgreementForRental(
                    selectedRentalId
                  );

                if (!selectedRental) {
                  return null;
                }

                return (
                  <div className="rounded-lg border border-border bg-paper p-4">

                    <p className="text-xs font-medium uppercase tracking-wide text-text-faint">
                      Selected Rental
                    </p>

                    <p className="mt-1 font-display text-sm font-semibold text-ink">
                      {selectedRental?.property?.title ||
                        'Rental Property'}
                    </p>

                    <p className="mt-1 text-xs text-text-muted">
                      {selectedRental?.monthlyRent
                        ? `₹${Number(
                          selectedRental.monthlyRent
                        ).toLocaleString(
                          'en-IN'
                        )}/month`
                        : 'Rent not available'}
                    </p>

                    {selectedAgreement ? (
                      <div className="mt-4 border-t border-border pt-3">

                        <p className="text-xs font-medium uppercase tracking-wide text-text-faint">
                          Agreement
                        </p>

                        <p className="mt-1 text-sm font-medium text-ink">
                          {selectedAgreement.title ||
                            selectedAgreement.originalFileName ||
                            'Rental Agreement'}
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/chat/${selectedAgreement._id}`
                            )
                          }
                          className="mt-3 rounded-lg bg-lease-600 px-4 py-2 text-xs font-medium text-white hover:bg-lease-700"
                        >
                          Open AI Chat
                        </button>

                      </div>
                    ) : (
                      <div className="mt-4 rounded-lg border border-dashed border-border bg-white px-4 py-3">

                        <p className="text-xs font-medium text-ink">
                          No agreement available
                        </p>

                        <p className="mt-1 text-xs leading-relaxed text-text-faint">
                          An agreement has not been
                          uploaded for this rental yet.
                          AI Chat will become available
                          once the landlord uploads the
                          agreement.
                        </p>

                      </div>
                    )}

                  </div>
                );
              })()}

            </div>
          )}

          {/* Error */}
          {error && (
            <p className="mt-4 text-center text-xs text-red-600">
              {error}
            </p>
          )}

        </div>

      </div>

    </div>
  );
}

// =====================================================
// ERROR
// =====================================================

if (error && !agreement) {
  return (
    <div className="fade-in">

      <div className="rounded-xl2 border border-border bg-white px-6 py-10 text-center">

        <h2 className="font-display text-xl font-semibold text-ink">
          Unable to load agreement
        </h2>

        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>

        <div className="mt-5 flex justify-center gap-3">

          <button
            type="button"
            onClick={() =>
              navigate('/chat')
            }
            className="rounded-lg bg-lease-600 px-4 py-2 text-sm font-medium text-white hover:bg-lease-700"
          >
            Back to AI Chat
          </button>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
            className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-ink hover:bg-paper"
          >
            Try Again
          </button>

        </div>

      </div>

    </div>
  );
}

// =====================================================
// UI
// =====================================================

return (
  <div className="fade-in h-[calc(100vh-140px)]">

    <div className="grid h-full gap-5 lg:grid-cols-[280px_1fr]">

      {/* =================================================
            LEFT SIDEBAR
        ================================================= */}

      <aside className="hidden flex-col rounded-xl2 border border-border bg-white p-4 lg:flex">

        <button
          type="button"
          onClick={() =>
            navigate('/chat')
          }
          className="mb-4 flex items-center gap-2 text-xs font-medium text-text-muted hover:text-ink"
        >
          <ArrowLeft size={14} />
          Change Rental
        </button>

        <p className="text-xs font-medium uppercase tracking-wide text-text-faint">
          Agreement
        </p>

        <div className="mt-2 rounded-lg bg-lease-50 p-3">

          <p className="text-sm font-medium text-ink">
            {agreementTitle}
          </p>

          <p className="mt-0.5 text-xs text-text-faint">
            {propertyTitle}
          </p>

          <p className="mt-1 text-xs text-text-faint">
            Landlord: {landlordName}
          </p>

        </div>

        <p className="mt-5 text-xs font-medium uppercase tracking-wide text-text-faint">
          Conversation
        </p>

        <div className="scroll-thin mt-2 flex-1 overflow-y-auto">

          {messages.length === 0 ? (
            <p className="rounded-lg bg-paper px-3 py-3 text-xs leading-relaxed text-text-faint">
              No previous questions. Start a
              conversation about this agreement.
            </p>
          ) : (
            <div className="space-y-2">

              {messages
                .filter(
                  (message) =>
                    message.role === 'user'
                )
                .map((message, index) => (
                  <div
                    key={index}
                    className="rounded-lg bg-paper px-3 py-2.5 text-xs text-text-muted"
                  >
                    {message.text}
                  </div>
                ))}

            </div>
          )}

        </div>

      </aside>

      {/* =================================================
            MAIN CHAT
        ================================================= */}

      <div className="flex h-full flex-col rounded-xl2 border border-border bg-white">

        {/* Header */}
        <div className="border-b border-border px-5 py-4">

          <div className="flex items-center justify-between gap-3">

            <div>
              <p className="font-display text-sm font-semibold text-ink">
                Ask about {agreementTitle}
              </p>

              <p className="mt-1 text-xs text-text-faint">
                AI-generated information is for assistance
                and should not be considered legal advice.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate(`/analysis/${agreementId}`)
              }
              className="hidden rounded-lg border border-border px-3 py-2 text-xs font-medium text-text-muted hover:bg-paper sm:block"
            >
              View Analysis
            </button>

          </div>

        </div>

        {/* Messages */}
        <div className="scroll-thin flex-1 space-y-4 overflow-y-auto px-5 py-5">

          {messages.length === 0 && (
            <div className="flex gap-2.5">

              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-signal-100 text-signal-600">
                <Bot size={15} />
              </span>

              <div className="max-w-[80%] rounded-xl2 rounded-tl-sm border border-border bg-paper px-4 py-2.5 text-sm leading-relaxed text-ink">
                Hello! I can help you understand this
                rental agreement. Ask me about rent,
                deposit, notice period, termination,
                clauses, risks, or any other part of the
                agreement.
              </div>

            </div>
          )}

          {messages.map((message, index) => {

            if (message.role === 'user') {
              return (
                <div
                  key={index}
                  className="flex justify-end"
                >
                  <div className="max-w-[80%] rounded-xl2 rounded-tr-sm bg-lease-600 px-4 py-2.5 text-sm text-white">
                    {message.text}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={index}
                className="flex gap-2.5"
              >

                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-signal-100 text-signal-600">
                  <Bot size={15} />
                </span>

                <div className="max-w-[80%] whitespace-pre-line rounded-xl2 rounded-tl-sm border border-border bg-paper px-4 py-2.5 text-sm leading-relaxed text-ink">
                  {message.text}
                </div>

              </div>
            );
          })}

          {sending && (
            <div className="flex gap-2.5">

              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-signal-100 text-signal-600">
                <Bot size={15} />
              </span>

              <div className="rounded-xl2 rounded-tl-sm border border-border bg-paper px-4 py-2.5 text-sm text-text-faint">
                AI is thinking...
              </div>

            </div>
          )}

          <div ref={chatEndRef} />

        </div>

        {/* Input */}
        <div className="border-t border-border p-4">

          <div className="mb-3 flex flex-wrap gap-2">

            {defaultSuggestions.map(
              (suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  disabled={sending}
                  onClick={() =>
                    handleSend(suggestion)
                  }
                  className="rounded-full border border-border px-3 py-1.5 text-xs text-text-muted hover:bg-paper disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {suggestion}
                </button>
              )
            )}

          </div>

          <div className="flex items-center gap-2 rounded-lg border border-border bg-paper px-3 py-2.5">

            <input
              value={inputValue}
              onChange={(e) =>
                setInputValue(e.target.value)
              }
              onKeyDown={handleKeyDown}
              type="text"
              disabled={sending}
              placeholder="Ask anything about your rental agreement…"
              className="w-full bg-transparent text-sm text-ink placeholder:text-text-faint focus:outline-none disabled:opacity-60"
            />

            <button
              type="button"
              onClick={() => handleSend()}
              disabled={
                sending ||
                !inputValue.trim()
              }
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-lease-600 text-white hover:bg-lease-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send size={16} />
            </button>

          </div>

          {error && (
            <p className="mt-2 text-xs text-red-600">
              {error}
            </p>
          )}

        </div>

      </div>

    </div>

  </div>
);
};

export default Chat;