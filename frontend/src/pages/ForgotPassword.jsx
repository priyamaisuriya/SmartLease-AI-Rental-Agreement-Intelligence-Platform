import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, ShieldCheck, Loader2 } from 'lucide-react';
import api from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [resetLink, setResetLink] = useState(''); // FOR DEVELOPMENT ONLY

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const res = await api.post('/auth/forgot-password', { email });
      
      setSuccess(true);
      // NOTE: In a real app this link would be sent to the user's email.
      // We display it here just for local testing since we don't have an email provider setup.
      if (res.data.resetUrl) {
        setResetLink(res.data.resetUrl);
      }
      
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper p-4">
      <div className="w-full max-w-md">
        
        {/* Header */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center justify-center w-12 h-12 bg-gold/10 rounded-xl mb-6">
            <ShieldCheck className="w-6 h-6 text-gold" />
          </Link>
          <h1 className="text-3xl font-display font-bold text-ink mb-2">Reset Password</h1>
          <p className="text-text-muted">Enter your email and we'll send you a reset link</p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-border p-8">
          
          {success ? (
            <div className="text-center fade-in">
              <div className="w-16 h-16 bg-good-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-good-600" />
              </div>
              <h2 className="text-xl font-bold text-ink mb-3">Check your email</h2>
              <p className="text-text-muted text-sm mb-6">
                We've sent password reset instructions to <span className="font-medium text-ink">{email}</span>
              </p>
              
              {/* DEVELOPMENT ONLY BLOCK */}
              {resetLink && (
                <div className="bg-lease-50 border border-lease-200 rounded-lg p-4 mb-6 text-left">
                  <p className="text-xs font-bold text-lease-800 uppercase tracking-wider mb-2">Dev Mode Note:</p>
                  <p className="text-sm text-lease-700 mb-3">
                    Normally this would be emailed to you. For testing, click the link below to reset your password:
                  </p>
                  <a href={resetLink} className="text-sm text-blue-600 underline font-medium break-all">
                    {resetLink}
                  </a>
                </div>
              )}
              {/* END DEVELOPMENT ONLY BLOCK */}

              <Link 
                to="/auth"
                className="w-full flex items-center justify-center gap-2 py-3 bg-paper border border-border text-ink rounded-lg font-medium hover:bg-line/30 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 fade-in">
              {error && (
                <div className="p-3 bg-bad-50 border border-bad-200 text-bad-700 text-sm rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-ink mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-text-faint" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-paper border border-border rounded-lg text-sm text-ink focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 bg-ink text-white rounded-lg font-medium hover:bg-ink-dark transition-colors disabled:opacity-70"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Send Reset Link
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center mt-6">
                <Link to="/auth" className="text-sm font-medium text-text-muted hover:text-ink transition-colors">
                  Remembered your password? Log in
                </Link>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
