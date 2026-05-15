/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Search, Bell, User, Plus, LogOut } from 'lucide-react';
import { APP_NAME } from '../constants';
import { auth, loginWithGoogle, logout } from '../lib/firebase';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { cn } from '../lib/utils';

export function Header({ currentTab, setTab, onReportClick }: { currentTab: string, setTab: (tab: any) => void, onReportClick: () => void }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-700 px-6 flex items-center justify-between sticky top-0 z-30 text-white shadow-lg">
      <div className="flex items-center gap-6 flex-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl shadow-lg ring-1 ring-blue-400/20">RM</div>
          <div>
            <h1 className="text-sm font-bold leading-none tracking-tight">Report Maps</h1>
            <p className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold mt-1">Gestão Urbana Colaborativa</p>
          </div>
        </div>
        
        <nav className="hidden md:flex gap-6 text-xs font-bold uppercase tracking-wider">
          <button onClick={() => setTab('map')} className={cn("pb-1 transition-all", currentTab === 'map' ? "text-blue-400 border-b-2 border-blue-400" : "text-slate-400 hover:text-white")}>Mapa</button>
          <button onClick={() => setTab('forum')} className={cn("pb-1 transition-all", currentTab === 'forum' ? "text-blue-400 border-b-2 border-blue-400" : "text-slate-400 hover:text-white")}>Fórum</button>
          <button onClick={() => setTab('dashboard')} className={cn("pb-1 transition-all", currentTab === 'dashboard' ? "text-blue-400 border-b-2 border-blue-400" : "text-slate-400 hover:text-white")}>Estatísticas</button>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={onReportClick}
          className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg flex items-center gap-2 text-xs font-bold transition-all shadow-lg shadow-blue-900/20 active:scale-95 uppercase tracking-wider"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Reportar Agora</span>
        </button>
        
        <div className="h-8 w-[1px] bg-slate-700 mx-2" />
        
        {user ? (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold leading-none">{user.displayName?.split(' ')[0]}</p>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">
                {user.email === 'yuridragoni6@gmail.com' ? 'Administrador' : 'Cidadão Ativo'}
              </p>
            </div>
            <img 
              src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
              alt={user.displayName || ''} 
              className="w-9 h-9 rounded-full border border-slate-600 ring-2 ring-slate-800"
              referrerPolicy="no-referrer"
            />
            <button 
              onClick={() => logout()}
              className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
              title="Sair"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button 
            onClick={() => loginWithGoogle()}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all border border-slate-700 text-xs font-bold uppercase tracking-wider"
          >
            <User size={16} />
            <span>Entrar</span>
          </button>
        )}
      </div>
    </header>
  );
}
