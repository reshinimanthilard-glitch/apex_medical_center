import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDocs, 
  getDoc, 
  deleteDoc,
  query, 
  orderBy, 
  updateDoc 
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { 
  Patient, 
  MedicineRecord, 
  Prescription, 
  MedicalReport, 
  PrescriptionItem,
  StoreMedicine,
  StockTransaction,
  PrescriptionType
} from '../types/patient';
import { SAMPLE_PATIENT_SEEDS, SAMPLE_STORE_MEDICINES } from '../lib/sampleData';

const LOCAL_STORAGE_PATIENTS_KEY = 'apex_cached_patients_v3';
const LOCAL_STORAGE_PRESCRIPTIONS_KEY = 'apex_cached_prescriptions_v3';
const LOCAL_STORAGE_REPORTS_KEY = 'apex_cached_reports_v3';
const LOCAL_STORAGE_STORE_MEDS_KEY = 'apex_cached_store_meds_v3';
const LOCAL_STORAGE_TRANSACTIONS_KEY = 'apex_cached_transactions_v3';

// --- Local Storage Helpers ---

export function getLocalPatients(): Patient[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PATIENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalPatients(patients: Patient[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_PATIENTS_KEY, JSON.stringify(patients));
  } catch (e) {
    console.warn('Could not save patients to local storage:', e);
  }
}

export function getLocalPrescriptions(patientDocId: string): Prescription[] {
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_PRESCRIPTIONS_KEY}_${patientDocId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalPrescriptions(patientDocId: string, prescriptions: Prescription[]): void {
  try {
    localStorage.setItem(`${LOCAL_STORAGE_PRESCRIPTIONS_KEY}_${patientDocId}`, JSON.stringify(prescriptions));
  } catch (e) {
    console.warn('Could not save prescriptions to local storage:', e);
  }
}

export function getLocalReports(patientDocId: string): MedicalReport[] {
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_REPORTS_KEY}_${patientDocId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalReports(patientDocId: string, reports: MedicalReport[]): void {
  try {
    localStorage.setItem(`${LOCAL_STORAGE_REPORTS_KEY}_${patientDocId}`, JSON.stringify(reports));
  } catch (e) {
    console.warn('Could not save reports to local storage:', e);
  }
}

export function getLocalStoreMedicines(): StoreMedicine[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_STORE_MEDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalStoreMedicines(meds: StoreMedicine[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_STORE_MEDS_KEY, JSON.stringify(meds));
  } catch (e) {
    console.warn('Could not save store meds to local storage:', e);
  }
}

export function getLocalStockTransactions(): StockTransaction[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_TRANSACTIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalStockTransactions(txs: StockTransaction[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_TRANSACTIONS_KEY, JSON.stringify(txs));
  } catch (e) {
    console.warn('Could not save stock transactions to local storage:', e);
  }
}

// --- Firestore Payload Sanitizer ---

/**
 * Deeply removes all `undefined` values from objects and arrays.
 * Firestore strictly rejects documents with `undefined` values.
 */
export function deepCleanFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }
  if (Array.isArray(data)) {
    return data
      .filter((item) => item !== undefined)
      .map((item) => deepCleanFirestore(item)) as unknown as T;
  }
  if (typeof data === 'object' && !(data instanceof Date)) {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(data as Record<string, any>)) {
      if (value !== undefined) {
        cleaned[key] = deepCleanFirestore(value);
      }
    }
    return cleaned as T;
  }
  return data;
}

// --- Sequential Medical ID Generator ---

/**
 * Generates sequential Medical ID in format: APX-YYYY-1, APX-YYYY-2, etc.
 * Changes year by year.
 */
export function generateNextMedicalId(patientsList: Patient[]): string {
  const currentYear = new Date().getFullYear();
  const prefix = `APX-${currentYear}-`;
  
  let maxSeq = 0;
  for (const p of patientsList) {
    const pId = p.patientId ? p.patientId.replace(/\s+/g, '') : '';
    if (pId.startsWith(prefix)) {
      const numPart = parseInt(pId.replace(prefix, ''), 10);
      if (!isNaN(numPart) && numPart > maxSeq) {
        maxSeq = numPart;
      }
    }
  }
  return `APX-${currentYear}-${maxSeq + 1}`;
}

