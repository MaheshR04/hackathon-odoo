import React, { useState, useEffect } from 'react';
import { X, User, Phone, MapPin, ShieldAlert, Image, Save, AlertCircle } from 'lucide-react';
import { Employee } from '../types';
import { api } from '../services/api';

interface EditProfileModalProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isAdminEditing?: boolean;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  employee,
  isOpen,
  onClose,
  onSuccess,
  isAdminEditing = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    emergencyContact: '',
    profilePicture: '',
    designation: '',
    department: '',
    employmentStatus: 'Active',
    role: 'employee'
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || '',
        email: employee.email || '',
        phone: employee.phone || '',
        address: employee.address || '',
        emergencyContact: employee.emergencyContact || '',
        profilePicture: employee.profilePicture || '',
        designation: employee.designation || '',
        department: employee.department || '',
        employmentStatus: employee.employmentStatus || 'Active',
        role: employee.role || 'employee'
      });
    }
  }, [employee]);

  if (!isOpen || !employee) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await api.employees.update(employee.id, formData);
      if (res.success) {
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" />

      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl z-10 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 p-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isAdminEditing ? `Edit Employee Dossier (${employee.id})` : 'Edit My Profile Details'}
              </h3>
              <p className="text-xs text-slate-400">
                {isAdminEditing
                  ? 'Full administrative control over all attributes'
                  : 'Update your contact information and profile picture'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Avatar Preview */}
          <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <img
              src={formData.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name || 'User'}`}
              alt="Avatar Preview"
              className="h-14 w-14 rounded-xl object-cover ring-2 ring-purple-500/30"
            />
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Profile Avatar URL / Seed
              </label>
              <input
                type="text"
                value={formData.profilePicture}
                onChange={e => setFormData({ ...formData, profilePicture: e.target.value })}
                placeholder="https://images.unsplash.com/... or Dicebear URL"
                className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-white text-xs focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Admin Only Fields */}
          {isAdminEditing && (
            <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/20 space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-purple-400">
                Admin Exclusive Attributes
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-white text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-white text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Designation</label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={e => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-white text-xs"
                  >
                    <option value="Human Resources">Human Resources</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Product & Design">Product & Design</option>
                    <option value="Sales & Growth">Sales & Growth</option>
                    <option value="Finance">Finance</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Role / Access</label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-white text-xs font-bold text-purple-300"
                  >
                    <option value="employee">Employee</option>
                    <option value="admin">Admin / HR Officer</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Contact Fields (Editable by both Employee & Admin) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                <span>Contact Phone</span>
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <ShieldAlert className="h-3.5 w-3.5 text-slate-400" />
                <span>Emergency Contact</span>
              </label>
              <input
                type="text"
                value={formData.emergencyContact}
                onChange={e => setFormData({ ...formData, emergencyContact: e.target.value })}
                placeholder="Name (Relationship: Phone)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              <span>Residential / Permanent Address</span>
            </label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              placeholder="Street address, City, State, ZIP code"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs focus:border-purple-500 focus:outline-none resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-purple-950/50 transition disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{loading ? 'Saving Changes...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
