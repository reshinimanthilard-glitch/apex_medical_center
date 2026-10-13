import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Plus, 
  Layers, 
  History, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar, 
  Clock, 
  User, 
  Building2, 
  RotateCw, 
  Pill, 
  FileText, 
  TrendingDown, 
  TrendingUp, 
  ShieldCheck, 
  X, 
  Check, 
  Edit3, 
  DollarSign, 
  RefreshCw 
} from 'lucide-react';
import { StoreMedicine, StockTransaction, Patient, StaffUser } from '../types/patient';
import { 
  createStoreMedicine, 
  addStockToMedicine, 
  recordStockTransaction, 
  adjustMedicineStock,
  fetchStoreMedicines,
  fetchStockTransactions
} from '../services/patientService';

interface DrugStoreDashboardProps {
  medicines: StoreMedicine[];
  transactions: StockTransaction[];
  patients: Patient[];
  staffUser: StaffUser | null;
  onRefreshData: () => Promise<void>;
  isLoading: boolean;
}

export const DrugStoreDashboard: React.FC<DrugStoreDashboardProps> = ({
  medicines,
  transactions,
  patients,
  staffUser,
  onRefreshData,
  isLoading,
}) => {
  // Navigation tabs within Drug Store
  const [activeTab, setActiveTab] = useState<'inventory' | 'history' | 'alerts'>('inventory');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock' | 'expiring_soon' | 'expired'>('all');
  const [dosageFormFilter, setDosageFormFilter] = useState<string>('all');

  // Modals state
  const [isAddMedicineModalOpen, setIsAddMedicineModalOpen] = useState(false);
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
  const [isDispenseModalOpen, setIsDispenseModalOpen] = useState(false);
  const [isAdjustStockModalOpen, setIsAdjustStockModalOpen] = useState(false);

  // Selected items for action
  const [selectedMedicineForStock, setSelectedMedicineForStock] = useState<StoreMedicine | null>(null);
  const [selectedMedicineForAdjustment, setSelectedMedicineForAdjustment] = useState<StoreMedicine | null>(null);

  // Notification banners
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const showNotification = (msg: string, isErr = false) => {
    if (isErr) {
      setErrorBanner(msg);
      setTimeout(() => setErrorBanner(null), 5000);
    } else {
      setSuccessBanner(msg);
      setTimeout(() => setSuccessBanner(null), 5000);
    }
  };

  // Helper date calculations
  const todayDate = new Date();
  const ninetyDaysFromNow = new Date();
  ninetyDaysFromNow.setDate(todayDate.getDate() + 90);

  const isExpired = (expiryDate?: string) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < todayDate;
  };

  const isExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const exp = new Date(expiryDate);
    return exp >= todayDate && exp <= ninetyDaysFromNow;
  };

  // Summary Metrics calculations
  const metrics = useMemo(() => {
    const totalItems = medicines.length;
    const totalStockQty = medicines.reduce((sum, m) => sum + (Number(m.currentStockQuantity) || 0), 0);
    
    const lowStockMeds = medicines.filter(
      (m) => m.currentStockQuantity > 0 && m.currentStockQuantity <= m.minimumStockLevel
    );
    
    const outOfStockMeds = medicines.filter((m) => m.currentStockQuantity === 0);
    
    const expiringMeds = medicines.filter(
      (m) => isExpiringSoon(m.expiryDate) || isExpired(m.expiryDate)
    );

    return {
      totalItems,
      totalStockQty,
      lowStockCount: lowStockMeds.length,
      outOfStockCount: outOfStockMeds.length,
      expiringCount: expiringMeds.length,
      lowStockMeds,
      outOfStockMeds,
      expiringMeds,
    };
  }, [medicines]);

  // Filtered medicines list
  const filteredMedicines = useMemo(() => {
    return medicines.filter((med) => {
      // Search match
      const query = searchQuery.trim().toLowerCase();
      const matchSearch =
        !query ||
        med.medicineName.toLowerCase().includes(query) ||
        (med.genericName && med.genericName.toLowerCase().includes(query)) ||
        (med.strength && med.strength.toLowerCase().includes(query)) ||
        (med.dosageForm && med.dosageForm.toLowerCase().includes(query)) ||
        (med.batchNumber && med.batchNumber.toLowerCase().includes(query));

      if (!matchSearch) return false;

      // Dosage form match
      if (dosageFormFilter !== 'all' && med.dosageForm !== dosageFormFilter) {
        return false;
      }

      // Status filter match
      if (statusFilter === 'in_stock') {
        return med.currentStockQuantity > med.minimumStockLevel && !isExpired(med.expiryDate);
      }
      if (statusFilter === 'low_stock') {
        return med.currentStockQuantity > 0 && med.currentStockQuantity <= med.minimumStockLevel;
      }
      if (statusFilter === 'out_of_stock') {
        return med.currentStockQuantity === 0;
      }
      if (statusFilter === 'expiring_soon') {
        return isExpiringSoon(med.expiryDate);
      }
      if (statusFilter === 'expired') {
        return isExpired(med.expiryDate);
      }

      return true;
    });
  }, [medicines, searchQuery, statusFilter, dosageFormFilter]);

  // Unique dosage forms for filter dropdown
  const uniqueDosageForms = useMemo(() => {
    const forms = new Set<string>();
    medicines.forEach((m) => {
      if (m.dosageForm) forms.add(m.dosageForm);
    });
    return Array.from(forms);
  }, [medicines]);

  return (
    <div className="space-y-6">
      {/* Top Banner Alert if any */}
      {successBanner && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successBanner}</span>
          </div>
          <button onClick={() => setSuccessBanner(null)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorBanner && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-sm flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="font-semibold">{errorBanner}</span>
          </div>
          <button onClick={() => setErrorBanner(null)} className="text-rose-700 hover:text-rose-900 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. DRUG STORE DASHBOARD HEADER */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-teal-100/50 via-sky-50/40 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-teal-700 mb-1 uppercase tracking-wider">
              <Package className="w-4 h-4 text-teal-600" />
              <span>APEX Medical Center • Pilikada, Kurunegala</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Drug Store & Medicine Inventory
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Automatic stock management, prescription dispensing deduction, batch tracking, and audit log.
            </p>
          </div>

          {/* Action Buttons: Add New Medicine, Add Stock, View Stock, Stock History */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsAddMedicineModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add New Medicine</span>
            </button>

            <button
              onClick={() => {
                setSelectedMedicineForStock(null);
                setIsAddStockModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm shadow-teal-500/20 transition-all cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>Add Stock</span>
            </button>

            <button
              onClick={() => setIsDispenseModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Pill className="w-4 h-4" />
              <span>Dispense Medicine</span>
            </button>

            <button
              onClick={() => onRefreshData()}
              disabled={isLoading}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
              title="Refresh inventory data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* 5 DASHBOARD STATISTICS CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4 mt-6 pt-6 border-t border-slate-100">
          
          {/* Total Medicine Items */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100">
            <div className="flex items-center justify-between text-blue-700 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider">Total Items</span>
              <Package className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-950">
              {metrics.totalItems}
            </div>
            <span className="text-[11px] text-blue-700/80 mt-0.5 block">Unique medications</span>
          </div>

          {/* Total Stock Quantity */}
          <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-100">
            <div className="flex items-center justify-between text-teal-700 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider">Total Stock</span>
              <Layers className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-teal-950">
              {metrics.totalStockQty.toLocaleString()}
            </div>
            <span className="text-[11px] text-teal-700/80 mt-0.5 block">Units in store</span>
          </div>

          {/* Low-Stock Medicines */}
          <div 
            onClick={() => {
              setActiveTab('inventory');
              setStatusFilter('low_stock');
            }}
            className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 cursor-pointer hover:bg-amber-100/70 transition-colors"
          >
            <div className="flex items-center justify-between text-amber-800 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider">Low Stock</span>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-950">
              {metrics.lowStockCount}
            </div>
            <span className="text-[11px] text-amber-800 mt-0.5 block font-medium">Below reorder level</span>
          </div>

          {/* Out-of-Stock Medicines */}
          <div 
            onClick={() => {
              setActiveTab('inventory');
              setStatusFilter('out_of_stock');
            }}
            className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200/80 cursor-pointer hover:bg-rose-100/70 transition-colors"
          >
            <div className="flex items-center justify-between text-rose-800 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider">Out of Stock</span>
              <AlertCircle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-950">
              {metrics.outOfStockCount}
            </div>
            <span className="text-[11px] text-rose-800 mt-0.5 block font-medium">Requires procurement</span>
          </div>

          {/* Expiring Medicines */}
          <div 
            onClick={() => {
              setActiveTab('inventory');
              setStatusFilter('expiring_soon');
            }}
            className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200/80 cursor-pointer hover:bg-purple-100/70 transition-colors col-span-2 sm:col-span-1"
          >
            <div className="flex items-center justify-between text-purple-800 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider">Expiring / Exp</span>
              <Clock className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-950">
              {metrics.expiringCount}
            </div>
            <span className="text-[11px] text-purple-800 mt-0.5 block font-medium">Within 90 days</span>
          </div>

        </div>
      </div>

      {/* SECTION TABS: View Stock, Stock History, Critical Alerts */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'inventory'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>View Stock ({medicines.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'history'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Stock History ({transactions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'alerts'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Stock Alerts ({metrics.lowStockCount + metrics.outOfStockCount + metrics.expiringCount})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: VIEW STOCK (INVENTORY LIST & SEARCH) */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          {/* Search & Filter Controls */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search medicine name, generic, strength, batch..."
                className="w-full pl-10 pr-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="py-2 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:ring-2 focus:ring-blue-100"
              >
                <option value="all">All Stock Statuses</option>
                <option value="in_stock">In Stock (Healthy)</option>
                <option value="low_stock">Low Stock (≤ Minimum)</option>
                <option value="out_of_stock">Out of Stock (0)</option>
                <option value="expiring_soon">Expiring Soon (&lt; 90d)</option>
                <option value="expired">Expired</option>
              </select>

              {/* Dosage Form Filter */}
              <select
                value={dosageFormFilter}
                onChange={(e) => setDosageFormFilter(e.target.value)}
                className="py-2 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:ring-2 focus:ring-blue-100"
              >
                <option value="all">All Dosage Forms</option>
                {uniqueDosageForms.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>

              {(searchQuery || statusFilter !== 'all' || dosageFormFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setDosageFormFilter('all');
                  }}
                  className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>

          {/* Inventory Table / Cards */}
          {filteredMedicines.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
              <Package className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-700">No medicines found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No items match your search or filter criteria. You can register a new medicine or adjust filters.
              </p>
              <button
                onClick={() => setIsAddMedicineModalOpen(true)}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Medicine Now
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                      <th className="py-3 px-4">Medicine & Form</th>
                      <th className="py-3 px-4">Generic Name</th>
                      <th className="py-3 px-4">Batch & Expiry</th>
                      <th className="py-3 px-4 text-center">Available Stock</th>
                      <th className="py-3 px-4 text-center">Min Level</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredMedicines.map((med) => {
                      const expired = isExpired(med.expiryDate);
                      const expiringSoon = isExpiringSoon(med.expiryDate);
                      const isLowStock = med.currentStockQuantity > 0 && med.currentStockQuantity <= med.minimumStockLevel;
                      const isOutOfStock = med.currentStockQuantity === 0;

                      return (
                        <tr key={med.id || med.medicineName} className="hover:bg-slate-50/60 transition-colors">
                          {/* Medicine & Form */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 text-sm">
                              {med.medicineName}
                            </div>
                            <div className="text-slate-500 text-xs flex items-center gap-1.5 mt-0.5">
                              {med.strength && <span className="font-medium text-slate-700">{med.strength}</span>}
                              {med.dosageForm && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span>{med.dosageForm}</span>
                                </>
                              )}
                              <span aria-hidden="true">·</span>
                              <span className="text-slate-400 capitalize">{med.unitOfMeasurement}</span>
                            </div>
                          </td>

                          {/* Generic Name */}
                          <td className="py-3.5 px-4 text-slate-600">
                            {med.genericName ? (
                              <span className="italic">{med.genericName}</span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>

                          {/* Batch & Expiry */}
                          <td className="py-3.5 px-4">
                            <div className="font-mono text-xs text-slate-700 font-semibold">
                              {med.batchNumber || 'N/A'}
                            </div>
                            <div className="text-[11px] mt-0.5 flex items-center gap-1">
                              {med.expiryDate ? (
                                expired ? (
                                  <span className="text-rose-700 font-bold bg-rose-50 px-1.5 py-0.5 rounded">
                                    Expired: {med.expiryDate}
                                  </span>
                                ) : expiringSoon ? (
                                  <span className="text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded">
                                    Exp: {med.expiryDate} (Soon)
                                  </span>
                                ) : (
                                  <span className="text-slate-500">Exp: {med.expiryDate}</span>
                                )
                              ) : (
                                <span className="text-slate-400">No date</span>
                              )}
                            </div>
                          </td>

                          {/* Available Stock */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="font-extrabold text-base text-slate-900">
                              {med.currentStockQuantity.toLocaleString()}
                            </div>
                            <div className="text-[10px] text-slate-400 capitalize">
                              {med.unitOfMeasurement}
                            </div>
                          </td>

                          {/* Min Level */}
                          <td className="py-3.5 px-4 text-center text-slate-500 text-xs">
                            {med.minimumStockLevel}
                          </td>

                          {/* Status Badge */}
                          <td className="py-3.5 px-4 text-center">
                            {isOutOfStock ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                                <AlertCircle className="w-3 h-3" />
                                Out of Stock
                              </span>
                            ) : isLowStock ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                                <AlertTriangle className="w-3 h-3" />
                                Low Stock
                              </span>
                            ) : expired ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800">
                                Expired
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                                In Stock
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setSelectedMedicineForStock(med);
                                  setIsAddStockModalOpen(true);
                                }}
                                className="px-2.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                                title="Add more stock to this medicine"
                              >
                                + Add Stock
                              </button>

                              <button
                                onClick={() => {
                                  setSelectedMedicineForAdjustment(med);
                                  setIsAdjustStockModalOpen(true);
                                }}
                                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                title="Adjust stock / audit count"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: STOCK HISTORY & AUDIT TRAIL */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800">Stock Movement Audit Trail</h3>
              <p className="text-xs text-slate-500">
                Permanent records of all received, dispensed, returned, and adjusted stock transactions.
              </p>
            </div>
            <div className="text-xs text-slate-400 font-medium">
              Total logs: <strong>{transactions.length}</strong>
            </div>
          </div>

          {transactions.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-2">
              <History className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-700">No stock transactions yet</h3>
              <p className="text-xs text-slate-500">
                Stock movements will be logged automatically when new stock is received or dispensed to patients.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                      <th className="py-3 px-4">Date & Time</th>
                      <th className="py-3 px-4">Medicine</th>
                      <th className="py-3 px-4">Transaction Type</th>
                      <th className="py-3 px-4 text-center">Qty Change</th>
                      <th className="py-3 px-4 text-center">Prev → Updated</th>
                      <th className="py-3 px-4">Reference / Patient</th>
                      <th className="py-3 px-4">Performed By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transactions.map((tx) => {
                      const isAddition = tx.transactionType === 'Stock Received' || tx.transactionType === 'Returned';
                      const formattedTime = new Date(tx.timestamp).toLocaleString();

                      return (
                        <tr key={tx.id || `${tx.timestamp}_${tx.medicineId}`} className="hover:bg-slate-50/60">
                          {/* Date & Time */}
                          <td className="py-3 px-4 font-medium text-slate-700 text-xs whitespace-nowrap">
                            {formattedTime}
                          </td>

                          {/* Medicine */}
                          <td className="py-3 px-4 font-bold text-slate-900">
                            {tx.medicineName}
                            {tx.batchNumber && (
                              <span className="block text-[11px] text-slate-400 font-mono font-normal">
                                Batch: {tx.batchNumber}
                              </span>
                            )}
                          </td>

                          {/* Transaction Type */}
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                tx.transactionType === 'Stock Received'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : tx.transactionType === 'Dispensed'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : tx.transactionType === 'Returned'
                                  ? 'bg-teal-50 text-teal-700 border border-teal-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {isAddition ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                              {tx.transactionType}
                            </span>
                          </td>

                          {/* Quantity */}
                          <td className="py-3 px-4 text-center font-bold text-sm">
                            <span className={isAddition ? 'text-emerald-600' : 'text-blue-600'}>
                              {isAddition ? `+${tx.quantity}` : `-${tx.quantity}`}
                            </span>
                          </td>

                          {/* Previous -> Updated */}
                          <td className="py-3 px-4 text-center text-xs font-mono">
                            <span className="text-slate-400">{tx.previousStock}</span>
                            <span className="text-slate-400 mx-1">→</span>
                            <span className="font-bold text-slate-800">{tx.updatedStock}</span>
                          </td>

                          {/* Reference / Patient */}
                          <td className="py-3 px-4 text-xs text-slate-600">
                            {tx.patientName && (
                              <div className="font-semibold text-slate-800">
                                Patient: {tx.patientName} ({tx.patientId})
                              </div>
                            )}
                            {tx.prescriptionNumber && (
                              <div className="text-[11px] text-blue-600 font-mono font-medium">
                                Rx: {tx.prescriptionNumber}
                              </div>
                            )}
                            {tx.notes && <div className="text-[11px] text-slate-400 italic">{tx.notes}</div>}
                            {!tx.patientName && !tx.prescriptionNumber && !tx.notes && '—'}
                          </td>

                          {/* Performed By */}
                          <td className="py-3 px-4 text-xs text-slate-700">
                            {tx.performedBy || 'Staff'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CRITICAL ALERTS (LOW STOCK, OUT OF STOCK, EXPIRING) */}
      {activeTab === 'alerts' && (
        <div className="space-y-6">
          {/* Out of Stock Section */}
          <div className="bg-white rounded-2xl border border-rose-200 shadow-xs p-5 space-y-3">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-base">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              <span>Out-of-Stock Medicines ({metrics.outOfStockCount})</span>
            </div>
            {metrics.outOfStockMeds.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No medicines currently out of stock.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {metrics.outOfStockMeds.map((med) => (
                  <div key={med.id} className="p-3.5 bg-rose-50/60 border border-rose-100 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{med.medicineName} {med.strength}</div>
                      <div className="text-xs text-slate-500">{med.dosageForm} • Min: {med.minimumStockLevel}</div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedMedicineForStock(med);
                        setIsAddStockModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Restock
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Low Stock Section */}
          <div className="bg-white rounded-2xl border border-amber-200 shadow-xs p-5 space-y-3">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-base">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span>Low-Stock Medicines ({metrics.lowStockCount})</span>
            </div>
            {metrics.lowStockMeds.length === 0 ? (
              <p className="text-xs text-slate-500 italic">All medicines above minimum safety threshold.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {metrics.lowStockMeds.map((med) => (
                  <div key={med.id} className="p-3.5 bg-amber-50/60 border border-amber-100 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{med.medicineName} {med.strength}</div>
                      <div className="text-xs text-amber-800 font-semibold">
                        Stock: {med.currentStockQuantity} / Min: {med.minimumStockLevel} {med.unitOfMeasurement}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedMedicineForStock(med);
                        setIsAddStockModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Add Stock
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Expiring Soon Section */}
          <div className="bg-white rounded-2xl border border-purple-200 shadow-xs p-5 space-y-3">
            <div className="flex items-center gap-2 text-purple-800 font-bold text-base">
              <Clock className="w-5 h-5 text-purple-600" />
              <span>Expiring & Expired Medicines ({metrics.expiringCount})</span>
            </div>
            {metrics.expiringMeds.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No batches expiring within the next 90 days.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {metrics.expiringMeds.map((med) => {
                  const expired = isExpired(med.expiryDate);
                  return (
                    <div key={med.id} className="p-3.5 bg-purple-50/60 border border-purple-100 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{med.medicineName} {med.strength}</div>
                        <div className="text-xs font-semibold text-purple-900">
                          {expired ? 'Expired on:' : 'Expires:'} {med.expiryDate}
                        </div>
                        <div className="text-[11px] text-slate-500">Batch: {med.batchNumber || 'N/A'} • Qty: {med.currentStockQuantity}</div>
                      </div>
                      <span className={`px-2 py-1 rounded-md text-[11px] font-bold ${expired ? 'bg-rose-100 text-rose-800' : 'bg-purple-100 text-purple-800'}`}>
                        {expired ? 'Do Not Dispense' : 'Expiring Soon'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: ADD NEW MEDICINE TO THE STORE                   */}
      {/* ======================================================== */}
      {isAddMedicineModalOpen && (
        <AddNewMedicineModal
          isOpen={isAddMedicineModalOpen}
          onClose={() => setIsAddMedicineModalOpen(false)}
          onSuccess={async (med) => {
            setIsAddMedicineModalOpen(false);
            showNotification(`Successfully added ${med.medicineName} to the Drug Store.`);
            await onRefreshData();
          }}
          staffName={staffUser?.displayName || 'Dr. Wishmika Rajaguru'}
        />
      )}

      {/* ======================================================== */}
      {/* MODAL 2: ADD MORE STOCK TO EXISTING MEDICINE             */}
      {/* ======================================================== */}
      {isAddStockModalOpen && (
        <AddStockModal
          isOpen={isAddStockModalOpen}
          onClose={() => {
            setIsAddStockModalOpen(false);
            setSelectedMedicineForStock(null);
          }}
          medicines={medicines}
          initialMedicine={selectedMedicineForStock}
          onSuccess={async (name, addedQty) => {
            setIsAddStockModalOpen(false);
            setSelectedMedicineForStock(null);
            showNotification(`Successfully added ${addedQty} units to ${name}.`);
            await onRefreshData();
          }}
          staffName={staffUser?.displayName || 'Dr. Wishmika Rajaguru'}
        />
      )}

      {/* ======================================================== */}
      {/* MODAL 3: DIRECT DISPENSE MEDICINE                        */}
      {/* ======================================================== */}
      {isDispenseModalOpen && (
        <DirectDispenseModal
          isOpen={isDispenseModalOpen}
          onClose={() => setIsDispenseModalOpen(false)}
          medicines={medicines}
          patients={patients}
          onSuccess={async (msg) => {
            setIsDispenseModalOpen(false);
            showNotification(msg);
            await onRefreshData();
          }}
          staffName={staffUser?.displayName || 'Dr. Wishmika Rajaguru'}
        />
      )}

      {/* ======================================================== */}
      {/* MODAL 4: ADJUST MEDICINE STOCK                           */}
      {/* ======================================================== */}
      {isAdjustStockModalOpen && selectedMedicineForAdjustment && (
        <AdjustStockModal
          isOpen={isAdjustStockModalOpen}
          onClose={() => {
            setIsAdjustStockModalOpen(false);
            setSelectedMedicineForAdjustment(null);
          }}
          medicine={selectedMedicineForAdjustment}
          onSuccess={async () => {
            setIsAdjustStockModalOpen(false);
            setSelectedMedicineForAdjustment(null);
            showNotification(`Stock adjusted for ${selectedMedicineForAdjustment.medicineName}.`);
            await onRefreshData();
          }}
          staffName={staffUser?.displayName || 'Dr. Wishmika Rajaguru'}
        />
      )}
    </div>
  );
};

// =========================================================================
// SUB-COMPONENT: ADD NEW MEDICINE MODAL
// =========================================================================
interface AddNewMedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (med: StoreMedicine) => void;
  staffName: string;
}

const AddNewMedicineModal: React.FC<AddNewMedicineModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  staffName,
}) => {
  const [medicineName, setMedicineName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [strength, setStrength] = useState('500 mg');
  const [dosageForm, setDosageForm] = useState('Tablet');
  const [unitOfMeasurement, setUnitOfMeasurement] = useState('tablets');
  const [currentStockQuantity, setCurrentStockQuantity] = useState<number>(1000);
  const [minimumStockLevel, setMinimumStockLevel] = useState<number>(100);
  const [batchNumber, setBatchNumber] = useState(`BT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  const [expiryDate, setExpiryDate] = useState('2028-06-30');
  const [supplierName, setSupplierName] = useState('State Pharmaceuticals Corporation (SPC)');
  const [dateAdded] = useState(new Date().toISOString().split('T')[0]);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!medicineName.trim()) {
      setErrorMsg('Medicine Name is required.');
      return;
    }

    if (currentStockQuantity < 0) {
      setErrorMsg('Stock quantity cannot be negative.');
      return;
    }

    setLoading(true);
    try {
      const created = await createStoreMedicine(
        {
          medicineName: medicineName.trim(),
          genericName: genericName.trim() || undefined,
          strength: strength.trim() || undefined,
          dosageForm: dosageForm.trim(),
          unitOfMeasurement: unitOfMeasurement.trim(),
          currentStockQuantity: Number(currentStockQuantity) || 0,
          minimumStockLevel: Number(minimumStockLevel) || 50,
          batchNumber: batchNumber.trim() || undefined,
          expiryDate: expiryDate.trim() || undefined,
          supplierName: supplierName.trim() || undefined,
          dateAdded,
        },
        staffName
      );
      onSuccess(created);
    } catch (err: unknown) {
      console.error('Error adding medicine:', err);
      setErrorMsg('Failed to add medicine. Please verify data and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-sky-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">Add New Medicine to Drug Store</h3>
              <p className="text-xs text-blue-100">Register new medical stock item with batch tracking</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-blue-100 hover:text-white hover:bg-white/10 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Medicine Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Medicine Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={medicineName}
                onChange={(e) => setMedicineName(e.target.value)}
                placeholder="e.g. Paracetamol, Amoxicillin"
                required
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 font-semibold"
              />
            </div>

            {/* Generic Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Generic Name
              </label>
              <input
                type="text"
                value={genericName}
                onChange={(e) => setGenericName(e.target.value)}
                placeholder="e.g. Acetaminophen, Amoxicillin Trihydrate"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              />
            </div>

            {/* Strength */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Strength <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={strength}
                onChange={(e) => setStrength(e.target.value)}
                placeholder="e.g. 500 mg, 250 mg/5ml, 20 mg"
                required
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              />
            </div>

            {/* Dosage Form */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Dosage Form <span className="text-rose-500">*</span>
              </label>
              <select
                value={dosageForm}
                onChange={(e) => {
                  setDosageForm(e.target.value);
                  if (e.target.value === 'Tablet') setUnitOfMeasurement('tablets');
                  else if (e.target.value === 'Capsule') setUnitOfMeasurement('capsules');
                  else if (e.target.value === 'Syrup' || e.target.value === 'Suspension') setUnitOfMeasurement('bottles');
                  else if (e.target.value === 'Injection') setUnitOfMeasurement('vials');
                  else if (e.target.value === 'Cream' || e.target.value === 'Ointment') setUnitOfMeasurement('tubes');
                }}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 font-medium"
              >
                <option value="Tablet">Tablet</option>
                <option value="Capsule">Capsule</option>
                <option value="Syrup">Syrup</option>
                <option value="Suspension">Suspension</option>
                <option value="Injection">Injection</option>
                <option value="Cream">Cream</option>
                <option value="Ointment">Ointment</option>
                <option value="Drops">Eye/Ear Drops</option>
                <option value="Inhaler">Inhaler</option>
              </select>
            </div>

            {/* Unit of Measurement */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Unit of Measurement <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={unitOfMeasurement}
                onChange={(e) => setUnitOfMeasurement(e.target.value)}
                placeholder="e.g. tablets, capsules, bottles, vials, tubes"
                required
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              />
            </div>

            {/* Current Stock Quantity */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Initial Stock Quantity <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={currentStockQuantity}
                onChange={(e) => setCurrentStockQuantity(Number(e.target.value))}
                placeholder="e.g. 1000"
                required
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 font-bold"
              />
            </div>

            {/* Minimum Stock Level */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Minimum Stock Level (Alert threshold) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={minimumStockLevel}
                onChange={(e) => setMinimumStockLevel(Number(e.target.value))}
                placeholder="e.g. 100"
                required
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              />
            </div>

            {/* Batch Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Batch Number
              </label>
              <input
                type="text"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                placeholder="e.g. BT-2026-01"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 font-mono text-xs"
              />
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Expiry Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 font-medium"
              />
            </div>

            {/* Supplier Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Supplier Name
              </label>
              <input
                type="text"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                placeholder="e.g. State Pharmaceuticals Corporation, GSK"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Save & Register Medicine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// =========================================================================
// SUB-COMPONENT: ADD MORE STOCK TO EXISTING MEDICINE MODAL
// =========================================================================
interface AddStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicines: StoreMedicine[];
  initialMedicine: StoreMedicine | null;
  onSuccess: (medicineName: string, addedQty: number) => void;
  staffName: string;
}

const AddStockModal: React.FC<AddStockModalProps> = ({
  isOpen,
  onClose,
  medicines,
  initialMedicine,
  onSuccess,
  staffName,
}) => {
  const [selectedId, setSelectedId] = useState(initialMedicine?.id || (medicines[0]?.id || ''));
  const [additionalQty, setAdditionalQty] = useState<number>(500);
  const [batchNumber, setBatchNumber] = useState(`BT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  const [expiryDate, setExpiryDate] = useState('2028-12-31');
  const [supplierName, setSupplierName] = useState('State Pharmaceuticals Corporation');
  const [receivedDate, setReceivedDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('Regular stock delivery');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const targetMed = medicines.find((m) => m.id === selectedId);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedId) {
      setErrorMsg('Please select a medicine.');
      return;
    }

    if (additionalQty <= 0) {
      setErrorMsg('Additional quantity must be greater than zero.');
      return;
    }

    setLoading(true);
    try {
      await addStockToMedicine(
        selectedId,
        additionalQty,
        {
          batchNumber: batchNumber.trim() || undefined,
          expiryDate: expiryDate.trim() || undefined,
          supplierName: supplierName.trim() || undefined,
          notes: notes.trim() || undefined,
        },
        staffName
      );
      onSuccess(targetMed?.medicineName || 'Medicine', additionalQty);
    } catch (err: unknown) {
      console.error('Error adding stock:', err);
      setErrorMsg('Failed to update stock. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 to-emerald-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">Add Stock to Existing Medicine</h3>
              <p className="text-xs text-teal-100">Automatically increases available quantity & logs transaction</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-teal-100 hover:text-white hover:bg-white/10 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Select Medicine */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Medicine <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-100 focus:border-teal-500 font-semibold"
            >
              {medicines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.medicineName} {m.strength || ''} ({m.dosageForm || 'Unit'}) • Current: {m.currentStockQuantity} {m.unitOfMeasurement}
                </option>
              ))}
            </select>
          </div>

          {/* Live Current Stock -> New Stock Preview */}
          {targetMed && (
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 block">Current Stock:</span>
                <span className="font-bold text-slate-900 text-sm">{targetMed.currentStockQuantity} {targetMed.unitOfMeasurement}</span>
              </div>
              <div className="text-teal-600 font-bold text-lg">+</div>
              <div>
                <span className="text-slate-500 block">Adding:</span>
                <span className="font-bold text-teal-700 text-sm">+{additionalQty}</span>
              </div>
              <div className="text-teal-600 font-bold text-lg">=</div>
              <div>
                <span className="text-slate-500 block">Updated Stock:</span>
                <span className="font-extrabold text-teal-900 text-sm">
                  {targetMed.currentStockQuantity + Number(additionalQty)} {targetMed.unitOfMeasurement}
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {/* Additional Quantity */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Additional Quantity <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={additionalQty}
                onChange={(e) => setAdditionalQty(Number(e.target.value))}
                required
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-100 focus:border-teal-500 font-bold"
              />
            </div>

            {/* Received Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Received Date
              </label>
              <input
                type="date"
                value={receivedDate}
                onChange={(e) => setReceivedDate(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-100 focus:border-teal-500"
              />
            </div>

            {/* Batch Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Batch Number
              </label>
              <input
                type="text"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                placeholder="e.g. BT-2026-X"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-100 focus:border-teal-500 font-mono text-xs"
              />
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Expiry Date
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-100 focus:border-teal-500"
              />
            </div>
          </div>

          {/* Supplier Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Supplier Name
            </label>
            <input
              type="text"
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
              placeholder="e.g. State Pharmaceuticals Corporation"
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-100 focus:border-teal-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Transaction Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Monthly replenishment batch"
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-100 focus:border-teal-500 text-xs"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-teal-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Adding Stock...' : 'Confirm & Add Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// =========================================================================
// SUB-COMPONENT: DIRECT DISPENSE MODAL
// =========================================================================
interface DirectDispenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicines: StoreMedicine[];
  patients: Patient[];
  onSuccess: (msg: string) => void;
  staffName: string;
}

const DirectDispenseModal: React.FC<DirectDispenseModalProps> = ({
  isOpen,
  onClose,
  medicines,
  patients,
  onSuccess,
  staffName,
}) => {
  const [selectedMedId, setSelectedMedId] = useState(medicines[0]?.id || '');
  const [dispenseQty, setDispenseQty] = useState<number>(10);
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.patientId || '');
  const [notes, setNotes] = useState('Clinic prescription dispensing');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const targetMed = medicines.find((m) => m.id === selectedMedId);
  const targetPatient = patients.find((p) => p.patientId === selectedPatientId);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!targetMed) {
      setErrorMsg('Please select a medicine.');
      return;
    }

    if (dispenseQty <= 0) {
      setErrorMsg('Dispense quantity must be greater than zero.');
      return;
    }

    if (targetMed.currentStockQuantity < dispenseQty) {
      setErrorMsg(
        `Insufficient stock for ${targetMed.medicineName}. Requested: ${dispenseQty}, Available: ${targetMed.currentStockQuantity}. Cannot dispense more than available stock.`
      );
      return;
    }

    // Check expiry
    if (targetMed.expiryDate && new Date(targetMed.expiryDate) < new Date()) {
      setErrorMsg(`Cannot dispense expired stock (${targetMed.medicineName} expired on ${targetMed.expiryDate}).`);
      return;
    }

    setLoading(true);
    try {
      const prevStock = targetMed.currentStockQuantity;
      const newStock = prevStock - dispenseQty;

      await adjustMedicineStock(
        targetMed.id!,
        newStock,
        'Dispensed' as any,
        notes || `Dispensed ${dispenseQty} units to ${targetPatient?.name || 'patient'} (${selectedPatientId})`,
        staffName
      );

      onSuccess(`Successfully dispensed ${dispenseQty} units of ${targetMed.medicineName} to ${targetPatient?.name || 'patient'}.`);
    } catch (err: unknown) {
      console.error('Error dispensing medicine:', err);
      setErrorMsg('Failed to dispense medicine. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Pill className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">Dispense Medicine from Drug Store</h3>
              <p className="text-xs text-emerald-100">Automatically deducts stock and records patient audit trail</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Select Medicine */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Medicine to Dispense <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedMedId}
              onChange={(e) => setSelectedMedId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 font-semibold"
            >
              {medicines.map((m) => (
                <option key={m.id} value={m.id} disabled={m.currentStockQuantity === 0}>
                  {m.medicineName} {m.strength || ''} — Stock: {m.currentStockQuantity} {m.unitOfMeasurement} {m.currentStockQuantity === 0 ? '(Out of Stock)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Select Patient */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Recipient Patient <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 font-medium"
            >
              {patients.map((p) => (
                <option key={p.patientId} value={p.patientId}>
                  {p.name} ({p.patientId}) {p.nic ? `• NIC: ${p.nic}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity to Dispense */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Quantity to Dispense ({targetMed?.unitOfMeasurement || 'units'}) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              max={targetMed?.currentStockQuantity || 9999}
              value={dispenseQty}
              onChange={(e) => setDispenseQty(Number(e.target.value))}
              required
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 font-bold"
            />
          </div>

          {/* Stock calculation preview */}
          {targetMed && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 block">Available:</span>
                <span className="font-bold text-slate-800">{targetMed.currentStockQuantity}</span>
              </div>
              <div className="text-emerald-700 font-bold text-lg">−</div>
              <div>
                <span className="text-slate-500 block">Dispensing:</span>
                <span className="font-bold text-emerald-700">{dispenseQty}</span>
              </div>
              <div className="text-emerald-700 font-bold text-lg">=</div>
              <div>
                <span className="text-slate-500 block">Remaining:</span>
                <span className={`font-bold ${targetMed.currentStockQuantity - dispenseQty < 0 ? 'text-rose-600' : 'text-emerald-900'}`}>
                  {Math.max(0, targetMed.currentStockQuantity - dispenseQty)} {targetMed.unitOfMeasurement}
                </span>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Dispensing Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Outpatient clinic consultation dispensing"
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 text-xs"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Dispensing...' : 'Confirm Dispensing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// =========================================================================
// SUB-COMPONENT: ADJUST STOCK MODAL
// =========================================================================
interface AdjustStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicine: StoreMedicine;
  onSuccess: () => void;
  staffName: string;
}

const AdjustStockModal: React.FC<AdjustStockModalProps> = ({
  isOpen,
  onClose,
  medicine,
  onSuccess,
  staffName,
}) => {
  const [newStock, setNewStock] = useState<number>(medicine.currentStockQuantity);
  const [adjType, setAdjType] = useState<'Adjustment' | 'Returned'>('Adjustment');
  const [reason, setReason] = useState('Physical inventory audit count correction');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adjustMedicineStock(
        medicine.id!,
        newStock,
        adjType,
        reason,
        staffName
      );
      onSuccess();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-800 px-6 py-4 text-white flex items-center justify-between">
          <h3 className="text-base font-bold">Adjust Stock: {medicine.medicineName}</h3>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Adjustment Type</label>
            <select
              value={adjType}
              onChange={(e) => setAdjType(e.target.value as any)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
            >
              <option value="Adjustment">Audit Count Adjustment</option>
              <option value="Returned">Patient Medicine Return</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Corrected Stock Count ({medicine.unitOfMeasurement})
            </label>
            <input
              type="number"
              min="0"
              value={newStock}
              onChange={(e) => setNewStock(Number(e.target.value))}
              required
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Audit Reason / Justification</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-600">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black"
            >
              {loading ? 'Saving...' : 'Confirm Adjustment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
