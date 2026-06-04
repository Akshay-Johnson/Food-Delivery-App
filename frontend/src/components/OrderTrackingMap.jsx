import { useEffect, useRef } from "react";
import L from "leaflet";

// Leaflet default icons fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function OrderTrackingMap({
  restaurantLoc,
  customerLoc,
  agentLoc,
  restaurantName = "Restaurant",
  customerName = "Delivery Address",
  agentName = "Delivery Agent",
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({
    restaurant: null,
    customer: null,
    agent: null,
  });

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // 1. Initialize Leaflet map
    const defaultCenter = [
      restaurantLoc?.lat || 9.9312,
      restaurantLoc?.lng || 76.2673,
    ];
    const map = L.map(mapContainerRef.current).setView(defaultCenter, 13);
    mapInstanceRef.current = map;

    // 2. Tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    const bounds = [];

    // Custom SVG icons
    const restIcon = L.divIcon({
      html: `
        <svg viewBox="0 0 24 24" width="36" height="36" style="filter: drop-shadow(0px 3px 4px rgba(0,0,0,0.5));">
          <path fill="#EF4444" stroke="#FFFFFF" stroke-width="1.5" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
          <circle cx="12" cy="9" r="3" fill="#FFFFFF"/>
        </svg>
      `,
      className: "custom-marker-rest",
      iconSize: [36, 36],
      iconAnchor: [18, 33],
      popupAnchor: [0, -32],
    });

    const custIcon = L.divIcon({
      html: `
        <svg viewBox="0 0 24 24" width="36" height="36" style="filter: drop-shadow(0px 3px 4px rgba(0,0,0,0.5));">
          <path fill="#10B981" stroke="#FFFFFF" stroke-width="1.5" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
          <circle cx="12" cy="9" r="3" fill="#FFFFFF"/>
        </svg>
      `,
      className: "custom-marker-cust",
      iconSize: [36, 36],
      iconAnchor: [18, 33],
      popupAnchor: [0, -32],
    });

    const agentIcon = L.divIcon({
      html: `
        <svg viewBox="0 0 24 24" width="36" height="36" style="filter: drop-shadow(0px 3px 4px rgba(0,0,0,0.5));">
          <path fill="#8B5CF6" stroke="#FFFFFF" stroke-width="1.5" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
          <circle cx="12" cy="9" r="3" fill="#FFFFFF"/>
        </svg>
      `,
      className: "custom-marker-agent",
      iconSize: [36, 36],
      iconAnchor: [18, 33],
      popupAnchor: [0, -32],
    });

    // 3. Add Restaurant Marker
    if (restaurantLoc?.lat && restaurantLoc?.lng) {
      markersRef.current.restaurant = L.marker([restaurantLoc.lat, restaurantLoc.lng], { icon: restIcon })
        .addTo(map)
        .bindPopup(`<b>${restaurantName}</b><br/>Shop Location`)
        .openPopup();
      bounds.push([restaurantLoc.lat, restaurantLoc.lng]);
    }

    // 4. Add Customer Marker
    if (customerLoc?.lat && customerLoc?.lng) {
      markersRef.current.customer = L.marker([customerLoc.lat, customerLoc.lng], { icon: custIcon })
        .addTo(map)
        .bindPopup(`<b>${customerName}</b><br/>Delivery Location`);
      bounds.push([customerLoc.lat, customerLoc.lng]);
    }

    // 5. Add Agent Marker
    if (agentLoc?.lat && agentLoc?.lng) {
      markersRef.current.agent = L.marker([agentLoc.lat, agentLoc.lng], { icon: agentIcon })
        .addTo(map)
        .bindPopup(`<b>${agentName}</b><br/>Agent Position`);
      bounds.push([agentLoc.lat, agentLoc.lng]);
    }

    // 6. Fit map view to bounds
    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [restaurantLoc, customerLoc]);

  // Update Agent Position Live
  useEffect(() => {
    if (mapInstanceRef.current && agentLoc?.lat && agentLoc?.lng) {
      const map = mapInstanceRef.current;
      
      if (markersRef.current.agent) {
        // Move existing marker
        markersRef.current.agent.setLatLng([agentLoc.lat, agentLoc.lng]);
      } else {
        // Create agent icon dynamically if it didn't exist initially
        const agentIcon = L.divIcon({
          html: `
            <svg viewBox="0 0 24 24" width="36" height="36" style="filter: drop-shadow(0px 3px 4px rgba(0,0,0,0.5));">
              <path fill="#8B5CF6" stroke="#FFFFFF" stroke-width="1.5" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              <circle cx="12" cy="9" r="3" fill="#FFFFFF"/>
            </svg>
          `,
          className: "custom-marker-agent",
          iconSize: [36, 36],
          iconAnchor: [18, 33],
          popupAnchor: [0, -32],
        });
        
        markersRef.current.agent = L.marker([agentLoc.lat, agentLoc.lng], { icon: agentIcon })
          .addTo(map)
          .bindPopup(`<b>${agentName}</b><br/>Agent Position`);
      }

      // Readjust map bounds with agent position
      const bounds = [];
      if (restaurantLoc?.lat && restaurantLoc?.lng) bounds.push([restaurantLoc.lat, restaurantLoc.lng]);
      if (customerLoc?.lat && customerLoc?.lng) bounds.push([customerLoc.lat, customerLoc.lng]);
      bounds.push([agentLoc.lat, agentLoc.lng]);
      
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [agentLoc]);

  return (
    <div ref={mapContainerRef} className="w-full h-80 rounded-xl border border-white/20 overflow-hidden relative z-10 shadow-lg bg-black/20" />
  );
}
