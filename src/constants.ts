/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AlertTriangle, Home, Info, Map as MapIcon, MessageSquare, Settings, Shield, User, Zap, Droplets, Flame, Trash2, Lightbulb } from 'lucide-react';
import { IssueType, UrbanIssue } from './types';

export const ISSUE_TYPES: { type: IssueType; label: string; color: string; icon: any }[] = [
  { type: 'pothole', label: 'Buraco', color: '#B45309', icon: AlertTriangle },
  { type: 'flooding', label: 'Alagamento', color: '#1D4ED8', icon: Droplets },
  { type: 'power_outage', label: 'Queda de Energia', color: '#FBBF24', icon: Zap },
  { type: 'fire', label: 'Queimada', color: '#DC2626', icon: Flame },
  { type: 'light_failure', label: 'Iluminação Pública', color: '#FACC15', icon: Lightbulb },
  { type: 'garbage', label: 'Lixo Acumulado', color: '#059669', icon: Trash2 },
  { type: 'other', label: 'Outro', color: '#6B7280', icon: Info },
];

export const APP_NAME = "Report Maps";
export const APP_DESCRIPTION = "Melhorando a comunicação entre cidadãos e a prefeitura.";
export const STATUS_INFO: Record<UrbanIssue['status'], { label: string; className: string }> = {
  pending: { label: 'Pendente', className: 'bg-amber-100 text-amber-700' },
  in_progress: { label: 'Em Progresso', className: 'bg-blue-100 text-blue-700' },
  solved: { label: 'Resolvido', className: 'bg-green-100 text-green-700' },
};