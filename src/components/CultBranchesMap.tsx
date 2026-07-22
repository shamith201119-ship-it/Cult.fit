import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Branch {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  phone: string;
  timing: string;
}

const CULT_BRANCHES: Branch[] = [
  {
    id: 'hsr',
    name: 'Cult HSR Layout',
    lat: 12.9116,
    lng: 77.6388,
    address: 'Sector 6, HSR Layout, Bengaluru, Karnataka 560102',
    phone: '+91 80 4718 2000',
    timing: '06:00 AM - 10:00 PM'
  },
  {
    id: 'koramangala',
    name: 'Cult Koramangala Prime',
    lat: 12.9345,
    lng: 77.6258,
    address: '80 Feet Rd, Koramangala 4th Block, Bengaluru, Karnataka 560034',
    phone: '+91 80 4718 2000',
    timing: '05:30 AM - 10:30 PM'
  },
  {
    id: 'indiranagar',
    name: 'Cult Indiranagar Signature',
    lat: 12.9719,
    lng: 77.6412,
    address: '100 Feet Rd, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560038',
    phone: '+91 80 4718 2000',
    timing: '06:00 AM - 10:00 PM'
  },
  {
    id: 'jayanagar',
    name: 'Cult Jayanagar',
    lat: 12.9288,
    lng: 77.5834,
    address: '9th Block, Jayanagar, Bengaluru, Karnataka 560069',
    phone: '+91 80 4718 2000',
    timing: '05:30 AM - 10:00 PM'
  }
];

export default function CultBranchesMap() {
  const [selectedBranch, setSelectedBranch] = useState<Branch>(CULT_BRANCHES[0]);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  const handleSelectBranch = (branch: Branch) => {
    setSelectedBranch(branch);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([branch.lat, branch.lng], 14, {
        animate: true,
        duration: 0.8
      });
    }
  };

  // Initialize map once
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [CULT_BRANCHES[0].lat, CULT_BRANCHES[0].lng],
      zoom: 13,
      zoomControl: false,
      attributionControl: false
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    }).addTo(map);

    // Add zoom control to bottom right instead
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers and center when selectedBranch changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Render markers with current state
    CULT_BRANCHES.forEach((b) => {
      const isSelected = b.id === selectedBranch.id;
      const markerIcon = L.divIcon({
        html: `
          <div class="relative flex items-center justify-center">
            ${
              isSelected
                ? '<span class="absolute inline-flex h-8 w-8 rounded-full bg-orange-500/20 animate-ping"></span>'
                : ''
            }
            <div class="relative rounded-full h-4 w-4 ${
              isSelected ? 'bg-orange-500 border-2 border-white' : 'bg-zinc-950 border-2 border-white'
            } flex items-center justify-center shadow-lg transition-transform duration-300 ${
              isSelected ? 'scale-125' : 'hover:scale-110'
            }">
              <div class="h-1 w-1 rounded-full bg-white"></div>
            </div>
          </div>
        `,
        className: 'custom-leaflet-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([b.lat, b.lng], { icon: markerIcon })
        .addTo(map)
        .on('click', () => {
          handleSelectBranch(b);
        });

      markersRef.current.push(marker);
    });
  }, [selectedBranch]);

  return (
    <div className="w-full max-w-4xl bg-white border border-zinc-200/80 p-4 md:p-6 text-left flex flex-col md:flex-row gap-6">
      {/* Branches List */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[9px] tracking-[0.3em] font-mono text-orange-500 uppercase block mb-2">
            ACTIVE SANCTUARIES
          </span>
          <h3 className="text-xl font-black text-zinc-950 uppercase tracking-tight mb-4">
            FIND YOUR BRANCH
          </h3>

          <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-3 md:pb-0 scrollbar-none snap-x mb-4 md:mb-6">
            {CULT_BRANCHES.map((b) => (
              <button
                key={b.id}
                onClick={() => handleSelectBranch(b)}
                className={`flex-none w-[220px] md:w-full text-left p-3 transition-all duration-300 border font-sans cursor-pointer flex flex-col snap-start ${
                  selectedBranch.id === b.id
                    ? 'border-orange-500 bg-orange-500/5'
                    : 'border-zinc-200 hover:border-zinc-400 bg-white'
                }`}
              >
                <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider truncate block w-full">
                  {b.name}
                </span>
                <span className="text-[10px] text-zinc-500 mt-1 line-clamp-1 block w-full">
                  {b.address}
                </span>
              </button>
            ))}
          </div>
        </div>

        {selectedBranch && (
          <div className="border-t border-zinc-100 pt-4 font-mono text-[10px] text-zinc-500 space-y-1 mb-4 md:mb-0">
            <p>
              <span className="text-zinc-950 font-bold">TIMINGS:</span>{' '}
              {selectedBranch.timing}
            </p>
            <p>
              <span className="text-zinc-950 font-bold">PHONE:</span>{' '}
              {selectedBranch.phone}
            </p>
          </div>
        )}
      </div>

      {/* Leaflet Map Div Container */}
      <div className="w-full md:w-[480px] h-[200px] md:h-[360px] bg-zinc-100 border border-zinc-200 relative overflow-hidden z-10">
        <div ref={mapRef} className="w-full h-full" />
      </div>
    </div>
  );
}
