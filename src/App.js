import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

function App() {
  const [locationData, setLocationData] = useState(null); // State to store location data
  const [debugMessage, setDebugMessage] = useState(''); // Debug message

  // Function to communicate with the WebView bridge
  const callWebViewJavascriptBridge = (handlerName, data, callback) => {
    if (window.WebViewJavascriptBridge) {
      window.WebViewJavascriptBridge.callHandler(handlerName, data, (response) => {
        console.log(`${handlerName} response:`, response);
        if (callback) callback(response);
      });
    } else {
      console.warn('WebViewJavascriptBridge is not available.');
      setDebugMessage('WebViewJavascriptBridge is not available.');
    }
  };

  // Start Location Listener
  const startLocationListener = () => {
    setDebugMessage('Starting location listener...');
    callWebViewJavascriptBridge('startLocationListener', '', () => {
      setDebugMessage('Location listener started. Wait a few seconds before fetching the last location.');
    });
  };

  // Fetch Last Location
  const getLastLocation = () => {
    setDebugMessage('Fetching last known location...');
    callWebViewJavascriptBridge('getLastLocation', '', (response) => {
      try {
        const parsedResponse = JSON.parse(response); // Parse the first layer
        if (parsedResponse.responseData) {
          const nestedData = JSON.parse(parsedResponse.responseData); // Parse the nested responseData
          setLocationData(nestedData.respData); // Set the relevant location data
          setDebugMessage('Location data fetched successfully.');
        } else {
          setDebugMessage('Invalid responseData format.');
        }
      } catch (error) {
        setDebugMessage('Error parsing response. Check the logs for details.');
        console.error('Error parsing response:', error);
      }
    });
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Location Listener with Map</h1>
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

      {/* Map Section */}
      {locationData && (
        <div style={styles.mapContainer}>
          <MapContainer
            center={[locationData.latitude, locationData.longitude]}
            zoom={15}
            style={{ height: '400px', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={[locationData.latitude, locationData.longitude]}>
              <Popup>
                Latitude: {locationData.latitude}, Longitude: {locationData.longitude}
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      )}
    </div>
  );
}

export default App;

// Inline styles
const styles = {
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1E1E1E',
    color: '#FFFFFF',
    fontFamily: 'Arial, sans-serif',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: '2rem',
    marginBottom: '20px',
    color: '#FFD700',
    textAlign: 'center',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
  },
  button: {
    width: '220px',
    height: '50px',
    backgroundColor: '#007BFF',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '5px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.3)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  debugMessage: {
    color: '#FFD700',
    marginTop: '10px',
    fontSize: '1rem',
    textAlign: 'center',
  },
  mapContainer: {
    marginTop: '20px',
    width: '100%',
    maxWidth: '600px',
    borderRadius: '10px',
    overflow: 'hidden',
  },
};
