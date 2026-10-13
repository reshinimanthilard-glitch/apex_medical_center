import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Image as ImageIcon, 
  Upload, 
  Plus, 
  Trash2, 
  Calendar, 
  Eye, 
  Download, 
  AlertCircle, 
  RotateCw, 
  CheckCircle2, 
  X,
  FileCheck,
  Tag,
  Paperclip
} from 'lucide-react';
import { Patient, MedicalReport, ReportCategory, StaffUser } from '../types/patient';
import { addMedicalReport, deleteMedicalReport } from '../services/patientService';

interface MedicalReportsSectionProps {
  patient: Patient;
  reports: MedicalReport[];
  staffUser: StaffUser | null;
  onRefreshReports: () => Promise<void>;
}

export const MedicalReportsSection: React.FC<MedicalReportsSectionProps> = ({
  patient,
  reports,
  staffUser,
  onRefreshReports,
}) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedReportForView, setSelectedReportForView] = useState<MedicalReport | null>(null);

  // Upload Form State
  const [title, setTitle] = useState('');
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<ReportCategory>('Lab Report');
  const [notes, setNotes] = useState('');
  const [fileData, setFileData] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState<'image' | 'pdf'>('image');
  const [fileSize, setFileSize] = useState(0);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File selection & base64 conversion
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setFileSize(file.size);

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    setFileType(isPdf ? 'pdf' : 'image');

    // Check size limit: keep under 850KB for Firestore doc limit
    if (file.size > 850 * 1024) {
      if (isPdf) {
        setUploadError('PDF file is too large for database record (max ~850KB). Please upload a compressed PDF.');
        return;
      } else {
        // Compress image via canvas
        compressAndLoadImage(file);
        return;
      }
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFileData(reader.result as string);
      setUploadError(null);
    };
    reader.onerror = () => {
      setUploadError('Could not read the selected file.');
    };
    reader.readAsDataURL(file);
  };

  // Image compressor to ensure it fits in Cloud Firestore document (< 800KB)
  const compressAndLoadImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 1200;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75);
        setFileData(compressedDataUrl);
        setFileSize(Math.round((compressedDataUrl.length * 3) / 4));
        setUploadError(null);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);

    if (!title.trim()) {
      setUploadError('Please provide a report title.');
      return;
    }
    if (!fileData) {
      setUploadError('Please choose a report photo or PDF document to upload.');
      return;
    }

    setIsUploading(true);
    try {
      const docId = patient.id || `pat_${patient.patientId.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
      const staffUid = staffUser?.uid || 'staff_upload';

      await addMedicalReport(
        docId,
        patient.patientId,
        {
          title: title.trim(),
          reportDate,
          category,
          fileType,
          fileName: fileName || `${title.replace(/\s+/g, '_')}.${fileType === 'pdf' ? 'pdf' : 'jpg'}`,
          fileData,
          fileSize,
          notes: notes.trim(),
        },
        staffUid
      );

      await onRefreshReports();
      setIsUploadModalOpen(false);
      // Reset form
      setTitle('');
      setNotes('');
      setFileData(null);
      setFileName('');
    } catch (err: unknown) {
      console.error('Report upload failed:', err);
      setUploadError('Failed to save medical report in Cloud Firestore.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteReport = async (reportId?: string) => {
    if (!reportId) return;
    if (!window.confirm('Are you sure you want to delete this medical report?')) return;
    const docId = patient.id || `pat_${patient.patientId.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
    await deleteMedicalReport(docId, reportId);
    await onRefreshReports();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Top Action Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Paperclip className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-900">
              Medical Reports & Documents (Photos / PDFs)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Store patient lab results, blood tests, radiology scans, and medical PDF reports securely in Cloud Firestore.
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer shrink-0"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Medical Report / PDF</span>
        </button>
      </div>

      {/* Reports Grid */}
      {reports.length === 0 ? (
        <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-6">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 mx-auto flex items-center justify-center mb-3">
            <FileText className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">No Medical Reports Uploaded Yet</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            You can attach diagnostic lab reports, X-ray photos, blood investigations, or medical PDF documents directly to this patient's profile.
          </p>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="mt-4 inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload First Medical Report</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Thumbnail / Header Preview */}
                <div 
                  onClick={() => setSelectedReportForView(report)}
                  className="h-36 bg-slate-100 border-b border-slate-200 relative cursor-pointer overflow-hidden flex items-center justify-center group-hover:bg-slate-200/60 transition-colors"
                >
                  {report.fileType === 'image' ? (
                    <img
                      src={report.fileData}
                      alt={report.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center mb-2 shadow-xs">
                        <FileText className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold text-slate-700 block truncate max-w-[200px]">
                        {report.fileName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">PDF Document</span>
                    </div>
                  )}

                  {/* Category Pill Over Thumbnail */}
                  <span className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                    {report.category}
                  </span>

                  <div className="absolute inset-0 bg-blue-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-white text-blue-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Report</span>
                    </span>
                  </div>
                </div>

                {/* Report Info Details */}
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 
                      onClick={() => setSelectedReportForView(report)}
                      className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer leading-snug"
                    >
                      {report.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {report.reportDate}
                    </span>
                    <span>•</span>
                    <span>{formatFileSize(report.fileSize)}</span>
                  </div>

                  {report.notes && (
                    <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      {report.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Bottom Card Actions */}
              <div className="p-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => setSelectedReportForView(report)}
                  className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect</span>
                </button>

                <div className="flex items-center gap-2">
                  <a
                    href={report.fileData}
                    download={report.fileName}
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    title="Download file"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => handleDeleteReport(report.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete report"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="bg-gradient-to-r from-blue-700 to-sky-600 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Upload Medical Report / PDF</h3>
                  <p className="text-xs text-blue-100">
                    Patient: {patient.name} ({patient.patientId})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1.5 rounded-lg text-blue-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
              {uploadError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Report Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Full Blood Count, Lipid Profile, Chest X-Ray"
                  className="w-full bg-slate-50 focus:bg-white border border-slate-300 focus:border-blue-600 rounded-xl px-3 py-2 text-xs text-slate-900 outline-hidden font-medium"
                />
              </div>

              {/* Date & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date of Report *
                  </label>
                  <input
                    type="date"
                    required
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                    className="w-full bg-slate-50 focus:bg-white border border-slate-300 focus:border-blue-600 rounded-xl px-3 py-2 text-xs text-slate-900 outline-hidden font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ReportCategory)}
                    className="w-full bg-slate-50 focus:bg-white border border-slate-300 focus:border-blue-600 rounded-xl px-2.5 py-2 text-xs text-slate-900 outline-hidden font-medium"
                  >
                    <option value="Lab Report">Lab Report</option>
                    <option value="Blood Test">Blood Test</option>
                    <option value="Radiology / X-Ray">Radiology / X-Ray</option>
                    <option value="ECG / Cardiology">ECG / Cardiology</option>
                    <option value="Prescription Scan">Prescription Scan</option>
                    <option value="Discharge Summary">Discharge Summary</option>
                    <option value="Other">Other Document</option>
                  </select>
                </div>
              </div>

              {/* File Input Box */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Photo or PDF File *
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/40 rounded-2xl p-6 text-center cursor-pointer transition-colors"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {fileName ? (
                    <div className="space-y-1">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 mx-auto flex items-center justify-center">
                        {fileType === 'pdf' ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                      </div>
                      <p className="text-xs font-bold text-slate-900 truncate max-w-xs mx-auto">{fileName}</p>
                      <p className="text-[11px] text-blue-600 font-medium">{formatFileSize(fileSize)}</p>
                      <span className="text-[10px] text-slate-400 block">Click to choose a different file</span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 mx-auto flex items-center justify-center">
                        <Upload className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-slate-800">Click to browse or drop file here</p>
                      <p className="text-[11px] text-slate-500">Supports JPG, PNG, WebP photos & PDF documents</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Clinical Notes / Radiologist Findings
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Normal blood counts, no acute fracture observed"
                  className="w-full bg-slate-50 focus:bg-white border border-slate-300 focus:border-blue-600 rounded-xl px-3 py-2 text-xs text-slate-900 outline-hidden font-medium resize-none"
                />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin" />
                      <span>Saving in Firebase Space...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Upload & Save in Firebase</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Document / Photo Viewer Modal */}
      {selectedReportForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 px-6 py-3.5 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase bg-blue-600 text-white px-2 py-0.5 rounded">
                  {selectedReportForView.category}
                </span>
                <h3 className="text-sm font-bold text-white truncate max-w-md">
                  {selectedReportForView.title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={selectedReportForView.fileData}
                  download={selectedReportForView.fileName}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>

                <button
                  onClick={() => setSelectedReportForView(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Viewer Content */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-100 flex items-center justify-center">
              {selectedReportForView.fileType === 'image' ? (
                <div className="max-w-full text-center">
                  <img
                    src={selectedReportForView.fileData}
                    alt={selectedReportForView.title}
                    className="max-h-[65vh] mx-auto rounded-xl shadow-lg border border-slate-200 object-contain bg-white"
                  />
                </div>
              ) : (
                <div className="w-full h-[65vh] bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col">
                  <iframe
                    src={selectedReportForView.fileData}
                    title={selectedReportForView.title}
                    className="w-full flex-1 border-none"
                  />
                </div>
              )}
            </div>

            {/* Viewer Footer Meta */}
            <div className="bg-white px-6 py-3 border-t border-slate-200 text-xs flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="text-slate-600">
                <strong className="text-slate-900">Date:</strong> {selectedReportForView.reportDate} • 
                <span className="ml-2 font-mono text-slate-500">{selectedReportForView.fileName}</span>
                {selectedReportForView.notes && (
                  <p className="mt-1 text-slate-700 font-medium">
                    Notes: {selectedReportForView.notes}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedReportForView(null)}
                className="px-4 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
