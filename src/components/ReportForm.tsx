/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';

import { ISSUE_TYPES } from '../constants';
import { IssueType } from '../types';
import { MapPin, Camera, AlertCircle } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface ReportFormProps {
  onSubmit: (data: any) => void;
  initialLocation?: { lat: number, lng: number };
}

export function ReportForm({ onSubmit, initialLocation }: ReportFormProps) {
  const [type, setType] = useState<IssueType>('pothole');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Max dimension 800px (good for records, keeps file size low)
          const MAX_DIM = 800;
          if (width > height) {
            if (width > MAX_DIM) {
              height *= MAX_DIM / width;
              width = MAX_DIM;
            }
          } else {
            if (height > MAX_DIM) {
              width *= MAX_DIM / height;
              height = MAX_DIM;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Use lower quality to stay under 1MB limit
          const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
          setImagePreview(dataUrl);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (initialLocation) {
      // Mock reverse geocoding for now
      setAddress(`Lat: ${initialLocation.lat.toFixed(4)}, Lng: ${initialLocation.lng.toFixed(4)}`);
    }
  }, [initialLocation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const reportData: any = {
      type,
      title,
      description,
      location: initialLocation || { lat: -23.5505, lng: -46.6333 },
    };

    if (address) reportData.address = address;
    if (imagePreview) reportData.imageUrl = imagePreview;

    onSubmit(reportData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-700">Tipo de Problema</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {ISSUE_TYPES.map((it) => (
            <button
              key={it.type}
              type="button"
              onClick={() => setType(it.type)}
              className={cn(
                "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all gap-2",
                type === it.type 
                  ? "bg-slate-900 border-slate-900 text-white shadow-md" 
                  : "bg-white border-slate-100 text-slate-600 hover:border-slate-200"
              )}
            >
              <it.icon size={20} />
              <span className="text-[10px] font-semibold uppercase tracking-wider">{it.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1.5">Título do Relato</label>
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Buraco Grade na Rua X"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-slate-900 transition-all"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1.5">Localização / Endereço</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Endereço aproximado"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-slate-900 transition-all"
            />
          </div>
          {initialLocation && (
            <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
              <AlertCircle size={10} />
              Coordenadas capturadas via mapa
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1.5">Descrição detalhada</label>
          <textarea 
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva o problema para ajudar os órgãos responsáveis..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-slate-900 transition-all resize-none"
            required
          />
        </div>
      </div>

      <div>
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleImageChange}
        />
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-slate-500 gap-2 hover:bg-slate-100 transition-colors cursor-pointer overflow-hidden min-h-[120px]"
        >
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
          ) : (
            <>
              <Camera size={24} />
              <span className="text-sm">Adicionar Foto (Opcional)</span>
            </>
          )}
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all active:scale-[0.98]"
      >
        Publicar Relato
      </button>
    </form>
  );
}
