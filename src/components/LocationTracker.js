import React, { useEffect, useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const LocationTracker = () => {
    const [currentLocation, setCurrentLocation] = useState({
        latitude: null,
        longitude: null,
        accuracy: null,
        timestamp: null,
    });
    const [statusMessage, setStatusMessage] = useState("");
    const API_KEY = "AIzaSyBA9bzem6pdx8Ke_ubaEnp9WTu42SJCfhw"; // Replace with your Google API Key

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
                latitude: parseFloat(data.latitude),
                longitude: parseFloat(data.longitude),
                accuracy: data.accuracy,
                timestamp: data.timestamp,
            });
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
            <div style={styles.mapContainer}>
                {currentLocation.latitude && currentLocation.longitude ? (
                    <LoadScript googleMapsApiKey={API_KEY}>
                        <GoogleMap
                            mapContainerStyle={styles.map}
                            center={{
                                lat: currentLocation.latitude,
                                lng: currentLocation.longitude,
                            }}
                            zoom={15}
                        >
                            <Marker
                                position={{
                                    lat: currentLocation.latitude,
                                    lng: currentLocation.longitude,
                                }}
                            />
                        </GoogleMap>
                    </LoadScript>
                ) : (
                    <p>Waiting for location data...</p>
                )}
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
    mapContainer: {
        marginTop: "20px",
        width: "100%",
        height: "400px",
    },
    map: {
        width: "100%",
        height: "400px",
    },
};

export default LocationTracker;
