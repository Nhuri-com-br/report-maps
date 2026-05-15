/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MapView } from './components/MapView';
import { Modal } from './components/Modal';
import { ReportForm } from './components/ReportForm';
import { UrbanIssue } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, MapPin, Calendar, ThumbsUp, MessageCircle, X, Info, Zap, Shield, Map as MapIcon } from 'lucide-react';
import { ISSUE_TYPES, APP_NAME } from './constants';
import { cn } from './lib/utils';
import { auth } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { issueService } from './services/issueService';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentTab, setTab] = useState<string>('dashboard');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<UrbanIssue | null>(null);
  const [issues, setIssues] = useState<UrbanIssue[]>([]);
  const [clickedLocation, setClickedLocation] = useState<{ lat: number, lng: number } | undefined>(undefined);

  const filteredIssues = issues.filter(issue => {
    if (currentTab === 'map_fire') return issue.type === 'fire';
    if (currentTab === 'map_flood') return issue.type === 'flooding';
    if (currentTab === 'map_pothole') return issue.type === 'pothole';
    if (currentTab === 'map_power') return issue.type === 'power_outage';
    return true;
  });

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    const unsubscribeIssues = issueService.subscribeToIssues((fetchedIssues) => {
      setIssues(fetchedIssues);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeIssues();
    };
  }, []);

  const handleCreateIssue = async (data: any) => {
    if (!user) {
      alert('Você precisa estar logado para relatar um problema.');
      return;
    }
    
    try {
      await issueService.createIssue({
        ...data,
      });
      setIsReportModalOpen(false);
      setClickedLocation(undefined);
      setTab('map');
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleLike = async (issue: UrbanIssue) => {
    if (!user) return;
    const isLiked = issue.likedBy.includes(user.uid);
    try {
      await issueService.toggleLike(issue.id, isLiked);
    } catch (error) {
      console.error(error);
    }
  };

  const renderContent = () => {
    // Determine the base view
    const view = currentTab.startsWith('map') ? 'map' : currentTab;

    switch (view) {
      case 'dashboard':
        return (
          <div className="p-8 max-w-6xl mx-auto space-y-8">
            <header>
              <h1 className="text-3xl font-bold text-slate-900">Bem-vindo ao Report Maps</h1>
              <p className="text-slate-500 mt-1">Aqui está um resumo do que está acontecendo na sua cidade.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-4">
                  <AlertTriangle size={20} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">{filteredIssues.length}</h3>
                <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Relatos Ativos</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <MapPin size={20} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">4</h3>
                <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Bairros Afetados</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-4">
                  <ThumbsUp size={20} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">0</h3>
                <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Solucionados Hoje</p>
              </div>
            </div>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">
                  {currentTab === 'dashboard' ? 'Relatos Recentes' : `Relatos de ${ISSUE_TYPES.find(t => t.type === currentTab.replace('map_', '').replace('fire', 'fire').replace('flood', 'flooding').replace('pothole', 'pothole').replace('power', 'power_outage'))?.label || ''}`}
                </h2>
                <button onClick={() => setTab('map')} className="text-blue-600 text-sm font-semibold hover:underline">Ver no Mapa</button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {filteredIssues.length > 0 ? filteredIssues.map(issue => {
                  const it = ISSUE_TYPES.find(t => t.type === issue.type);
                  const isLiked = user && issue.likedBy.includes(user.uid);
                  return (
                    <motion.div 
                      key={issue.id}
                      whileHover={{ y: -2 }}
                      className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4 items-start"
                    >
                      <div className="flex-shrink-0">
                        {issue.imageUrl ? (
                          <img src={issue.imageUrl} alt={issue.title} className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl shadow-sm" />
                        ) : (
                          <div className="p-3 rounded-xl bg-slate-50 text-slate-600 w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                            {it && <it.icon size={24} />}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900">{issue.title}</h4>
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                            issue.status === 'pending' ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
                          )}>
                            {issue.status === 'pending' ? 'Pendente' : issue.status === 'in_progress' ? 'Em Progresso' : 'Resolvido'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-2">{issue.description}</p>
                        <div className="flex flex-wrap items-center gap-4 pt-2 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1"><MapPin size={12} /> {issue.address}</span>
                          <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(issue.createdAt).toLocaleDateString('pt-BR')}</span>
                          <span className="text-slate-300">|</span>
                          <span>Por {issue.reporterName}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleToggleLike(issue)}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all",
                            isLiked ? "bg-blue-600 text-white shadow-md shadow-blue-200" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                          )}
                        >
                          <ThumbsUp size={14} className={cn(isLiked && "fill-white")} /> {issue.likesCount}
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 text-slate-600 text-xs font-semibold hover:bg-slate-100">
                          <MessageCircle size={14} /> Comentar
                        </button>
                      </div>
                    </motion.div>
                  );
                }) : (
                  <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                    <Info size={40} className="mb-2 opacity-20" />
                    <p className="font-medium">Nenhuma ocorrência encontrada nesta categoria.</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        );
      case 'map':
        return (
          <div className="flex-1 h-full relative">
            <MapView 
              issues={filteredIssues} 
              onSelectIssue={setSelectedIssue}
              onMapClick={(lat, lng) => {
                setClickedLocation({ lat, lng });
                setIsReportModalOpen(true);
              }}
            />
            {selectedIssue && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md px-4">
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 max-h-[80vh] overflow-y-auto"
                >
                  <div className="h-2 w-full bg-blue-600" />
                  {selectedIssue.imageUrl && (
                    <img 
                      src={selectedIssue.imageUrl} 
                      alt={selectedIssue.title} 
                      className="w-full h-48 object-cover border-b border-slate-100" 
                    />
                  )}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-lg">{selectedIssue.title}</h4>
                      <button onClick={() => setSelectedIssue(null)} className="p-1 hover:bg-slate-100 rounded-full">
                        <X size={20} className="text-slate-400" />
                      </button>
                    </div>
                    <p className="text-sm text-slate-600">{selectedIssue.description}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">{selectedIssue.reporterName}</span>
                      <button className="bg-slate-900 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-sm">
                        Ver detalhes
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        );
      case 'about':
        return (
          <div className="p-8 max-w-4xl mx-auto space-y-8">
            <header className="text-center space-y-4">
              <div className="w-20 h-20 bg-blue-600 rounded-3xl mx-auto flex items-center justify-center shadow-xl shadow-blue-200">
                <MapIcon className="text-white" size={40} />
              </div>
              <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Report Maps</h1>
              <p className="text-xl text-slate-500 max-w-2xl mx-auto">TCC de Desenvolvimento de Sistemas</p>
            </header>

            <div className="prose prose-slate max-w-none bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
              <section>
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                  <span className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center text-sm">01</span>
                  Resumo do Projeto
                </h2>
                <p className="text-slate-600 leading-relaxed mt-4">
                  O projeto propõe o desenvolvimento de um aplicativo com o objetivo de ajudar a população a informar e acompanhar problemas urbanos, 
                  como buracos nas ruas, alagamentos, quedas de energia e queimadas. A ideia é permitir que os próprios usuários façam registros 
                  dessas situações de forma simples, facilitando a comunicação com órgãos responsáveis, como a Defesa Civil e a prefeitura.
                </p>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
                <section className="space-y-4">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Zap size={18} className="text-blue-600" />
                    Tecnologias Utilizadas
                  </h3>
                  <ul className="grid grid-cols-2 gap-2">
                    {['React + Vite', 'TypeScript', 'Tailwind CSS', 'Firebase Docs', 'Google Maps API', 'Motion'].map(tech => (
                      <li key={tech} className="bg-slate-50 px-3 py-1.5 rounded-lg text-sm text-slate-600 border border-slate-100">
                        {tech}
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="space-y-4">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Shield size={18} className="text-green-600" />
                    Responsáveis
                  </h3>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-sm text-slate-600">Desenvolvido como projeto experimental de conclusão de curso.</p>
                  </div>
                </section>
              </div>

              <section className="border-t border-slate-100 pt-8">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                  <span className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center text-sm">02</span>
                  Objetivo Geral
                </h2>
                <p className="text-slate-600 leading-relaxed mt-4">
                  Desenvolver um aplicativo que melhore a comunicação entre cidadãos e órgãos públicos através de uma plataforma digital interativa 
                  rápida, organizada e eficiente.
                </p>
              </section>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-full text-slate-400 flex-col gap-4">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
              <Info size={32} />
            </div>
            <p className="font-medium italic">Esta seção ({currentTab}) está em desenvolvimento...</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 text-slate-900 font-sans overflow-hidden">
      <Sidebar currentTab={currentTab} setTab={setTab} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header currentTab={currentTab} setTab={setTab} onReportClick={() => setIsReportModalOpen(true)} />
        
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </main>

          <aside className="w-80 bg-slate-50 border-l border-slate-200 hidden xl:flex flex-col shrink-0 overflow-hidden">
            <div className="p-6 border-b border-slate-200 bg-white">
              <h2 className="text-sm font-bold text-slate-800">Atividade Recente</h2>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-1">Feed colaborativo em tempo real</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {issues.slice(0, 5).map(issue => (
                <div key={issue.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-xs font-bold text-slate-600">
                      {issue.reporterName[0]}
                    </div>
                    <div>
                      <p className="text-xs text-slate-700 leading-tight">
                        <strong className="text-slate-900">{issue.reporterName}</strong> reportou um problema de <strong>{ISSUE_TYPES.find(t => t.type === issue.type)?.label}</strong>
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium mt-1">{issue.address}</p>
                    </div>
                  </div>
                </div>
              ))}

              <div className="bg-green-50 border border-green-100 p-4 rounded-xl space-y-2">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center shrink-0 text-lg">🏛️</div>
                  <div>
                    <p className="text-xs font-bold text-green-800 uppercase tracking-tight">Defesa Civil Atualizou</p>
                    <p className="text-[11px] text-green-700 font-medium mt-0.5">Equipe enviada para averiguação técnica no local.</p>
                    <div className="mt-2 inline-block px-2 py-0.5 bg-green-600 text-[9px] text-white font-bold rounded uppercase tracking-wider">
                      Em Atendimento
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white border-t border-slate-200">
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                <span>Resumo Semanal</span>
                <span className="text-blue-600">64% Resolvidos</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "64%" }}
                  className="h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" 
                />
              </div>
            </div>
          </aside>
        </div>

        <footer className="h-10 bg-white border-t border-slate-200 px-6 flex items-center justify-between text-[10px] text-slate-400 uppercase font-bold tracking-widest bg-white/80 backdrop-blur-sm z-20">
          <div>&copy; 2024 Projeto Report Maps - TCC ADS</div>
          <div className="flex gap-4 items-center">
            <span>Versão 1.0.2-beta</span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
              <span className="text-slate-500">Sistema Operacional</span>
            </div>
          </div>
        </footer>
      </div>

      <Modal 
        isOpen={isReportModalOpen} 
        onClose={() => {
          setIsReportModalOpen(false);
          setClickedLocation(undefined);
        }}
        title="Novo Relato Urbano"
      >
        <ReportForm onSubmit={handleCreateIssue} initialLocation={clickedLocation} />
      </Modal>
    </div>
  );
}

// End of App component

