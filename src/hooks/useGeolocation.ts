import { useState, useEffect } from 'react';

interface Location {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: number;
}

interface GeolocationError {
    code: number;
    message: string;
}

export function useGeolocation() {
    const [location, setLocation] = useState<Location | null>(null);
    const [error, setError] = useState<GeolocationError | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!navigator.geolocation) {
            setError({ code: 0, message: 'Geolocation is not supported by your browser' });
            setLoading(false);
            return;
        }

        const successHandler = (position: GeolocationPosition) => {
            setLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                timestamp: position.timestamp,
            });
            setLoading(false);
            setError(null);
        };

        const errorHandler = (err: GeolocationPositionError) => {
            setError({ code: err.code, message: err.message });
            setLoading(false);
        };

        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
        };

        const id = navigator.geolocation.watchPosition(successHandler, errorHandler, options);

        return () => navigator.geolocation.clearWatch(id);
    }, []);

    return { location, error, loading };
}
