import React, { useEffect, useState } from 'react';

const LocationTracker = () => {
    const [currentLocation, setCurrentLocation] = useState({
        latitude: null,
        longitude: null,
        accuracy: null,
        timestamp: null,
    });
    const [statusMessage, setStatusMessage] = useState("");

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
            setCurrentLocation({
                latitude: data.latitude,
                longitude: data.longitude,
                accuracy: data.accuracy,
                timestamp: data.timestamp,
            });
            responseCallback("Location received successfully");
        });
    };

    const startLocationListener = () => {
        if (window.WebViewJavascriptBridge) {
            window.WebViewJavascriptBridge.callHandler(
                "startLocationListener",
                "",
                () => {
                    setStatusMessage("Location listener started successfully!");
                }
            );
        } else {
            setStatusMessage("WebViewJavascriptBridge not initialized.");
        }
    };

    const stopLocationListener = () => {
        if (window.WebViewJavascriptBridge) {
            window.WebViewJavascriptBridge.callHandler(
                "stopLocationListener",
                "",
                () => {
                    setStatusMessage("Location listener stopped.");
                }
            );
        } else {
            setStatusMessage("WebViewJavascriptBridge not initialized.");
        }
    };

    const getLastLocation = () => {
        if (window.WebViewJavascriptBridge) {
            window.WebViewJavascriptBridge.callHandler(
                "getLastLocation",
                "",
                (responseData) => {
                    setCurrentLocation({
                        latitude: responseData.latitude,
                        longitude: responseData.longitude,
                        accuracy: responseData.accuracy,
                        timestamp: responseData.timestamp,
                    });
                    setStatusMessage("Last known location retrieved successfully!");
                }
            );
        } else {
            setStatusMessage("WebViewJavascriptBridge not initialized.");
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
                    Get Last Location
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
        </div>
    );
};

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
