import React, { useState, useMemo } from 'react';
import { 
  Search, 
  User, 
  Calendar, 
  Phone, 
  MapPin, 
  Pill, 
  ChevronRight, 
  Plus, 
  Sparkles, 
  FileText, 
  AlertTriangle,
  Activity,
  Heart,
  CreditCard,
  Printer,
  ShieldCheck,
  Stethoscope,
  Users,
  FileCheck,
  Package,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  ArrowUpRight
} from 'lucide-react';
import { Patient, Prescription } from '../types/patient';
import { getLocalPrescriptions } from '../services/patientService';
import { EcgHeartbeatBackground } from './EcgHeartbeatBackground';

interface PatientSearchProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onNavigateToRegister: () => void;
  onSeedSampleData: () => void;
  isSeeding: boolean;
  onQuickNewPrescription?: (patient: Patient) => void;
  onQuickPrintPrescription?: (patient: Patient) => void;
  storeMedicinesCount?: number;
  onNavigateToDrugStore?: () => void;
}

export const PatientSearch: React.FC<PatientSearchProps> = ({
  patients,
  onSelectPatient,
  onNavigateToRegister,
  onSeedSampleData,
  isSeeding,
  onQuickNewPrescription,
  onQuickPrintPrescription,
  storeMedicinesCount = 0,
  onNavigateToDrugStore,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'allergies' | 'female' | 'male'>('all');

  // Filter patients based on query (by NIC, Name, and Medical ID) and demographic filters
  const filteredPatients = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return patients.filter((patient) => {
      const matchesId = patient.patientId.toLowerCase().includes(q) || 
        patient.patientId.replace(/\s+/g, '').toLowerCase().includes(q.replace(/\s+/g, ''));
      const matchesName = patient.name.toLowerCase().includes(q);
      const matchesNic = patient.nic ? patient.nic.toLowerCase().includes(q) : false;
      const matchesPhone = patient.phoneNumber.toLowerCase().includes(q);

      const matchesSearch = !q || matchesId || matchesName || matchesNic || matchesPhone;
      if (!matchesSearch) return false;

      if (selectedFilter === 'allergies') {
        return !!patient.allergies && !patient.allergies.toLowerCase().includes('no known');
      }
      if (selectedFilter === 'female') {
        return patient.gender?.toLowerCase() === 'female';
      }
      if (selectedFilter === 'male') {
        return patient.gender?.toLowerCase() === 'male';
      }
      return true;
    });
  }, [patients, searchQuery, selectedFilter]);

  const calculateAge = (dobString: string): string => {
    try {
      const birth = new Date(dobString);
      const now = new Date();
      let age = now.getFullYear() - birth.getFullYear();
      const m = now.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
        age--;
      }
      return `${age} yrs`;
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-7">
      {/* 
        FOUR PASTEL STATS CARDS (Exact Dribbble HavenMed Reference Image 1)
        Card 1: Lavender/Periwinkle - Total Patients
        Card 2: Mint/Sage - Appointments / Medical ID
        Card 3: Buttery Yellow/Lime - Drug Store Stock
        Card 4: Baby Blue/Cyan - Prescriptions & Invoices
      */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Lavender / Periwinkle (Total Patients) */}
        <div className="bg-[#ece8fe] rounded-3xl p-5 border border-[#ddd6fe]/70 shadow-xs relative overflow-hidden transition-transform hover:-translate-y-0.5 duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-white/80 backdrop-blur-xs flex items-center justify-center text-[#5b21b6] shadow-2xs">
              <Users className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#5b21b6] bg-white/70 px-2.5 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3 text-[#5b21b6]" />
              +2.1%
            </span>
          </div>

          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            Total Patients
          </h3>
          <p className="text-xs text-[#5b21b6] font-semibold mt-1">
            {patients.length} registered in APEX
          </p>
        </div>

        {/* Card 2: Mint / Sage (Appointments / Medical ID) */}
        <div className="bg-[#dff1ec] rounded-3xl p-5 border border-[#a7f3d0]/70 shadow-xs relative overflow-hidden transition-transform hover:-translate-y-0.5 duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-white/80 backdrop-blur-xs flex items-center justify-center text-[#065f46] shadow-2xs">
              <Calendar className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#065f46] bg-white/70 px-2.5 py-0.5 rounded-full">
              Sequential
            </span>
          </div>

          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            Medical ID Series
          </h3>
          <p className="text-xs text-[#065f46] font-semibold font-mono mt-1">
            APX-{new Date().getFullYear()}-# Active
          </p>
        </div>

        {/* Card 3: Buttery Light Lime / Yellow (Drug Store Stock) */}
        <div className="bg-[#f4f7cb] rounded-3xl p-5 border border-[#fef08a]/80 shadow-xs relative overflow-hidden transition-transform hover:-translate-y-0.5 duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-white/80 backdrop-blur-xs flex items-center justify-center text-[#3f6212] shadow-2xs">
              <Package className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#3f6212] bg-white/70 px-2.5 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3 text-[#3f6212]" />
              Tracked
            </span>
          </div>

          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            Drug Store
          </h3>
          <p className="text-xs text-[#3f6212] font-semibold mt-1">
            {storeMedicinesCount > 0 ? `${storeMedicinesCount} items in stock` : 'Automatic inventory sync'}
          </p>
        </div>

        {/* Card 4: Baby Blue / Cyan (Prescriptions Format) */}
        <div className="bg-[#d8f1f7] rounded-3xl p-5 border border-[#bae6fd]/80 shadow-xs relative overflow-hidden transition-transform hover:-translate-y-0.5 duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-white/80 backdrop-blur-xs flex items-center justify-center text-[#0e7490] shadow-2xs">
              <Printer className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0e7490] bg-white/70 px-2.5 py-0.5 rounded-full">
              A5 Standard
            </span>
          </div>

          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            Prescriptions
          </h3>
          <p className="text-xs text-[#0e7490] font-semibold mt-1">
            Dr. Wishmika • Single signature
          </p>
        </div>
      </div>

      {/* 
        TWO BENTO SHOWCASE CARDS (Exact Dribbble HavenMed Image 1 Layout)
        Left Card: "Patient Health" with Cute 3D Translucent Heart & Floating 108 bpm pill!
        Right Card: "Drug Store & Stock" with Cute 3D Medicine Bottles!
      */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Showcase Card 1: Patient Health (Matching HavenMed "Patient Health" Card) */}
        <div className="bg-gradient-to-br from-[#ebf7f5] via-white to-[#f0faf8] rounded-3xl p-6 sm:p-7 border border-[#b2e2d8] shadow-xs relative overflow-hidden flex flex-col justify-between">
          {/* Subtle animated heartbeat ECG waveform in background */}
          <EcgHeartbeatBackground 
            className="absolute inset-0 pointer-events-none" 
            opacity={0.12} 
            variant="blue-teal" 
          />

          {/* Card Header */}
          <div className="flex items-center justify-between relative z-10 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white shadow-2xs border border-teal-100 flex items-center justify-center text-teal-600">
                <Heart className="w-5 h-5 fill-rose-500/20 text-rose-500 animate-pulse" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Patient Health & Vitals</h4>
                <p className="text-xs text-teal-800 font-medium">Cardiovascular & Clinical Care</p>
              </div>
            </div>

            <button
              onClick={onNavigateToRegister}
              className="w-9 h-9 rounded-2xl bg-white border border-slate-200 hover:border-teal-400 flex items-center justify-center text-slate-600 hover:text-teal-700 shadow-2xs transition-colors cursor-pointer"
              title="Register new patient"
            >
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {/* Center 3D Cute Illustration with Floating Pulse Badge */}
          <div className="relative z-10 my-2 flex flex-col sm:flex-row items-center justify-center gap-6">
            <div className="relative w-44 h-44 sm:w-52 sm:h-52 shrink-0">
              {/* Cute 3D Translucent Heart/Lungs Generated Asset */}
              <img
                src="/src/assets/images/cute_medical_health_1791878324613.jpg"
                alt="Cute 3D Medical Heart & Lungs"
                className="w-full h-full object-cover rounded-3xl shadow-sm border border-white/60"
                referrerPolicy="no-referrer"
              />

              {/* Floating Pill Badge (Exact HavenMed 108 bpm style!) */}
              <div className="absolute bottom-3 right-2 bg-white/95 backdrop-blur-md border border-teal-200 px-3 py-1.5 rounded-full shadow-md flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                <span className="text-xs font-black text-slate-900">74 bpm</span>
                <span className="text-[10px] text-teal-700 font-semibold bg-teal-50 px-1.5 py-0.5 rounded-md">Normal</span>
              </div>
            </div>

            {/* Clinical Overview Notes */}
            <div className="space-y-2.5 text-left flex-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 bg-teal-100/70 px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Active Consultation Hub
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Lead Physician: <strong className="text-slate-900 font-bold">Dr. Wishmika Rajaguru</strong>. Every visit stores separate prescription histories with instant A5 sheet printing.
              </p>
              <div className="pt-1 flex flex-wrap gap-2">
                <button
                  onClick={onNavigateToRegister}
                  className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Register Patient</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Showcase Card 2: Drug Store & Automatic Inventory */}
        <div className="bg-gradient-to-br from-[#f8f6ff] via-white to-[#f4f7cb]/30 rounded-3xl p-6 sm:p-7 border border-[#ddd6fe] shadow-xs relative overflow-hidden flex flex-col justify-between">
          {/* Card Header */}
          <div className="flex items-center justify-between relative z-10 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white shadow-2xs border border-purple-100 flex items-center justify-center text-purple-600">
                <Package className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Drug Store & Inventory</h4>
                <p className="text-xs text-purple-800 font-medium">Automatic Dispense Deductions</p>
              </div>
            </div>

            {onNavigateToDrugStore && (
              <button
                onClick={onNavigateToDrugStore}
                className="w-9 h-9 rounded-2xl bg-white border border-slate-200 hover:border-purple-400 flex items-center justify-center text-slate-600 hover:text-purple-700 shadow-2xs transition-colors cursor-pointer"
                title="Open Drug Store Inventory"
              >
                <ArrowUpRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Center 3D Cute Illustration for Drug Store */}
          <div className="relative z-10 my-2 flex flex-col sm:flex-row items-center justify-center gap-6">
            <div className="relative w-44 h-44 sm:w-52 sm:h-52 shrink-0">
              {/* Cute 3D Pharmacy Pills & Bottles Asset */}
              <img
                src="/src/assets/images/cute_drugstore_pills_1791878325824.jpg"
                alt="Cute 3D Pharmacy Medicine Bottles"
                className="w-full h-full object-cover rounded-3xl shadow-sm border border-white/60"
                referrerPolicy="no-referrer"
              />

              {/* Floating Pill Badge */}
              <div className="absolute bottom-3 right-2 bg-white/95 backdrop-blur-md border border-purple-200 px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-black text-slate-900">{storeMedicinesCount} Items</span>
                <span className="text-[10px] text-purple-700 font-semibold bg-purple-50 px-1 py-0.5 rounded">Store</span>
              </div>
            </div>

            {/* Inventory Notes */}
            <div className="space-y-2.5 text-left flex-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-800 bg-purple-100/70 px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                Batch & Expiry Tracking
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Prescribed medicines deduct stock automatically upon dispensing. Track batch numbers, expiry dates, and low-stock alerts.
              </p>
              <div className="pt-1 flex flex-wrap gap-2">
                {onNavigateToDrugStore && (
                  <button
                    onClick={onNavigateToDrugStore}
                    className="inline-flex items-center gap-1.5 bg-[#6d28d9] hover:bg-[#5b21b6] text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>Open Drug Store</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 
        PATIENT DIRECTORY & SEARCH SECTION
        - Search through NIC Number, Full Name, or Medical ID
        - Clean pill filter tags (All, With Allergies, Female, Male)
      */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Search className="w-5 h-5 text-teal-600" />
              <span>Patient Directory</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Search patient records through <strong className="text-slate-800">NIC Number</strong>, <strong className="text-slate-800">Full Name</strong>, or <strong className="text-slate-800">Medical ID</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onNavigateToRegister}
              className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Patient</span>
            </button>
          </div>
        </div>

        {/* Search Bar Input (Pill Shaped) */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5 text-teal-600" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search through NIC number, Name, or Medical ID (e.g. APX-2026-1)..."
            className="w-full pl-12 pr-28 py-3.5 bg-slate-50/80 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 rounded-2xl text-sm sm:text-base text-slate-900 placeholder-slate-400 font-medium transition-all outline-hidden"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-20 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              Clear
            </button>
          )}
          <div className="absolute inset-y-0 right-3 flex items-center">
            <span className="text-xs bg-teal-100 text-teal-800 font-bold px-3 py-1 rounded-xl">
              {filteredPatients.length} found
            </span>
          </div>
        </div>

        {/* Filter Pills with Soft Colors */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Records ({patients.length})
            </button>
            <button
              onClick={() => setSelectedFilter('allergies')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedFilter === 'allergies'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              With Allergies
            </button>
            <button
              onClick={() => setSelectedFilter('female')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedFilter === 'female'
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200'
              }`}
            >
              Female
            </button>
            <button
              onClick={() => setSelectedFilter('male')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedFilter === 'male'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-200'
              }`}
            >
              Male
            </button>
          </div>

          <span className="text-xs text-slate-400">
            Click any patient record to view visit history & prescriptions
          </span>
        </div>
      </div>

      {/* Patient Directory List */}
      {filteredPatients.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 mx-auto flex items-center justify-center mb-4">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            {patients.length === 0 ? 'No Patient Records in Database' : 'No Patients Matched Your Search'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-2">
            {patients.length === 0
              ? 'Get started by loading fictional clinical sample data or registering a new patient record.'
              : `No patient found matching "${searchQuery}". Please verify the NIC number, Patient Name, or Medical ID.`}
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {patients.length === 0 && (
              <button
                onClick={onSeedSampleData}
                disabled={isSeeding}
                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>Load Sample Patients</span>
              </button>
            )}
            <button
              onClick={onNavigateToRegister}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Register Patient Now</span>
            </button>
          </div>
        </div>
      ) : (
        /* Vertical List of Beautiful Patient Cards */
        <div className="space-y-3.5">
          {filteredPatients.map((patient) => {
            const hasAllergies = patient.allergies && !patient.allergies.toLowerCase().includes('no known');
            const docId = patient.id || `pat_${patient.patientId.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
            const cachedRxs = getLocalPrescriptions(docId);
            const rxCount = cachedRxs.length;

            return (
              <div
                key={patient.id || patient.patientId}
                className="bg-white border border-slate-200/90 hover:border-teal-400 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all group flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left side: Patient info with avatar and badges */}
                <div className="flex items-start gap-4 flex-1">
                  {/* Initials Avatar with Beautiful Gradient */}
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 via-cyan-600 to-blue-600 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-xs">
                    {patient.name.charAt(0)}
                  </div>

                  <div className="space-y-1.5 flex-1">
                    {/* Top line badges: Medical ID + NIC + Blood */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-black bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded-lg flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                        ID: {patient.patientId}
                      </span>

                      {patient.nic ? (
                        <span className="font-mono text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                          <CreditCard className="w-3 h-3 text-teal-600" />
                          NIC: {patient.nic}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                          No NIC recorded
                        </span>
                      )}

                      {patient.bloodType && (
                        <span className="text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded">
                          Blood: {patient.bloodType}
                        </span>
                      )}
                    </div>

                    {/* Prominent Patient Name */}
                    <div className="flex items-center gap-3">
                      <h4 
                        onClick={() => onSelectPatient(patient)}
                        className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors cursor-pointer"
                      >
                        {patient.name}
                      </h4>
                    </div>

                    {/* Demographics & Contact Row */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                      <span className="flex items-center gap-1 text-slate-700 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{calculateAge(patient.dateOfBirth)} • {patient.gender || 'Not specified'}</span>
                      </span>

                      <span className="flex items-center gap-1 text-slate-700 font-medium">
                        <Phone className="w-3.5 h-3.5 text-teal-600" />
                        <span>{patient.phoneNumber}</span>
                      </span>

                      <span className="flex items-center gap-1 text-slate-500 truncate max-w-xs">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{patient.address}</span>
                      </span>
                    </div>

                    {/* Allergy Banner if present */}
                    {hasAllergies && (
                      <div className="mt-1 inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-md">
                        <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                        <span>Allergy: {patient.allergies}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right side: Quick Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                  {/* View Profile Button */}
                  <button
                    onClick={() => onSelectPatient(patient)}
                    className="flex items-center gap-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>View Profile</span>
                  </button>

                  {/* New Prescription Button */}
                  <button
                    onClick={() => {
                      if (onQuickNewPrescription) {
                        onQuickNewPrescription(patient);
                      } else {
                        onSelectPatient(patient);
                      }
                    }}
                    className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Prescription</span>
                  </button>

                  {/* Print Rx Button */}
                  <button
                    onClick={() => {
                      if (onQuickPrintPrescription) {
                        onQuickPrintPrescription(patient);
                      } else {
                        onSelectPatient(patient);
                      }
                    }}
                    className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    title="Print Prescription (A5 Sheet)"
                  >
                    <Printer className="w-3.5 h-3.5 text-teal-600" />
                    <span>Print Rx</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
