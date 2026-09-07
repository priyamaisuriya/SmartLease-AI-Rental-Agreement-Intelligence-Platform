import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import api from '../services/api';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await api.post(`/auth/reset-password/${token}`, { password });
      
      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/auth');
      }, 3000);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired reset token. Please try again.');
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
          <h1 className="text-3xl font-display font-bold text-ink mb-2">New Password</h1>
          <p className="text-text-muted">Create a strong new password for your account</p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-border p-8">
          
          {success ? (
            <div className="text-center fade-in">
              <div className="w-16 h-16 bg-good-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="w-8 h-8 text-good-600" />
              </div>
              <h2 className="text-xl font-bold text-ink mb-3">Password Reset!</h2>
              <p className="text-text-muted text-sm mb-6">
                Your password has been successfully updated. You will be redirected to the login page momentarily.
              </p>
              <Link 
                to="/auth"
                className="w-full flex items-center justify-center py-3 bg-ink text-white rounded-lg font-medium hover:bg-ink-dark transition-colors"
              >
                Go to Login
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
                <label htmlFor="password" className="block text-sm font-medium text-ink mb-2">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-text-faint" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-paper border border-border rounded-lg text-sm text-ink focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors"
                    placeholder="At least 8 characters"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-ink mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-text-faint" />
                  </div>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-paper border border-border rounded-lg text-sm text-ink focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors"
                    placeholder="Repeat your new password"
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
                    Reset Password
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
