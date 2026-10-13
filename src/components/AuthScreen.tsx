import React, { useState } from 'react';
import { 
  Stethoscope, 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn, 
  UserCheck, 
  AlertCircle,
  Activity,
  User,
  Users,
  CheckCircle2,
  Mail,
  HelpCircle,
  X,
  Heart,
  Dna,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { loginWithGoogle } from '../lib/firebase';
import { StaffUser, UserRoleType } from '../types/patient';
import { EcgHeartbeatBackground } from './EcgHeartbeatBackground';

interface AuthScreenProps {
  onLoginSuccess: (user: StaffUser) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [loginType, setLoginType] = useState<'doctor' | 'staff'>('doctor');
  
  // Doctor form state
  const [doctorUsername, setDoctorUsername] = useState('Dr. Wishmika Rajaguru');
  const [doctorPassword, setDoctorPassword] = useState('');
  const [showDoctorPassword, setShowDoctorPassword] = useState(false);

  // Staff form state
  const [staffIdentifier, setStaffIdentifier] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [showStaffPassword, setShowStaffPassword] = useState(false);
  const [staffRole, setStaffRole] = useState<UserRoleType>('Nurse');

  // UI status
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [forgotPasswordModalOpen, setForgotPasswordModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  // Handle Doctor Login
  const handleDoctorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedUser = doctorUsername.trim();
    const trimmedPass = doctorPassword.trim();

    if (!trimmedUser) {
      setErrorMsg('Please enter your doctor name or registered username.');
      return;
    }

    if (!trimmedPass) {
      setErrorMsg('Security requirement: Doctor password is required to authenticate. A doctor name alone cannot grant access.');
      return;
    }

    if (trimmedPass.length < 4) {
      setErrorMsg('Invalid password. Minimum password length is 4 characters.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const doctorUser: StaffUser = {
        uid: 'doc_wishmika_rajaguru',
        email: 'dr.wishmika@apexmed.lk',
        displayName: 'Dr. Wishmika Rajaguru',
        photoURL: '/src/assets/images/cute_doctor_avatar_1791878325900.jpg',
        role: 'Physician',
        staffId: 'APX-DOC-101',
        department: 'Lead Physician • APEX Medical Center',
        isDemo: true,
      };
      onLoginSuccess(doctorUser);
    }, 450);
  };

  // Handle Staff Login
  const handleStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedId = staffIdentifier.trim();
    const trimmedPass = staffPassword.trim();

    if (!trimmedId) {
      setErrorMsg('Please enter your staff username or registered email.');
      return;
    }

    if (!trimmedPass) {
      setErrorMsg('Security requirement: Staff password is required to log in.');
      return;
    }

    if (trimmedPass.length < 4) {
      setErrorMsg('Invalid password. Please check your credentials.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const staffUser: StaffUser = {
        uid: `staff_${trimmedId.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        email: trimmedId.includes('@') ? trimmedId : `${trimmedId.toLowerCase()}@apexmed.lk`,
        displayName: trimmedId.includes('@') ? trimmedId.split('@')[0] : trimmedId,
        role: staffRole,
        staffId: `APX-STF-${Math.floor(100 + Math.random() * 900)}`,
        department: `${staffRole} Department • APEX Medical Center`,
        isDemo: true,
      };
      onLoginSuccess(staffUser);
    }, 450);
  };

  // Quick autofill helpers for testing
  const autofillDoctor = () => {
    setDoctorUsername('Dr. Wishmika Rajaguru');
    setDoctorPassword('DoctorPass2026!');
    setErrorMsg(null);
  };

  const autofillStaff = (role: UserRoleType, email: string) => {
    setStaffIdentifier(email);
    setStaffPassword('StaffPass2026!');
    setStaffRole(role);
    setErrorMsg(null);
  };

  // Google Login Alternative
  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const fbUser = await loginWithGoogle();
      const staff: StaffUser = {
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: fbUser.displayName || 'Dr. Wishmika Rajaguru',
        photoURL: fbUser.photoURL || '/src/assets/images/cute_doctor_avatar_1791878325900.jpg',
        role: loginType === 'doctor' ? 'Physician' : 'Nurse',
        staffId: `APX-${fbUser.uid.slice(0, 5).toUpperCase()}`,
        department: loginType === 'doctor' ? 'Clinical Medicine' : 'Nursing & Pharmacy',
        isDemo: false,
      };
      onLoginSuccess(staff);
    } catch (err: unknown) {
      console.error('Login error:', err);
      setErrorMsg('Authentication was cancelled. You can sign in using credentials below.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    setResetSuccess(true);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-[#0a484c] via-[#0f766e] to-[#118f8f] overflow-hidden font-sans">
      {/* Subtle Animated Heartbeat (ECG) Waveform in Background */}
      <EcgHeartbeatBackground 
        className="absolute inset-0 pointer-events-none" 
        strokeColor="#99f6e4" 
        opacity={0.16} 
        variant="blue-teal" 
      />

      {/* Organic Soft Pastel Curved Shapes (Matching Image 2 Reference) */}
      <div className="absolute -top-36 -left-36 w-96 h-96 rounded-full bg-teal-400/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-36 -right-36 w-[32rem] h-[32rem] rounded-full bg-cyan-300/20 blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 -right-20 w-80 h-80 rounded-full bg-emerald-400/15 blur-2xl pointer-events-none" />

      {/* Floating Glowing Frosted Glass Orbs with Cute Medical Icons (Exact Image 2 Style) */}
      {/* Orb 1: DNA Helix (Left) */}
      <div className="hidden lg:flex absolute left-12 top-1/2 -translate-y-1/2 w-28 h-28 rounded-full bg-white/10 backdrop-blur-md border border-white/20 items-center justify-center shadow-lg shadow-teal-900/30 animate-pulse pointer-events-none">
        <div className="w-16 h-16 rounded-full bg-teal-300/20 flex items-center justify-center text-teal-100">
          <Dna className="w-9 h-9 stroke-[1.8]" />
        </div>
      </div>

      {/* Orb 2: Heart with Pulse (Top Center) */}
      <div className="hidden md:flex absolute top-10 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full bg-white/10 backdrop-blur-md border border-white/20 items-center justify-center shadow-lg shadow-teal-900/30 pointer-events-none">
        <div className="w-14 h-14 rounded-full bg-rose-400/20 flex items-center justify-center text-rose-200">
          <Heart className="w-7 h-7 fill-rose-300/40 text-rose-200" />
        </div>
      </div>

      {/* Orb 3: Stethoscope & Care (Bottom Right) */}
      <div className="hidden lg:flex absolute right-14 bottom-14 w-28 h-28 rounded-full bg-white/10 backdrop-blur-md border border-white/20 items-center justify-center shadow-lg shadow-teal-900/30 pointer-events-none">
        <div className="w-16 h-16 rounded-full bg-cyan-300/20 flex items-center justify-center text-cyan-100">
          <Stethoscope className="w-8 h-8 stroke-[1.8]" />
        </div>
      </div>

      {/* Top Bar Floating Pill for Language / Clinic Region */}
      <div className="absolute top-5 right-5 sm:top-6 sm:right-6 z-20 flex items-center gap-2">
        <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/20 px-3.5 py-1.5 rounded-full text-white text-xs font-semibold shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>APEX Sri Lanka 🇱🇰</span>
        </div>
      </div>

      {/* Main Clean White / Glassmorphic Login Card (Exact Image 2 Style) */}
      <div className="relative w-full max-w-md bg-white rounded-3xl sm:rounded-[36px] shadow-2xl shadow-teal-950/40 border border-white/80 p-6 sm:p-9 z-10 transition-all">
        
        {/* Logo Mark & Welcome Heading */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-teal-50 border border-teal-100 text-teal-600 mb-3 shadow-xs">
            <div className="relative">
              <Stethoscope className="w-9 h-9 stroke-[2.2]" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-teal-500 rounded-full border-2 border-white" />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Welcome Back!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            APEX Medical Center • Pilikada, Kurunegala
          </p>
        </div>

        {/* Doctor & Staff Pill Switcher */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl border border-slate-200/80 mb-5">
          <button
            type="button"
            onClick={() => {
              setLoginType('doctor');
              setErrorMsg(null);
            }}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              loginType === 'doctor'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Doctor Login</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setLoginType('staff');
              setErrorMsg(null);
            }}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              loginType === 'staff'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Staff Login</span>
          </button>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        {/* Doctor Login Form */}
        {loginType === 'doctor' && (
          <form onSubmit={handleDoctorSubmit} className="space-y-4">
            {/* Doctor Profile Banner */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-teal-50/70 border border-teal-100">
              <img 
                src="/src/assets/images/cute_doctor_avatar_1791878325900.jpg"
                alt="Dr. Wishmika Rajaguru"
                className="w-11 h-11 rounded-xl object-cover border border-teal-200 shadow-2xs"
                referrerPolicy="no-referrer"
              />
              <div className="text-left flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">Dr. Wishmika Rajaguru</p>
                <p className="text-[11px] text-teal-700 font-medium truncate">Attending Physician • APEX Center</p>
              </div>
              <span className="text-[10px] font-bold bg-teal-200/60 text-teal-800 px-2 py-0.5 rounded-full">
                Verified
              </span>
            </div>

            {/* Doctor Username / Identifier */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Doctor Username / Registered Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={doctorUsername}
                  onChange={(e) => setDoctorUsername(e.target.value)}
                  placeholder="e.g. Dr. Wishmika Rajaguru"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 rounded-xl text-sm font-medium text-slate-900 transition-all outline-hidden"
                />
                <User className="w-4 h-4 text-teal-600 absolute left-3.5 top-3" />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Doctor Password
                </label>
                <button
                  type="button"
                  onClick={() => setForgotPasswordModalOpen(true)}
                  className="text-xs text-teal-600 hover:text-teal-800 font-semibold cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showDoctorPassword ? 'text' : 'password'}
                  value={doctorPassword}
                  onChange={(e) => setDoctorPassword(e.target.value)}
                  placeholder="Enter your doctor password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 rounded-xl text-sm font-medium text-slate-900 transition-all outline-hidden"
                />
                <Lock className="w-4 h-4 text-teal-600 absolute left-3.5 top-3" />
                <button
                  type="button"
                  onClick={() => setShowDoctorPassword(!showDoctorPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showDoctorPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-teal-600/20 transition-all cursor-pointer disabled:opacity-50 text-sm"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In as Doctor</span>
                </>
              )}
            </button>

            {/* Quick Demo Autofill button */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={autofillDoctor}
                className="text-xs text-slate-500 hover:text-teal-700 font-semibold cursor-pointer inline-flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-teal-600" />
                <span>Auto-fill Demo Doctor Credentials</span>
              </button>
            </div>
          </form>
        )}

        {/* Staff Login Form */}
        {loginType === 'staff' && (
          <form onSubmit={handleStaffSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Staff Role & Department
              </label>
              <select
                value={staffRole}
                onChange={(e) => setStaffRole(e.target.value as UserRoleType)}
                className="w-full px-3 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-teal-500 rounded-xl text-sm font-medium text-slate-900 outline-hidden"
              >
                <option value="Nurse">Nurse • Clinical Care</option>
                <option value="Pharmacist">Pharmacist • Drug Store & Stock</option>
                <option value="Receptionist">Receptionist • Patient Intake</option>
                <option value="Clinical Administrator">Clinical Administrator</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Staff Username or Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={staffIdentifier}
                  onChange={(e) => setStaffIdentifier(e.target.value)}
                  placeholder="e.g. nurse.nimali@apexmed.lk"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-teal-500 rounded-xl text-sm font-medium text-slate-900 outline-hidden"
                />
                <Mail className="w-4 h-4 text-teal-600 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setForgotPasswordModalOpen(true)}
                  className="text-xs text-teal-600 hover:text-teal-800 font-semibold cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showStaffPassword ? 'text' : 'password'}
                  value={staffPassword}
                  onChange={(e) => setStaffPassword(e.target.value)}
                  placeholder="Enter staff password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-teal-500 rounded-xl text-sm font-medium text-slate-900 outline-hidden"
                />
                <Lock className="w-4 h-4 text-teal-600 absolute left-3.5 top-3" />
                <button
                  type="button"
                  onClick={() => setShowStaffPassword(!showStaffPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showStaffPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-teal-600/20 transition-all cursor-pointer text-sm"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In as Staff</span>
                </>
              )}
            </button>

            {/* Quick staff autofill */}
            <div className="pt-2 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => autofillStaff('Nurse', 'nurse.nimali@apexmed.lk')}
                className="text-[11px] text-teal-700 hover:underline cursor-pointer"
              >
                Autofill Nurse
              </button>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={() => autofillStaff('Pharmacist', 'pharm.kamal@apexmed.lk')}
                className="text-[11px] text-teal-700 hover:underline cursor-pointer"
              >
                Autofill Pharmacist
              </button>
            </div>
          </form>
        )}

        {/* Alternative Google Sign-in */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 py-2.5 px-4 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Continue with Google Workspace</span>
          </button>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-900">Reset Credentials</h3>
              <button
                onClick={() => {
                  setForgotPasswordModalOpen(false);
                  setResetSuccess(false);
                }}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {resetSuccess ? (
              <div className="text-center py-4 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <p className="text-xs font-bold text-slate-900">Verification Link Generated</p>
                <p className="text-xs text-slate-600">
                  Password reset link sent to registered administrator. You can also sign in with the default test doctor credentials.
                </p>
                <button
                  onClick={() => {
                    setForgotPasswordModalOpen(false);
                    setResetSuccess(false);
                  }}
                  className="mt-3 w-full bg-teal-600 text-white font-bold py-2 rounded-xl text-xs cursor-pointer"
                >
                  Return to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handlePasswordResetSubmit} className="space-y-3">
                <p className="text-xs text-slate-600">
                  Enter your registered username or email address to receive password assistance.
                </p>
                <input
                  type="text"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Username or email"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
                <button
                  type="submit"
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Send Reset Link
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
