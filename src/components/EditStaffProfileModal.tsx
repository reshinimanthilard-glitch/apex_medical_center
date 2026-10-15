import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Shield, 
  Building2, 
  Save, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Stethoscope,
  LogOut
} from 'lucide-react';
import { StaffUser, UserRoleType } from '../types/patient';

interface EditStaffProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffUser: StaffUser;
  onSaveProfile: (updatedStaff: StaffUser) => void;
  onDeleteProfile: () => void;
}

export const EditStaffProfileModal: React.FC<EditStaffProfileModalProps> = ({
  isOpen,
  onClose,
  staffUser,
  onSaveProfile,
  onDeleteProfile,
}) => {
  const [displayName, setDisplayName] = useState(staffUser.displayName || '');
  const [email, setEmail] = useState(staffUser.email || '');
  const [role, setRole] = useState<UserRoleType>(staffUser.role || 'Physician');
  const [department, setDepartment] = useState(staffUser.department || '');
  const [staffId, setStaffId] = useState(staffUser.staffId || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setDisplayName(staffUser.displayName || '');
      setEmail(staffUser.email || '');
      setRole(staffUser.role || 'Physician');
      setDepartment(staffUser.department || '');
      setStaffId(staffUser.staffId || '');
      setShowDeleteConfirm(false);
      setSuccessMessage(null);
    }
  }, [isOpen, staffUser]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: StaffUser = {
      ...staffUser,
      displayName: displayName.trim() || 'Dr. Wishmika Rajaguru',
      email: email.trim() || staffUser.email,
      role,
      department: department.trim() || staffUser.department,
      staffId: staffId.trim() || staffUser.staffId,
    };
    onSaveProfile(updated);
    setSuccessMessage('Personal profile updated successfully!');
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 via-cyan-700 to-blue-700 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/src/assets/images/cute_doctor_avatar_1791878325900.jpg"
              alt="Profile avatar"
              className="w-12 h-12 rounded-2xl object-cover border-2 border-white/40 shadow-xs"
              referrerPolicy="no-referrer"
            />
            <div>
              <h2 className="text-lg font-black tracking-tight">
                My Personal Profile
              </h2>
              <p className="text-xs text-teal-100 font-medium">
                Staff ID: <strong className="font-mono text-white">{staffUser.staffId}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-7 space-y-5">
          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {!showDeleteConfirm ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Display Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-teal-500 rounded-xl text-sm font-medium text-slate-900 outline-hidden"
                  />
                  <User className="w-4 h-4 text-teal-600 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-teal-500 rounded-xl text-sm font-medium text-slate-900 outline-hidden"
                  />
                  <Mail className="w-4 h-4 text-teal-600 absolute left-3.5 top-3" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Clinical Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRoleType)}
                    className="w-full px-3 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-teal-500 rounded-xl text-sm font-medium text-slate-900 outline-hidden"
                  >
                    <option value="Physician">Physician / Doctor</option>
                    <option value="Surgeon">Surgeon</option>
                    <option value="Nurse">Nurse</option>
                    <option value="Pharmacist">Pharmacist</option>
                    <option value="Receptionist">Receptionist</option>
                    <option value="Clinical Administrator">Clinical Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Staff ID Code
                  </label>
                  <input
                    type="text"
                    value={staffId}
                    onChange={(e) => setStaffId(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-teal-500 rounded-xl text-sm font-mono font-medium text-slate-900 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Department / Hospital Center
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-teal-500 rounded-xl text-sm font-medium text-slate-900 outline-hidden"
                  />
                  <Building2 className="w-4 h-4 text-teal-600 absolute left-3.5 top-3" />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-2 rounded-xl transition-colors cursor-pointer font-bold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Profile</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Profile</span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* Delete Profile Confirmation */
            <div className="space-y-4 py-2">
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 text-xs space-y-2">
                <p className="font-bold flex items-center gap-1.5 text-rose-700">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  Delete Personal Profile & Session
                </p>
                <p className="text-slate-600 leading-relaxed">
                  Are you sure you want to delete your personal staff profile and sign out? This will clear your personal authentication session from this device.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Go Back
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onDeleteProfile();
                    onClose();
                  }}
                  className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Yes, Delete & Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
