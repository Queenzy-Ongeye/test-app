import React, { useState } from 'react';

function App() {
  const [locationData, setLocationData] = useState(null); // State to store location data

  // Function to communicate with the WebView bridge
  const callWebViewJavascriptBridge = (handlerName, data) => {
    if (window.WebViewJavascriptBridge) {
      window.WebViewJavascriptBridge.callHandler(handlerName, data, (response) => {
        console.log(`${handlerName} response:`, response);

        if (handlerName === 'getLastLocation') {
          setLocationData(response); // Update state with location data
        } else {
          alert(`${handlerName} executed successfully.`);
        }
      });
    } else {
      console.warn('WebViewJavascriptBridge is not available.');
    }
  };

  // Location functions
  const startLocationListener = () => {
    callWebViewJavascriptBridge('startLocationListener', '');
  };

  const stopLocationListener = () => {
    callWebViewJavascriptBridge('stopLocationListener', '');
  };

  const getLastLocation = () => {
    callWebViewJavascriptBridge('getLastLocation', '');
  };

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: '#000000', color: '#ffffff', padding: '20px' }}>
      <h1 style={{ textAlign: 'center' }}>Location Listener</h1>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        <button
          style={{ width: '200px', height: '50px', margin: '10px 0' }}
          onClick={startLocationListener}
        >
          Start Location Listener
        </button>
        <button
          style={{ width: '200px', height: '50px', margin: '10px 0' }}
          onClick={stopLocationListener}
        >
          Stop Location Listener
        </button>
        <button
          style={{ width: '200px', height: '50px', margin: '10px 0' }}
          onClick={getLastLocation}
        >
          Get Last Location
        </button>
      </div>

      {/* Displaying location data */}
      {locationData && (
        <div style={{ marginTop: '20px', color: '#00FF00', textAlign: 'center' }}>
          <h2>Location Data:</h2>
          <pre style={{ textAlign: 'left', backgroundColor: '#333333', padding: '10px', borderRadius: '5px' }}>
            {JSON.stringify(locationData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default App;
