'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, CheckCircle, ArrowLeft, ArrowRight, CreditCard } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const TOTAL_MANDATORY_STEPS = 4;
const TOTAL_STEPS = 6;

export default function SignupPage() {
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    countryCode: '+91',
    password: '', 
    confirmPassword: '',
    company: '', 
    profession: '',
    address: '',
    gstRegistered: false,
    gstin: '',
    plan: 'monthly',
    paymentMethod: 'card' as 'card' | 'upi',
    upiId: '',
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
  });

  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const setF = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value }));
    setError('');
  };

  const handleNext = () => {
    setError('');
    if (step === 1 && !form.name.trim()) return setError('Please enter your full name.');
    
    if (step === 2) {
      if (!form.email.trim()) return setError('Please enter your email.');
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) return setError('Please enter a valid email address.');
    }
    
    if (step === 3 && !form.phone.trim()) return setError('Please enter your phone number.');
    
    if (step === 4) {
      if (!form.password) return setError('Please enter a password.');
      if (form.password.length < 8) return setError('Password must be at least 8 characters.');
      if (!/\d/.test(form.password)) return setError('Password must contain at least one number.');
      if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
    }
    
    setStep(s => Math.min(s + 1, TOTAL_STEPS));
  };

  const handleBack = () => {
    setError('');
    setStep(s => Math.max(s - 1, 1));
  };

  const submitSignup = async (addPaymentMethod: boolean) => {
    setLoading(true);
    setError('');

    const mockRazorpayCustomerId = addPaymentMethod ? `cust_mock_${Math.random().toString(36).substring(2, 10)}` : null;
    const mockRazorpayMandateId = addPaymentMethod ? `mandate_mock_${Math.random().toString(36).substring(2, 10)}` : null;

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { 
          name: form.name, 
          phone: `${form.countryCode} ${form.phone}`,
          company_name: form.company || form.name, 
          profession: form.profession,
          business_address: form.address,
          gst_registered: form.gstRegistered,
          gstin: form.gstin,
          payment_method_added: addPaymentMethod,
          payment_method: addPaymentMethod ? form.paymentMethod : null,
          razorpay_customer_id: mockRazorpayCustomerId,
          razorpay_mandate_id: mockRazorpayMandateId,
        },
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setDone(true);
    setLoading(false);
  };

  if (done) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--content-bg)', padding: '24px',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}>
        <div style={{ textAlign: 'center', maxWidth: '380px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'var(--success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <CheckCircle size={32} color="var(--success)" />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 10px' }}>
            Check your email
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 24px' }}>
            We sent a confirmation link to <strong>{form.email}</strong>. Click it to activate your account and start your 7-day free trial.
          </p>
          <Link href="/login" style={{
            display: 'inline-block', padding: '11px 28px',
            background: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)',
            borderRadius: '10px', textDecoration: 'none', fontSize: '14px', fontWeight: 600,
          }}>
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '14px 16px',
    border: '1px solid var(--border)', borderRadius: '12px',
    background: 'var(--card-bg)', color: 'var(--text-primary)',
    fontSize: '16px', outline: 'none', transition: 'border-color 0.15s',
    boxSizing: 'border-box',
    marginBottom: '8px'
  };

  // Progress logic: hits 100% after step 4. Optional step 5 keeps it 100%. Checkout keeps it 100%.
  const progressPercent = Math.min((step / TOTAL_MANDATORY_STEPS) * 100, 100);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      background: 'var(--content-bg)',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      
      {/* Header with Progress Bar */}
      <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/deskflo.png" alt="Deskflo Logo" style={{ height: '28px', width: 'auto', objectFit: 'contain' }} />
          <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>Deskflo</span>
        </div>
        
        {step <= TOTAL_STEPS && (
          <div style={{ width: '100%', maxWidth: '480px', height: '6px', background: 'var(--border-light)', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ 
              height: '100%', background: 'var(--accent)', 
              width: `${progressPercent}%`, transition: 'width 0.3s ease' 
            }} />
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px 60px' }}>
        <div style={{ width: '100%', maxWidth: '480px' }}>
          
          {error && (
            <div style={{
              padding: '12px 16px', borderRadius: '10px', marginBottom: '24px',
              background: 'var(--error-light)', border: '1px solid var(--error)',
              color: 'var(--error)', fontSize: '14px', fontWeight: 500,
            }}>
              {error}
            </div>
          )}

          {/* STEP 1: Name */}
          {step === 1 && (
            <div className="fade-in">
              <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px', letterSpacing: '-0.5px' }}>
                What's your full name?
              </h1>
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', margin: '0 0 32px' }}>
                This is how clients will see you on the platform.
              </p>
              <input
                autoFocus
                required type="text" value={form.name} onChange={setF('name')}
                placeholder="e.g. Rahul Sharma"
                style={inputStyle}
                onKeyDown={(e) => e.key === 'Enter' && handleNext()}
              />
              <div style={{ marginTop: '32px' }}>
                <button onClick={handleNext} style={primaryBtnStyle}>Continue <ArrowRight size={18} /></button>
              </div>
              <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)', marginTop: '24px' }}>
                Already have an account? <Link href="/login" style={{ color: 'var(--accent-dark)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
              </p>
            </div>
          )}

          {/* STEP 2: Email */}
          {step === 2 && (
            <div className="fade-in">
              <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px', letterSpacing: '-0.5px' }}>
                What's your email address?
              </h1>
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', margin: '0 0 32px' }}>
                We'll use this to secure your account.
              </p>
              <input
                autoFocus
                required type="email" value={form.email} onChange={setF('email')}
                placeholder="you@example.com"
                style={inputStyle}
                onKeyDown={(e) => e.key === 'Enter' && handleNext()}
              />
              <div style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
                <button onClick={handleBack} style={secondaryBtnStyle}><ArrowLeft size={18} /></button>
                <button onClick={handleNext} style={{...primaryBtnStyle, flex: 1}}>Continue <ArrowRight size={18} /></button>
              </div>
            </div>
          )}

          {/* STEP 3: Phone */}
          {step === 3 && (
            <div className="fade-in">
              <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px', letterSpacing: '-0.5px' }}>
                Your phone number?
              </h1>
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', margin: '0 0 32px' }}>
                Used for OTP verification and WhatsApp reminders.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <select 
                  value={form.countryCode} 
                  onChange={setF('countryCode')}
                  style={{ ...inputStyle, width: '110px', padding: '14px 10px', appearance: 'none' }}
                >
                  <option value="+91">+91 (IN)</option>
                  <option value="+1">+1 (US)</option>
                  <option value="+44">+44 (UK)</option>
                  <option value="+61">+61 (AU)</option>
                </select>
                <input
                  autoFocus
                  required type="tel" value={form.phone} onChange={setF('phone')}
                  placeholder="98765 43210"
                  style={{ ...inputStyle, flex: 1 }}
                  onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                />
              </div>
              <div style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
                <button onClick={handleBack} style={secondaryBtnStyle}><ArrowLeft size={18} /></button>
                <button onClick={handleNext} style={{...primaryBtnStyle, flex: 1}}>Continue <ArrowRight size={18} /></button>
              </div>
            </div>
          )}

          {/* STEP 4: Password */}
          {step === 4 && (
            <div className="fade-in">
              <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px', letterSpacing: '-0.5px' }}>
                Create a password
              </h1>
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', margin: '0 0 32px' }}>
                Must be at least 8 characters and contain a number.
              </p>
              
              <div style={{ position: 'relative', marginBottom: '16px' }}>
                <input
                  autoFocus
                  required type={showPw ? 'text' : 'password'} value={form.password} onChange={setF('password')}
                  placeholder="Password"
                  style={{ ...inputStyle, paddingRight: '46px', marginBottom: 0 }}
                  onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                />
                <button
                  type="button" onClick={() => setShowPw(v => !v)}
                  style={eyeBtnStyle}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div style={{ position: 'relative' }}>
                <input
                  required type={showConfirmPw ? 'text' : 'password'} value={form.confirmPassword} onChange={setF('confirmPassword')}
                  placeholder="Confirm Password"
                  style={{ ...inputStyle, paddingRight: '46px' }}
                  onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                />
                <button
                  type="button" onClick={() => setShowConfirmPw(v => !v)}
                  style={eyeBtnStyle}
                >
                  {showConfirmPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
                <button onClick={handleBack} style={secondaryBtnStyle}><ArrowLeft size={18} /></button>
                <button onClick={handleNext} style={{...primaryBtnStyle, flex: 1}}>Continue <ArrowRight size={18} /></button>
              </div>
            </div>
          )}

          {/* STEP 5: Optional Business Details */}
          {step === 5 && (
            <div className="fade-in">
              <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px', letterSpacing: '-0.5px' }}>
                Business Details <span style={{ color: 'var(--text-muted)', fontSize: '18px', fontWeight: 500 }}>(Optional)</span>
              </h1>
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', margin: '0 0 32px' }}>
                Tailor your invoice letterhead and portal. Skip anything you don't have.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Business / Freelancer Display Name</label>
                  <input type="text" value={form.company} onChange={setF('company')} placeholder="Defaults to full name" style={inputStyle} />
                </div>
                
                <div>
                  <label style={labelStyle}>Profession / Service</label>
                  <select value={form.profession} onChange={setF('profession')} style={{ ...inputStyle, appearance: 'none' }}>
                    <option value="">Select a category...</option>
                    <option value="Design">Design</option>
                    <option value="Development">Development</option>
                    <option value="Writing">Writing</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Consulting">Consulting</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Business Address (For Invoices)</label>
                  <input type="text" value={form.address} onChange={setF('address')} placeholder="City, State, Country" style={inputStyle} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                  <input type="checkbox" id="gst" checked={form.gstRegistered} onChange={setF('gstRegistered')} style={{ width: '18px', height: '18px' }} />
                  <label htmlFor="gst" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>Are you GST Registered?</label>
                </div>

                {form.gstRegistered && (
                  <div className="fade-in">
                    <label style={labelStyle}>GSTIN Number</label>
                    <input type="text" value={form.gstin} onChange={setF('gstin')} placeholder="22AAAAA0000A1Z5" style={inputStyle} />
                  </div>
                )}
              </div>

              <div style={{ marginTop: '36px', display: 'flex', gap: '12px' }}>
                <button onClick={handleBack} style={secondaryBtnStyle}><ArrowLeft size={18} /></button>
                <button onClick={handleNext} style={{...primaryBtnStyle, flex: 1}}>Continue to Checkout <ArrowRight size={18} /></button>
              </div>
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <button onClick={handleNext} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '14px', cursor: 'pointer', fontWeight: 500 }}>
                  Skip these details for now
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: Checkout */}
          {step === 6 && (
            <div className="fade-in">
              <h1 style={{ fontSize: '32px', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 8px', letterSpacing: '-0.5px', textAlign: 'center' }}>
                7 days free
              </h1>
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', margin: '0 0 32px', textAlign: 'center' }}>
                Add payment details to activate your trial. Cancel anytime.
              </p>

              <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
                {/* Plan Selection */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                  <button 
                    onClick={() => setForm(f => ({ ...f, plan: 'monthly' }))}
                    style={{
                      padding: '16px', borderRadius: '12px', border: form.plan === 'monthly' ? '2px solid var(--accent)' : '2px solid var(--border)',
                      background: form.plan === 'monthly' ? 'var(--accent-light)' : 'transparent', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>Monthly</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>₹299/mo</div>
                  </button>
                  <button 
                    onClick={() => setForm(f => ({ ...f, plan: 'annual' }))}
                    style={{
                      padding: '16px', borderRadius: '12px', border: form.plan === 'annual' ? '2px solid var(--accent)' : '2px solid var(--border)',
                      background: form.plan === 'annual' ? 'var(--accent-light)' : 'transparent', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', position: 'relative'
                    }}
                  >
                    <div style={{ position: 'absolute', top: '-10px', right: '-10px', background: 'var(--success)', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '4px 8px', borderRadius: '100px' }}>SAVE 20%</div>
                    <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>Annual</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>₹2,990/yr</div>
                  </button>
                </div>

                {/* Payment Method Toggle */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={labelStyle}>Autopay Method</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, paymentMethod: 'card' }))}
                      style={{
                        padding: '10px', borderRadius: '10px',
                        background: form.paymentMethod === 'card' ? 'var(--text-primary)' : 'var(--card-bg)',
                        color: form.paymentMethod === 'card' ? 'var(--card-bg)' : 'var(--text-primary)',
                        border: '1px solid var(--border)', fontSize: '14px', fontWeight: 700,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        transition: 'all 0.15s'
                      }}
                    >
                      <CreditCard size={15} /> Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, paymentMethod: 'upi' }))}
                      style={{
                        padding: '10px', borderRadius: '10px',
                        background: form.paymentMethod === 'upi' ? 'var(--text-primary)' : 'var(--card-bg)',
                        color: form.paymentMethod === 'upi' ? 'var(--card-bg)' : 'var(--text-primary)',
                        border: '1px solid var(--border)', fontSize: '14px', fontWeight: 700,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        transition: 'all 0.15s'
                      }}
                    >
                      ⚡ UPI
                    </button>
                  </div>
                </div>

                {/* Payment Form */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {form.paymentMethod === 'card' ? (
                    <>
                      <input type="text" value={form.cardName} onChange={setF('cardName')} placeholder="Name on card" style={{ ...inputStyle, padding: '12px 14px', fontSize: '14px' }} />
                      <div style={{ position: 'relative' }}>
                        <input type="text" value={form.cardNumber} onChange={setF('cardNumber')} placeholder="Card number" maxLength={19} style={{ ...inputStyle, padding: '12px 14px', paddingLeft: '40px', fontSize: '14px' }} />
                        <CreditCard size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <input type="text" value={form.cardExpiry} onChange={setF('cardExpiry')} placeholder="MM/YY" maxLength={5} style={{ ...inputStyle, padding: '12px 14px', fontSize: '14px' }} />
                        <input type="text" value={form.cardCvv} onChange={setF('cardCvv')} placeholder="CVV" maxLength={4} style={{ ...inputStyle, padding: '12px 14px', fontSize: '14px' }} />
                      </div>
                    </>
                  ) : (
                    <div>
                      <input type="text" value={form.upiId} onChange={setF('upiId')} placeholder="e.g. rahul@upi" style={{ ...inputStyle, padding: '12px 14px', fontSize: '14px' }} />
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '4px 0 0', lineHeight: 1.4 }}>
                        You'll be redirected to your UPI app to approve the recurring mandate.
                      </p>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => submitSignup(true)} 
                  disabled={loading}
                  style={{ ...primaryBtnStyle, width: '100%', marginTop: '24px', opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? <Loader2 size={18} className="spin" /> : `Start 7-Day Trial (${form.plan === 'monthly' ? '₹299/mo' : '₹2,990/yr'})`}
                </button>
                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                  <button 
                    onClick={() => submitSignup(false)} 
                    disabled={loading}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '14px', cursor: 'pointer', fontWeight: 500, opacity: loading ? 0.7 : 1 }}
                  >
                    Skip for now
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
                <button onClick={handleBack} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ArrowLeft size={16} /> Back to details
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
        .fade-in { animation: fadeIn 0.3s ease-in-out; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// Reusable styles
const primaryBtnStyle: React.CSSProperties = {
  padding: '14px 24px',
  background: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)',
  border: 'none', borderRadius: '12px',
  fontSize: '16px', fontWeight: 700, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
  transition: 'all 0.2s',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
};

const secondaryBtnStyle: React.CSSProperties = {
  padding: '14px',
  background: 'var(--content-bg)', color: 'var(--text-primary)',
  border: '1px solid var(--border)', borderRadius: '12px',
  fontSize: '16px', fontWeight: 700, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  transition: 'all 0.2s',
};

const eyeBtnStyle: React.CSSProperties = {
  position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0,
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px'
};
