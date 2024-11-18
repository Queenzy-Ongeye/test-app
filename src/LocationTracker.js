import React, { useState, useEffect } from "react";

const LocationTracker = () => {
    const [currentLocation, setCurrentLocation] = useState({
        latitude: "Not available",
        longitude: "Not available",
        accuracy: "Not available",
        timestamp: "Not available",
    });
    const [statusMessage, setStatusMessage] = useState("Idle");

    // Initialize WebViewJavascriptBridge for testing in browser
    useEffect(() => {
        if (!window.WebViewJavascriptBridge) {
            console.log("Mocking WebViewJavascriptBridge for browser testing.");
            window.WebViewJavascriptBridge = {
                callHandler: (handlerName, data, callback) => {
                    console.log(`Handler called: ${handlerName}`);
                    if (handlerName === "getLastLocation") {
                        callback({
                            latitude: 37.7749,
                            longitude: -122.4194,
                            accuracy: 5,
                            timestamp: new Date().toISOString(),
                        });
                    } else if (handlerName === "startLocationListener") {
                        console.log("Location listener started.");
                    }
                },
            };
        }
    }, []);

    // Function to start location listener
    const startLocationListener = () => {
        if (window.WebViewJavascriptBridge) {
            console.log("Starting location listener...");
            window.WebViewJavascriptBridge.callHandler(
                "startLocationListener",
                "",
                (responseData) => {
                    console.log("Location listener started:", responseData);
                    setStatusMessage("Location listener started.");
                }
            );
        } else {
            setStatusMessage("WebViewJavascriptBridge not initialized.");
        }
    };

    // Function to get the last location
    const getLastLocation = () => {
        if (window.WebViewJavascriptBridge) {
            console.log("Calling getLastLocation...");
            window.WebViewJavascriptBridge.callHandler(
                "getLastLocation",
                "",
                (responseData) => {
                    console.log("Response from getLastLocation:", responseData);
                    if (responseData) {
                        setCurrentLocation({
                            latitude: responseData.latitude || "Not available",
                            longitude: responseData.longitude || "Not available",
                            accuracy: responseData.accuracy || "Not available",
                            timestamp: responseData.timestamp || "Not available",
                        });
                        setStatusMessage("Last known location retrieved successfully!");
                    } else {
                        setStatusMessage("No data received from getLastLocation.");
                    }
                }
            );
        } else {
            setStatusMessage("WebViewJavascriptBridge not initialized.");
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.header}>Location Tracker</h1>
            <div style={styles.statusBox}>
                <strong>Status: </strong>
                <span>{statusMessage}</span>
            </div>
            <div style={styles.buttonContainer}>
                <button style={styles.button} onClick={startLocationListener}>
                    Start Location Listener
                </button>
                <button style={styles.button} onClick={getLastLocation}>
                    Get Last Location
                </button>
            </div>
            <div style={styles.locationBox}>
                <h3>Current Location:</h3>
                <p>
                    <strong>Latitude:</strong> {currentLocation.latitude}
                </p>
                <p>
                    <strong>Longitude:</strong> {currentLocation.longitude}
                </p>
                <p>
                    <strong>Accuracy:</strong> {currentLocation.accuracy} meters
                </p>
                <p>
                    <strong>Timestamp:</strong> {currentLocation.timestamp}
                </p>
            </div>
        </div>
    );
};

// Styles for the UI
const styles = {
    container: {
        fontFamily: "'Arial', sans-serif",
        padding: "20px",
        backgroundColor: "#f0f4f8",
        minHeight: "100vh",
    },
    header: {
        textAlign: "center",
        color: "#333",
    },
    statusBox: {
        marginBottom: "20px",
        padding: "10px",
        backgroundColor: "#eaf2f8",
        border: "1px solid #d1dce3",
        borderRadius: "5px",
        fontSize: "16px",
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
        backgroundColor: "#007BFF",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        transition: "background-color 0.3s ease",
    },
    buttonHover: {
        backgroundColor: "#0056b3",
    },
    locationBox: {
        padding: "15px",
        backgroundColor: "#ffffff",
        border: "1px solid #d1dce3",
        borderRadius: "5px",
        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
    },
};

export default LocationTracker;
