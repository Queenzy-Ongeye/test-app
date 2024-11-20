import React, { useState, useEffect, useRef } from "react";

const LocationTracker = () => {
    const mapRef = useRef(null); // Ref for map container
    const [currentLocation, setCurrentLocation] = useState({
        latitude: "Not available",
        longitude: "Not available",
    });
    const [map, setMap] = useState(null);

    const apiKey = "AIzaSyBA9bzem6pdx8Ke_ubaEnp9WTu42SJCfhw"; // Replace with your Google Maps API key

    useEffect(() => {
        // Load the Google Maps script asynchronously
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);

        // Cleanup script on component unmount
        return () => {
            document.body.removeChild(script);
        };
    }, [apiKey]);

    // Initialize the map
    useEffect(() => {
        if (window.google && currentLocation.latitude !== "Not available") {
            const map = new window.google.maps.Map(mapRef.current, {
                center: {
                    lat: parseFloat(currentLocation.latitude),
                    lng: parseFloat(currentLocation.longitude),
                },
                zoom: 15,
            });
            setMap(map);

            // Add a marker for the current location
            new window.google.maps.Marker({
                position: {
                    lat: parseFloat(currentLocation.latitude),
                    lng: parseFloat(currentLocation.longitude),
                },
                map: map,
            });
        }
    }, [currentLocation]);

    const getLastLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCurrentLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                },
                (error) => {
                    console.error("Error fetching location:", error);
                }
            );
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    };

    return (
        <div style={{ textAlign: "center", padding: "20px" }}>
            <h1>Location Tracker</h1>
            <button onClick={getLastLocation} style={{ padding: "10px 20px", marginBottom: "20px" }}>
                Get Last Location
            </button>
            <div>
                <p>Latitude: {currentLocation.latitude}</p>
                <p>Longitude: {currentLocation.longitude}</p>
            </div>
            <div
                ref={mapRef}
                style={{
                    width: "100%",
                    height: "400px",
                    border: "1px solid #ccc",
                    marginTop: "20px",
                }}
            ></div>
        </div>
    );
};

export default LocationTracker;
