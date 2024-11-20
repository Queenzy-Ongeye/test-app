import React, { useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

function App() {
  const [locationData, setLocationData] = useState(null); // State to store location data
  const [debugMessage, setDebugMessage] = useState(""); // Debug message

  // Your Google Maps API Key
  const GOOGLE_MAPS_API_KEY = "AIzaSyBA9bzem6pdx8Ke_ubaEnp9WTu42SJCfhw";

  // Function to communicate with the WebView bridge
  const callWebViewJavascriptBridge = (handlerName, data, callback) => {
    if (window.WebViewJavascriptBridge) {
      window.WebViewJavascriptBridge.callHandler(handlerName, data, (response) => {
        console.log(`${handlerName} response:`, response);
        if (callback) callback(response);
      });
    } else {
      console.warn("WebViewJavascriptBridge is not available.");
      setDebugMessage("WebViewJavascriptBridge is not available.");
    }
  };

  // Start Location Listener
  const startLocationListener = () => {
    setDebugMessage("Starting location listener...");
    callWebViewJavascriptBridge("startLocationListener", "", () => {
      setDebugMessage("Location listener started. Wait a few seconds before fetching the last location.");
    });
  };

  // Fetch Last Location
  const getLastLocation = () => {
    setDebugMessage("Fetching last known location...");
    const callWebViewJavascriptBridge = (handlerName, data, callback) => {
      if (window.WebViewJavascriptBridge) {
        window.WebViewJavascriptBridge.callHandler(handlerName, data, (response) => {
          try {
            const parsedResponse = JSON.parse(response);
            callback(null, parsedResponse);
          } catch (error) {
            callback(error, null);
          }
        });
      } else {
        console.error("WebViewJavascriptBridge is not initialized.");
        callback(new Error("WebViewJavascriptBridge is not initialized."), null);
      }
    };
    
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Location Listener with Google Maps</h1>
      <div style={styles.buttonContainer}>
        <button style={styles.button} onClick={startLocationListener}>
          Start Location Listener
        </button>
        <button style={styles.button} onClick={getLastLocation}>
          Get Last Location
        </button>
      </div>

      {/* Debug Message */}
      {debugMessage && <p style={styles.debugMessage}>{debugMessage}</p>}

      {/* Google Maps Section */}
      {locationData && locationData.latitude && locationData.longitude ? (
        <div style={styles.mapContainer}>
          <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
            <GoogleMap
              mapContainerStyle={{ height: "400px", width: "100%" }}
              center={{
                lat: parseFloat(locationData.latitude),
                lng: parseFloat(locationData.longitude),
              }}
              zoom={15}
            >
              <Marker
                position={{
                  lat: parseFloat(locationData.latitude),
                  lng: parseFloat(locationData.longitude),
                }}
              />
            </GoogleMap>
          </LoadScript>
        </div>
      ) : (
        <p style={styles.noLocationMessage}>No location data available to display on the map.</p>
      )}
    </div>
  );
}

export default App;

// Inline styles
const styles = {
  container: {
    width: "100%",
    height: "100%",
    backgroundColor: "#1E1E1E",
    color: "#FFFFFF",
    fontFamily: "Arial, sans-serif",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  title: {
    fontSize: "2rem",
    marginBottom: "20px",
    color: "#FFD700",
    textAlign: "center",
  },
  buttonContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
    marginBottom: "20px",
  },
  button: {
    width: "220px",
    height: "50px",
    backgroundColor: "#007BFF",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "5px",
    fontSize: "1rem",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.3)",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  debugMessage: {
    color: "#FFD700",
    marginTop: "10px",
    fontSize: "1rem",
    textAlign: "center",
  },
  mapContainer: {
    marginTop: "20px",
    width: "100%",
    maxWidth: "600px",
    borderRadius: "10px",
    overflow: "hidden",
  },
  noLocationMessage: {
    marginTop: "20px",
    color: "#FFD700",
    fontSize: "1rem",
  },
};
