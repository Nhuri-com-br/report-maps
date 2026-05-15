/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { useState, useEffect } from 'react';
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

function MapEvents({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onMapClick?.(e.latlng.lat, e.latlng.lng);
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
        <MapEvents onMapClick={onMapClick} />
        
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
