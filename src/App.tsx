/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, testConnection, logoutUser } from './lib/firebase';
import { 
  Patient, 
  MedicineRecord, 
  Prescription, 
  MedicalReport, 
  StaffUser,
  StoreMedicine,
  StockTransaction
} from './types/patient';
import { 
  fetchAllPatients, 
  fetchPatientPrescriptions,
  fetchPatientMedicalReports,
  fetchPatientMedicineHistory, 
  createPrescription,
  updatePrescription,
  deletePrescription,
  updatePatient,
  deletePatient,
  seedSampleData, 
  getLocalPatients,
  fetchStoreMedicines,
  fetchStockTransactions,
  getLocalStoreMedicines,
  getLocalStockTransactions
} from './services/patientService';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { Header } from './components/Header';
import { AuthScreen } from './components/AuthScreen';
import { PatientSearch } from './components/PatientSearch';
import { PatientRegistration } from './components/PatientRegistration';
import { PatientDetails } from './components/PatientDetails';
import { DrugStoreDashboard } from './components/DrugStoreDashboard';
import { OfflineBanner } from './components/OfflineBanner';
import { TestingGuideModal } from './components/TestingGuideModal';

export default function App() {
  const isOnline = useOnlineStatus();

  // Authentication State
  const [staffUser, setStaffUser] = useState<StaffUser | null>(() => {
    try {
      const stored = sessionStorage.getItem('apex_staff_session');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [authLoading, setAuthLoading] = useState(true);

  // Application Views & Data State
  const [currentTab, setCurrentTab] = useState<'search' | 'register' | 'details' | 'drug-store'>('search');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Drug Store & Inventory State
  const [storeMedicines, setStoreMedicines] = useState<StoreMedicine[]>([]);
  const [stockTransactions, setStockTransactions] = useState<StockTransaction[]>([]);
  const [isLoadingStore, setIsLoadingStore] = useState(false);

  // Selected Patient's Separate Collections
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [medicalReports, setMedicalReports] = useState<MedicalReport[]>([]);
  const [medicineRecords, setMedicineRecords] = useState<MedicineRecord[]>([]);
  const [isLoadingPatientData, setIsLoadingPatientData] = useState(false);

  // Modals & Helpers
  const [isTestingGuideOpen, setIsTestingGuideOpen] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Test Firebase connection on boot
  useEffect(() => {
    testConnection();
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
      if (firebaseUser) {
        const staff: StaffUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || 'Dr. Wishmika Rajaguru',
          photoURL: firebaseUser.photoURL,
          role: 'Physician',
          staffId: `DOC-${firebaseUser.uid.slice(0, 5).toUpperCase()}`,
          department: 'Physician • APEX Medical Center',
          isDemo: false,
        };
        setStaffUser(staff);
        sessionStorage.setItem('apex_staff_session', JSON.stringify(staff));
      } else {
        const stored = sessionStorage.getItem('apex_staff_session');
        if (stored) {
          try {
            setStaffUser(JSON.parse(stored));
          } catch {
            setStaffUser(null);
          }
        } else {
          setStaffUser(null);
        }
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Load patient directory
  const loadPatients = useCallback(async () => {
    setIsLoadingPatients(true);
    try {
      const fetched = await fetchAllPatients();
      if (fetched.length === 0) {
        const local = getLocalPatients();
        setPatients(local);
      } else {
        setPatients(fetched);
      }
    } catch (err) {
      console.warn('Could not load patients, using local fallback:', err);
      setPatients(getLocalPatients());
    } finally {
      setIsLoadingPatients(false);
    }
  }, []);

  // Load Drug Store medicines and stock movement history
  const loadStoreData = useCallback(async () => {
    setIsLoadingStore(true);
    try {
      const [meds, txs] = await Promise.all([
        fetchStoreMedicines(),
        fetchStockTransactions(),
      ]);
      setStoreMedicines(meds);
      setStockTransactions(txs);
    } catch (err) {
      console.warn('Could not load store data, using local fallback:', err);
      setStoreMedicines(getLocalStoreMedicines());
      setStockTransactions(getLocalStockTransactions());
    } finally {
      setIsLoadingStore(false);
    }
  }, []);

  useEffect(() => {
    if (staffUser) {
      loadPatients();
      loadStoreData();
    }
  }, [staffUser, loadPatients, loadStoreData]);

  // Load patient prescriptions, reports, and medicine log
  const handleSelectPatient = async (patient: Patient) => {
    setSelectedPatient(patient);
    setCurrentTab('details');
    setIsLoadingPatientData(true);

    const docId = patient.id || `pat_${patient.patientId.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
    try {
      const [rxs, reps, meds] = await Promise.all([
        fetchPatientPrescriptions(docId),
        fetchPatientMedicalReports(docId),
        fetchPatientMedicineHistory(docId),
      ]);
      setPrescriptions(rxs);
      setMedicalReports(reps);
      setMedicineRecords(meds);
    } catch (err) {
      console.warn('Error loading patient subcollections:', err);
    } finally {
      setIsLoadingPatientData(false);
    }
  };

  // Create a separate visit prescription
  const handleCreatePrescription = async (prescriptionData: {
    prescriptionNumber: string;
    prescriptionType: 'internal' | 'external';
    date: string;
    time: string;
    prescribingDoctor: string;
    visitReason?: string;
    medicines: any[];
    instructions?: string;
    status: 'active' | 'completed' | 'discontinued';
  }) => {
    if (!selectedPatient) return;
    const docId = selectedPatient.id || `pat_${selectedPatient.patientId.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
    const staffUid = staffUser?.uid || 'staff_anonymous';

    const newRx = await createPrescription(
      docId,
      selectedPatient.patientId,
      prescriptionData,
      staffUid
    );

    // Add to separate prescriptions state
    setPrescriptions((prev) => [newRx, ...prev]);

    // Also refresh medicine log
    const updatedMeds = await fetchPatientMedicineHistory(docId);
    setMedicineRecords(updatedMeds);

    // Refresh drug store in case stock was noted
    await loadStoreData();
  };

  // Edit / Update an existing prescription
  const handleUpdatePrescription = async (prescriptionId: string, updatedData: Partial<Prescription>) => {
    if (!selectedPatient) return;
    const docId = selectedPatient.id || `pat_${selectedPatient.patientId.replace(/[^a-zA-Z0-9_-]/g, '_')}`;

    await updatePrescription(docId, prescriptionId, updatedData);

    // Update state
    setPrescriptions((prev) =>
      prev.map((rx) => (rx.id === prescriptionId ? { ...rx, ...updatedData } : rx))
    );

    // Refresh medicine history
    const updatedMeds = await fetchPatientMedicineHistory(docId);
    setMedicineRecords(updatedMeds);

    // Refresh store inventory
    await loadStoreData();
  };

  // Delete a prescription
  const handleDeletePrescription = async (prescriptionId: string) => {
    if (!selectedPatient) return;
    const docId = selectedPatient.id || `pat_${selectedPatient.patientId.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
    await deletePrescription(docId, prescriptionId);
    setPrescriptions((prev) => prev.filter((rx) => rx.id !== prescriptionId));

    // Refresh medicine history
    const updatedMeds = await fetchPatientMedicineHistory(docId);
    setMedicineRecords(updatedMeds);
  };

  // Refresh medical reports
  const handleRefreshReports = async () => {
    if (!selectedPatient) return;
    const docId = selectedPatient.id || `pat_${selectedPatient.patientId.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
    const updatedReports = await fetchPatientMedicalReports(docId);
    setMedicalReports(updatedReports);
  };

  // On new patient registered
  const handlePatientRegistered = (newPatient: Patient) => {
    setPatients((prev) => [newPatient, ...prev]);
    handleSelectPatient(newPatient);
  };

  // Update Patient Personal Profile
  const handleUpdatePatient = async (patientDocId: string, updatedData: Partial<Patient>) => {
    const updated = await updatePatient(patientDocId, updatedData);
    setPatients((prev) =>
      prev.map((p) => (p.id === patientDocId || (p.patientId && p.patientId === updated.patientId) ? { ...p, ...updated } : p))
    );
    if (selectedPatient && (selectedPatient.id === patientDocId || selectedPatient.patientId === updated.patientId)) {
      setSelectedPatient((prev) => (prev ? { ...prev, ...updated } : null));
    }
  };

  // Delete Patient Personal Profile
  const handleDeletePatient = async (patientDocId: string) => {
    await deletePatient(patientDocId);
    setPatients((prev) => prev.filter((p) => p.id !== patientDocId));
    if (selectedPatient && (selectedPatient.id === patientDocId || selectedPatient.patientId === patientDocId)) {
      setSelectedPatient(null);
      setCurrentTab('search');
    }
  };

  // Update Staff / Doctor Personal Profile
  const handleUpdateStaffProfile = (updatedStaff: StaffUser) => {
    setStaffUser(updatedStaff);
    sessionStorage.setItem('apex_staff_session', JSON.stringify(updatedStaff));
  };

  // Delete / Reset Staff Personal Profile
  const handleDeleteStaffProfile = async () => {
    await handleLogout();
  };

  // Seed sample clinical data & Drug Store inventory
  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      const staffUid = staffUser?.uid || 'staff_seed';
      await seedSampleData(staffUid);
      await Promise.all([loadPatients(), loadStoreData()]);
      if (selectedPatient) {
        await handleSelectPatient(selectedPatient);
      }
    } catch (err) {
      console.error('Seeding error:', err);
    } finally {
      setIsSeeding(false);
    }
  };

  // Handle staff login from AuthScreen
  const handleStaffLogin = (user: StaffUser) => {
    setStaffUser(user);
    sessionStorage.setItem('apex_staff_session', JSON.stringify(user));
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // Ignored
    }
    sessionStorage.removeItem('apex_staff_session');
    setStaffUser(null);
    setSelectedPatient(null);
  };

  // Quick navigation from Testing Guide
  const handleSelectTestPatientId = (testPatientId: string) => {
    const found = patients.find((p) => p.patientId === testPatientId);
    if (found) {
      handleSelectPatient(found);
    } else {
      handleSeedData().then(() => {
        const seededList = getLocalPatients();
        const seededFound = seededList.find((p) => p.patientId === testPatientId);
        if (seededFound) {
          handleSelectPatient(seededFound);
        }
      });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">Loading APEX Medical Station...</p>
        </div>
      </div>
    );
  }

  if (!staffUser) {
    return <AuthScreen onLoginSuccess={handleStaffLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#eaf3f0] text-slate-900 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      {/* Offline Status Alert */}
      <OfflineBanner isOnline={isOnline} cachedPatientsCount={patients.length} />

      {/* Main Clinical Header with Two-Part Navigation */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          if (tab === 'search' || tab === 'drug-store') {
            setSelectedPatient(null);
          }
        }}
        staffUser={staffUser}
        onLogout={handleLogout}
        isOnline={isOnline}
        onOpenTestingGuide={() => setIsTestingGuideOpen(true)}
        onSeedSampleData={handleSeedData}
        isSeeding={isSeeding}
        onUpdateStaffProfile={handleUpdateStaffProfile}
        onDeleteStaffProfile={handleDeleteStaffProfile}
      />

      {/* Main Workspace Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:py-8">
        {/* PART 1: PATIENT MANAGEMENT - SEARCH & DIRECTORY */}
        {currentTab === 'search' && (
          <PatientSearch
            patients={patients}
            onSelectPatient={handleSelectPatient}
            onNavigateToRegister={() => setCurrentTab('register')}
            onSeedSampleData={handleSeedData}
            isSeeding={isSeeding}
            onQuickNewPrescription={(patient) => {
              handleSelectPatient(patient);
            }}
            onQuickPrintPrescription={(patient) => {
              handleSelectPatient(patient);
            }}
            storeMedicinesCount={storeMedicines.length}
            onNavigateToDrugStore={() => setCurrentTab('drug-store')}
            onUpdatePatient={handleUpdatePatient}
            onDeletePatient={handleDeletePatient}
          />
        )}

        {/* PART 1: PATIENT MANAGEMENT - REGISTER NEW PATIENT */}
        {currentTab === 'register' && (
          <PatientRegistration
            existingPatients={patients}
            staffUser={staffUser}
            onPatientRegistered={handlePatientRegistered}
            onCancel={() => setCurrentTab('search')}
          />
        )}

        {/* PART 1: PATIENT MANAGEMENT - PATIENT PROFILE & SEPARATE VISITS */}
        {currentTab === 'details' && selectedPatient && (
          <PatientDetails
            patient={selectedPatient}
            prescriptions={prescriptions}
            medicalReports={medicalReports}
            medicineRecords={medicineRecords}
            staffUser={staffUser}
            onBack={() => {
              setCurrentTab('search');
              setSelectedPatient(null);
            }}
            onCreatePrescription={handleCreatePrescription}
            onUpdatePrescription={handleUpdatePrescription}
            onDeletePrescription={handleDeletePrescription}
            onRefreshReports={handleRefreshReports}
            isLoading={isLoadingPatientData}
            storeMedicines={storeMedicines}
            onRefreshStore={loadStoreData}
            onUpdatePatientProfile={handleUpdatePatient}
            onDeletePatient={handleDeletePatient}
          />
        )}

        {/* PART 2: DRUG STORE & MEDICINE INVENTORY DASHBOARD */}
        {currentTab === 'drug-store' && (
          <DrugStoreDashboard
            medicines={storeMedicines}
            transactions={stockTransactions}
            patients={patients}
            staffUser={staffUser}
            onRefreshData={loadStoreData}
            isLoading={isLoadingStore}
          />
        )}
      </main>

      {/* Testing Guide Modal */}
      <TestingGuideModal
        isOpen={isTestingGuideOpen}
        onClose={() => setIsTestingGuideOpen(false)}
        onSeedSampleData={handleSeedData}
        isSeeding={isSeeding}
        onSelectTestPatientId={handleSelectTestPatientId}
      />

      {/* Hospital Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            © {new Date().getFullYear()} <strong>APEX Medical Center</strong> • Pilikada, Kurunegala • Doctor: <strong>Dr. Wishmika Rajaguru</strong> • Tel: <strong>0775621300</strong>
          </p>
          <p className="text-[11px] text-teal-700 font-medium">
            Two Integrated Modules: Patient Management & Drug Store Inventory Space Active
          </p>
        </div>
      </footer>
    </div>
  );
}
