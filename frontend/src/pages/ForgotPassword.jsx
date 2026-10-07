import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, ShieldCheck, Loader2, KeyRound } from 'lucide-react';
import api from '../services/api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await api.post('/auth/forgot-password/send-otp', { email });
      
      setOtpSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      setError('Please enter the OTP');
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError('OTP must be exactly 6 digits.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const res = await api.post('/auth/forgot-password/verify-otp', { email, otp });
      
      if (res.data.resetToken) {
        navigate(`/reset-password/${res.data.resetToken}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
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
          <p className="text-text-muted">
            {otpSent ? "Enter the verification code sent to your email" : "Enter your email and we'll send you a verification code"}
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-border p-8">
          
          <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="space-y-6 fade-in">
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
                  disabled={otpSent}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-paper border border-border rounded-lg text-sm text-ink focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            {otpSent && (
              <div className="animate-in fade-in duration-300">
                <label htmlFor="otp" className="block text-sm font-medium text-ink mb-2">
                  Verification Code (OTP)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <KeyRound className="w-5 h-5 text-text-faint" />
                  </div>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    value={otp}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setOtp(value);
                      setError(null);
                    }}
                    className="w-full pl-11 pr-4 py-3 tracking-widest bg-paper border border-border rounded-lg text-sm text-ink focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors"
                    placeholder="000000"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 bg-ink text-white rounded-lg font-medium hover:bg-ink-dark transition-colors disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {otpSent ? "Verify & Continue" : "Send Verification Code"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            
            {otpSent && (
               <div className="text-center mt-4">
                 <button 
                   type="button" 
                   onClick={() => {
                     setOtpSent(false);
                     setOtp('');
                     setError(null);
                   }}
                   className="text-sm font-medium text-gold-deep hover:text-ink transition-colors"
                 >
                   Change email address
                 </button>
               </div>
            )}

            <div className="text-center mt-6">
              <Link to="/auth" className="text-sm font-medium text-text-muted hover:text-ink transition-colors inline-flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Back to login
              </Link>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

