import React, { useState } from 'react';

function App() {
  const [locationData, setLocationData] = useState(null); // State to store location data
  const [rawResponse, setRawResponse] = useState(null); // State to store raw response for debugging
  const [debugMessage, setDebugMessage] = useState(''); // State to store debug messages

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
    callWebViewJavascriptBridge('startLocationListener', '', (response) => {
      setDebugMessage('Location listener started. You can now fetch the last location.');
    });
  };

  // Stop Location Listener
  const stopLocationListener = () => {
    setDebugMessage('Stopping location listener...');
    callWebViewJavascriptBridge('stopLocationListener', '', (response) => {
      setDebugMessage('Location listener stopped.');
    });
  };

  // Fetch Last Location (with a delay)
  const getLastLocation = () => {
    setDebugMessage('Fetching last known location...');
    setTimeout(() => {
      callWebViewJavascriptBridge('getLastLocation', '', (response) => {
        setRawResponse(response); // Save raw response for debugging
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
          setDebugMessage('Error parsing response. Check raw response for details.');
          console.error('Error parsing response:', error);
        }
      });
    }, 2000); // Adding a 2-second delay
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Location Listener</h1>
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

      {/* Debug Message */}
      {debugMessage && <p style={styles.debugMessage}>{debugMessage}</p>}

      {/* Displaying raw response for debugging */}
      {rawResponse && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Raw Response</h2>
          <pre style={styles.cardContent}>{rawResponse}</pre>
        </div>
      )}

      {/* Displaying parsed location data */}
      {locationData && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Location Data</h2>
          <div style={styles.locationData}>
            <p style={styles.dataField}>
              <strong>Latitude:</strong> {locationData.latitude || 'N/A'}
            </p>
            <p style={styles.dataField}>
              <strong>Longitude:</strong> {locationData.longitude || 'N/A'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

// Inline styles for the app
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
  card: {
    width: '90%',
    maxWidth: '600px',
    backgroundColor: '#333333',
    borderRadius: '10px',
    padding: '20px',
    marginTop: '20px',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.5)',
  },
  cardTitle: {
    fontSize: '1.5rem',
    marginBottom: '10px',
    color: '#FFD700',
  },
  cardContent: {
    color: '#00FF00',
    backgroundColor: '#1A1A1A',
    padding: '10px',
    borderRadius: '5px',
    overflowX: 'auto',
  },
  locationData: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  dataField: {
    fontSize: '1rem',
    color: '#FFFFFF',
  },
};
