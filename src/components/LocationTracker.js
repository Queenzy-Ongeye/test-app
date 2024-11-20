import React, { useEffect, useState, useMemo } from "react";
import { GoogleMap, Marker, Polyline, useJsApiLoader } from "@react-google-maps/api";

const LocationTracker = () => {
    const [currentLocation, setCurrentLocation] = useState({
        latitude: null,
        longitude: null,
        accuracy: null,
        timestamp: null,
    });
    const [journey, setJourney] = useState([]); // Journey points
    const [statusMessage, setStatusMessage] = useState("");

    const API_KEY = "AIzaSyBA9bzem6pdx8Ke_ubaEnp9WTu42SJCfhw"; // Replace with your API key

    const { isLoaded } = useJsApiLoader(
        useMemo(() => ({
            googleMapsApiKey: API_KEY,
            libraries: ["maps"],
            language: "en",
            region: "US",
        }), [API_KEY])
    );

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

    const registerLocationCallback = (bridge) => {
        bridge.registerHandler("locationCallBack", (data, responseCallback) => {
            const newPoint = {
                lat: data.latitude,
                lng: data.longitude,
            };
            setCurrentLocation({
                latitude: data.latitude,
                longitude: data.longitude,
                accuracy: data.accuracy,
                timestamp: data.timestamp,
            });
            setJourney((prev) => [...prev, newPoint]); // Append to journey
            responseCallback("Location received successfully");
        });
    };

    const startLocationListener = () => {
        if (window.WebViewJavascriptBridge) {
            window.WebViewJavascriptBridge.callHandler("startLocationListener", "", (responseData) => {
                setStatusMessage("Location listener started successfully!");
            });
        } else {
            setStatusMessage("WebViewJavascriptBridge is not initialized.");
        }
    };

    const stopLocationListener = () => {
        if (window.WebViewJavascriptBridge) {
            window.WebViewJavascriptBridge.callHandler("stopLocationListener", "", (responseData) => {
                setStatusMessage("Location listener stopped.");
            });
        } else {
            setStatusMessage("WebViewJavascriptBridge is not initialized.");
        }
    };

    const getLastLocation = () => {
        if (window.WebViewJavascriptBridge) {
            window.WebViewJavascriptBridge.callHandler("getLastLocation", "", (responseData) => {
                try {
                    const locations = JSON.parse(responseData); // Parse JSON response
                    const formattedJourney = locations.map((loc) => ({
                        lat: loc.latitude,
                        lng: loc.longitude,
                    }));
                    setJourney(formattedJourney); // Update journey state
                    setStatusMessage("Journey retrieved successfully!");
                } catch (error) {
                    setStatusMessage("Error parsing journey data.");
                    console.error("Error parsing response data:", error);
                }
            });
        } else {
            setStatusMessage("WebViewJavascriptBridge is not initialized.");
        }
    };

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
                    Get Last Journey
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
                        lat: currentLocation.latitude || 37.7749,
                        lng: currentLocation.longitude || -122.4194,
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
                    {journey.length > 1 && (
                        <Polyline
                            path={journey}
                            options={{
                                strokeColor: "#FF0000",
                                strokeOpacity: 0.8,
                                strokeWeight: 2,
                            }}
                        />
                    )}
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
