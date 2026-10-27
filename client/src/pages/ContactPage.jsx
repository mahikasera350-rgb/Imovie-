import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, HelpCircle, ChevronDown } from 'lucide-react';
import { toast } from 'react-toastify';

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      toast.success('Your message has been received! Our support team will respond within 24 hours.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setSending(false);
    }, 600);
  };

  const faqs = [
    {
      q: 'How does seat holding work when booking tickets?',
      a: 'When you select seats and proceed to review, IMovies locks those seats for 5 minutes under your secure session. Other customers will see them as "On Hold" in real time, preventing concurrent double-booking.',
    },
    {
      q: 'Can I cancel my confirmed movie booking?',
      a: 'Yes! Eligible bookings can be cancelled anytime before the scheduled showtime starts from your "My Bookings" dashboard. Once cancelled, your seats are immediately released and full refund tracking is initiated.',
    },
    {
      q: 'What is Development Demo Payment Mode?',
      a: 'Demo Payment Mode is a simulated payment gateway created for testing full booking lifecycles safely without charging real credit cards. You can test both approval and decline scenarios.',
    },
  ];

  return (
    <div className="container py-5">
      <div className="mx-auto" style={{ maxWidth: '880px' }}>
        <div className="text-center mb-5">
          <h1 className="fw-extrabold text-light mb-2">Help Center & Contact Support</h1>
          <p className="text-secondary">
            Have questions about your booking, refund, or theatre experience? We're here 24/7 to assist you.
          </p>
        </div>

        <div className="row g-4 mb-5">
          {/* Contact Details & Info */}
          <div className="col-12 col-md-5">
            <div className="p-4 rounded-3 bg-cinematic-card border border-secondary h-100">
              <h5 className="fw-bold text-light mb-3">Customer Support</h5>
              <div className="d-flex flex-column gap-3 small text-secondary mb-4">
                <div className="d-flex align-items-center gap-3">
                  <div className="p-2 rounded bg-dark border border-secondary text-danger">
                    <Mail size={18} />
                  </div>
                  <div>
                    <strong className="text-light d-block">Email Inquiries</strong>
                    <span>support@imovies.com</span>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-3">
                  <div className="p-2 rounded bg-dark border border-secondary text-danger">
                    <Phone size={18} />
                  </div>
                  <div>
                    <strong className="text-light d-block">Helpline (Toll Free)</strong>
                    <span>+1 (800) 555-IMOV</span>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-3">
                  <div className="p-2 rounded bg-dark border border-secondary text-danger">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <strong className="text-light d-block">Corporate Headquarters</strong>
                    <span>1540 Broadway, Times Square, New York, NY</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded bg-dark border border-secondary small text-secondary">
                <strong className="text-warning d-block mb-1">Instant E-Ticket Delivery:</strong>
                <span>Once verified, your digital pass with booking reference is generated immediately.</span>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="col-12 col-md-7">
            <div className="p-4 rounded-3 bg-cinematic-card border border-secondary">
              <h5 className="fw-bold text-light mb-3">Send Us a Message</h5>
              <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                <div className="row g-2">
                  <div className="col-6">
                    <label className="form-label small text-secondary">Your Name</label>
                    <input
                      type="text"
                      required
                      className="form-control form-control-sm bg-dark border-secondary text-light py-2"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small text-secondary">Email Address</label>
                    <input
                      type="email"
                      required
                      className="form-control form-control-sm bg-dark border-secondary text-light py-2"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label small text-secondary">Subject / Booking Ref</label>
                  <input
                    type="text"
                    required
                    className="form-control form-control-sm bg-dark border-secondary text-light py-2"
                    placeholder="e.g. Booking Cancellation Query"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label small text-secondary">Message</label>
                  <textarea
                    rows="3"
                    required
                    className="form-control form-control-sm bg-dark border-secondary text-light py-2"
                    placeholder="How can our support team assist you today?"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="btn btn-cinema-red py-2.5 d-flex align-items-center justify-content-center gap-2 fw-semibold"
                >
                  <Send size={16} />
                  {sending ? 'Sending Message...' : 'Submit Message'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="pt-4 border-top border-secondary">
          <h4 className="fw-bold text-light mb-4 text-center">Frequently Asked Questions</h4>
          <div className="d-flex flex-column gap-3">
            {faqs.map((f, i) => (
              <div key={i} className="p-3.5 rounded bg-cinematic-card border border-secondary">
                <h6 className="fw-bold text-light mb-2">{f.q}</h6>
                <p className="text-secondary small mb-0">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