/**
 * Register a new patient with NIC and sequential Medical ID
 */
export async function registerPatient(
  patientData: Omit<Patient, 'id' | 'registeredBy' | 'createdAt'>,
  staffUid: string,
  staffName: string
): Promise<Patient> {
  const now = new Date().toISOString();
  
  const cleanData: Omit<Patient, 'id'> = {
    patientId: patientData.patientId.trim().toUpperCase(),
    name: patientData.name.trim(),
    dateOfBirth: patientData.dateOfBirth.trim(),
    phoneNumber: patientData.phoneNumber.trim(),
    address: patientData.address.trim(),
    registeredBy: staffUid,
    registeredByName: staffName,
    createdAt: now,
    ...(patientData.nic ? { nic: patientData.nic.trim().toUpperCase() } : {}),
    ...(patientData.gender ? { gender: patientData.gender } : {}),
    ...(patientData.bloodType ? { bloodType: patientData.bloodType } : {}),
    ...(patientData.allergies ? { allergies: patientData.allergies.trim() } : {}),
    ...(patientData.emergencyContact ? { emergencyContact: patientData.emergencyContact.trim() } : {}),
    updatedAt: now,
  };

  const path = 'patients';
  try {
    const docId = `pat_${cleanData.patientId.replace(/[^a-zA-Z0-9_-]/g, '_')}_${Date.now()}`;
    const docRef = doc(db, path, docId);
    const safeData = deepCleanFirestore(cleanData);
    await setDoc(docRef, safeData);

    const createdPatient: Patient = {
      id: docId,
      ...safeData,
    };

    const currentList = getLocalPatients();
    const updatedList = [createdPatient, ...currentList.filter(p => p.patientId !== createdPatient.patientId)];
    saveLocalPatients(updatedList);

    return createdPatient;
  } catch (error) {
    console.error('Error registering patient in Firestore, falling back to local storage:', error);
    const fallbackId = `local_${cleanData.patientId}_${Date.now()}`;
    const fallbackPatient: Patient = {
      id: fallbackId,
      ...cleanData,
    };
    const currentList = getLocalPatients();
    saveLocalPatients([fallbackPatient, ...currentList]);
    return fallbackPatient;
  }
}

/**
 * Fetch all patients
 */
export async function fetchAllPatients(): Promise<Patient[]> {
  const path = 'patients';
  try {
    const collRef = collection(db, path);
    const q = query(collRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    const patients: Patient[] = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<Patient, 'id'>)
    }));

    if (patients.length > 0) {
      saveLocalPatients(patients);
      return patients;
    }
    return getLocalPatients();
  } catch (error) {
    console.warn('Firestore fetch failed, returning cached patients:', error);
    return getLocalPatients();
  }
}

// --- Prescriptions Management ---

export function generatePrescriptionNumber(type: PrescriptionType = 'internal'): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  const prefix = type === 'internal' ? 'RX-INT' : 'RX-EXT';
  return `${prefix}-${year}-${rand}`;
}

/**
 * Create a separate visit prescription (Internal or External)
 */
