/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({ isOpen, onClose, title, children, maxWidth = "max-w-md" }: ModalProps) {
  // Fecha com a tecla Esc
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className={cn(
              "w-full bg-white shadow-2xl flex flex-col overflow-hidden",
              "max-h-[92dvh] rounded-t-2xl sm:max-h-[90dvh] sm:rounded-2xl",
              maxWidth
            )}
          >
            {/* Cabeçalho fixo */}
            <div className="shrink-0 p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
              <button
                onClick={onClose}
                aria-label="Fechar"
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Corpo com rolagem */}
            <div className="flex-1 min-h-0 overflow-y-auto p-6">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}