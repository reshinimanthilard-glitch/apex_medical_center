# Security Specification: MediPulse Patient Management

## 1. Data Invariants
1. Patients can only be created, read, and updated by authorized medical center staff members.
2. Every patient record must have a valid non-empty string `patientId` (alphanumeric/hyphen), `name`, `dateOfBirth`, `phoneNumber`, `address`, `registeredBy`, and optional `registeredByName`.
3. Medicine records must belong to an existing patient parent document.
4. Medicine history is strictly append-and-preserve: previous records cannot be silently overwritten or deleted by unauthorized operations.
5. All IDs must conform to length and character regex guards (`^[a-zA-Z0-9_-]+$`).

## 2. The Dirty Dozen Attack Payloads
1. Unauthenticated reading of `/patients` (Denied: `request.auth == null`).
2. Unauthenticated insertion of rogue patient record (Denied: `request.auth == null`).
3. Identity Spoofing: Staff user A inserting patient with `registeredBy = 'user_B'` (Denied: `incoming().registeredBy != request.auth.uid`).
4. Huge Payload Injection: Patient name over 150 characters (Denied: `.size() <= 150`).
5. Path Traversal or Malicious ID: Injecting ID with path characters `../` or exceeding length limits (Denied: `isValidId(docId)`).
6. Orphaned Medicine Record: Adding medicine record with mismatched `patientDocId` or invalid parent (Denied: `patientDocId == patientId`).
7. Doctor Spoofing / Empty Physician Name: Medicine record without valid doctor name (Denied: `size() >= 2`).
8. Medicine Record without required fields: Submitting medicine record without `medicineName` or `dosage` (Denied: `hasAll(...)`).
9. Arbitrary Field Pollution: Adding arbitrary `__adminRole` or unauthorized extra fields to patient (Denied: `hasOnly(...)`).
10. Unauthenticated read of medicine history (Denied: `request.auth == null`).
11. Deletion of entire medical records database by regular user (Denied: blanket write/delete disallowed).
12. Denial of Wallet / Unbounded query scrape (Denied: secure collection access requiring auth and explicit document access).