export async function createPrescription(
  patientDocId: string,
  patientId: string,
  prescriptionData: {
    prescriptionNumber?: string;
    prescriptionType: PrescriptionType;
    date: string;
    time: string;
    prescribingDoctor: string;
    visitReason?: string;
    medicines: PrescriptionItem[];
    instructions?: string;
    status?: 'active' | 'completed' | 'discontinued';
  },
  staffUid: string
): Promise<Prescription> {
  const now = new Date().toISOString();
  const rxType = prescriptionData.prescriptionType || 'internal';
  const rxNumber = prescriptionData.prescriptionNumber || generatePrescriptionNumber(rxType);

  // Sanitize medicines list to remove any undefined fields
  const cleanMedicines = (prescriptionData.medicines || []).map((m) => {
    const med: Record<string, any> = {
      medicineName: (m.medicineName || '').trim(),
      dosage: (m.dosage || '1 tablet').trim(),
      mealTiming: m.mealTiming || 'After meals',
      frequency: m.frequency || 'Twice daily',
    };
    if (m.timingDetail) med.timingDetail = m.timingDetail;
    if (m.duration && m.duration.trim()) med.duration = m.duration.trim();
    if (m.notes && m.notes.trim()) med.notes = m.notes.trim();
    if (typeof m.dispenseQuantity === 'number' && !isNaN(m.dispenseQuantity)) {
      med.dispenseQuantity = m.dispenseQuantity;
    }
    return med;
  });

  const prescriptionPayload: Omit<Prescription, 'id'> = {
    prescriptionNumber: rxNumber,
    prescriptionType: rxType,
    patientDocId,
    patientId: patientId.toUpperCase(),
    date: prescriptionData.date,
    time: prescriptionData.time,
    prescribedAt: now,
    prescribingDoctor: prescriptionData.prescribingDoctor.trim(),
    medicines: cleanMedicines as PrescriptionItem[],
    status: prescriptionData.status || 'active',
    isDispensed: false,
    createdBy: staffUid,
    createdAt: now,
    ...(prescriptionData.visitReason ? { visitReason: prescriptionData.visitReason.trim() } : {}),
    ...(prescriptionData.instructions ? { instructions: prescriptionData.instructions.trim() } : {}),
    updatedAt: now,
  };

  const firestoreSafePayload = deepCleanFirestore(prescriptionPayload);

  try {
    const collRef = collection(db, 'patients', patientDocId, 'prescriptions');
    const docRef = await addDoc(collRef, firestoreSafePayload);

    const createdRx: Prescription = {
      id: docRef.id,
      ...prescriptionPayload,
    };

    const currentRxs = getLocalPrescriptions(patientDocId);
    saveLocalPrescriptions(patientDocId, [createdRx, ...currentRxs]);

    // Update parent patient latestVisitDate & updatedAt
    try {
      await updateDoc(doc(db, 'patients', patientDocId), { 
        updatedAt: now,
        latestVisitDate: prescriptionData.date,
      });
    } catch {
      // Non-fatal
    }

    return createdRx;
  } catch (error) {
    console.error('Error creating prescription in Firestore, caching locally:', error);
    const localId = `local_rx_${Date.now()}`;
    const fallbackRx: Prescription = {
      id: localId,
      ...prescriptionPayload,
    };
    const currentRxs = getLocalPrescriptions(patientDocId);
    saveLocalPrescriptions(patientDocId, [fallbackRx, ...currentRxs]);
    return fallbackRx;
  }
}

/**
 * Edit / Update an existing prescription
 */
export async function updatePrescription(
  patientDocId: string,
  prescriptionId: string,
  updatedData: Partial<Prescription>
): Promise<void> {
  const now = new Date().toISOString();
  const rawPayload = {
    ...updatedData,
    updatedAt: now,
  };
  const payload = deepCleanFirestore(rawPayload);

  try {
    await updateDoc(doc(db, 'patients', patientDocId, 'prescriptions', prescriptionId), payload);
  } catch (e) {
    console.warn('Could not update prescription in Firestore:', e);
  }

  // Update local cache
  const currentRxs = getLocalPrescriptions(patientDocId);
  const updated = currentRxs.map(rx => rx.id === prescriptionId ? { ...rx, ...payload } : rx);
  saveLocalPrescriptions(patientDocId, updated);
}

/**
 * Fetch prescriptions for patient
 */
export async function fetchPatientPrescriptions(patientDocId: string): Promise<Prescription[]> {
  try {
    const collRef = collection(db, 'patients', patientDocId, 'prescriptions');
    const q = query(collRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    const prescriptions: Prescription[] = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<Prescription, 'id'>)
    }));

    if (prescriptions.length > 0) {
      saveLocalPrescriptions(patientDocId, prescriptions);
      return prescriptions;
    }
    return getLocalPrescriptions(patientDocId);
  } catch (error) {
    console.warn('Could not fetch prescriptions from Firestore, using local cache:', error);
    return getLocalPrescriptions(patientDocId);
  }
}

/**
 * Delete a prescription
 */
