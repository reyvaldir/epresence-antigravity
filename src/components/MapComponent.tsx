import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapComponentProps {
  userLocation: { latitude: number; longitude: number } | null;
  officeLocation?: { latitude: number; longitude: number; radius: number };
}

export default function MapComponent({ userLocation, officeLocation }: MapComponentProps) {
  const center = userLocation 
    ? [userLocation.latitude, userLocation.longitude] as [number, number]
    : [-6.2088, 106.8456] as [number, number]; // Default to Jakarta

  return (
    <div className="h-[300px] w-full rounded-lg overflow-hidden shadow-inner border border-gray-200">
      <MapContainer center={center} zoom={15} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {userLocation && (
          <Marker position={[userLocation.latitude, userLocation.longitude]}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        {officeLocation && (
          <>
            <Circle 
              center={[officeLocation.latitude, officeLocation.longitude]}
              radius={officeLocation.radius}
              pathOptions={{ color: 'green', fillColor: 'green', fillOpacity: 0.2 }}
            />
            <Marker position={[officeLocation.latitude, officeLocation.longitude]}>
              <Popup>Office Location</Popup>
            </Marker>
          </>
        )}
      </MapContainer>
    </div>
  );
}
