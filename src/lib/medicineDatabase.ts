export interface StandardMedicine {
  name: string;
  genericName: string;
  defaultDosage: string;
  defaultTiming: 'Before meals' | 'After meals' | 'With meals' | 'Empty stomach' | 'As directed';
  defaultFrequency: 'Once daily' | 'Twice daily' | 'Three times daily' | 'Every 8 hours' | 'Every 6 hours' | 'As needed';
  defaultTimingDetail?: 'Morning Only' | 'Night Only';
  category: string;
}

export const MEDICINE_DATABASE: StandardMedicine[] = [
  // Analgesics & Antipyretics
  { name: 'Paracetamol 500mg', genericName: 'Paracetamol', defaultDosage: '1-2 tablets', defaultTiming: 'After meals', defaultFrequency: 'Every 6 hours', category: 'Analgesic' },
  { name: 'Paracetamol 650mg', genericName: 'Paracetamol', defaultDosage: '1 tablet', defaultTiming: 'After meals', defaultFrequency: 'Every 6 hours', category: 'Analgesic' },
  { name: 'Paracetamol Syrup 120mg/5ml', genericName: 'Paracetamol', defaultDosage: '5ml', defaultTiming: 'After meals', defaultFrequency: 'Every 6 hours', category: 'Pediatric' },
  { name: 'Paracetamol Syrup 250mg/5ml', genericName: 'Paracetamol', defaultDosage: '5ml', defaultTiming: 'After meals', defaultFrequency: 'Every 6 hours', category: 'Pediatric' },
  { name: 'Ibuprofen 200mg', genericName: 'Ibuprofen', defaultDosage: '1 tablet', defaultTiming: 'After meals', defaultFrequency: 'Every 8 hours', category: 'NSAID' },
  { name: 'Ibuprofen 400mg', genericName: 'Ibuprofen', defaultDosage: '1 tablet', defaultTiming: 'After meals', defaultFrequency: 'Every 8 hours', category: 'NSAID' },
  { name: 'Diclofenac Sodium 50mg', genericName: 'Diclofenac', defaultDosage: '1 tablet', defaultTiming: 'After meals', defaultFrequency: 'Twice daily', category: 'NSAID' },
  { name: 'Aceclofenac 100mg', genericName: 'Aceclofenac', defaultDosage: '1 tablet', defaultTiming: 'After meals', defaultFrequency: 'Twice daily', category: 'NSAID' },
  { name: 'Mefenamic Acid 500mg', genericName: 'Mefenamic Acid', defaultDosage: '1 capsule', defaultTiming: 'After meals', defaultFrequency: 'Every 8 hours', category: 'NSAID' },
  { name: 'Tramadol 50mg', genericName: 'Tramadol', defaultDosage: '1 capsule', defaultTiming: 'After meals', defaultFrequency: 'As needed', category: 'Analgesic' },

  // Antibiotics & Antimicrobials
  { name: 'Amoxicillin 500mg', genericName: 'Amoxicillin', defaultDosage: '1 capsule', defaultTiming: 'After meals', defaultFrequency: 'Every 8 hours', category: 'Antibiotic' },
  { name: 'Amoxicillin 250mg', genericName: 'Amoxicillin', defaultDosage: '1 capsule', defaultTiming: 'After meals', defaultFrequency: 'Every 8 hours', category: 'Antibiotic' },
  { name: 'Amoxicillin Syrup 125mg/5ml', genericName: 'Amoxicillin', defaultDosage: '5ml', defaultTiming: 'After meals', defaultFrequency: 'Every 8 hours', category: 'Pediatric' },
  { name: 'Amoxicillin + Clavulanic Acid 625mg (Augmentin)', genericName: 'Amoxicillin/Clavulanate', defaultDosage: '1 tablet', defaultTiming: 'After meals', defaultFrequency: 'Twice daily', category: 'Antibiotic' },
  { name: 'Amoxicillin + Clavulanic Acid 375mg', genericName: 'Amoxicillin/Clavulanate', defaultDosage: '1 tablet', defaultTiming: 'After meals', defaultFrequency: 'Three times daily', category: 'Antibiotic' },
  { name: 'Azithromycin 500mg', genericName: 'Azithromycin', defaultDosage: '1 tablet', defaultTiming: 'Before meals', defaultFrequency: 'Once daily', defaultTimingDetail: 'Morning Only', category: 'Antibiotic' },
  { name: 'Azithromycin 250mg', genericName: 'Azithromycin', defaultDosage: '1 capsule', defaultTiming: 'Before meals', defaultFrequency: 'Once daily', defaultTimingDetail: 'Morning Only', category: 'Antibiotic' },
  { name: 'Ciprofloxacin 500mg', genericName: 'Ciprofloxacin', defaultDosage: '1 tablet', defaultTiming: 'After meals', defaultFrequency: 'Twice daily', category: 'Antibiotic' },
  { name: 'Cefalexin 500mg', genericName: 'Cefalexin', defaultDosage: '1 capsule', defaultTiming: 'After meals', defaultFrequency: 'Every 6 hours', category: 'Antibiotic' },
  { name: 'Cefixime 200mg', genericName: 'Cefixime', defaultDosage: '1 tablet', defaultTiming: 'After meals', defaultFrequency: 'Twice daily', category: 'Antibiotic' },
  { name: 'Clarithromycin 500mg', genericName: 'Clarithromycin', defaultDosage: '1 tablet', defaultTiming: 'After meals', defaultFrequency: 'Twice daily', category: 'Antibiotic' },
  { name: 'Doxycycline 100mg', genericName: 'Doxycycline', defaultDosage: '1 capsule', defaultTiming: 'After meals', defaultFrequency: 'Twice daily', category: 'Antibiotic' },
  { name: 'Metronidazole 400mg', genericName: 'Metronidazole', defaultDosage: '1 tablet', defaultTiming: 'After meals', defaultFrequency: 'Every 8 hours', category: 'Antiprotozoal' },
  { name: 'Co-Trimoxazole 480mg', genericName: 'Sulfamethoxazole/Trimethoprim', defaultDosage: '1 tablet', defaultTiming: 'After meals', defaultFrequency: 'Twice daily', category: 'Antibiotic' },
  { name: 'Nitrofurantoin 100mg', genericName: 'Nitrofurantoin', defaultDosage: '1 tablet', defaultTiming: 'After meals', defaultFrequency: 'Twice daily', category: 'Antibiotic' },

  // Antihistamines & Allergy
  { name: 'Cetirizine 10mg', genericName: 'Cetirizine', defaultDosage: '1 tablet', defaultTiming: 'After meals', defaultFrequency: 'Once daily', defaultTimingDetail: 'Night Only', category: 'Antihistamine' },
  { name: 'Cetirizine Syrup 5mg/5ml', genericName: 'Cetirizine', defaultDosage: '5ml', defaultTiming: 'After meals', defaultFrequency: 'Once daily', defaultTimingDetail: 'Night Only', category: 'Pediatric' },
  { name: 'Chlorpheniramine 4mg (Piriton)', genericName: 'Chlorpheniramine', defaultDosage: '1 tablet', defaultTiming: 'After meals', defaultFrequency: 'Every 8 hours', category: 'Antihistamine' },
  { name: 'Fexofenadine 120mg (Allegra)', genericName: 'Fexofenadine', defaultDosage: '1 tablet', defaultTiming: 'After meals', defaultFrequency: 'Once daily', defaultTimingDetail: 'Morning Only', category: 'Antihistamine' },
  { name: 'Fexofenadine 180mg', genericName: 'Fexofenadine', defaultDosage: '1 tablet', defaultTiming: 'After meals', defaultFrequency: 'Once daily', defaultTimingDetail: 'Morning Only', category: 'Antihistamine' },
  { name: 'Loratadine 10mg', genericName: 'Loratadine', defaultDosage: '1 tablet', defaultTiming: 'After meals', defaultFrequency: 'Once daily', defaultTimingDetail: 'Morning Only', category: 'Antihistamine' },
  { name: 'Levocetirizine 5mg', genericName: 'Levocetirizine', defaultDosage: '1 tablet', defaultTiming: 'After meals', defaultFrequency: 'Once daily', defaultTimingDetail: 'Night Only', category: 'Antihistamine' },

  // Gastrointestinal & Antacids
  { name: 'Omeprazole 20mg', genericName: 'Omeprazole', defaultDosage: '1 capsule', defaultTiming: 'Before meals', defaultFrequency: 'Once daily', defaultTimingDetail: 'Morning Only', category: 'Antacid' },
  { name: 'Pantoprazole 40mg', genericName: 'Pantoprazole', defaultDosage: '1 tablet', defaultTiming: 'Before meals', defaultFrequency: 'Once daily', defaultTimingDetail: 'Morning Only', category: 'Antacid' },
  { name: 'Esomeprazole 20mg', genericName: 'Esomeprazole', defaultDosage: '1 tablet', defaultTiming: 'Before meals', defaultFrequency: 'Once daily', defaultTimingDetail: 'Morning Only', category: 'Antacid' },
  { name: 'Esomeprazole 40mg', genericName: 'Esomeprazole', defaultDosage: '1 tablet', defaultTiming: 'Before meals', defaultFrequency: 'Once daily', defaultTimingDetail: 'Morning Only', category: 'Antacid' },
  { name: 'Rabeprazole 20mg', genericName: 'Rabeprazole', defaultDosage: '1 tablet', defaultTiming: 'Before meals', defaultFrequency: 'Once daily', defaultTimingDetail: 'Morning Only', category: 'Antacid' },
  { name: 'Famotidine 20mg', genericName: 'Famotidine', defaultDosage: '1 tablet', defaultTiming: 'Before meals', defaultFrequency: 'Twice daily', category: 'Antacid' },
  { name: 'Domperidone 10mg', genericName: 'Domperidone', defaultDosage: '1 tablet', defaultTiming: 'Before meals', defaultFrequency: 'Three times daily', category: 'Antiemetic' },
  { name: 'Metoclopramide 10mg (Plasil)', genericName: 'Metoclopramide', defaultDosage: '1 tablet', defaultTiming: 'Before meals', defaultFrequency: 'Three times daily', category: 'Antiemetic' },
  { name: 'Ondansetron 4mg', genericName: 'Ondansetron', defaultDosage: '1 tablet', defaultTiming: 'Before meals', defaultFrequency: 'Twice daily', category: 'Antiemetic' },
  { name: 'Antacid Suspension (Gelusil / Mucaine)', genericName: 'Antacid', defaultDosage: '10ml', defaultTiming: 'After meals', defaultFrequency: 'Three times daily', category: 'Antacid' },
  { name: 'Hyoscine Butylbromide 10mg (Buscopan)', genericName: 'Hyoscine', defaultDosage: '1 tablet', defaultTiming: 'Before meals', defaultFrequency: 'As needed', category: 'Antispasmodic' },

  // Respiratory & Cough
  { name: 'Salbutamol 2mg', genericName: 'Salbutamol', defaultDosage: '1 tablet', defaultTiming: 'After meals', defaultFrequency: 'Every 8 hours', category: 'Bronchodilator' },
  { name: 'Salbutamol 4mg', genericName: 'Salbutamol', defaultDosage: '1 tablet', defaultTiming: 'After meals', defaultFrequency: 'Every 8 hours', category: 'Bronchodilator' },
  { name: 'Salbutamol Inhaler 100mcg', genericName: 'Salbutamol', defaultDosage: '2 puffs', defaultTiming: 'As directed', defaultFrequency: 'As needed', category: 'Inhaler' },
  { name: 'Montelukast 10mg', genericName: 'Montelukast', defaultDosage: '1 tablet', defaultTiming: 'After meals', defaultFrequency: 'Once daily', defaultTimingDetail: 'Night Only', category: 'Respiratory' },
  { name: 'Deriphyllin 150mg', genericName: 'Theophylline/Etophylline', defaultDosage: '1 tablet', defaultTiming: 'After meals', defaultFrequency: 'Twice daily', category: 'Bronchodilator' },
  { name: 'Bromhexine 8mg', genericName: 'Bromhexine', defaultDosage: '1 tablet', defaultTiming: 'After meals', defaultFrequency: 'Every 8 hours', category: 'Mucolytic' },
  { name: 'Ambroxol 30mg', genericName: 'Ambroxol', defaultDosage: '1 tablet', defaultTiming: 'After meals', defaultFrequency: 'Every 8 hours', category: 'Mucolytic' },
  { name: 'Dextromethorphan Syrup', genericName: 'Dextromethorphan', defaultDosage: '5-10ml', defaultTiming: 'After meals', defaultFrequency: 'Three times daily', category: 'Cough Suppressant' },

  // Cardiovascular & Hypertension
  { name: 'Amlodipine 5mg', genericName: 'Amlodipine', defaultDosage: '1 tablet', defaultTiming: 'After meals', defaultFrequency: 'Once daily', defaultTimingDetail: 'Morning Only', category: 'Antihypertensive' },
  { name: 'Amlodipine 10mg', genericName: 'Amlodipine', defaultDosage: '1 tablet', defaultTiming: 'After meals', defaultFrequency: 'Once daily', defaultTimingDetail: 'Morning Only', category: 'Antihypertensive' },
  { name: 'Losartan Potassium 50mg', genericName: 'Losartan', defaultDosage: '1 tablet', defaultTiming: 'After meals', defaultFrequency: 'Once daily', defaultTimingDetail: 'Morning Only', category: 'Antihypertensive' },
  { name: 'Losartan Potassium 25mg', genericName: 'Losartan', defaultDosage: '1 tablet', defaultTiming: 'After meals', defaultFrequency: 'Once daily', defaultTimingDetail: 'Morning Only', category: 'Antihypertensive' },
  { name: 'Telmisartan 40mg', genericName: 'Telmisartan', defaultDosage: '1 tablet', defaultTiming: 'After meals', defaultFrequency: 'Once daily', defaultTimingDetail: 'Morning Only', category: 'Antihypertensive' },
  { name: 'Enalapril 5mg', genericName: 'Enalapril', defaultDosage: '1 tablet', defaultTiming: 'After meals', defaultFrequency: 'Once daily', defaultTimingDetail: 'Morning Only', category: 'Antihypertensive' },
  { name: 'Lisinopril 10mg', genericName: 'Lisinopril', defaultDosage: '1 tablet', defaultTiming: 'After meals', defaultFrequency: 'Once daily', defaultTimingDetail: 'Morning Only', category: 'Antihypertensive' },
  { name: 'Atenolol 50mg', genericName: 'Atenolol', defaultDosage: '1 tablet', defaultTiming: 'After meals', defaultFrequency: 'Once daily', defaultTimingDetail: 'Morning Only', category: 'Beta Blocker' },
  { name: 'Bisoprolol 2.5mg', genericName: 'Bisoprolol', defaultDosage: '1 tablet', defaultTiming: 'After meals', defaultFrequency: 'Once daily', defaultTimingDetail: 'Morning Only', category: 'Beta Blocker' },
  { name: 'Bisoprolol 5mg', genericName: 'Bisoprolol', defaultDosage: '1 tablet', defaultTiming: 'After meals', defaultFrequency: 'Once daily', defaultTimingDetail: 'Morning Only', category: 'Beta Blocker' },
  { name: 'Hydrochlorothiazide 25mg', genericName: 'Hydrochlorothiazide', defaultDosage: '1 tablet', defaultTiming: 'After meals', defaultFrequency: 'Once daily', defaultTimingDetail: 'Morning Only', category: 'Diuretic' },
  { name: 'Furosemide 40mg (Lasix)', genericName: 'Furosemide', defaultDosage: '1 tablet', defaultTiming: 'After meals', defaultFrequency: 'Once daily', defaultTimingDetail: 'Morning Only', category: 'Diuretic' },
  { name: 'Atorvastatin 10mg', genericName: 'Atorvastatin', defaultDosage: '1 tablet', defaultTiming: 'After meals', defaultFrequency: 'Once daily', defaultTimingDetail: 'Night Only', category: 'Statin' },
  { name: 'Atorvastatin 20mg', genericName: 'Atorvastatin', defaultDosage: '1 tablet', defaultTiming: 'After meals', defaultFrequency: 'Once daily', defaultTimingDetail: 'Night Only', category: 'Statin' },
  { name: 'Rosuvastatin 10mg', genericName: 'Rosuvastatin', defaultDosage: '1 tablet', defaultTiming: 'After meals', defaultFrequency: 'Once daily', defaultTimingDetail: 'Night Only', category: 'Statin' },
  { name: 'Aspirin 75mg (Eco-Aspirin)', genericName: 'Aspirin', defaultDosage: '1 tablet', defaultTiming: 'After meals', defaultFrequency: 'Once daily', defaultTimingDetail: 'Morning Only', category: 'Antiplatelet' },
  { name: 'Clopidogrel 75mg', genericName: 'Clopidogrel', defaultDosage: '1 tablet', defaultTiming: 'After meals', defaultFrequency: 'Once daily', defaultTimingDetail: 'Morning Only', category: 'Antiplatelet' },

  // Diabetes & Endocrine
  { name: 'Metformin 500mg', genericName: 'Metformin', defaultDosage: '1 tablet', defaultTiming: 'After meals', defaultFrequency: 'Twice daily', category: 'Antidiabetic' },
  { name: 'Metformin 850mg', genericName: 'Metformin', defaultDosage: '1 tablet', defaultTiming: 'After meals', defaultFrequency: 'Twice daily', category: 'Antidiabetic' },
  { name: 'Metformin 500mg SR (Slow Release)', genericName: 'Metformin', defaultDosage: '1 tablet', defaultTiming: 'After meals', defaultFrequency: 'Once daily', defaultTimingDetail: 'Night Only', category: 'Antidiabetic' },
  { name: 'Gliclazide 80mg', genericName: 'Gliclazide', defaultDosage: '1 tablet', defaultTiming: 'Before meals', defaultFrequency: 'Twice daily', category: 'Antidiabetic' },
  { name: 'Gliclazide MR 30mg', genericName: 'Gliclazide', defaultDosage: '1 tablet', defaultTiming: 'Before meals', defaultFrequency: 'Once daily', defaultTimingDetail: 'Morning Only', category: 'Antidiabetic' },
  { name: 'Gliclazide MR 60mg', genericName: 'Gliclazide', defaultDosage: '1 tablet', defaultTiming: 'Before meals', defaultFrequency: 'Once daily', defaultTimingDetail: 'Morning Only', category: 'Antidiabetic' },
  { name: 'Glimepiride 1mg', genericName: 'Glimepiride', defaultDosage: '1 tablet', defaultTiming: 'Before meals', defaultFrequency: 'Once daily', defaultTimingDetail: 'Morning Only', category: 'Antidiabetic' },
  { name: 'Glimepiride 2mg', genericName: 'Glimepiride', defaultDosage: '1 tablet', defaultTiming: 'Before meals', defaultFrequency: 'Once daily', defaultTimingDetail: 'Morning Only', category: 'Antidiabetic' },
  { name: 'Thyroxine 50mcg', genericName: 'Levothyroxine', defaultDosage: '1 tablet', defaultTiming: 'Before meals', defaultFrequency: 'Once daily', defaultTimingDetail: 'Morning Only', category: 'Thyroid' },
  { name: 'Thyroxine 100mcg', genericName: 'Levothyroxine', defaultDosage: '1 tablet', defaultTiming: 'Before meals', defaultFrequency: 'Once daily', defaultTimingDetail: 'Morning Only', category: 'Thyroid' },

  // Vitamins & Supplements
  { name: 'Vitamin C 500mg (Ascorbic Acid)', genericName: 'Vitamin C', defaultDosage: '1 tablet', defaultTiming: 'After meals', defaultFrequency: 'Once daily', defaultTimingDetail: 'Morning Only', category: 'Vitamin' },
  { name: 'Vitamin B Complex', genericName: 'B-Complex', defaultDosage: '1 tablet', defaultTiming: 'After meals', defaultFrequency: 'Once daily', defaultTimingDetail: 'Morning Only', category: 'Vitamin' },
  { name: 'Calcium Carbonate + Vitamin D3 500mg', genericName: 'Calcium/Vit D3', defaultDosage: '1 tablet', defaultTiming: 'After meals', defaultFrequency: 'Once daily', defaultTimingDetail: 'Night Only', category: 'Supplement' },
  { name: 'Ferrous Fumarate 200mg (Iron)', genericName: 'Iron', defaultDosage: '1 tablet', defaultTiming: 'After meals', defaultFrequency: 'Once daily', defaultTimingDetail: 'Morning Only', category: 'Supplement' },
  { name: 'Folic Acid 5mg', genericName: 'Folic Acid', defaultDosage: '1 tablet', defaultTiming: 'After meals', defaultFrequency: 'Once daily', defaultTimingDetail: 'Morning Only', category: 'Supplement' },
  { name: 'Multivitamin with Minerals', genericName: 'Multivitamin', defaultDosage: '1 capsule', defaultTiming: 'After meals', defaultFrequency: 'Once daily', defaultTimingDetail: 'Morning Only', category: 'Vitamin' },
  { name: 'Zinc Sulfate 20mg', genericName: 'Zinc', defaultDosage: '1 tablet', defaultTiming: 'After meals', defaultFrequency: 'Once daily', defaultTimingDetail: 'Morning Only', category: 'Supplement' },

  // Topicals, Eye, Ear
  { name: 'Hydrocortisone 1% Cream', genericName: 'Hydrocortisone', defaultDosage: 'Apply thin layer', defaultTiming: 'As directed', defaultFrequency: 'Twice daily', category: 'Dermatological' },
  { name: 'Betamethasone Valerate 0.1% Cream', genericName: 'Betamethasone', defaultDosage: 'Apply thin layer', defaultTiming: 'As directed', defaultFrequency: 'Twice daily', category: 'Dermatological' },
  { name: 'Clotrimazole 1% Cream', genericName: 'Clotrimazole', defaultDosage: 'Apply locally', defaultTiming: 'As directed', defaultFrequency: 'Twice daily', category: 'Antifungal' },
  { name: 'Ciprofloxacin Eye/Ear Drops 0.3%', genericName: 'Ciprofloxacin Drops', defaultDosage: '2 drops', defaultTiming: 'As directed', defaultFrequency: 'Every 8 hours', category: 'Ophthalmic' },
  { name: 'Chloramphenicol 1% Eye Ointment', genericName: 'Chloramphenicol', defaultDosage: 'Apply to eye', defaultTiming: 'As directed', defaultFrequency: 'Once daily', defaultTimingDetail: 'Night Only', category: 'Ophthalmic' },
  { name: 'Saline Nasal Drops', genericName: 'Sodium Chloride', defaultDosage: '2 drops per nostril', defaultTiming: 'As directed', defaultFrequency: 'Every 6 hours', category: 'Nasal' },
];