export async function deletePrescription(patientDocId: string, prescriptionId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'patients', patientDocId, 'prescriptions', prescriptionId));
  } catch (e) {
    console.warn('Failed to delete prescription from Firestore:', e);
  }
  const current = getLocalPrescriptions(patientDocId);
  saveLocalPrescriptions(patientDocId, current.filter(rx => rx.id !== prescriptionId));
}

// --- Medical Reports Management ---

export async function addMedicalReport(
  patientDocId: string,
  patientId: string,
  reportData: {
    title: string;
    reportDate: string;
    category: MedicalReport['category'];
    fileType: 'image' | 'pdf';
    fileName: string;
    fileData: string;
    fileSize: number;
    notes?: string;
  },
  staffUid: string
): Promise<MedicalReport> {
  const now = new Date().toISOString();

  const reportPayload: Omit<MedicalReport, 'id'> = {
    patientDocId,
    patientId: patientId.toUpperCase(),
    title: reportData.title.trim(),
    reportDate: reportData.reportDate,
    category: reportData.category,
    fileType: reportData.fileType,
    fileName: reportData.fileName,
    fileData: reportData.fileData,
    fileSize: reportData.fileSize,
    uploadedBy: staffUid,
    createdAt: now,
    ...(reportData.notes ? { notes: reportData.notes.trim() } : {}),
  };

  const safeReport = deepCleanFirestore(reportPayload);

  try {
    const collRef = collection(db, 'patients', patientDocId, 'medical_reports');
    const docRef = await addDoc(collRef, safeReport);

    const createdReport: MedicalReport = {
      id: docRef.id,
      ...safeReport,
    };

    const currentReports = getLocalReports(patientDocId);
    saveLocalReports(patientDocId, [createdReport, ...currentReports]);

    return createdReport;
  } catch (error) {
    console.error('Error saving medical report in Firestore, caching locally:', error);
    const fallbackReport: MedicalReport = {
      id: `local_rep_${Date.now()}`,
      ...reportPayload,
    };
    const currentReports = getLocalReports(patientDocId);
    saveLocalReports(patientDocId, [fallbackReport, ...currentReports]);
    return fallbackReport;
  }
}

export async function fetchPatientMedicalReports(patientDocId: string): Promise<MedicalReport[]> {
  try {
    const collRef = collection(db, 'patients', patientDocId, 'medical_reports');
    const q = query(collRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    const reports: MedicalReport[] = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<MedicalReport, 'id'>)
    }));

    if (reports.length > 0) {
      saveLocalReports(patientDocId, reports);
      return reports;
    }
    return getLocalReports(patientDocId);
  } catch (error) {
    console.warn('Could not fetch medical reports from Firestore, using local cache:', error);
    return getLocalReports(patientDocId);
  }
}

export async function deleteMedicalReport(patientDocId: string, reportId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'patients', patientDocId, 'medical_reports', reportId));
  } catch (e) {
    console.warn('Failed to delete report from Firestore:', e);
  }
  const current = getLocalReports(patientDocId);
  saveLocalReports(patientDocId, current.filter(r => r.id !== reportId));
}

// --- Cumulative Medicine History (Legacy Support) ---

export async function fetchPatientMedicineHistory(patientDocId: string): Promise<MedicineRecord[]> {
  try {
    const rxs = await fetchPatientPrescriptions(patientDocId);
    const flattened: MedicineRecord[] = [];
    for (const rx of rxs) {
      for (const med of rx.medicines) {
        flattened.push({
          id: `${rx.id}_${med.medicineName}`,
          patientDocId,
          patientId: rx.patientId,
          date: rx.date,
          medicineName: med.medicineName,
          dosage: med.dosage,
          mealTiming: med.mealTiming,
          frequency: med.frequency,
          timingDetail: med.timingDetail,
          duration: med.duration,
          prescribingDoctor: rx.prescribingDoctor,
          notes: med.notes || rx.instructions || '',
          status: rx.status,
          prescriptionNumber: rx.prescriptionNumber,
          prescriptionType: rx.prescriptionType,
          createdBy: rx.createdBy,
          createdAt: rx.createdAt,
        });
      }
    }
    return flattened;
  } catch (e) {
    console.warn('Failed to build medicine history:', e);
    return [];
  }
}

// --- Drug Store & Inventory Management ---

/**
 * Fetch all store medicines
 */
