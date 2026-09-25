import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn, ShieldCheck, AlertCircle, ArrowLeft, Users, KeyRound, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const STAFF_DEMO_ACCOUNTS = [
  { label: '👑 Admin (Full Access)', email: 'admin@omwhub.com', pass: 'admin123', bg: '#EFF6FF', text: '#1E40AF' },
  { label: '🎧 Support Agent (Sunil)', email: 'sunil.k@omwhub.com', pass: 'sunil123', bg: '#FCE7F3', text: '#9D174D' },
  { label: '⚙️ Operations Lead (Pooja)', email: 'pooja.v@omwhub.com', pass: 'pooja123', bg: '#FEF3C7', text: '#92400E' },
  { label: '💰 Finance Manager (Rajesh)', email: 'rajesh.m@omwhub.com', pass: 'rajesh123', bg: '#ECFDF5', text: '#065F46' }
];

export default function Login({ type = 'select', onLoginSuccess }) {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openAdminPortal = () => {
    navigate('/admin');
  };

  const openUserPortal = () => {
    navigate('/user');
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both Email and Password.');
      return;
    }

    try {
      setIsSubmitting(true);
      const user = await login(email, password, type);
      if (user) {
        onLoginSuccess(user);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Invalid Email or Password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillStaffAccount = (demo) => {
    setEmail(demo.email);
    setPassword(demo.pass);
    setError('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(135deg, rgb(15, 23, 42) 0%, rgb(30, 41, 59) 50%, rgb(15, 23, 42) 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* Ambient Lighting Orbs */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '20%',
        width: 400,
        height: 400,
        background: 'radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, rgba(0, 0, 0, 0) 70%)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }}></div>
      
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        right: '20%',
        width: 450,
        height: 450,
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(0, 0, 0, 0) 70%)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }}></div>

      {/* STEP 1: INITIAL PORTAL SELECTION CARD - PREMIUM REDESIGN */}
      {type === 'select' && (
        <div style={{
          width: '100%',
          maxWidth: 580,
          background: 'rgba(30, 41, 59, 0.65)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: 32,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05) inset',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 10,
          animation: 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          padding: '40px 48px'
        }}>
          
          <style>
            {`
              @keyframes fadeInUp {
                0% { opacity: 0; transform: translateY(20px) scale(0.95); }
                100% { opacity: 1; transform: translateY(0) scale(1); }
              }
              .portal-card {
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.06);
                border-radius: 20px;
                padding: 24px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 20px;
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                position: relative;
                overflow: hidden;
              }
              .portal-card::before {
                content: '';
                position: absolute;
                top: 0; left: 0; right: 0; bottom: 0;
                border-radius: 20px;
                padding: 2px;
                background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0));
                -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                -webkit-mask-composite: xor;
                mask-composite: exclude;
                opacity: 0;
                transition: opacity 0.4s ease;
              }
              .portal-card:hover {
                transform: translateY(-4px) scale(1.02);
                background: rgba(255, 255, 255, 0.06);
                box-shadow: 0 20px 40px -10px rgba(0,0,0,0.5);
              }
              .portal-card.admin:hover::before {
                background: linear-gradient(135deg, #38BDF8, #818CF8);
                opacity: 1;
              }
              .portal-card.user:hover::before {
                background: linear-gradient(135deg, #34D399, #10B981);
                opacity: 1;
              }
              .portal-card.admin:hover .icon-box {
                background: linear-gradient(135deg, #38BDF8, #3B82F6);
                box-shadow: 0 0 20px rgba(56, 189, 248, 0.4);
                color: #FFF;
              }
              .portal-card.user:hover .icon-box {
                background: linear-gradient(135deg, #34D399, #10B981);
                box-shadow: 0 0 20px rgba(52, 211, 153, 0.4);
                color: #FFF;
              }
            `}
          </style>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 64,
              height: 64,
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.02) 100%)',
              borderRadius: 20,
              marginBottom: 20,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
            }}>
              <Sparkles size={28} color="#38BDF8" style={{ filter: 'drop-shadow(0 0 8px rgba(56,189,248,0.6))' }} />
            </div>
            <h2 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.5px' }}>
              Welcome to <span style={{ background: 'linear-gradient(to right, #38BDF8, #818CF8)', WebkitBackgroundClip: 'text', color: 'transparent' }}>omw!</span>
            </h2>
            <p style={{ margin: '8px 0 0', fontSize: 15, color: '#94A3B8', fontWeight: 500 }}>
              Select your secure access portal to continue.
            </p>
          </div>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            {/* Admin Login */}
            <div className="portal-card admin" onClick={openAdminPortal}>
              <div className="icon-box" style={{
                width: 56, height: 56, borderRadius: 16,
                background: 'rgba(56, 189, 248, 0.1)',
                color: '#38BDF8',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.3s ease'
              }}>
                <ShieldCheck size={28} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#F8FAFC', letterSpacing: '-0.3px' }}>
                  Admin Portal
                </h3>
                <p style={{ margin: '6px 0 0', fontSize: 13, color: '#94A3B8', lineHeight: 1.5, fontWeight: 500 }}>
                  Master control, analytics, and full staff management.
                </p>
              </div>
              <ArrowLeft size={20} color="#64748B" style={{ transform: 'rotate(180deg)', opacity: 0.5 }} />
            </div>

            {/* Staff User Login */}
            <div className="portal-card user" onClick={openUserPortal}>
              <div className="icon-box" style={{
                width: 56, height: 56, borderRadius: 16,
                background: 'rgba(52, 211, 153, 0.1)',
                color: '#34D399',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.3s ease'
              }}>
                <Users size={28} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#F8FAFC', letterSpacing: '-0.3px' }}>
                  User Portal
                </h3>
                <p style={{ margin: '6px 0 0', fontSize: 13, color: '#94A3B8', lineHeight: 1.5, fontWeight: 500 }}>
                  Staff access for permitted operational modules.
                </p>
              </div>
              <ArrowLeft size={20} color="#64748B" style={{ transform: 'rotate(180deg)', opacity: 0.5 }} />
            </div>

          </div>
        </div>
      )}

      {/* STEP 2: ADMIN LOGIN PORTAL - PREMIUM REDESIGN */}
      {type === 'admin' && (
        <div style={{
          width: '100%',
          maxWidth: 460,
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: 32,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05) inset',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 10,
          animation: 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          {/* Top Back Link */}
          <div style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '16px 28px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <button 
              type="button"
              onClick={() => navigate('/')}
              style={{
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'color 0.2s',
                padding: 0
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#38BDF8'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}
            >
              <ArrowLeft size={16} /> Back to Selection
            </button>
          </div>

          <div style={{
            padding: '36px 40px 24px',
            textAlign: 'center',
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 56,
              height: 56,
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(59, 130, 246, 0.05) 100%)',
              borderRadius: 16,
              marginBottom: 16,
              border: '1px solid rgba(56, 189, 248, 0.2)',
              boxShadow: '0 0 20px rgba(56, 189, 248, 0.15)'
            }}>
              <ShieldCheck size={28} color="#38BDF8" style={{ filter: 'drop-shadow(0 0 6px rgba(56,189,248,0.5))' }} />
            </div>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#F8FAFC', letterSpacing: '-0.3px' }}>
              Super Admin Login
            </h2>
            <p style={{ margin: '8px 0 0', fontSize: 14, color: '#94A3B8', fontWeight: 500 }}>
              Master system access required.
            </p>
          </div>

          <div style={{ padding: '0 40px 40px' }}>
            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: 12,
                padding: '12px 16px',
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                color: '#FCA5A5',
                fontSize: 13,
                fontWeight: 600,
                backdropFilter: 'blur(10px)'
              }}>
                <AlertCircle size={20} color="#EF4444" style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#CBD5E1', marginBottom: 8 }}>
                  Admin Email ID
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
                  <input 
                    type="email" 
                    required
                    placeholder="admin@omwhub.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ 
                      width: '100%', padding: '14px 16px 14px 44px', borderRadius: 14, 
                      background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255, 255, 255, 0.1)', 
                      fontSize: 15, color: '#F8FAFC', outline: 'none', boxSizing: 'border-box',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#38BDF8'; e.target.style.background = 'rgba(0,0,0,0.3)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'; e.target.style.background = 'rgba(0,0,0,0.2)'; }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#CBD5E1', marginBottom: 8 }}>
                  Master Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ 
                      width: '100%', padding: '14px 46px 14px 44px', borderRadius: 14, 
                      background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255, 255, 255, 0.1)', 
                      fontSize: 15, color: '#F8FAFC', outline: 'none', boxSizing: 'border-box',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#38BDF8'; e.target.style.background = 'rgba(0,0,0,0.3)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'; e.target.style.background = 'rgba(0,0,0,0.2)'; }}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: 0 }}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #38BDF8, #2563EB)',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: 15,
                  padding: '16px',
                  borderRadius: 14,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  boxShadow: '0 8px 20px rgba(37, 99, 235, 0.3)',
                  marginTop: 8,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <LogIn size={20} />
                <span>{isSubmitting ? 'Authenticating...' : 'Sign In as Super Admin'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* STEP 3: STAFF USER LOGIN PORTAL - PREMIUM REDESIGN */}
      {type === 'user' && (
        <div style={{
          width: '100%',
          maxWidth: 460,
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: 32,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05) inset',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 10,
          animation: 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          {/* Top Back Link */}
          <div style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '16px 28px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <button 
              type="button"
              onClick={() => navigate('/')}
              style={{
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'color 0.2s',
                padding: 0
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#34D399'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}
            >
              <ArrowLeft size={16} /> Back to Selection
            </button>
          </div>

          <div style={{
            padding: '36px 40px 24px',
            textAlign: 'center',
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 56,
              height: 56,
              background: 'linear-gradient(135deg, rgba(52, 211, 153, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%)',
              borderRadius: 16,
              marginBottom: 16,
              border: '1px solid rgba(52, 211, 153, 0.2)',
              boxShadow: '0 0 20px rgba(52, 211, 153, 0.15)'
            }}>
              <Users size={28} color="#34D399" style={{ filter: 'drop-shadow(0 0 6px rgba(52,211,153,0.5))' }} />
            </div>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#F8FAFC', letterSpacing: '-0.3px' }}>
              Staff User Portal
            </h2>
            <p style={{ margin: '8px 0 0', fontSize: 14, color: '#94A3B8', fontWeight: 500 }}>
              Access your operational modules.
            </p>
          </div>

          <div style={{ padding: '0 40px 40px' }}>
            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: 12,
                padding: '12px 16px',
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                color: '#FCA5A5',
                fontSize: 13,
                fontWeight: 600,
                backdropFilter: 'blur(10px)'
              }}>
                <AlertCircle size={20} color="#EF4444" style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#CBD5E1', marginBottom: 8 }}>
                  Staff Email ID
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
                  <input 
                    type="email" 
                    required
                    placeholder="sunil.k@omwhub.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ 
                      width: '100%', padding: '14px 16px 14px 44px', borderRadius: 14, 
                      background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255, 255, 255, 0.1)', 
                      fontSize: 15, color: '#F8FAFC', outline: 'none', boxSizing: 'border-box',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#34D399'; e.target.style.background = 'rgba(0,0,0,0.3)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'; e.target.style.background = 'rgba(0,0,0,0.2)'; }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#CBD5E1', marginBottom: 8 }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ 
                      width: '100%', padding: '14px 46px 14px 44px', borderRadius: 14, 
                      background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255, 255, 255, 0.1)', 
                      fontSize: 15, color: '#F8FAFC', outline: 'none', boxSizing: 'border-box',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#34D399'; e.target.style.background = 'rgba(0,0,0,0.3)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'; e.target.style.background = 'rgba(0,0,0,0.2)'; }}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: 0 }}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #34D399, #059669)',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: 15,
                  padding: '16px',
                  borderRadius: 14,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  boxShadow: '0 8px 20px rgba(5, 150, 105, 0.3)',
                  marginTop: 8,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <LogIn size={20} />
                <span>{isSubmitting ? 'Authenticating...' : 'Sign In to OMW CRM'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
