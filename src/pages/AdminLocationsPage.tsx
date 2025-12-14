import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { MapPin, Plus, Navigation, Edit2, Trash2 } from 'lucide-react';
import { GET_OFFICE_LOCATIONS, CREATE_OFFICE_LOCATION, UPDATE_OFFICE_LOCATION, DELETE_OFFICE_LOCATION } from '../graphql/operations';

export default function AdminLocationsPage() {
  const { data: locationData, refetch } = useQuery<any>(GET_OFFICE_LOCATIONS);
  const [createLocation] = useMutation(CREATE_OFFICE_LOCATION);
  const [updateLocation] = useMutation(UPDATE_OFFICE_LOCATION);
  const [deleteLocation] = useMutation(DELETE_OFFICE_LOCATION);

  const locations = locationData?.officeLocations || [];

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    coordinates: '', // Single field: "lat, lng"
    radius: '100',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse coordinates
    const coords = formData.coordinates.split(',').map(s => s.trim());
    if (coords.length !== 2) {
      alert('Please enter coordinates in format: latitude, longitude');
      return;
    }

    const latitude = parseFloat(coords[0]);
    const longitude = parseFloat(coords[1]);

    if (isNaN(latitude) || isNaN(longitude)) {
      alert('Invalid coordinates. Please enter valid numbers.');
      return;
    }

    try {
      await createLocation({
        variables: {
          name: formData.name,
          latitude,
          longitude,
          radius: parseFloat(formData.radius),
        }
      });
      setFormData({ name: '', coordinates: '', radius: '100' });
      setIsAdding(false);
      alert('Office location added successfully!');
      refetch();
    } catch (err) {
      console.error(err);
      alert('Failed to add location');
    }
  };

  const handleEdit = (location: any) => {
    setEditingId(location.id);
    setFormData({
      name: location.name,
      coordinates: `${location.latitude}, ${location.longitude}`,
      radius: location.radius.toString(),
    });
    setIsAdding(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    // Parse coordinates
    const coords = formData.coordinates.split(',').map(s => s.trim());
    if (coords.length !== 2) {
      alert('Please enter coordinates in format: latitude, longitude');
      return;
    }

    const latitude = parseFloat(coords[0]);
    const longitude = parseFloat(coords[1]);

    if (isNaN(latitude) || isNaN(longitude)) {
      alert('Invalid coordinates. Please enter valid numbers.');
      return;
    }

    try {
      await updateLocation({
        variables: {
          id: editingId,
          name: formData.name,
          latitude,
          longitude,
          radius: parseFloat(formData.radius),
        }
      });
      setFormData({ name: '', coordinates: '', radius: '100' });
      setEditingId(null);
      alert('Office location updated successfully!');
      refetch();
    } catch (err) {
      console.error(err);
      alert('Failed to update location');
    }
  };

  const handleDelete = async (locationId: string, name: string) => {
    if (!confirm(`Delete office location "${name}"?`)) return;
    try {
      await deleteLocation({ variables: { id: locationId } });
      alert('Location deleted');
      refetch();
    } catch (err) {
      console.error(err);
      alert('Failed to delete');
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude.toFixed(6);
          const lng = position.coords.longitude.toFixed(6);
          setFormData({
            ...formData,
            coordinates: `${lat}, ${lng}`,
          });
        },
        (error) => {
          alert('Unable to get location: ' + error.message);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <MapPin className="w-6 h-6 text-blue-600" />
                Office Locations
              </h1>
              <p className="text-gray-500 mt-1">Manage geofencing for attendance check-ins</p>
            </div>
            <button
              onClick={() => {
                 setIsAdding(!isAdding);
                 setEditingId(null);
                 setFormData({ name: '', coordinates: '', radius: '100' });
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Location
            </button>
          </div>
        </div>

        {/* Add/Edit Location Form */}
        {(isAdding || editingId) && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">
              {editingId ? 'Edit Office Location' : 'Add New Office Location'}
            </h2>
            <form onSubmit={editingId ? handleUpdate : handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Office Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g., Main Office, Branch A"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coordinates (Latitude, Longitude)
                </label>
                <input
                  type="text"
                  value={formData.coordinates}
                  onChange={(e) => setFormData({ ...formData, coordinates: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                  placeholder="-1.2289917977636888, 116.8822932730151"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter coordinates separated by comma (copy from Google Maps)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Radius (meters)</label>
                <input
                  type="number"
                  value={formData.radius}
                  onChange={(e) => setFormData({ ...formData, radius: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="100"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Employees must be within this radius to check in</p>
              </div>

              <button
                type="button"
                onClick={getCurrentLocation}
                className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                Use My Current Location
              </button>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors"
                >
                  {editingId ? 'Update Location' : 'Add Location'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setEditingId(null);
                    setFormData({ name: '', coordinates: '', radius: '100' });
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-bold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Locations List */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">Active Locations</h2>
          
          {!locations || locations.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No office locations yet</p>
              <p className="text-sm text-gray-400 mt-1">Add your first location to enable geofencing</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {locations.map((location: any) => (
                <div key={location.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{location.name}</h3>
                        <p className="text-sm text-gray-500">{location.radius}m radius</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(location)}
                        className="text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(location.id, location.name)}
                        className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Latitude:</span>
                      <span className="font-mono font-medium">{location.latitude.toFixed(6)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Longitude:</span>
                      <span className="font-mono font-medium">{location.longitude.toFixed(6)}</span>
                    </div>
                  </div>

                  <a
                    href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 block text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View on Google Maps →
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
