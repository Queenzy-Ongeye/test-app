import React, { useState, useEffect } from "react";

const LocationTracker = () => {
    const [currentLocation, setCurrentLocation] = useState({
        latitude: "Not available",
        longitude: "Not available",
        accuracy: "Not available",
        timestamp: "Not available",
    });
    const [statusMessage, setStatusMessage] = useState("Idle");

    const apiKey = "AIzaSyBA9bzem6pdx8Ke_ubaEnp9WTu42SJCfhw"; // Replace with your Google Maps API key

    // Initialize WebViewJavascriptBridge for testing in the browser
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
                    }
                },
            };
        }
    }, []);

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
                        setStatusMessage(
                            `Location retrieved successfully at ${new Date(
                                responseData.timestamp
                            ).toLocaleString()}!`
                        );
                    } else {
                        setStatusMessage("No data received from getLastLocation.");
                    }
                }
            );
        } else {
            setStatusMessage("WebViewJavascriptBridge not initialized.");
        }
    };

    useEffect(() => {
        // Automatically fetch the last location on component mount
        getLastLocation();
    }, []);

    return (
        <div style={styles.container}>
            <h1 style={styles.header}>Location Tracker</h1>
            <div style={styles.statusBox}>
                <strong>Status: </strong>
                <span>{statusMessage}</span>
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
                    <strong>Timestamp:</strong>{" "}
                    {currentLocation.timestamp !== "Not available"
                        ? new Date(currentLocation.timestamp).toLocaleString()
                        : "Not available"}
                </p>
            </div>
            {currentLocation.latitude !== "Not available" && (
                <div style={styles.mapContainer}>
                    <iframe
                        title="Google Maps"
                        width="100%"
                        height="400"
                        style={{ border: "0", borderRadius: "10px" }}
                        src={`https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${currentLocation.latitude},${currentLocation.longitude}&zoom=15`}
                        allowFullScreen
                    ></iframe>
                </div>
            )}
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
    locationBox: {
        padding: "15px",
        backgroundColor: "#ffffff",
        border: "1px solid #d1dce3",
        borderRadius: "5px",
        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
    },
    mapContainer: {
        marginTop: "20px",
    },
};

export default LocationTracker;
