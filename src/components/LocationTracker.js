import React, { useEffect, useState, useMemo } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const LocationTracker = () => {
    const [currentLocation, setCurrentLocation] = useState({
        latitude: null,
        longitude: null,
        accuracy: null,
        timestamp: null,
    });
    const [statusMessage, setStatusMessage] = useState("");
    const [snappedLocation, setSnappedLocation] = useState({});
    const [distanceMatrix, setDistanceMatrix] = useState({});
    const [targetLocation, setTargetLocation] = useState({
        latitude: 37.7749, // default to San Francisco
        longitude: -122.4194,
    });

    const API_KEY = "AIzaSyBA9bzem6pdx8Ke_ubaEnp9WTu42SJCfhw"; // Replace with your actual API key

    // Memoize the Google Maps API loader to prevent it from being called multiple times
    const { isLoaded } = useJsApiLoader(
        useMemo(() => ({
            googleMapsApiKey: API_KEY,
            libraries: ["maps"],
            language: "en",
            region: "US",
        }), [API_KEY]) // Ensure it only re-runs when API_KEY changes
    );

    // Initialize WebViewJavascriptBridge
    const connectWebViewJavascriptBridge = (callback) => {
        if (window.WebViewJavascriptBridge) {
            callback(window.WebViewJavascriptBridge);
        } else {
            document.addEventListener(
                "WebViewJavascriptBridgeReady",
                () => callback(window.WebViewJavascriptBridge),
                false
            );
        }
    };

    // Register handlers for receiving location updates
    const registerLocationCallback = (bridge) => {
        bridge.registerHandler("locationCallBack", (data, responseCallback) => {
            setCurrentLocation({
                latitude: data.latitude,
                longitude: data.longitude,
                accuracy: data.accuracy,
                timestamp: data.timestamp,
            });
            fetchSnappedLocation(data.latitude, data.longitude);
            fetchDistanceMatrix(data.latitude, data.longitude);
            responseCallback("Location received successfully");
        });
    };

    // Start and stop location listeners
    const startLocationListener = () => {
        if (window.WebViewJavascriptBridge) {
            window.WebViewJavascriptBridge.callHandler("startLocationListener", "", (responseData) => {
                setStatusMessage("Location listener started successfully!");
            });
        } else {
            setStatusMessage("WebViewJavascriptBridge not initialized.");
        }
    };

    const stopLocationListener = () => {
        if (window.WebViewJavascriptBridge) {
            window.WebViewJavascriptBridge.callHandler("stopLocationListener", "", (responseData) => {
                setStatusMessage("Location listener stopped.");
            });
        } else {
            setStatusMessage("WebViewJavascriptBridge not initialized.");
        }
    };

    // Fetch snapped location using Google Roads API
    const fetchSnappedLocation = async (latitude, longitude) => {
        try {
            const response = await fetch(
                `https://roads.googleapis.com/v1/snapToRoads?path=${latitude},${longitude}&interpolate=true&key=${API_KEY}`
            );
            const data = await response.json();
            setSnappedLocation(data.snappedPoints ? data.snappedPoints[0].location : {});
        } catch (error) {
            console.error("Error fetching snapped location:", error);
        }
    };

    // Fetch distance and duration using Google Distance Matrix API
    const fetchDistanceMatrix = async (latitude, longitude) => {
        try {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${latitude},${longitude}&destinations=${targetLocation.latitude},${targetLocation.longitude}&key=${API_KEY}`
            );
            const data = await response.json();
            setDistanceMatrix(data.rows[0].elements[0]);
        } catch (error) {
            console.error("Error fetching distance matrix:", error);
        }
    };

    // Get last known location using the Geolocation API (for browsers that support it)
    const getLastLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude, accuracy } = position.coords;
                    setCurrentLocation({
                        latitude,
                        longitude,
                        accuracy,
                        timestamp: position.timestamp,
                    });
                    setStatusMessage("Last known location fetched successfully!");
                    fetchSnappedLocation(latitude, longitude);
                    fetchDistanceMatrix(latitude, longitude);
                },
                (error) => {
                    setStatusMessage(`Error fetching last location: ${error.message}`);
                },
                { enableHighAccuracy: true }
            );
        } else {
            setStatusMessage("Geolocation is not supported by this browser.");
        }
    };

    // Initialize bridge and register callback on component mount
    useEffect(() => {
        connectWebViewJavascriptBridge((bridge) => {
            registerLocationCallback(bridge);
        });
    }, []);

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Location Tracker</h1>
            <div style={styles.buttonContainer}>
                <button style={styles.button} onClick={startLocationListener}>
                    Start Location Listener
                </button>
                <button style={styles.button} onClick={stopLocationListener}>
                    Stop Location Listener
                </button>
                <button style={styles.button} onClick={getLastLocation}>
                    Get Last Known Location
                </button>
            </div>
            {statusMessage && <p style={styles.status}>{statusMessage}</p>}
            <div style={styles.locationInfo}>
                <h3>Current Location:</h3>
                <p><strong>Latitude:</strong> {currentLocation.latitude || "Not available"}</p>
                <p><strong>Longitude:</strong> {currentLocation.longitude || "Not available"}</p>
                <p><strong>Accuracy:</strong> {currentLocation.accuracy || "Not available"} meters</p>
                <p><strong>Timestamp:</strong> {currentLocation.timestamp || "Not available"}</p>
            </div>
            {isLoaded && (
                <GoogleMap
                    center={{
                        lat: currentLocation.latitude || targetLocation.latitude,
                        lng: currentLocation.longitude || targetLocation.longitude,
                    }}
                    zoom={12}
                    mapContainerStyle={styles.mapContainer}
                >
                    {currentLocation.latitude && (
                        <Marker
                            position={{
                                lat: currentLocation.latitude,
                                lng: currentLocation.longitude,
                            }}
                            label="You"
                        />
                    )}
                    {snappedLocation.latitude && (
                        <Marker
                            position={{
                                lat: snappedLocation.latitude,
                                lng: snappedLocation.longitude,
                            }}
                            label="Snapped"
                        />
                    )}
                    <Marker
                        position={{
                            lat: targetLocation.latitude,
                            lng: targetLocation.longitude,
                        }}
                        label="Target"
                    />
                </GoogleMap>
            )}
        </div>
    );
};

// Styles
const styles = {
    container: {
        fontFamily: "Arial, sans-serif",
        color: "#333",
        padding: "20px",
        textAlign: "center",
    },
    title: {
        fontSize: "24px",
        marginBottom: "20px",
    },
    buttonContainer: {
        display: "flex",
        justifyContent: "center",
        gap: "10px",
        marginBottom: "20px",
    },
    button: {
        padding: "10px 20px",
        fontSize: "16px",
        backgroundColor: "#4CAF50",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
    },
    status: {
        margin: "10px 0",
        color: "#007BFF",
        fontStyle: "italic",
    },
    locationInfo: {
        marginTop: "20px",
        padding: "10px",
        border: "1px solid #ccc",
        borderRadius: "5px",
        display: "inline-block",
        textAlign: "left",
    },
    mapContainer: {
        height: "400px",
        width: "100%",
        marginTop: "20px",
    },
};

export default LocationTracker;
