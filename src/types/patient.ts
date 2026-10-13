export interface Patient {
  id?: string; // Firestore document ID
  patientId: string; // Clinical Unique ID, e.g. APX-2026-1
  nic?: string; // National Identity Card number
  name: string;
  dateOfBirth: string; // YYYY-MM-DD
  phoneNumber: string;
  address: string;
  gender?: string;
  bloodType?: string;
  allergies?: string;
  emergencyContact?: string;
  registeredBy: string; // Auth UID
  registeredByName?: string;
  createdAt: string;
  updatedAt?: string;
  latestVisitDate?: string;
  medicineCount?: number;
  prescriptionCount?: number;
  reportCount?: number;
}

export type MealTiming = 'Before meals' | 'After meals' | 'With meals' | 'Empty stomach' | 'As directed';

export type FrequencyOption = 
  | 'Once daily' 
  | 'Twice daily' 
  | 'Three times daily' 
  | 'Every 8 hours' 
  | 'Every 6 hours' 
  | 'As needed';

export type OnceDailyTiming = 'Morning Only' | 'Night Only';

export interface PrescriptionItem {
  id?: string;
  medicineName: string;
  dosage: string;
  mealTiming: MealTiming | string;
  frequency: FrequencyOption | string;
  timingDetail?: OnceDailyTiming | string; // Only 'Morning Only' or 'Night Only' when Once Daily is selected
  duration?: string;
  dispenseQuantity?: number; // Quantity to deduct from Drug Store if Internal Prescription
  notes?: string;
}

export type PrescriptionType = 'internal' | 'external';

export interface Prescription {
  id?: string; // Firestore document ID
  prescriptionNumber: string; // e.g. RX-INT-2026-0001 or RX-EXT-2026-0001
  prescriptionType: PrescriptionType; // 'internal' (Our Drug Store) or 'external' (Outside Pharmacy)
  patientDocId: string; // Parent patient Firestore doc ID
  patientId: string; // Clinic patient identifier code
  date: string; // YYYY-MM-DD
  time: string; // e.g. 10:30 AM
  prescribedAt: string; // ISO datetime
  prescribingDoctor: string; // Dr. Wishmika Rajaguru
  visitReason?: string; // Chief complaint / diagnosis
  medicines: PrescriptionItem[];
  instructions?: string;
  status: 'active' | 'completed' | 'discontinued';
  isDispensed?: boolean; // True when internal medicine stock has been deducted
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

export interface StoreMedicine {
  id?: string;
  medicineName: string;
  genericName?: string;
  strength?: string;
  dosageForm?: string; // Tablet, Capsule, Syrup, Injection, Cream, Suspension, Ointment, etc.
  unitOfMeasurement: string; // tablets, capsules, bottles, vials, tubes, etc.
  currentStockQuantity: number;
  minimumStockLevel: number;
  batchNumber?: string;
  expiryDate?: string; // YYYY-MM-DD
  supplierName?: string;
  dateAdded?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface StockBatch {
  id?: string;
  medicineId: string;
  batchNumber: string;
  quantity: number;
  expiryDate: string;
  supplierName?: string;
  receivedDate: string;
}

export type StockTransactionType = 'Stock Received' | 'Dispensed' | 'Returned' | 'Adjustment';

export interface StockTransaction {
  id?: string;
  medicineId: string;
  medicineName: string;
  transactionType: StockTransactionType;
  quantity: number; // positive for received, positive or negative magnitude
  previousStock: number;
  updatedStock: number;
  prescriptionNumber?: string;
  patientId?: string;
  patientName?: string;
  batchNumber?: string;
  performedBy?: string;
  notes?: string;
  timestamp: string; // ISO
}

export type ReportCategory = 
  | 'Lab Report' 
  | 'Blood Test' 
  | 'Radiology / X-Ray' 
  | 'ECG / Cardiology' 
  | 'Prescription Scan' 
  | 'Discharge Summary' 
  | 'Other';

export interface MedicalReport {
  id?: string;
  patientDocId: string;
  patientId: string;
  title: string;
  reportDate: string; // YYYY-MM-DD
  category: ReportCategory;
  fileType: 'image' | 'pdf';
  fileName: string;
  fileData: string; // Base64 data URL
  fileSize: number; // Bytes
  notes?: string;
  uploadedBy: string;
  createdAt: string;
}

export type MedicineStatus = 'active' | 'completed' | 'discontinued';

export interface MedicineRecord {
  id?: string;
  patientDocId: string;
  patientId: string;
  date: string;
  medicineName: string;
  dosage: string;
  mealTiming?: string;
  frequency?: string;
  timingDetail?: string;
  duration?: string;
  prescribingDoctor: string;
  notes: string;
  status?: MedicineStatus;
  prescriptionNumber?: string;
  prescriptionType?: PrescriptionType;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

export type UserRoleType = 
  | 'Doctor' 
  | 'Physician' 
  | 'Surgeon' 
  | 'Nurse' 
  | 'Pharmacist' 
  | 'Receptionist' 
  | 'Admin' 
  | 'Staff' 
  | 'Clinical Administrator';

export interface StaffUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  role: UserRoleType;
  staffId: string;
  department: string;
  isDemo?: boolean;
}

export interface DoctorProfile {
  id: string;
  name: string;
  role: string;
  specialty: string;
  qualifications: string;
  slmcNumber: string;
  roomNumber: string;
  phone: string;
  email: string;
  isAvailable: boolean;
  dutyHours: string;
  consultationFee: number;
  todayConsultationsCount: number;
  bio: string;
}

export interface ClinicStaffMember {
  id: string;
  name: string;
  role: UserRoleType;
  department: string;
  phone: string;
  email: string;
  shift: string;
  status: 'On Duty' | 'On Break' | 'Off Duty';
  assignedArea: string;
}

export type AppointmentStatus = 'Pending' | 'In-Consultation' | 'Completed' | 'Cancelled';

export interface ClinicAppointment {
  id: string;
  appointmentNumber: string;
  patientDocId: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  doctorName: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. 09:30 AM
  reasonForVisit: string;
  status: AppointmentStatus;
  tokenNumber: number;
  consultationFee: number;
  paymentStatus: 'Paid' | 'Pending';
  notes?: string;
  createdAt: string;
}

export interface BillingInvoice {
  id: string;
  invoiceNumber: string;
  patientDocId: string;
  patientId: string;
  patientName: string;
  date: string;
  doctorFee: number;
  pharmacyFee: number;
  labFee: number;
  discount: number;
  totalAmount: number;
  paymentMethod: 'Cash' | 'Card' | 'Insurance' | 'Online';
  paymentStatus: 'Paid' | 'Pending';
  notes?: string;
  createdAt: string;
}

export interface ClinicNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert' | 'success';
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