/**
 * Smart search function for Helakuru-like autocomplete.
 * Matches starting letters first, then contains.
 * Limits to top 5-6 suggestions to avoid screen clutter.
 */
export function getSmartMedicineSuggestions(query: string, maxResults: number = 6): StandardMedicine[] {
  const clean = query.trim().toLowerCase();
  if (!clean || clean.length < 1) return [];

  // Group 1: Names or Generics starting with query
  const startsWithMatches: StandardMedicine[] = [];
  // Group 2: Contains query elsewhere
  const containsMatches: StandardMedicine[] = [];

  for (const med of MEDICINE_DATABASE) {
    const nameLow = med.name.toLowerCase();
    const genLow = med.genericName.toLowerCase();

    if (nameLow.startsWith(clean) || genLow.startsWith(clean)) {
      startsWithMatches.push(med);
    } else if (nameLow.includes(clean) || genLow.includes(clean)) {
      containsMatches.push(med);
    }

    if (startsWithMatches.length >= maxResults) break;
  }

  const combined = [...startsWithMatches, ...containsMatches];
  // Deduplicate
  const seen = new Set<string>();
  const results: StandardMedicine[] = [];
  for (const item of combined) {
    if (!seen.has(item.name)) {
      seen.add(item.name);
      results.push(item);
    }
    if (results.length >= maxResults) break;
  }

  return results;
}
