import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BrainCircuit,
  Send,
  User,
  RefreshCw,
  FileText,
} from 'lucide-react';
import api from '../../services/api';

const AiChat = () => {
  const { agreementId } = useParams();
  const navigate = useNavigate();

  const [agreement, setAgreement] = useState(null);
  const [rentals, setRentals] = useState([]);
  const [agreements, setAgreements] = useState([]);

  const [selectedRental, setSelectedRental] = useState('');

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  /*
   * Find agreement belonging to selected rental.
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
   * Load landlord rentals when no agreement
   * has been selected yet.
   *
   * GET requests only — no Gemini usage.
   */
  useEffect(() => {
    const loadRentalSelectionData = async () => {
      setLoading(true);
      setError('');

      try {
        const [rentalsResponse, agreementsResponse] =
          await Promise.all([
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
        setLoading(false);
      }
    };

    if (!agreementId) {
      loadRentalSelectionData();
    }
  }, [agreementId]);

  /*
   * Handle rental selection.
   */
  const handleRentalChange = (e) => {
    const rentalId = e.target.value;

    setSelectedRental(rentalId);

    if (!rentalId) {
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
      `/landlord/chat/${selectedAgreement._id}`
    );
  };

  const suggestedQuestions = agreementId
    ? [
      "What is the tenant's notice period?",
      'Is there a rent increase clause?',
      'What penalties are mentioned?',
      'Who is responsible for painting?',
    ]
    : [];

  /*
   * Load agreement details and previous AI questions/answers.
   *
   * GET requests only.
   * They do NOT consume Gemini requests.
   */
  useEffect(() => {
    const loadChatData = async () => {
      if (!agreementId) {
        return;
      }

      setLoading(true);
      setError('');

      try {
        const agreementResponse = await api.get(
          `/agreements/${agreementId}`
        );

        const agreementData =
          agreementResponse.data?.agreement ||
          agreementResponse.data;

        setAgreement(agreementData);

        const historyResponse = await api.get(
          `/ai/agreements/${agreementId}/history`
        );

        const analyses =
          historyResponse.data?.analyses || [];

        const questionAnalyses = analyses
          .filter(
            (analysis) =>
              analysis.type === 'question'
          )
          .reverse();

        const historyMessages = [];

        questionAnalyses.forEach((analysis) => {
          if (analysis.input) {
            historyMessages.push({
              role: 'user',
              text: analysis.input,
            });
          }

          if (analysis.result) {
            historyMessages.push({
              role: 'ai',
              text: analysis.result,
            });
          }
        });

        const agreementName =
          agreementData?.title ||
          agreementData?.originalFileName ||
          'this agreement';

        const initialMessage = {
          role: 'ai',
          text:
            historyMessages.length > 0
              ? `Welcome back. I can help you understand "${agreementName}". You can ask another question about this agreement.`
              : `Hello! I can help you understand the agreement "${agreementName}". What would you like to know about it?`,
        };

        setMessages([
          initialMessage,
          ...historyMessages,
        ]);
      } catch (err) {
        console.error(
          'Failed to load AI chat:',
          err
        );

        setError(
          err.response?.data?.message ||
          'Failed to load AI chat.'
        );

        setMessages([
          {
            role: 'ai',
            text:
              'I could not load the agreement conversation. Please try again.',
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadChatData();
  }, [agreementId]);

  /*
   * Send question to Gemini through existing backend.
   *
   * IMPORTANT:
   * This POST request consumes one Gemini request.
   */
  const handleSend = async (e) => {
    e?.preventDefault();

    const question = input.trim();

    if (!question || sending) {
      return;
    }

    if (!agreementId) {
      setMessages((previous) => [
        ...previous,
        {
          role: 'user',
          text: question,
        },
        {
          role: 'ai',
          text:
            'Please select a rental agreement before asking agreement-related AI questions.',
        },
      ]);

      setInput('');
      return;
    }

    const userMessage = {
      role: 'user',
      text: question,
    };

    setMessages((previous) => [
      ...previous,
      userMessage,
    ]);

    setInput('');
    setSending(true);
    setError('');

    try {
      const response = await api.post(
        `/ai/agreements/${agreementId}/ask`,
        {
          question,
        }
      );

      const answer =
        response.data?.answer ||
        response.data?.result ||
        response.data?.response ||
        'The AI did not return an answer.';

      setMessages((previous) => [
        ...previous,
        {
          role: 'ai',
          text: answer,
        },
      ]);
    } catch (err) {
      console.error(
        'Failed to send AI question:',
        err
      );

      const errorMessage =
        err.response?.data?.message ||
        'Failed to get an AI response. Please try again.';

      setError(errorMessage);

      setMessages((previous) => [
        ...previous,
        {
          role: 'ai',
          text: errorMessage,
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleSuggest = (question) => {
    setInput(question);
  };

  /*
   * ============================================================
   * RENTAL SELECTION PAGE
   * ============================================================
   */

  if (!agreementId && loading) {
    return (
      <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto fade-in">

        <div className="flex items-center gap-4 mb-4">
          <Link
            to="/landlord"
            className="p-2 text-text-muted hover:bg-white rounded-lg border border-transparent hover:border-border transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div>
            <h1 className="text-xl font-display font-bold text-ink flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-lease-600" />
              AI Chat
            </h1>

            <p className="text-xs text-text-muted mt-0.5">
              Select a rental to continue
            </p>
          </div>
        </div>

        <div className="flex-1 bg-white border border-border rounded-xl shadow-sm flex items-center justify-center">
          <RefreshCw className="w-8 h-8 text-lease-600 animate-spin" />
        </div>

      </div>
    );
  }

  if (!agreementId) {
    return (
      <div className="fade-in max-w-4xl mx-auto">

        <div className="flex items-center gap-4 mb-6">

          <Link
            to="/landlord"
            className="p-2 text-text-muted hover:bg-white rounded-lg border border-transparent hover:border-border transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div>
            <h1 className="text-xl font-display font-bold text-ink flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-lease-600" />
              AI Chat
            </h1>

            <p className="text-xs text-text-muted mt-1">
              Select a rental agreement to start an AI conversation.
            </p>
          </div>

        </div>

        {error && (
          <div className="mb-4 bg-warn-50 border border-warn-500/20 rounded-lg px-4 py-3">
            <p className="text-sm text-warn-800">
              {error}
            </p>
          </div>
        )}

        <div className="bg-white border border-border rounded-xl shadow-sm p-6">

          <div className="flex items-center gap-3 mb-5">

            <div className="w-10 h-10 rounded-lg bg-lease-50 flex items-center justify-center">
              <FileText className="w-5 h-5 text-lease-600" />
            </div>

            <div>
              <h2 className="font-semibold text-ink">
                Select Rental
              </h2>

              <p className="text-xs text-text-muted mt-1">
                Choose one of your rentals to open its agreement.
              </p>
            </div>

          </div>

          <select
            value={selectedRental}
            onChange={handleRentalChange}
            className="w-full px-4 py-3 bg-paper border border-border rounded-lg text-sm font-medium text-ink focus:outline-none focus:border-lease-500 focus:ring-1 focus:ring-lease-500"
          >
            <option value="">
              Select a rental...
            </option>

            {rentals.map((rental) => {
              const property =
                rental.property || {};

              const selectedAgreement =
                getAgreementForRental(rental._id);

              return (
                <option
                  key={rental._id}
                  value={rental._id}
                >
                  {property.title ||
                    property.name ||
                    'Rental Property'}
                  {' — '}
                  ₹
                  {Number(
                    rental.monthlyRent || 0
                  ).toLocaleString('en-IN')}
                  /month
                  {!selectedAgreement
                    ? ' — No agreement'
                    : ''}
                </option>
              );
            })}
          </select>

          {rentals.length === 0 && (
            <div className="mt-5 text-center py-8">

              <FileText className="w-10 h-10 text-text-faint mx-auto mb-3" />

              <p className="text-sm font-medium text-ink">
                No rentals found
              </p>

              <p className="text-xs text-text-muted mt-1">
                Your rentals will appear here once they are available.
              </p>

            </div>
          )}

        </div>

      </div>
    );
  }

  /*
   * ============================================================
   * AGREEMENT CHAT
   * ============================================================
   */

  if (loading) {
    return (
      <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto fade-in">

        <div className="flex items-center gap-4 mb-4 flex-shrink-0">

          <Link
            to="/landlord/chat"
            className="p-2 text-text-muted hover:bg-white rounded-lg border border-transparent hover:border-border transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div>
            <h1 className="text-xl font-display font-bold text-ink flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-lease-600" />
              AI Chat
            </h1>

            <p className="text-xs text-text-muted mt-0.5">
              Loading conversation...
            </p>
          </div>

        </div>

        <div className="flex-1 bg-white border border-border rounded-xl shadow-sm flex items-center justify-center">

          <div className="text-center">

            <RefreshCw className="w-8 h-8 text-lease-600 animate-spin mx-auto mb-3" />

            <p className="text-sm text-text-muted">
              Loading AI conversation...
            </p>

          </div>

        </div>

      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto fade-in">

      {/* Header */}
      <div className="flex items-center gap-4 mb-4 flex-shrink-0">

        <Link
          to="/landlord/chat"
          className="p-2 text-text-muted hover:bg-white rounded-lg border border-transparent hover:border-border transition-all"
          title="Change Rental"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <div className="min-w-0">

          <h1 className="text-xl font-display font-bold text-ink flex items-center gap-2">

            <BrainCircuit className="w-5 h-5 text-lease-600" />

            Ask AI About This Agreement

          </h1>

          {agreement && (
            <div className="flex items-center gap-1.5 mt-1 text-xs text-text-muted">

              <FileText className="w-3.5 h-3.5" />

              <span className="truncate max-w-[400px]">
                {agreement.title ||
                  agreement.originalFileName ||
                  'Rental Agreement'}
              </span>

            </div>
          )}

          <p className="text-xs text-text-muted mt-1">
            AI-generated information is for assistance and should not
            be considered legal advice.
          </p>

        </div>

      </div>

      {/* Error */}
      {error && (
        <div className="mb-3 bg-bad-50 border border-bad-500/20 rounded-lg px-4 py-3 flex-shrink-0">
          <p className="text-sm text-bad-700">
            {error}
          </p>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 bg-white border border-border rounded-t-xl shadow-sm flex flex-col overflow-hidden">

        <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-thin">

          {messages.map((msg, idx) => (

            <div
              key={idx}
              className={`flex gap-4 ${msg.role === 'user'
                  ? 'justify-end'
                  : 'justify-start'
                }`}
            >

              {msg.role === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-lease-100 flex items-center justify-center flex-shrink-0">

                  <BrainCircuit className="w-4 h-4 text-lease-600" />

                </div>
              )}

              <div
                className={`max-w-[80%] rounded-2xl p-4 text-sm shadow-sm whitespace-pre-line ${msg.role === 'user'
                    ? 'bg-lease-600 text-white rounded-tr-sm'
                    : 'bg-paper border border-border text-ink rounded-tl-sm'
                  }`}
              >
                {msg.text}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-ink flex items-center justify-center flex-shrink-0">

                  <User className="w-4 h-4 text-white" />

                </div>
              )}

            </div>

          ))}

          {sending && (
            <div className="flex gap-4 justify-start">

              <div className="w-8 h-8 rounded-full bg-lease-100 flex items-center justify-center flex-shrink-0">

                <BrainCircuit className="w-4 h-4 text-lease-600" />

              </div>

              <div className="bg-paper border border-border text-text-muted rounded-2xl rounded-tl-sm p-4 text-sm flex items-center gap-2">

                <RefreshCw className="w-4 h-4 animate-spin" />

                Thinking...

              </div>

            </div>
          )}

        </div>

        {messages.length === 1 && !sending && (
          <div className="p-4 bg-paper/50 border-t border-border flex flex-wrap gap-2">

            {suggestedQuestions.map((question, idx) => (
              <button
                key={idx}
                onClick={() =>
                  handleSuggest(question)
                }
                className="px-3 py-1.5 bg-white border border-border rounded-full text-xs font-medium text-ink hover:border-lease-500 hover:text-lease-600 transition-colors"
              >
                {question}
              </button>
            ))}

          </div>
        )}

        <div className="p-4 border-t border-border bg-white">

          <form
            onSubmit={handleSend}
            className="relative flex items-center"
          >

            <input
              type="text"
              value={input}
              onChange={(e) =>
                setInput(e.target.value)
              }
              placeholder="Ask a question about this agreement..."
              disabled={sending}
              className="w-full pl-4 pr-12 py-3 bg-paper border border-border rounded-xl text-sm focus:outline-none focus:border-lease-500 focus:ring-1 focus:ring-lease-500 shadow-inner disabled:opacity-60"
            />

            <button
              type="submit"
              disabled={
                !input.trim() ||
                sending
              }
              className="absolute right-2 p-2 bg-lease-600 text-white rounded-lg hover:bg-lease-700 transition-colors disabled:opacity-50 disabled:hover:bg-lease-600"
            >
              {sending ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>

          </form>

          <p className="text-[11px] text-text-muted mt-2">
            Questions are answered using the contents of this
            agreement.
          </p>

        </div>

      </div>

    </div>
  );
};

export default AiChat;