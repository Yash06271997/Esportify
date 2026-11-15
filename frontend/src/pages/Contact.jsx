import React, { useState } from 'react';
import { Mail, MessageCircle, Send, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading]  = useState(false);
  const [success, setSuccess]  = useState(false);
  const [error, setError]      = useState(null);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      await api.post('/contact', form);
      setSuccess(true);
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="border-b border-cyber-border pb-6">
        <p className="pixel-heading text-cyber-purple text-xs mb-2">REACH US</p>
        <h1 className="text-4xl font-black text-cyber-text">Contact Us</h1>
        <p className="text-cyber-muted text-sm mt-2">Have questions, feedback, or issues? We'd love to hear from you.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Info sidebar */}
        <div className="space-y-5">
          <div className="cyber-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-cyber-purple/20 border border-cyber-purple/30 p-2">
                <Mail className="w-4 h-4 text-cyber-purple" />
              </div>
              <div>
                <p className="font-bold text-cyber-text text-sm">Email</p>
                <p className="text-xs text-cyber-muted">support@esportify.gg</p>
              </div>
            </div>
          </div>
          <div className="cyber-card p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-cyber-cyan/20 border border-cyber-cyan/30 p-2">
                <MessageCircle className="w-4 h-4 text-cyber-cyan" />
              </div>
              <div>
                <p className="font-bold text-cyber-text text-sm">Response Time</p>
                <p className="text-xs text-cyber-muted">Within 24–48 hours</p>
              </div>
            </div>
          </div>
          <div className="cyber-card-purple p-5">
            <p className="pixel-heading text-cyber-purple text-xs mb-2">SUPPORT HOURS</p>
            <p className="text-xs text-cyber-muted">Monday – Friday</p>
            <p className="text-sm font-bold text-cyber-text">10:00 AM – 6:00 PM IST</p>
          </div>
        </div>

        {/* Form */}
        <div className="md:col-span-2 cyber-card p-6">
          {success ? (
            <div className="text-center py-10">
              <CheckCircle className="w-14 h-14 text-cyber-green mx-auto mb-4" />
              <h2 className="text-xl font-black text-cyber-text mb-2">Message Sent!</h2>
              <p className="text-cyber-muted text-sm mb-5">We'll get back to you within 24–48 hours.</p>
              <button onClick={() => setSuccess(false)} className="cyber-btn-outline text-sm px-5 py-2">
                Send Another
              </button>
            </div>
          ) : (
            <>
              <h2 className="font-black text-cyber-text text-sm uppercase tracking-widest mb-5 pb-3 border-b border-cyber-border">
                Send a Message
              </h2>

              {error && (
                <div className="cyber-card border-red-700/50 p-4 flex items-center gap-3 mb-4">
                  <AlertCircle className="w-4 h-4 text-cyber-red shrink-0" />
                  <p className="text-sm text-cyber-red">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="cyber-label">Your Name *</label>
                    <input type="text" name="name" required value={form.name} onChange={handleChange}
                      className="cyber-input" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="cyber-label">Email Address *</label>
                    <input type="email" name="email" required value={form.email} onChange={handleChange}
                      className="cyber-input" placeholder="you@example.com" />
                  </div>
                </div>
                <div>
                  <label className="cyber-label">Subject *</label>
                  <input type="text" name="subject" required value={form.subject} onChange={handleChange}
                    className="cyber-input" placeholder="e.g. Issue with team registration" />
                </div>
                <div>
                  <label className="cyber-label">Message *</label>
                  <textarea name="message" required rows={5} value={form.message} onChange={handleChange}
                    className="cyber-input resize-none" placeholder="Describe your question or issue..." />
                </div>
                <button type="submit" disabled={loading} className="cyber-btn-primary w-full py-3 text-sm">
                  {loading
                    ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>Sending...</>
                    : <><Send className="w-4 h-4" /> Send Message</>}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;