export async function fetchStoreMedicines(): Promise<StoreMedicine[]> {
  try {
    const collRef = collection(db, 'store_medicines');
    const q = query(collRef, orderBy('medicineName', 'asc'));
    const snapshot = await getDocs(q);

    const meds: StoreMedicine[] = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<StoreMedicine, 'id'>)
    }));

    if (meds.length > 0) {
      saveLocalStoreMedicines(meds);
      return meds;
    }
    return getLocalStoreMedicines();
  } catch (error) {
    console.warn('Could not fetch store medicines from Firestore, using local cache:', error);
    return getLocalStoreMedicines();
  }
}

/**
 * Add a new medicine to the drug store
 */
export async function createStoreMedicine(
  medicineData: Omit<StoreMedicine, 'id' | 'createdAt' | 'updatedAt'>,
  staffName: string = 'Staff'
): Promise<StoreMedicine> {
  const now = new Date().toISOString();
  const payload: Omit<StoreMedicine, 'id'> = {
    ...medicineData,
    currentStockQuantity: Number(medicineData.currentStockQuantity) || 0,
    minimumStockLevel: Number(medicineData.minimumStockLevel) || 50,
    createdAt: now,
    updatedAt: now,
  };

  const safePayload = deepCleanFirestore(payload);

  try {
    const collRef = collection(db, 'store_medicines');
    const docRef = await addDoc(collRef, safePayload);

    const created: StoreMedicine = {
      id: docRef.id,
      ...safePayload,
    };

    const currentMeds = getLocalStoreMedicines();
    saveLocalStoreMedicines([...currentMeds, created]);

    // Record initial stock transaction if quantity > 0
    if (created.currentStockQuantity > 0) {
      await recordStockTransaction({
        medicineId: docRef.id,
        medicineName: `${created.medicineName} ${created.strength || ''}`.trim(),
        transactionType: 'Stock Received',
        quantity: created.currentStockQuantity,
        previousStock: 0,
        updatedStock: created.currentStockQuantity,
        batchNumber: created.batchNumber,
        performedBy: staffName,
        notes: `Initial registration of ${created.medicineName}`,
      });
    }

    return created;
  } catch (error) {
    console.error('Error creating store medicine in Firestore, caching locally:', error);
    const localId = `local_sm_${Date.now()}`;
    const fallback: StoreMedicine = {
      id: localId,
      ...payload,
    };
    const currentMeds = getLocalStoreMedicines();
    saveLocalStoreMedicines([...currentMeds, fallback]);
    return fallback;
  }
}

/**
 * Add more stock to an existing medicine
 */
export async function addStockToMedicine(
  medicineId: string,
  additionalQuantity: number,
  batchData: {
    batchNumber?: string;
    expiryDate?: string;
    supplierName?: string;
    notes?: string;
  },
  staffName: string = 'Staff'
): Promise<void> {
  const now = new Date().toISOString();
  const allMeds = getLocalStoreMedicines();
  const target = allMeds.find(m => m.id === medicineId);
  if (!target) return;

  const previousStock = target.currentStockQuantity;
  const updatedStock = previousStock + Number(additionalQuantity);

  const updatePayload: Partial<StoreMedicine> = {
    currentStockQuantity: updatedStock,
    updatedAt: now,
    ...(batchData.batchNumber ? { batchNumber: batchData.batchNumber } : {}),
    ...(batchData.expiryDate ? { expiryDate: batchData.expiryDate } : {}),
    ...(batchData.supplierName ? { supplierName: batchData.supplierName } : {}),
  };

  try {
    await updateDoc(doc(db, 'store_medicines', medicineId), updatePayload);
  } catch (e) {
    console.warn('Could not update stock in Firestore:', e);
  }

  // Update local
  saveLocalStoreMedicines(allMeds.map(m => m.id === medicineId ? { ...m, ...updatePayload } : m));

  // Log transaction
  await recordStockTransaction({
    medicineId,
    medicineName: `${target.medicineName} ${target.strength || ''}`.trim(),
    transactionType: 'Stock Received',
    quantity: Number(additionalQuantity),
    previousStock,
    updatedStock,
    batchNumber: batchData.batchNumber || target.batchNumber,
    performedBy: staffName,
    notes: batchData.notes || `Stock received from ${batchData.supplierName || target.supplierName || 'supplier'}`,
  });
}

