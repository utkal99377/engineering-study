import React, { useState } from 'react';
import { Users, Search, ShieldCheck, UserCheck, Shield } from 'lucide-react';

export const UsersTab = ({ users = [], onRoleChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const filteredUsers = users.filter((u) => {
    const matchesSearch = !searchQuery ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.college_branch && u.college_branch.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      
      {/* Control Bar */}
      <div className="clean-panel bg-[#11141E] border border-[#222634] p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 w-full sm:w-auto flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search students by name, email, or college branch..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#161924] pl-9 pr-3 py-2 rounded-xl border border-[#262B3D] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-[#161924] px-3 py-2 rounded-xl border border-[#262B3D] text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Roles ({users.length})</option>
            <option value="student">Students</option>
            <option value="admin">Administrators</option>
            <option value="content_manager">Content Managers</option>
          </select>
        </div>

        <span className="text-xs text-slate-400 font-mono">
          Showing {filteredUsers.length} of {users.length} accounts
        </span>
      </div>

      {/* Users Table */}
      <div className="clean-panel bg-[#11141E] border border-[#222634] rounded-2xl p-5 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#232738] text-slate-500 font-mono uppercase text-[10px]">
                <th className="pb-3 font-semibold">User</th>
                <th className="pb-3 font-semibold">Email</th>
                <th className="pb-3 font-semibold">College Branch & Sem</th>
                <th className="pb-3 font-semibold">Current Role</th>
                <th className="pb-3 font-semibold text-right">Assign Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1D2130]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 italic">
                    No users matching search query.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#161926] transition">
                    <td className="py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-300 font-bold font-mono text-xs flex items-center justify-center shrink-0">
                          {u.name?.charAt(0) || 'U'}
                        </div>
                        <span className="font-semibold text-white">{u.name}</span>
                      </div>
                    </td>

                    <td className="py-3.5 font-mono text-slate-400">{u.email}</td>

                    <td className="py-3.5 text-slate-300">
                      {u.college_branch || 'B.Tech CSE'} <span className="text-slate-500">({u.semester || '3rd Sem'})</span>
                    </td>

                    <td className="py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-semibold uppercase ${
                        u.role === 'admin'
                          ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                          : u.role === 'content_manager'
                          ? 'bg-sky-500/10 text-sky-300 border border-sky-500/30'
                          : 'bg-[#1C202E] text-slate-400'
                      }`}>
                        {u.role}
                      </span>
                    </td>

                    <td className="py-3.5 text-right">
                      <select
                        value={u.role}
                        onChange={(e) => onRoleChange(u.id, e.target.value)}
                        className="bg-[#161924] border border-[#2B3042] rounded-lg px-2.5 py-1 text-xs text-indigo-300 font-mono focus:outline-none focus:border-indigo-500"
                      >
                        <option value="student">student</option>
                        <option value="content_manager">content_manager</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
