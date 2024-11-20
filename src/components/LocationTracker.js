import React, { useEffect, useState } from 'react';

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
    const API_KEY = "AIzaSyBA9bzem6pdx8Ke_ubaEnp9WTu42SJCfhw"; // Replace with your Google Maps API key"; // Replace with your Google API Key
    const TARGET_LOCATION = { latitude: 37.7749, longitude: -122.4194 }; // Example: San Francisco, CA

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
            console.info("Received Location Data:", data);
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

    // Start the location listener
    const startLocationListener = () => {
        if (window.WebViewJavascriptBridge) {
            window.WebViewJavascriptBridge.callHandler(
                "startLocationListener",
                "",
                (responseData) => {
                    console.info("Location Listener Started:", responseData);
                    setStatusMessage("Location listener started successfully!");
                }
            );
        } else {
            setStatusMessage("WebViewJavascriptBridge not initialized.");
        }
    };

    // Stop the location listener
    const stopLocationListener = () => {
        if (window.WebViewJavascriptBridge) {
            window.WebViewJavascriptBridge.callHandler(
                "stopLocationListener",
                "",
                (responseData) => {
                    console.info("Location Listener Stopped:", responseData);
                    setStatusMessage("Location listener stopped.");
                }
            );
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
            console.info("Snapped Location Data:", data);
            setSnappedLocation(data.snappedPoints ? data.snappedPoints[0].location : {});
        } catch (error) {
            console.error("Error fetching snapped location:", error);
        }
    };

    // Fetch distance and duration using Google Distance Matrix API
    const fetchDistanceMatrix = async (latitude, longitude) => {
        try {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${latitude},${longitude}&destinations=${TARGET_LOCATION.latitude},${TARGET_LOCATION.longitude}&key=${API_KEY}`
            );
            const data = await response.json();
            console.info("Distance Matrix Data:", data);
            setDistanceMatrix(data.rows[0].elements[0]);
        } catch (error) {
            console.error("Error fetching distance matrix:", error);
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
            </div>
            {statusMessage && <p style={styles.status}>{statusMessage}</p>}
            <div style={styles.locationInfo}>
                <h3>Current Location:</h3>
                <p><strong>Latitude:</strong> {currentLocation.latitude || "Not available"}</p>
                <p><strong>Longitude:</strong> {currentLocation.longitude || "Not available"}</p>
                <p><strong>Accuracy:</strong> {currentLocation.accuracy || "Not available"} meters</p>
                <p><strong>Timestamp:</strong> {currentLocation.timestamp || "Not available"}</p>
            </div>
            <div style={styles.locationInfo}>
                <h3>Snapped Location:</h3>
                <p><strong>Latitude:</strong> {snappedLocation.latitude || "Not available"}</p>
                <p><strong>Longitude:</strong> {snappedLocation.longitude || "Not available"}</p>
            </div>
            <div style={styles.locationInfo}>
                <h3>Distance Matrix:</h3>
                <p><strong>Distance:</strong> {distanceMatrix.distance?.text || "Not available"}</p>
                <p><strong>Duration:</strong> {distanceMatrix.duration?.text || "Not available"}</p>
            </div>
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
};

export default LocationTracker;
