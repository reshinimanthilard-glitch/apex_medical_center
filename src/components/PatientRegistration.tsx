import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  RotateCw, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Phone, 
  MapPin, 
  User, 
  ShieldAlert, 
  Heart,
  Save,
  ArrowLeft,
  CreditCard,
  Hash
} from 'lucide-react';
import { Patient, StaffUser } from '../types/patient';
import { registerPatient, generateNextMedicalId } from '../services/patientService';

interface PatientRegistrationProps {
  existingPatients: Patient[];
  staffUser: StaffUser | null;
  onPatientRegistered: (newPatient: Patient) => void;
  onCancel: () => void;
}

export const PatientRegistration: React.FC<PatientRegistrationProps> = ({
  existingPatients,
  staffUser,
  onPatientRegistered,
  onCancel,
}) => {
  // Compute sequential ID e.g. APX - 2026 - 1, APX - 2026 - 2
  const computeInitialId = () => {
    return generateNextMedicalId(existingPatients);
  };

  const [patientId, setPatientId] = useState(computeInitialId);
  const [nic, setNic] = useState('');
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [gender, setGender] = useState('Female');
  const [bloodType, setBloodType] = useState('O+');
  const [allergies, setAllergies] = useState('No known drug allergies (NKDA)');
  const [emergencyContact, setEmergencyContact] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Recalculate when existing patients changes
  useEffect(() => {
    setPatientId(generateNextMedicalId(existingPatients));
  }, [existingPatients]);

  // Calculate age dynamically
  const calculatedAge = React.useMemo(() => {
    if (!dateOfBirth) return '';
    try {
      const birth = new Date(dateOfBirth);
      const now = new Date();
      let age = now.getFullYear() - birth.getFullYear();
      const m = now.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
        age--;
      }
      return isNaN(age) || age < 0 ? '' : `${age} years old`;
    } catch {
      return '';
    }
  }, [dateOfBirth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanId = patientId.trim().toUpperCase();
    if (!cleanId) {
      setErrorMessage('Patient Medical ID is required.');
      return;
    }

    // Check if ID already exists
    const isDuplicate = existingPatients.some(
      (p) => p.patientId.replace(/\s+/g, '').toUpperCase() === cleanId.replace(/\s+/g, '').toUpperCase()
    );
    if (isDuplicate) {
      setErrorMessage(`Patient Medical ID "${cleanId}" already exists in the system.`);
      return;
    }

    if (!name.trim()) {
      setErrorMessage('Please enter the patient’s full legal name.');
      return;
    }

    if (!dateOfBirth) {
      setErrorMessage('Please enter the patient’s date of birth.');
      return;
    }

    if (!phoneNumber.trim()) {
      setErrorMessage('Please enter a valid contact phone number.');
      return;
    }

    if (!address.trim()) {
      setErrorMessage('Please enter the patient’s residential address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const staffUid = staffUser?.uid || 'staff_anonymous';
      const staffName = staffUser?.displayName || 'Dr. Wishmika Rajaguru';

      const newPatient = await registerPatient(
        {
          patientId: cleanId,
          nic: nic.trim().toUpperCase(),
          name: name.trim(),
          dateOfBirth,
          phoneNumber: phoneNumber.trim(),
          address: address.trim(),
          gender,
          bloodType,
          allergies: allergies.trim(),
          emergencyContact: emergencyContact.trim(),
        },
        staffUid,
        staffName
      );

      onPatientRegistered(newPatient);
    } catch (err: unknown) {
      console.error('Registration failed:', err);
      setErrorMessage('Failed to register patient in database. Please check connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Patient Directory</span>
        </button>
        <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
          New Patient Intake
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Card Clinical Header */}
        <div className="bg-gradient-to-r from-blue-700 to-sky-600 p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Register New Patient</h2>
              <p className="text-xs text-blue-100 mt-0.5">
                APEX Medical Center • Pilikada, Kurunegala • Dr. Wishmika Rajaguru
              </p>
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Identification & Medical ID */}
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Hash className="w-4 h-4 text-blue-600" />
                <span>Patient Identification (Medical ID & NIC)</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Patient Medical ID */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Patient Medical ID * <span className="text-[11px] text-blue-600 font-normal">(Auto-generated sequential)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value.toUpperCase())}
                    className="font-mono text-sm font-bold bg-blue-50/50 border border-blue-200 focus:border-blue-600 rounded-xl px-3.5 py-2.5 text-blue-900 w-full outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setPatientId(generateNextMedicalId(existingPatients))}
                    className="p-2.5 bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 border border-slate-200 rounded-xl cursor-pointer"
                    title="Recalculate next sequential Medical ID"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Format: APX-{new Date().getFullYear()}-1, APX-{new Date().getFullYear()}-2, etc.
                </p>
              </div>

              {/* NIC Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  National Identity Card (NIC Number)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={nic}
                    onChange={(e) => setNic(e.target.value.toUpperCase())}
                    placeholder="e.g. 199012345678 or 901234567V"
                    className="w-full bg-white border border-slate-300 focus:border-blue-600 focus:ring-3 focus:ring-blue-100 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-hidden font-medium placeholder-slate-400"
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                    <CreditCard className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Patients can be searched quickly by their NIC or Name.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Personal & Contact Information */}
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                <span>Patient Demographics & Contact</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Kasun Chamara Perera"
                  className="w-full bg-white border border-slate-300 focus:border-blue-600 focus:ring-3 focus:ring-blue-100 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-hidden font-medium placeholder-slate-400"
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date of Birth * {calculatedAge && <span className="text-blue-600 font-bold">({calculatedAge})</span>}
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full bg-white border border-slate-300 focus:border-blue-600 focus:ring-3 focus:ring-blue-100 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-hidden font-medium"
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Gender *
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-white border border-slate-300 focus:border-blue-600 focus:ring-3 focus:ring-blue-100 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-hidden font-medium cursor-pointer"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g. 077 123 4567"
                    className="w-full bg-white border border-slate-300 focus:border-blue-600 focus:ring-3 focus:ring-blue-100 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-hidden font-medium placeholder-slate-400"
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Blood Group */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Blood Group
                </label>
                <select
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                  className="w-full bg-white border border-slate-300 focus:border-blue-600 focus:ring-3 focus:ring-blue-100 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-hidden font-medium cursor-pointer"
                >
                  <option value="A+">A Positive (A+)</option>
                  <option value="A-">A Negative (A-)</option>
                  <option value="B+">B Positive (B+)</option>
                  <option value="B-">B Negative (B-)</option>
                  <option value="AB+">AB Positive (AB+)</option>
                  <option value="AB-">AB Negative (AB-)</option>
                  <option value="O+">O Positive (O+)</option>
                  <option value="O-">O Negative (O-)</option>
                </select>
              </div>

              {/* Address */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Residential Address *
                </label>
                <div className="relative">
                  <textarea
                    rows={2}
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 42 Main Street, Pilikada, Kurunegala"
                    className="w-full bg-white border border-slate-300 focus:border-blue-600 focus:ring-3 focus:ring-blue-100 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-hidden font-medium placeholder-slate-400 resize-none"
                  />
                  <div className="absolute top-3 right-3 pointer-events-none text-slate-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Clinical & Allergy Safety */}
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>Clinical Notes & Allergies</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Known Drug / Food Allergies
                </label>
                <input
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="e.g. Penicillin, Aspirin, Sulfa drugs"
                  className="w-full bg-white border border-slate-300 focus:border-blue-600 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Emergency Contact (Optional)
                </label>
                <input
                  type="text"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="e.g. Spouse / S. Perera (071 987 6543)"
                  className="w-full bg-white border border-slate-300 focus:border-blue-600 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-hidden font-medium"
                />
              </div>
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Registering Patient...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Register Patient & Open Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
