/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LayoutPanelLeft, Map as MapIcon, MessageSquare, Info, Plus } from 'lucide-react';
import { cn } from '../lib/utils';

interface MobileNavProps {
  currentTab: string;
  setTab: (tab: string) => void;
  onReportClick: () => void;
}

export function MobileNav({ currentTab, setTab, onReportClick }: MobileNavProps) {
  const tabs = [
    { id: 'dashboard', icon: LayoutPanelLeft, label: 'Início' },
    { id: 'map', icon: MapIcon, label: 'Mapa' },
    { id: 'report', icon: Plus, label: 'Relatar', highlight: true },
    { id: 'forum', icon: MessageSquare, label: 'Fórum' },
    { id: 'about', icon: Info, label: 'Sobre' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-1 flex items-center justify-around z-50 h-16 shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => tab.id === 'report' ? onReportClick() : setTab(tab.id)}
          className={cn(
            "flex flex-col items-center justify-center p-2 rounded-xl transition-all",
            tab.highlight 
              ? "bg-blue-600 text-white shadow-lg -mt-8 w-12 h-12 rounded-2xl active:scale-90" 
              : currentTab === tab.id 
                ? "text-blue-600" 
                : "text-slate-400"
          )}
        >
          <tab.icon size={20} />
          {!tab.highlight && <span className="text-[10px] font-bold mt-1 tracking-tight">{tab.label}</span>}
        </button>
      ))}
    </nav>
  );
}