/**
 * Dispense medicines from internal drug store for an Internal Prescription
 * Deducts stock automatically and logs audit trail.
 */
export async function dispensePrescriptionMedicines(
  prescription: Prescription,
  patient: Patient,
  staffName: string = 'Dr. Wishmika Rajaguru'
): Promise<{ success: boolean; message: string }> {
  if (prescription.prescriptionType !== 'internal') {
    return { success: false, message: 'Only internal prescriptions are dispensed from the clinic drug store.' };
  }
  if (prescription.isDispensed) {
    return { success: false, message: 'This prescription has already been dispensed from stock.' };
  }

  const allMeds = await fetchStoreMedicines();

  // Validate stock availability first
  for (const item of prescription.medicines) {
    const qtyToDeduct = item.dispenseQuantity && item.dispenseQuantity > 0 ? item.dispenseQuantity : 10;
    const match = allMeds.find(m => 
      m.medicineName.toLowerCase() === item.medicineName.toLowerCase() ||
      item.medicineName.toLowerCase().startsWith(m.medicineName.toLowerCase())
    );

    if (match && match.currentStockQuantity < qtyToDeduct) {
      return { 
        success: false, 
        message: `Insufficient stock for ${match.medicineName} (Available: ${match.currentStockQuantity}, Requested: ${qtyToDeduct})` 
      };
    }
  }

  // Deduct stock for each medicine
  for (const item of prescription.medicines) {
    const qtyToDeduct = item.dispenseQuantity && item.dispenseQuantity > 0 ? item.dispenseQuantity : 10;
    const match = allMeds.find(m => 
      m.medicineName.toLowerCase() === item.medicineName.toLowerCase() ||
      item.medicineName.toLowerCase().startsWith(m.medicineName.toLowerCase())
    );

    if (match && match.id) {
      const prevStock = match.currentStockQuantity;
      const newStock = Math.max(0, prevStock - qtyToDeduct);

      try {
        await updateDoc(doc(db, 'store_medicines', match.id), {
          currentStockQuantity: newStock,
          updatedAt: new Date().toISOString(),
        });
      } catch (e) {
        console.warn('Failed to deduct stock in Firestore:', e);
      }

      // Record transaction
      await recordStockTransaction({
        medicineId: match.id,
        medicineName: `${match.medicineName} ${match.strength || ''}`.trim(),
        transactionType: 'Dispensed',
        quantity: qtyToDeduct,
        previousStock: prevStock,
        updatedStock: newStock,
        prescriptionNumber: prescription.prescriptionNumber,
        patientId: patient.patientId,
        patientName: patient.name,
        performedBy: staffName,
        notes: `Dispensed to patient ${patient.name} (${patient.patientId})`,
      });
    }
  }

  // Mark prescription as dispensed
  if (prescription.id) {
    await updatePrescription(prescription.patientDocId, prescription.id, {
      isDispensed: true,
      status: 'active',
    });
  }

  return { success: true, message: 'Medicines dispensed and drug store stock updated successfully.' };
}

/**
 * Record stock transaction audit log
 */
export async function recordStockTransaction(
  txData: Omit<StockTransaction, 'id' | 'timestamp'>
): Promise<StockTransaction> {
  const now = new Date().toISOString();
  const payload: Omit<StockTransaction, 'id'> = {
    ...txData,
    timestamp: now,
  };

  const safePayload = deepCleanFirestore(payload);

  try {
    const collRef = collection(db, 'stock_transactions');
    const docRef = await addDoc(collRef, safePayload);

    const created: StockTransaction = {
      id: docRef.id,
      ...safePayload,
    };

    const currentTxs = getLocalStockTransactions();
    saveLocalStockTransactions([created, ...currentTxs]);
    return created;
  } catch (error) {
    console.error('Error logging stock transaction in Firestore, caching locally:', error);
    const fallback: StockTransaction = {
      id: `local_tx_${Date.now()}`,
      ...payload,
    };
    const currentTxs = getLocalStockTransactions();
    saveLocalStockTransactions([fallback, ...currentTxs]);
    return fallback;
  }
}

