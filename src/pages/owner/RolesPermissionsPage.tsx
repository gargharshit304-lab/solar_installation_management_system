import React, { useState } from 'react';
import { 
  Layers, ShieldCheck, Check, X, Plus, Edit2, 
  Trash2, AlertCircle, Info, Lock, Save
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { RoleDefinition, PermissionAction } from '../../types';

export const RolesPermissionsPage: React.FC = () => {
  const { rolesPermissions, updateRolePermissions, createCustomRole, showToast } = useApp();

  const [selectedRoleId, setSelectedRoleId] = useState<string>(rolesPermissions[0]?.id || 'role-1');
  const [isCreateRoleModalOpen, setIsCreateRoleModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [newRoleBaseId, setNewRoleBaseId] = useState(rolesPermissions[0]?.id || 'role-1');

  const activeRole = rolesPermissions.find(r => r.id === selectedRoleId) || rolesPermissions[0];

  const modulesList: { key: string; label: string; category: string }[] = [
    { key: 'overview', label: 'Company Overview & KPIs', category: 'Executive' },
    { key: 'customers', label: 'Customers & CRM Directory', category: 'Sales' },
    { key: 'enquiries', label: 'Lead Inquiries & Pre-screening', category: 'Sales' },
    { key: 'follow_ups', label: 'Sales Follow-up Schedules', category: 'Sales' },
    { key: 'surveys', label: 'Site Surveys & Measurements', category: 'Field Operations' },
    { key: 'survey_review', label: 'Survey Review & Approval', category: 'Engineering' },
    { key: 'quotations', label: 'Solar Quotations & Pricing', category: 'Sales' },
    { key: 'orders', label: 'Customer Orders & Payments', category: 'Finance' },
    { key: 'inventory', label: 'Warehouse Stock & Panels', category: 'Supply Chain' },
    { key: 'dispatch', label: 'Material Dispatch & Logistics', category: 'Supply Chain' },
    { key: 'installations', label: 'Rooftop Installations & Sync', category: 'Operations' },
    { key: 'workforce', label: 'Workforce & Technicians', category: 'Human Resources' },
    { key: 'departments', label: 'Departments & Teams', category: 'Executive' },
    { key: 'roles_permissions', label: 'Roles & Security Matrix', category: 'Executive' },
    { key: 'approvals', label: 'Company Authorization Inbox', category: 'Executive' },
    { key: 'finance', label: 'P&L, Margins & Financials', category: 'Finance' },
    { key: 'reports', label: 'Business Analytics & Exports', category: 'Finance' },
    { key: 'ai_agents', label: 'Retell AI Voice Agents', category: 'Automation' },
    { key: 'settings', label: 'System Configuration', category: 'Administration' }
  ];

  const actionsList: { key: PermissionAction; label: string }[] = [
    { key: 'view', label: 'View' },
    { key: 'create', label: 'Create' },
    { key: 'edit', label: 'Edit' },
    { key: 'delete', label: 'Delete' },
    { key: 'assign', label: 'Assign' },
    { key: 'approve', label: 'Approve' },
    { key: 'export', label: 'Export' },
    { key: 'manage', label: 'Manage' },
  ];

  const handleTogglePermission = (moduleKey: string, action: PermissionAction) => {
    if (!activeRole) return;
    if (activeRole.roleKey === 'owner_admin') {
      showToast('Owner & Managing Director role permissions cannot be altered', 'warning');
      return;
    }

    const currentModuleActions = activeRole.permissions[moduleKey] || [];
    const exists = currentModuleActions.includes(action);

    const updatedModuleActions = exists 
      ? currentModuleActions.filter(a => a !== action)
      : [...currentModuleActions, action];

    const updatedPermissions = {
      ...activeRole.permissions,
      [moduleKey]: updatedModuleActions
    };

    updateRolePermissions(activeRole.id, updatedPermissions);
  };

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) {
      showToast('Role name is required', 'error');
      return;
    }

    const baseRole = rolesPermissions.find(r => r.id === newRoleBaseId);
    const initialPerms = baseRole ? { ...baseRole.permissions } : {};

    createCustomRole({
      name: newRoleName,
      roleKey: `custom_${newRoleName.toLowerCase().replace(/\s+/g, '_')}`,
      description: newRoleDesc || 'Custom configured company security role',
      userCount: 0,
      permissions: initialPerms
    });

    setNewRoleName('');
    setNewRoleDesc('');
    setIsCreateRoleModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-charcoal tracking-tight">Roles & Permissions Matrix</h1>
            <span className="px-2 py-0.5 bg-sand-200/70 text-navy text-[10px] font-bold rounded-full border border-warmGrey uppercase tracking-wider">
              RBAC Security
            </span>
          </div>
          <p className="text-xs text-mutedGrey mt-0.5">
            Granular access controls across 19 modules and 8 permission levels for SunPower Solutions
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setIsCreateRoleModalOpen(true)}
            className="px-3.5 py-2 bg-navy text-white text-xs font-semibold rounded-xl hover:bg-navy-light transition-colors shadow-xs flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Custom Role</span>
          </button>
        </div>
      </div>

      {/* Role Selector Tabs */}
      <div className="bg-white rounded-2xl p-4 border border-[rgba(196,138,66,0.18)] shadow-[0_3px_12px_rgba(196,138,66,0.10)]">
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          {rolesPermissions.map((role) => {
            const isSelected = role.id === activeRole?.id;
            return (
              <button
                key={role.id}
                onClick={() => setSelectedRoleId(role.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-2 shrink-0 border ${
                  isSelected
                    ? 'bg-navy text-white border-navy shadow-xs'
                    : 'bg-sand-50/70 text-charcoal border-warmGrey/60 hover:bg-sand-100'
                }`}
              >
                <span>{role.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-warmGrey/50 text-charcoal'
                }`}>
                  {role.userCount}
                </span>
                {role.isCustom && (
                  <span className="text-[9px] uppercase px-1 rounded bg-amber-100 text-amber font-bold">
                    Custom
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {activeRole && (
          <div className="mt-4 pt-3 border-t border-warmGrey/40 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
            <div>
              <span className="font-semibold text-charcoal">Role Scope: </span>
              <span className="text-mutedGrey">{activeRole.description}</span>
            </div>
            {activeRole.roleKey === 'owner_admin' && (
              <div className="flex items-center space-x-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px] font-semibold shrink-0">
                <Lock className="w-3 h-3" />
                <span>Superadmin — Root Access</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Permissions Matrix Table */}
      <div className="bg-white rounded-2xl border border-[rgba(196,138,66,0.18)] shadow-[0_3px_12px_rgba(196,138,66,0.10)] overflow-hidden">
        <div className="px-5 py-4 border-b border-warmGrey/60 bg-sand-50/40 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-charcoal">
              Access Matrix for <span className="text-navy">{activeRole?.name}</span>
            </h3>
            <p className="text-[11px] text-mutedGrey">
              Click individual cell checkboxes to toggle module authorization
            </p>
          </div>
          <div className="text-[11px] text-mutedGrey font-medium">
            Changes auto-save immediately
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-warmGrey/60 bg-sand-50/70 text-[11px] font-bold text-charcoal uppercase tracking-wider">
                <th className="py-3 px-4 min-w-[200px]">Module / Entity</th>
                <th className="py-3 px-3 text-mutedGrey font-medium text-[10px]">Category</th>
                {actionsList.map(action => (
                  <th key={action.key} className="py-3 px-3 text-center min-w-[70px]">
                    {action.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-warmGrey/40">
              {modulesList.map((mod) => {
                const grantedActions = activeRole?.permissions[mod.key] || [];
                const isSuperAdmin = activeRole?.roleKey === 'owner_admin';

                return (
                  <tr key={mod.key} className="hover:bg-sand-50/50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-charcoal">
                      {mod.label}
                    </td>
                    <td className="py-3 px-3 text-[10px] text-mutedGrey font-medium">
                      <span className="px-1.5 py-0.5 rounded bg-sand-100 text-charcoal">
                        {mod.category}
                      </span>
                    </td>

                    {actionsList.map(action => {
                      const isGranted = grantedActions.includes(action.key);
                      return (
                        <td key={action.key} className="py-3 px-3 text-center">
                          <button
                            type="button"
                            disabled={isSuperAdmin}
                            onClick={() => handleTogglePermission(mod.key, action.key)}
                            className={`w-6 h-6 rounded-md inline-flex items-center justify-center transition-all ${
                              isGranted
                                ? 'bg-navy text-white shadow-xs'
                                : 'bg-sand-100 text-mutedGrey hover:bg-sand-200'
                            } ${isSuperAdmin ? 'opacity-90 cursor-default' : 'cursor-pointer hover:scale-105'}`}
                          >
                            {isGranted ? <Check className="w-3.5 h-3.5" /> : <span className="text-[10px] text-warmGrey">•</span>}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Custom Role Modal */}
      {isCreateRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-warmGrey relative">
            <button
              onClick={() => setIsCreateRoleModalOpen(false)}
              className="absolute right-4 top-4 text-mutedGrey hover:text-charcoal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-sand-100 flex items-center justify-center text-navy">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-charcoal">Create Custom Role</h3>
                <p className="text-xs text-mutedGrey">Define specialized permissions for employees</p>
              </div>
            </div>

            <form onSubmit={handleCreateRole} className="space-y-4 text-xs">
              <div>
                <label className="block text-mutedGrey font-medium mb-1">Role Title</label>
                <input
                  type="text"
                  placeholder="e.g. Junior Solar Estimator or Site Supervisor"
                  value={newRoleName}
                  onChange={e => setNewRoleName(e.target.value)}
                  className="w-full p-2.5 border border-warmGrey rounded-xl text-charcoal focus:outline-none focus:ring-1 focus:ring-navy"
                  required
                />
              </div>

              <div>
                <label className="block text-mutedGrey font-medium mb-1">Base Permissions Template</label>
                <select
                  value={newRoleBaseId}
                  onChange={e => setNewRoleBaseId(e.target.value)}
                  className="w-full p-2.5 border border-warmGrey rounded-xl bg-white text-charcoal focus:outline-none focus:ring-1 focus:ring-navy"
                >
                  {rolesPermissions.map(r => (
                    <option key={r.id} value={r.id}>
                      Clone from {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-mutedGrey font-medium mb-1">Role Description & Responsibilities</label>
                <textarea
                  rows={3}
                  placeholder="Outline the operational responsibilities granted to this role..."
                  value={newRoleDesc}
                  onChange={e => setNewRoleDesc(e.target.value)}
                  className="w-full p-2.5 border border-warmGrey rounded-xl text-charcoal focus:outline-none focus:ring-1 focus:ring-navy"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateRoleModalOpen(false)}
                  className="px-4 py-2 border border-warmGrey text-charcoal rounded-xl hover:bg-sand-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-navy text-white rounded-xl hover:bg-navy-light font-semibold shadow-xs"
                >
                  Create Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
