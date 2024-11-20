import React, { useEffect, useState, useMemo } from "react";
import {
  GoogleMap,
  Marker,
  Polyline,
  useJsApiLoader,
} from "@react-google-maps/api";

const LocationTracker = () => {
  const [currentLocation, setCurrentLocation] = useState({
    latitude: null,
    longitude: null,
    accuracy: null,
    timestamp: null,
  });
  const [journey, setJourney] = useState([]); // Array to store the journey
  const [lastConnection, setLastConnection] = useState(null); // State for last connection
  const [statusMessage, setStatusMessage] = useState("");

  const API_KEY = "AIzaSyBA9bzem6pdx8Ke_ubaEnp9WTu42SJCfhw"; // Replace with your API key

  // Load the Google Maps API
  const { isLoaded } = useJsApiLoader(
    useMemo(
      () => ({
        googleMapsApiKey: API_KEY,
        libraries: ["maps"],
        language: "en",
      }),
      [API_KEY]
    )
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

  // Register the handler for receiving location updates
  const registerLocationCallback = (bridge) => {
    bridge.registerHandler("locationCallBack", (data, responseCallback) => {
      try {
        const { latitude, longitude, accuracy, timestamp } = JSON.parse(data);

        // Update current location
        setCurrentLocation({
          latitude,
          longitude,
          accuracy,
          timestamp,
        });

        // Append the new location to the journey array
        setJourney((prev) => [...prev, { lat: latitude, lng: longitude }]);

        // Acknowledge the location received
        responseCallback("Location received successfully");
      } catch (error) {
        console.error("Error processing location data:", error);
        setStatusMessage("Error receiving location updates.");
      }
    });
  };

  // Start receiving location updates
  const startLocationListener = () => {
    if (window.WebViewJavascriptBridge) {
      window.WebViewJavascriptBridge.callHandler(
        "startLocationListener",
        "",
        (responseData) => {
          setStatusMessage("Location listener started successfully!");
        }
      );
    } else {
      setStatusMessage("WebViewJavascriptBridge is not initialized.");
    }
  };

  // Stop receiving location updates
  const stopLocationListener = () => {
    if (window.WebViewJavascriptBridge) {
      window.WebViewJavascriptBridge.callHandler(
        "stopLocationListener",
        "",
        (responseData) => {
          setStatusMessage("Location listener stopped.");
        }
      );
    } else {
      setStatusMessage("WebViewJavascriptBridge is not initialized.");
    }
  };

  // Fetch Last Location
  const getLastLocation = () => {
    setStatusMessage("Fetching last known location...");
    connectWebViewJavascriptBridge((bridge) => {
      bridge.callHandler("getLastLocation", "", (response) => {
        try {
          const parsedResponse = JSON.parse(response);
          console.log("Parsed Response:", parsedResponse);

          if (parsedResponse.data) {
            const locationData = JSON.parse(parsedResponse.data);
            console.log("Parsed Location Data:", locationData);

            if (
              locationData.latitude !== undefined &&
              locationData.longitude !== undefined
            ) {
              const location = {
                latitude: parseFloat(locationData.latitude),
                longitude: parseFloat(locationData.longitude),
              };
              setCurrentLocation(location);
            } else {
              setStatusMessage(
                "Latitude or Longitude missing in location data."
              );
            }
          } else {
            setStatusMessage("`data` field is missing or invalid.");
          }
        } catch (error) {
          setStatusMessage("Error parsing response. Check the logs for details.");
          console.error("Error parsing response:", error);
        }
      });
    });
  };

  // Fetch Last Connection
  const getLastConnection = () => {
    setStatusMessage("Fetching last connection details...");
    connectWebViewJavascriptBridge((bridge) => {
      bridge.callHandler("getLastConnection", "", (response) => {
        try {
          const parsedResponse = JSON.parse(response);
          console.log("Parsed Last Connection Response:", parsedResponse);

          if (parsedResponse) {
            setLastConnection(parsedResponse); // Store last connection details
            setStatusMessage("Last connection details fetched successfully.");
          } else {
            setStatusMessage("No last connection details available.");
          }
        } catch (error) {
          setStatusMessage(
            "Error parsing last connection response. Check the logs for details."
          );
          console.error("Error parsing last connection response:", error);
        }
      });
    });
  };

  // Register the bridge callback when the component mounts
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
        <button style={styles.button} onClick={getLastLocation}>
          Get Last Location
        </button>
        <button style={styles.button} onClick={getLastConnection}>
          Get Last Connection
        </button>
        <button style={styles.button} onClick={stopLocationListener}>
          Stop Location Listener
        </button>
      </div>
      {statusMessage && <p style={styles.status}>{statusMessage}</p>}
      <div style={styles.locationInfo}>
        <h3>Current Location:</h3>
        <p>
          <strong>Latitude:</strong>{" "}
          {currentLocation.latitude || "Not available"}
        </p>
        <p>
          <strong>Longitude:</strong>{" "}
          {currentLocation.longitude || "Not available"}
        </p>
        <p>
          <strong>Accuracy:</strong>{" "}
          {currentLocation.accuracy || "Not available"} meters
        </p>
        <p>
          <strong>Timestamp:</strong>{" "}
          {currentLocation.timestamp || "Not available"}
        </p>
      </div>
      {lastConnection && (
        <div style={styles.locationInfo}>
          <h3>Last Connection:</h3>
          <pre>{JSON.stringify(lastConnection, null, 2)}</pre>
        </div>
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
};

export default LocationTracker;
