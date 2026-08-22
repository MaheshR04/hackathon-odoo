import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  ShieldCheck,
  Calendar,
  DollarSign,
  FileText,
  Edit,
  Plus,
  Trash2,
  Download,
  Sparkles,
  Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Employee, DocumentItem } from '../types';
import { EditProfileModal } from '../components/EditProfileModal';
import { SalaryStructureModal } from '../components/SalaryStructureModal';
import confetti from 'canvas-confetti';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'salary' | 'documents'>('details');

  // Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const fetchProfile = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await api.employees.getById(user.id);
      if (res.success) {
        setEmployee(res.employee);
      }
    } catch (err) {
      console.error('Fetch profile error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim() || !user) return;
    setUploadingDoc(true);
    try {
      const res = await api.employees.addDocument(user.id, {
        name: newDocName.endsWith('.pdf') ? newDocName : `${newDocName}.pdf`,
        size: '1.2 MB',
        type: 'PDF'
      });
      if (res.success) {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.7 }
        });
        setNewDocName('');
        fetchProfile();
        refreshUser();
      }
    } catch (err) {
      console.error('Add document error:', err);
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!user) return;
    try {
      await api.employees.deleteDocument(user.id, docId);
      fetchProfile();
      refreshUser();
    } catch (err) {
      console.error('Delete doc error:', err);
    }
  };

  const emp = employee || user;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
              Employee Dossier 360°
            </span>
          </div>
          <h1 className="font-display text-2xl font-extrabold text-white tracking-tight">
            My Professional Profile
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Verified identity, official employment details, compensation, and stored documents
          </p>
        </div>

        <button
          onClick={() => setShowEditModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-950/50 transition active:scale-95"
        >
          <Edit className="h-4 w-4" />
          <span>Edit Profile Details</span>
        </button>
      </div>

      {/* Hero Profile Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-r from-purple-950/50 via-slate-900 to-indigo-950/40 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <img
              src={emp?.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${emp?.name || 'User'}`}
              alt={emp?.name}
              className="h-20 w-20 rounded-2xl object-cover ring-4 ring-purple-500/30 shadow-2xl"
            />
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-bold text-white">{emp?.name}</h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                    emp?.role === 'admin'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {emp?.role === 'admin' ? 'Admin / HR Officer' : 'Verified Employee'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">{emp?.designation}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono mt-2">
                <span>ID: {emp?.id}</span>
                <span>•</span>
                <span>{emp?.department}</span>
                <span>•</span>
                <span>Joined {emp?.joiningDate || '2023-01-01'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Section Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('details')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'details'
              ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <User className="h-4 w-4" />
          <span>Personal & Job Details</span>
        </button>

        <button
          onClick={() => setActiveTab('salary')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'salary'
              ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <DollarSign className="h-4 w-4" />
          <span>Compensation & Salary Structure</span>
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'documents'
              ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Document Repository ({(emp?.documents || []).length})</span>
        </button>
      </div>

      {/* Tab 1: Personal & Job Details */}
      {activeTab === 'details' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Contact & Personal Info</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 text-[11px]">Primary Email</span>
                <p className="font-semibold text-white mt-0.5">{emp?.email}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Contact Phone</span>
                <p className="font-semibold text-white mt-0.5">{emp?.phone || '+1 (555) 000-0000'}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Permanent Address</span>
                <p className="font-semibold text-white mt-0.5">{emp?.address || 'Corporate Headquarters'}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Emergency Contact</span>
                <p className="font-semibold text-slate-300 mt-0.5">{emp?.emergencyContact || 'Not specified'}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
              <Building className="h-4 w-4" />
              <span>Employment & Governance</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 text-[11px]">Designation</span>
                <p className="font-semibold text-white mt-0.5">{emp?.designation}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Department</span>
                <p className="font-semibold text-white mt-0.5">{emp?.department}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Employment Status</span>
                <p className="font-bold text-emerald-400 mt-0.5">
                  ● {emp?.employmentStatus || 'Active'}
                </p>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Access Privilege</span>
                <p className="font-bold text-purple-400 mt-0.5">
                  {emp?.role === 'admin' ? 'Administrative HR Officer' : 'Standard Employee'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Compensation & Structure */}
      {activeTab === 'salary' && emp?.salaryStructure && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Configured Salary Structure</h3>
              <p className="text-xs text-slate-400">Monthly earnings and statutory deductions</p>
            </div>
            {isAdmin && (
              <button
                onClick={() => setShowSalaryModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition"
              >
                <Edit className="h-3.5 w-3.5" />
                <span>Adjust Structure</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2.5 text-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Earnings</h4>
              <div className="flex justify-between text-slate-300">
                <span>Basic Salary</span>
                <span className="font-mono font-semibold">${emp.salaryStructure.basic?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>House Rent Allowance (HRA)</span>
                <span className="font-mono font-semibold">${emp.salaryStructure.hra?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Special Allowance</span>
                <span className="font-mono font-semibold">${emp.salaryStructure.specialAllowance?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Performance Bonus</span>
                <span className="font-mono font-semibold">${emp.salaryStructure.bonus?.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-slate-700 flex justify-between font-bold text-white">
                <span>Gross Monthly Pay</span>
                <span className="font-mono text-emerald-400">${emp.salaryStructure.grossSalary?.toLocaleString()}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2.5 text-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400">Deductions</h4>
              <div className="flex justify-between text-slate-300">
                <span>Provident Fund (PF)</span>
                <span className="font-mono font-semibold">${emp.salaryStructure.pfDeduction?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Professional Tax</span>
                <span className="font-mono font-semibold">${emp.salaryStructure.professionalTax?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Income Tax (TDS)</span>
                <span className="font-mono font-semibold">${emp.salaryStructure.incomeTaxTDS?.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-slate-700 flex justify-between font-bold text-white">
                <span>Net Monthly Take-Home</span>
                <span className="font-mono text-emerald-400 text-sm">${emp.salaryStructure.netSalary?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Documents Vault */}
      {activeTab === 'documents' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white">Verified Employee Documents</h3>
              <p className="text-xs text-slate-400">Signed contracts, appointment letters, and identity cards</p>
            </div>

            {/* Quick Upload Mock Document */}
            <form onSubmit={handleAddDocument} className="flex items-center gap-2">
              <input
                type="text"
                value={newDocName}
                onChange={e => setNewDocName(e.target.value)}
                placeholder="Document name (e.g. Passport_ID)"
                className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-white text-xs placeholder-slate-500 focus:border-purple-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={uploadingDoc || !newDocName.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow transition disabled:opacity-50"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Upload</span>
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(emp?.documents || []).map(doc => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-800/40 hover:border-slate-700 transition"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-white truncate">{doc.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{doc.size} • {doc.uploadedAt}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteDocument(doc.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition shrink-0"
                  title="Remove document"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <EditProfileModal
        isOpen={showEditModal}
        employee={emp as Employee}
        onClose={() => setShowEditModal(false)}
        onSuccess={() => {
          fetchProfile();
          refreshUser();
        }}
        isAdminEditing={isAdmin}
      />

      {showSalaryModal && emp && (
        <SalaryStructureModal
          employeeId={emp.id}
          employeeName={emp.name}
          initialStructure={emp.salaryStructure}
          isOpen={showSalaryModal}
          onClose={() => setShowSalaryModal(false)}
          onSuccess={() => {
            fetchProfile();
            refreshUser();
          }}
        />
      )}
    </div>
  );
};
