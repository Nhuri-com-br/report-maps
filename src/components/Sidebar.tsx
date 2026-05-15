/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { LucideIcon } from 'lucide-react';

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  onClick: () => void;
  collapsed?: boolean;
}

function SidebarItem({ icon: Icon, label, active, onClick, collapsed, variant = 'default' }: SidebarItemProps & { variant?: 'default' | 'danger' | 'info' | 'success' | 'warning' }) {
  const variantClasses = {
    default: active ? "bg-slate-900 text-white shadow-lg shadow-slate-200" : "text-slate-500 hover:bg-slate-100",
    danger: active ? "bg-red-50 text-red-700 border-red-200" : "text-slate-500 hover:bg-red-50",
    info: active ? "bg-blue-50 text-blue-700 border-blue-200" : "text-slate-500 hover:bg-blue-50",
    success: active ? "bg-green-50 text-green-700 border-green-200" : "text-slate-500 hover:bg-green-50",
    warning: active ? "bg-yellow-50 text-yellow-700 border-yellow-200" : "text-slate-500 hover:bg-yellow-50",
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center justify-between w-full p-3 rounded-xl transition-all duration-200 group relative border border-transparent font-medium text-sm",
        variantClasses[variant]
      )}
    >
      <div className="flex items-center gap-3">
        <Icon size={18} className={cn(!active && "group-hover:scale-110 transition-transform")} />
        {!collapsed && <span className="whitespace-nowrap">{label}</span>}
      </div>
      {collapsed && (
        <div className="absolute left-full ml-4 px-2 py-1 bg-slate-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap shadow-xl">
          {label}
        </div>
      )}
    </button>
  );
}

import { LayoutPanelLeft, Map as MapIcon, ClipboardList, MessageSquare, Info, Settings, LogOut, Menu, Flame, Droplets, AlertTriangle, Zap } from 'lucide-react';
import { useState } from 'react';

export function Sidebar({ currentTab, setTab }: { currentTab: string, setTab: (tab: any) => void }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      className="h-screen bg-white border-r border-slate-200 flex flex-col z-40 sticky top-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)]"
    >
      <div className="p-6 flex items-center justify-between">
        {!isCollapsed && (
          <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Filtrar Mapa</h2>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400"
        >
          <Menu size={18} />
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        <SidebarItem 
          icon={LayoutPanelLeft} 
          label="Visão Geral" 
          active={currentTab === 'dashboard'} 
          onClick={() => setTab('dashboard')} 
          collapsed={isCollapsed}
        />
        <div className="h-px bg-slate-100 my-4 mx-2" />
        <SidebarItem 
          icon={Flame} 
          label="Queimadas" 
          variant="danger"
          active={currentTab === 'map_fire'} 
          onClick={() => setTab('map_fire')} 
          collapsed={isCollapsed}
        />
        <SidebarItem 
          icon={Droplets} 
          label="Alagamentos" 
          variant="info"
          active={currentTab === 'map_flood'} 
          onClick={() => setTab('map_flood')} 
          collapsed={isCollapsed}
        />
        <SidebarItem 
          icon={AlertTriangle} 
          label="Buracos" 
          active={currentTab === 'map_pothole'} 
          onClick={() => setTab('map_pothole')} 
          collapsed={isCollapsed}
        />
        <SidebarItem 
          icon={Zap} 
          label="Energia" 
          variant="warning"
          active={currentTab === 'map_power'} 
          onClick={() => setTab('map_power')} 
          collapsed={isCollapsed}
        />
      </nav>

      <div className="p-5 mt-auto">
        {!isCollapsed ? (
          <div className="bg-blue-600 rounded-2xl p-5 text-white shadow-xl shadow-blue-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all" />
            <h3 className="font-bold text-sm mb-1 relative z-10">Novo Registro</h3>
            <p className="text-[11px] text-blue-100 mb-4 relative z-10 font-medium">Encontrou um problema na sua rua? Informe agora.</p>
            <button 
              onClick={() => setTab('map')}
              className="w-full bg-white text-blue-600 font-bold py-2.5 rounded-xl text-xs shadow-sm hover:shadow-md transition-all active:scale-95 uppercase tracking-wider relative z-10"
            >
              Reportar Agora
            </button>
          </div>
        ) : (
          <button className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg mx-auto">
            <Plus size={20} />
          </button>
        )}
      </div>
    </motion.aside>
  );
}

import { Plus } from 'lucide-react';
