import { useEffect, useRef } from "react";
import L from "leaflet";

// Leaflet default marker icons styling fix for bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function LocationPicker({ value, onChange }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerInstanceRef = useRef(null);

  const initialLat = value?.lat || 9.9312;
  const initialLng = value?.lng || 76.2673;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Map
    const map = L.map(mapContainerRef.current).setView([initialLat, initialLng], 13);
    mapInstanceRef.current = map;

    // Add OSM Tile Layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    // Add draggable Marker with custom orange SVG icon
    const orangeIcon = L.divIcon({
      html: `
        <svg viewBox="0 0 24 24" width="36" height="36" style="filter: drop-shadow(0px 3px 4px rgba(0,0,0,0.5));">
          <path fill="#FF6B00" stroke="#FFFFFF" stroke-width="1.5" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
          <circle cx="12" cy="9" r="3" fill="#FFFFFF"/>
        </svg>
      `,
      className: "custom-marker-orange",
      iconSize: [36, 36],
      iconAnchor: [18, 33],
      popupAnchor: [0, -32],
    });

    const marker = L.marker([initialLat, initialLng], { draggable: true, icon: orangeIcon }).addTo(map);
    markerInstanceRef.current = marker;

    // Handle marker dragend
    marker.on("dragend", () => {
      const position = marker.getLatLng();
      onChange({
        lat: Number(position.lat.toFixed(5)),
        lng: Number(position.lng.toFixed(5)),
      });
    });

    // Handle map click
    map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      onChange({
        lat: Number(lat.toFixed(5)),
        lng: Number(lng.toFixed(5)),
      });
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map marker if value changes from outside
  useEffect(() => {
    if (mapInstanceRef.current && markerInstanceRef.current && value?.lat && value?.lng) {
      const currentPos = markerInstanceRef.current.getLatLng();
      if (Math.abs(currentPos.lat - value.lat) > 0.0001 || Math.abs(currentPos.lng - value.lng) > 0.0001) {
        markerInstanceRef.current.setLatLng([value.lat, value.lng]);
        mapInstanceRef.current.panTo([value.lat, value.lng]);
      }
    }
  }, [value]);

  return (
    <div className="space-y-2">
      <div ref={mapContainerRef} className="w-full h-64 rounded-xl border border-white/20 overflow-hidden relative z-10 shadow-inner bg-black/25" />
      <div className="flex justify-between items-center text-xs text-gray-400 px-1">
        <span>Drag the pin or click on the map</span>
        {value?.lat && value?.lng && (
          <span className="font-mono bg-white/5 px-2 py-0.5 rounded border border-white/10 text-white/70">
            {value.lat.toFixed(4)}, {value.lng.toFixed(4)}
          </span>
        )}
      </div>
    </div>
  );
}
