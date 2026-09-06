import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Loader2, Plus, Clock } from 'lucide-react';
import api from '../services/api';

const Feedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    rating: 5,
    category: 'UI/UX',
    feedback: ''
  });

  const categories = ['UI/UX', 'Agreement Analysis', 'Property Search', 'Feature Request', 'Bug Report', 'Other'];

  useEffect(() => {
    fetchMyFeedbacks();
  }, []);

  const fetchMyFeedbacks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/feedback');
      setFeedbacks(res.data);
      setError(null);
    } catch (err) {
      console.error('Failed to load your feedback:', err);
      setError('Failed to load your past feedback.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRating = (rating) => {
    setFormData({ ...formData, rating });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.feedback.trim()) {
      setError('Please provide feedback details.');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      setSuccess('');
      
      const res = await api.post('/feedback', formData);
      setFeedbacks([res.data, ...feedbacks]);
      
      setFormData({ rating: 5, category: 'UI/UX', feedback: '' });
      setSuccess('Thank you! Your feedback has been submitted successfully.');
      
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error('Submission failed:', err);
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 fade-in pb-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">Platform Feedback</h1>
          <p className="text-text-muted mt-1">Help us improve SmartLease AI by sharing your thoughts.</p>
        </div>
      </div>

      {success && (
        <div className="rounded-lg border border-good-500/20 bg-good-50 px-4 py-3 text-sm text-good-600 font-medium">
          {success}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-bad-500/20 bg-bad-50 px-4 py-3 text-sm text-bad-600 font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Submission Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-border p-6">
            <h2 className="text-lg font-bold text-ink mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-lease-600" />
              Submit Review
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div>
                <label className="block text-sm font-medium text-ink mb-2">Rating</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRating(star)}
                      className="p-1 transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star 
                        className={`w-7 h-7 ${star <= formData.rating ? 'fill-warn-500 text-warn-500' : 'text-line hover:text-warn-300'}`} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-2">Category</label>
                <select 
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-paper border border-border rounded-lg text-sm text-ink focus:outline-none focus:border-lease-500 focus:ring-1 focus:ring-lease-500"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-2">Your Feedback</label>
                <textarea 
                  name="feedback"
                  value={formData.feedback}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Tell us what you liked or what could be improved..."
                  className="w-full px-4 py-3 bg-paper border border-border rounded-lg text-sm text-ink placeholder:text-text-faint focus:outline-none focus:border-lease-500 focus:ring-1 focus:ring-lease-500 resize-none"
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                className="w-full flex justify-center items-center gap-2 py-2.5 bg-lease-600 text-white rounded-lg font-medium hover:bg-lease-700 transition-colors disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Submit Feedback
                  </>
                )}
              </button>

            </form>
          </div>
        </div>

        {/* Past Feedback List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden h-full flex flex-col">
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-bold text-ink flex items-center gap-2">
                <Clock className="w-5 h-5 text-text-muted" />
                Your Past Reviews
              </h2>
            </div>
            
            <div className="p-6 flex-1 bg-paper/30 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="w-8 h-8 text-lease-600 animate-spin" />
                </div>
              ) : feedbacks.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-border shadow-sm">
                    <MessageSquare className="w-8 h-8 text-text-faint" />
                  </div>
                  <h3 className="text-lg font-semibold text-ink">No feedback yet</h3>
                  <p className="text-sm text-text-muted mt-1 max-w-xs mx-auto">
                    You haven't submitted any reviews or feedback yet. We'd love to hear from you!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {feedbacks.map(item => (
                    <div key={item._id} className="bg-white p-5 rounded-xl border border-border shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className="inline-block px-2.5 py-1 bg-paper border border-border rounded-md text-xs font-semibold text-text-muted mb-2">
                            {item.category}
                          </span>
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-3.5 h-3.5 ${i < item.rating ? 'fill-warn-500 text-warn-500' : 'text-line'}`} 
                              />
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-xs text-text-faint mb-1">
                            {new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            item.status === 'archived' ? 'bg-line text-text-muted' : 
                            item.status === 'reviewed' ? 'bg-good-100 text-good-700' : 'bg-lease-50 text-lease-700'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-ink whitespace-pre-wrap">{item.feedback}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Feedback;
