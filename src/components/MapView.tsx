/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { useRef, useState, useEffect } from 'react';
import { auth, loginWithGoogle, getLoginErrorMessage } from '../lib/firebase';
// Removed duplicate import
import { X } from 'lucide-react';
import { UrbanIssue } from '../types';
import { ISSUE_TYPES } from '../constants';
import L from 'leaflet';

// Fix for default marker icons
// @ts-ignore
import icon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

function MapEvents({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      const target = e.originalEvent?.target as HTMLElement | null;
      // ignora cliques vindos do balão (Confirmar/Cancelar) ou de marcadores
      if (target?.closest('.leaflet-popup, .leaflet-marker-icon')) return;
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function MapView({ issues, onSelectIssue, onMapClick }: { 
  issues: UrbanIssue[], 
  onSelectIssue?: (issue: UrbanIssue) => void,
  onMapClick?: (lat: number, lng: number) => void
}) {
  const [center] = useState<[number, number]>([-23.5505, -46.6333]); // Default to São Paulo
  const [tempMarker, setTempMarker] = useState<{ lat: number; lng: number } | null>(null);
  const markerRef = useRef<L.Marker>(null);
  const [showHint, setShowHint] = useState(true);
  const ignoreMapClickUntil = useRef(0);

    // Abre o balão automaticamente quando o marcador temporário aparece
  useEffect(() => {
    if (!tempMarker) return;
    const timer = setTimeout(() => {
      markerRef.current?.openPopup();
    }, 50);
    return () => clearTimeout(timer);
  }, [tempMarker]);

  // Hide hint when marker is active
  useEffect(() => {
    if (tempMarker) setShowHint(false);
  }, [tempMarker]);

    // Map click creates/updates temporary marker
  const handleMapClick = (lat: number, lng: number) => {
    if (Date.now() < ignoreMapClickUntil.current) return;
    setTempMarker({ lat, lng });
  };

  // Confirmar: só faz login se ainda não houver usuário logado
  const handleConfirm = async () => {
    if (!tempMarker) return;
    ignoreMapClickUntil.current = Date.now() + 400;
    try {
      if (!auth.currentUser) {
        await loginWithGoogle();
      }
        } catch (err) {
      const msg = getLoginErrorMessage(err);
      if (msg) alert(msg);
      return; // mantém o marcador
    }
    onMapClick?.(tempMarker.lat, tempMarker.lng);
    setTempMarker(null);
  };

  const handleCancel = () => {
    ignoreMapClickUntil.current = Date.now() + 400;
    setTempMarker(null);
  };

  return (
    <div className="w-full h-full relative">
      <MapContainer 
        center={center} 
        zoom={13} 
        scrollWheelZoom={true} 
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEvents onMapClick={handleMapClick} />
        
        {tempMarker && (
          <Marker
            position={[tempMarker.lat, tempMarker.lng]}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target as L.Marker;
                const { lat, lng } = marker.getLatLng();
                setTempMarker({ lat, lng });
              },
            }}
            ref={(el) => {
              if (el) {
                markerRef.current = el;
                // Open popup automatically when marker is added or updated
                el.openPopup();
              } else {
                markerRef.current = null;
              }
            }}
          >
            <Popup closeButton={false} autoClose={false} closeOnEscapeKey={false} className="!pointer-events-auto">
              <div className="flex flex-col gap-2">
                <button
                  className="bg-blue-600 text-white py-1 px-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                  onClick={handleConfirm}
                >
                  Confirmar
                </button>
                <button
                  className="bg-gray-300 text-gray-800 py-1 px-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                  onClick={handleCancel}
                >
                  Cancelar
                </button>
              </div>
            </Popup>
          </Marker>
        )}
        {issues.map(issue => {
          const config = ISSUE_TYPES.find(t => t.type === issue.type);
          
          // Create custom icon based on type color
          const customIcon = L.divIcon({
            html: `<div style="background-color: ${config?.color || '#3b82f6'}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; items-center; justify-center; color: white;"></div>`,
            className: 'custom-leaflet-icon',
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          return (
            <Marker 
              key={issue.id} 
              position={[issue.location.lat, issue.location.lng]}
              icon={customIcon}
              eventHandlers={{
                click: () => onSelectIssue?.(issue),
              }}
            >
              <Popup>
                <div className="p-1 max-w-[200px]">
                  {issue.imageUrl && (
                    <img src={issue.imageUrl} alt={issue.title} className="w-full h-24 object-cover rounded mb-2" />
                  )}
                  <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-1 mb-1">{issue.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-2">{issue.description}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
