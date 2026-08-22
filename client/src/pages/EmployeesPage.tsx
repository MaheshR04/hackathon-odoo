import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Mail,
  Phone,
  Building,
  Shield,
  Briefcase,
  Edit,
  DollarSign,
  FileText,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Employee } from '../types';
import { AddEmployeeModal } from '../components/AddEmployeeModal';
import { EditProfileModal } from '../components/EditProfileModal';
import { SalaryStructureModal } from '../components/SalaryStructureModal';

interface EmployeesPageProps {
  selectedEmployeeId?: string | null;
  onSelectEmployee?: (empId: string | null) => void;
}

export const EmployeesPage: React.FC<EmployeesPageProps> = ({
  selectedEmployeeId,
  onSelectEmployee
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [activeDossierEmp, setActiveDossierEmp] = useState<Employee | null>(null);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  const [salaryEditingEmp, setSalaryEditingEmp] = useState<Employee | null>(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await api.employees.getAll({
        search: search || undefined,
        department: selectedDept !== 'all' ? selectedDept : undefined,
        role: selectedRole !== 'all' ? selectedRole : undefined
      });
      if (res.success) {
        setEmployees(res.employees);

        // If a specific employee was requested via props, highlight them
        if (selectedEmployeeId) {
          const match = res.employees.find((e: Employee) => e.id === selectedEmployeeId);
          if (match) setActiveDossierEmp(match);
        } else if (!activeDossierEmp && res.employees.length > 0) {
          setActiveDossierEmp(res.employees[0]);
        }
      }
    } catch (err) {
      console.error('Fetch employees error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [search, selectedDept, selectedRole]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
              {isAdmin ? 'Human Capital Management' : 'Organization Directory'}
            </span>
          </div>
          <h1 className="font-display text-2xl font-extrabold text-white tracking-tight">
            {isAdmin ? 'Employee Directory & Dossiers' : 'Company Colleagues'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {employees.length} active registered team members across all departments
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-950/50 transition active:scale-95"
          >
            <UserPlus className="h-4 w-4" />
            <span>Onboard New Employee</span>
          </button>
        )}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl">
        <div className="sm:col-span-6 relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, ID, email, or role..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs placeholder-slate-500 focus:border-purple-500 focus:outline-none"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={selectedDept}
            onChange={e => setSelectedDept(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs focus:border-purple-500 focus:outline-none"
          >
            <option value="all">All Departments</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Engineering">Engineering</option>
            <option value="Product & Design">Product & Design</option>
            <option value="Sales & Growth">Sales & Growth</option>
            <option value="Finance">Finance</option>
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={selectedRole}
            onChange={e => setSelectedRole(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs focus:border-purple-500 focus:outline-none"
          >
            <option value="all">All Roles</option>
            <option value="admin">HR Admin / Officers</option>
            <option value="employee">Employees</option>
          </select>
        </div>
      </div>

      {/* Split View: Employee List (Left 7 cols) & 360 Dossier Preview (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* List / Cards */}
        <div className="lg:col-span-7 space-y-3">
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-500">Loading directory...</div>
          ) : employees.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-500 rounded-2xl border border-slate-800 bg-slate-900/40">
              No employees match your search criteria.
            </div>
          ) : (
            employees.map(emp => {
              const isSelected = activeDossierEmp?.id === emp.id;
              return (
                <div
                  key={emp.id}
                  onClick={() => setActiveDossierEmp(emp)}
                  className={`group relative flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-purple-950/30 border-purple-500/50 shadow-lg shadow-purple-950/30'
                      : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <img
                      src={emp.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.name}`}
                      alt={emp.name}
                      className="h-12 w-12 rounded-xl object-cover ring-2 ring-purple-500/20"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition">
                          {emp.name}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider ${
                            emp.role === 'admin'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}
                        >
                          {emp.role === 'admin' ? 'Admin' : 'Employee'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-medium">{emp.designation}</p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1 font-mono">
                        <span>{emp.id}</span>
                        <span>•</span>
                        <span>{emp.department}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <ChevronRight className={`h-5 w-5 ${isSelected ? 'text-purple-400' : 'text-slate-600'}`} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 360 Employee Dossier Inspection Panel */}
        <div className="lg:col-span-5">
          {activeDossierEmp ? (
            <div className="sticky top-20 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl shadow-xl space-y-5">
              {/* Dossier Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <img
                    src={activeDossierEmp.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activeDossierEmp.name}`}
                    alt={activeDossierEmp.name}
                    className="h-14 w-14 rounded-2xl object-cover ring-2 ring-purple-500/30 shadow-md"
                  />
                  <div>
                    <h2 className="text-base font-bold text-white">{activeDossierEmp.name}</h2>
                    <p className="text-xs text-slate-400">{activeDossierEmp.designation}</p>
                    <p className="text-[11px] text-indigo-400 font-mono font-semibold mt-0.5">
                      {activeDossierEmp.id}
                    </p>
                  </div>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => setEditingEmp(activeDossierEmp)}
                    className="p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 transition"
                    title="Edit Profile"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Contact Matrix */}
              <div className="space-y-2 p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  <span className="truncate">{activeDossierEmp.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  <span>{activeDossierEmp.phone || 'Not specified'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Building className="h-3.5 w-3.5 text-slate-400" />
                  <span>{activeDossierEmp.department} • Joined {activeDossierEmp.joiningDate}</span>
                </div>
              </div>

              {/* Salary Structure Box (Admin or Self) */}
              {(isAdmin || user?.id === activeDossierEmp.id) && activeDossierEmp.salaryStructure && (
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <DollarSign className="h-3.5 w-3.5" />
                      <span>Salary Structure</span>
                    </span>
                    {isAdmin && (
                      <button
                        onClick={() => setSalaryEditingEmp(activeDossierEmp)}
                        className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold underline"
                      >
                        Adjust
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 text-[11px]">Monthly Gross:</span>
                      <p className="font-bold text-white font-mono">
                        ${activeDossierEmp.salaryStructure.grossSalary?.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px]">Net Take-Home:</span>
                      <p className="font-bold text-emerald-400 font-mono">
                        ${activeDossierEmp.salaryStructure.netSalary?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Documents Repository Vault */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-purple-400" />
                  <span>Verified Documents Vault</span>
                </span>

                <div className="space-y-1.5">
                  {(activeDossierEmp.documents || [
                    { id: '1', name: 'Employment_Contract_Signed.pdf', size: '1.2 MB' },
                    { id: '2', name: 'Tax_Declaration_Form.pdf', size: '850 KB' }
                  ]).map((doc, idx) => (
                    <div
                      key={doc.id || idx}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/40 border border-slate-800 text-xs"
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        <FileText className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate text-slate-300">{doc.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono shrink-0">{doc.size || 'PDF'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-xs text-slate-500 border border-slate-800 rounded-2xl bg-slate-900/30">
              Select an employee to inspect full 360° dossier.
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddEmployeeModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchEmployees}
      />

      <EditProfileModal
        isOpen={!!editingEmp}
        employee={editingEmp}
        onClose={() => setEditingEmp(null)}
        onSuccess={fetchEmployees}
        isAdminEditing={isAdmin}
      />

      {salaryEditingEmp && (
        <SalaryStructureModal
          isOpen={!!salaryEditingEmp}
          employeeId={salaryEditingEmp.id}
          employeeName={salaryEditingEmp.name}
          initialStructure={salaryEditingEmp.salaryStructure}
          onClose={() => setSalaryEditingEmp(null)}
          onSuccess={fetchEmployees}
        />
      )}
    </div>
  );
};