/**
 * Fetch all stock movement audit logs
 */
export async function fetchStockTransactions(): Promise<StockTransaction[]> {
  try {
    const collRef = collection(db, 'stock_transactions');
    const q = query(collRef, orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);

    const txs: StockTransaction[] = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<StockTransaction, 'id'>)
    }));

    if (txs.length > 0) {
      saveLocalStockTransactions(txs);
      return txs;
    }
    return getLocalStockTransactions();
  } catch (error) {
    console.warn('Could not fetch stock transactions from Firestore, using local cache:', error);
    return getLocalStockTransactions();
  }
}

/**
 * Adjust stock level or handle return for store inventory
 */
export async function adjustMedicineStock(
  medicineId: string,
  newQuantity: number,
  transactionType: 'Adjustment' | 'Returned',
  reason: string,
  staffName: string = 'Staff'
): Promise<void> {
  const now = new Date().toISOString();
  const allMeds = getLocalStoreMedicines();
  const target = allMeds.find(m => m.id === medicineId);
  if (!target) return;

  const previousStock = target.currentStockQuantity;
  const quantityDiff = newQuantity - previousStock;
  const finalStock = Math.max(0, newQuantity);

  const updatePayload = {
    currentStockQuantity: finalStock,
    updatedAt: now,
  };

  try {
    await updateDoc(doc(db, 'store_medicines', medicineId), updatePayload);
  } catch (e) {
    console.warn('Could not update stock in Firestore:', e);
  }

  saveLocalStoreMedicines(allMeds.map(m => m.id === medicineId ? { ...m, ...updatePayload } : m));

  await recordStockTransaction({
    medicineId,
    medicineName: `${target.medicineName} ${target.strength || ''}`.trim(),
    transactionType,
    quantity: Math.abs(quantityDiff),
    previousStock,
    updatedStock: finalStock,
    performedBy: staffName,
    notes: reason || `Stock ${transactionType.toLowerCase()} to ${finalStock}`,
  });
}

// --- Seed Data ---

export async function seedSampleData(staffUid: string): Promise<number> {
  let seededCount = 0;

  // 1. Seed Drug Store inventory
  for (const item of SAMPLE_STORE_MEDICINES) {
    try {
      const docId = `sm_${item.medicineName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      const medRef = doc(db, 'store_medicines', docId);
      await setDoc(medRef, item);
    } catch (e) {
      console.warn('Could not seed store medicine to Firestore:', e);
    }
  }
  saveLocalStoreMedicines(SAMPLE_STORE_MEDICINES.map((m, idx) => ({ id: `seed_sm_${idx}`, ...m })));

  // 2. Seed Patients with separate visit prescriptions
  for (const seed of SAMPLE_PATIENT_SEEDS) {
    try {
      const docId = `pat_${seed.patient.patientId.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
      const patientRef = doc(db, 'patients', docId);
      
      const payload: Omit<Patient, 'id'> = {
        ...seed.patient,
        registeredBy: staffUid,
        createdAt: seed.patient.createdAt,
      };

      await setDoc(patientRef, payload);

      if (seed.prescriptions) {
        for (const rx of seed.prescriptions) {
          const rxRef = doc(collection(db, 'patients', docId, 'prescriptions'));
          await setDoc(rxRef, {
            ...rx,
            patientDocId: docId,
            createdBy: staffUid,
          });
        }
      }
      seededCount++;
    } catch (e) {
      console.warn('Could not seed patient to Firestore:', e);
    }
  }

  // Update local mirrors
  const sampleLocalPatients: Patient[] = SAMPLE_PATIENT_SEEDS.map(seed => {
    const docId = `pat_${seed.patient.patientId.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
    if (seed.prescriptions) {
      saveLocalPrescriptions(docId, seed.prescriptions.map((rx, idx) => ({
        id: `seed_rx_${docId}_${idx}`,
        patientDocId: docId,
        ...rx,
      })));
    }
    return {
      id: docId,
      ...seed.patient,
      registeredBy: staffUid,
    };
  });

  saveLocalPatients(sampleLocalPatients);
  return seededCount;
}
