import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  UserPlus, 
  LogOut, 
  Wifi, 
  WifiOff, 
  Download, 
  HelpCircle, 
  ShieldCheck, 
  Stethoscope, 
  Sparkles,
  RefreshCw,
  Package,
  Layers,
  Users,
  Bell,
  ChevronDown,
  Edit3,
  User
} from 'lucide-react';
import { StaffUser } from '../types/patient';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { EditStaffProfileModal } from './EditStaffProfileModal';

interface HeaderProps {
  currentTab: 'search' | 'register' | 'details' | 'drug-store';
  onSelectTab: (tab: 'search' | 'register' | 'drug-store') => void;
  staffUser: StaffUser | null;
  onLogout: () => void;
  isOnline: boolean;
  onOpenTestingGuide: () => void;
  onSeedSampleData: () => void;
  isSeeding: boolean;
  onUpdateStaffProfile?: (updatedStaff: StaffUser) => void;
  onDeleteStaffProfile?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  staffUser,
  onLogout,
  isOnline,
  onOpenTestingGuide,
  onSeedSampleData,
  isSeeding,
  onUpdateStaffProfile,
  onDeleteStaffProfile,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isStaffProfileModalOpen, setIsStaffProfileModalOpen] = useState(false);

  const isPatientManagementActive = currentTab === 'search' || currentTab === 'register' || currentTab === 'details';
  const isDrugStoreActive = currentTab === 'drug-store';

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
      {/* Top Clinical Strip */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 py-1.5 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-teal-400 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              APEX Healthcare Management System
            </span>
            <span className="hidden md:inline text-slate-600">|</span>
            <span className="text-slate-300 text-[11px] font-medium hidden sm:inline">
              Pilikada, Kurunegala • Hotline: <strong>0775621300</strong>
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Connectivity Badge */}
            <div className="flex items-center gap-1.5">
              {isOnline ? (
                <span className="flex items-center gap-1 text-emerald-400 font-bold text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <Wifi className="w-3 h-3" />
                  Cloud Online
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-400 font-bold text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <WifiOff className="w-3 h-3" />
                  Offline Cache
                </span>
              )}
            </div>

            {/* Quick Testing Guide Action */}
            <button
              onClick={onOpenTestingGuide}
              className="text-slate-300 hover:text-white flex items-center gap-1 text-[11px] underline underline-offset-2 transition-colors cursor-pointer"
              title="How to test patient search and medicine history"
            >
              <HelpCircle className="w-3.5 h-3.5 text-teal-400" />
              <span>Guide</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Bar (HavenMed Inspired Clean Layout) */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-500 via-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-sm shadow-teal-500/20">
            <Stethoscope className="w-6 h-6 stroke-[2.3]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">
                APEX<span className="text-teal-600">Med</span>
              </h1>
              <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                Clinic
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Lead Doctor: <strong className="text-slate-800">Dr. Wishmika Rajaguru</strong>
            </p>
          </div>
        </div>

        {/* TWO PRIMARY PARTS NAVIGATION: Patient Management & Drug Store (Pill Aesthetic) */}
        <div className="flex items-center gap-1.5 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80">
          {/* Part 1: Patient Management */}
          <button
            onClick={() => onSelectTab('search')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              isPatientManagementActive
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Patient Management</span>
          </button>

          {/* Part 2: Drug Store */}
          <button
            onClick={() => onSelectTab('drug-store')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              isDrugStoreActive
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Drug Store & Stock</span>
          </button>

          {/* Quick Register Shortcut if in Patient Management */}
          {isPatientManagementActive && (
            <button
              onClick={() => onSelectTab('register')}
              className={`hidden md:flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ml-1 ${
                currentTab === 'register'
                  ? 'bg-white text-teal-700 shadow-2xs border border-teal-200'
                  : 'text-teal-700 hover:bg-teal-50'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Register</span>
            </button>
          )}
        </div>

        {/* Right Section: Doctor Avatar Profile Pill (Exact HavenMed Header Profile Style) */}
        <div className="flex items-center gap-3">
          {/* Quick Sample Data Seeding */}
          <button
            onClick={onSeedSampleData}
            disabled={isSeeding}
            className="hidden lg:flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-2 rounded-xl font-semibold transition-colors cursor-pointer disabled:opacity-50"
            title="Load sample patients & drug store inventory"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{isSeeding ? 'Seeding...' : 'Load Demo Data'}</span>
          </button>

          {/* PWA Install */}
          {isInstallable && (
            <button
              onClick={isIOS ? () => setShowIOSModal(true) : install}
              className="flex items-center gap-1.5 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-2 rounded-xl transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Install App</span>
            </button>
          )}

          {/* Doctor Profile Pill (Image 1 Style) */}
          {staffUser && (
            <div className="flex items-center gap-2.5 p-1.5 pr-2 rounded-2xl hover:bg-slate-50 border border-slate-200/80 transition-colors">
              <button
                onClick={() => setIsStaffProfileModalOpen(true)}
                className="flex items-center gap-2.5 text-left cursor-pointer group"
                title="View & Edit Personal Profile"
              >
                <img 
                  src="/src/assets/images/cute_doctor_avatar_1791878325900.jpg"
                  alt="Dr. Wishmika Rajaguru"
                  className="w-9 h-9 rounded-xl object-cover border border-teal-200 shadow-2xs group-hover:border-teal-400 transition-colors"
                  referrerPolicy="no-referrer"
                />
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-slate-900 group-hover:text-teal-700 leading-tight transition-colors">
                    {staffUser.displayName || 'Dr. Wishmika Rajaguru'}
                  </p>
                  <p className="text-[10px] text-teal-700 font-semibold">
                    {staffUser.role} • Kurunegala
                  </p>
                </div>
              </button>

              <button
                onClick={() => setIsStaffProfileModalOpen(true)}
                className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-colors cursor-pointer"
                title="Edit Personal Profile"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onLogout}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                title="Log Out Staff Member"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Doctor / Staff Personal Profile Modal */}
      {isStaffProfileModalOpen && staffUser && (
        <EditStaffProfileModal
          isOpen={isStaffProfileModalOpen}
          onClose={() => setIsStaffProfileModalOpen(false)}
          staffUser={staffUser}
          onSaveProfile={(updatedStaff) => {
            if (onUpdateStaffProfile) {
              onUpdateStaffProfile(updatedStaff);
            }
          }}
          onDeleteProfile={() => {
            if (onDeleteStaffProfile) {
              onDeleteStaffProfile();
            } else {
              onLogout();
            }
          }}
        />
      )}

      {/* iOS Installation Instructions Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-600 mx-auto flex items-center justify-center mb-3">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Install APEX Clinic on iPhone / iPad</h3>
            <p className="text-xs text-slate-600 mt-2 text-left leading-relaxed">
              1. Tap the <strong>Share</strong> button (box with upward arrow) in the Safari toolbar.<br />
              2. Scroll down and tap <strong>Add to Home Screen</strong>.<br />
              3. The app will launch in standalone offline mode!
            </p>
            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-4 w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 rounded-xl text-sm transition-colors cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
