import React, { useEffect, useState } from 'react';
import { MapPin, Car, Navigation, Pause, Play } from 'lucide-react';

const EnhancedLocationTracker = () => {
  const [currentLocation, setCurrentLocation] = useState({
    latitude: null,
    longitude: null,
    accuracy: null,
    timestamp: null,
  });
  const [journey, setJourney] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Connect to WebViewJavascriptBridge
  const connectWebViewJavascriptBridge = (callback) => {
    if (window.WebViewJavascriptBridge) {
      callback(window.WebViewJavascriptBridge);
    } else {
      document.addEventListener(
        'WebViewJavascriptBridgeReady',
        () => callback(window.WebViewJavascriptBridge),
        false
      );
    }
  };

  // Register location callback
  const registerLocationCallback = (bridge) => {
    bridge.registerHandler('locationCallBack', (data, responseCallback) => {
      const parsedData = JSON.parse(data.data || '{}');
      if (parsedData.latitude && parsedData.longitude) {
        const newPoint = {
          x: (parsedData.longitude + 180) / 360 * 100,
          y: (90 - parsedData.latitude) / 180 * 100,
          name: 'Current Location'
        };
        
        setCurrentLocation({
          latitude: parsedData.latitude,
          longitude: parsedData.longitude,
          accuracy: parsedData.accuracy || 'Unknown',
          timestamp: parsedData.timestamp || 'N/A',
        });
        
        setJourney((prev) => [...prev, newPoint]);
        responseCallback('Location received successfully');
      }
    });
  };

  // Start location listener
  const startLocationListener = () => {
    if (window.WebViewJavascriptBridge) {
      window.WebViewJavascriptBridge.callHandler('startLocationListener', '', (responseData) => {
        setStatusMessage('Location listener started successfully!');
        setIsTracking(true);
      });
    } else {
      setStatusMessage('WebViewJavascriptBridge is not initialized.');
    }
  };

  // Stop location listener
  const stopLocationListener = () => {
    if (window.WebViewJavascriptBridge) {
      window.WebViewJavascriptBridge.callHandler('stopLocationListener', '', (responseData) => {
        setStatusMessage('Location listener stopped.');
        setIsTracking(false);
      });
    } else {
      setStatusMessage('WebViewJavascriptBridge is not initialized.');
    }
  };

  // Get last location
  const getLastLocation = () => {
    if (window.WebViewJavascriptBridge) {
      setIsLoading(true);
      window.WebViewJavascriptBridge.callHandler('getLastLocation', '', (responseData) => {
        setIsLoading(false);
        try {
          const locations = JSON.parse(responseData);
          const formattedJourney = locations.map((loc) => ({
            x: (loc.longitude + 180) / 360 * 100,
            y: (90 - loc.latitude) / 180 * 100,
            name: 'Saved Location'
          }));
          setJourney(formattedJourney);
          setStatusMessage('Journey retrieved successfully!');
        } catch (error) {
          setStatusMessage('Error parsing journey data.');
          console.error('Error parsing response data:', error);
        }
      });
    } else {
      setStatusMessage('WebViewJavascriptBridge is not initialized.');
    }
  };

  // Initialize bridge on component mount
  useEffect(() => {
    connectWebViewJavascriptBridge((bridge) => {
      registerLocationCallback(bridge);
    });
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white shadow-lg p-6 flex flex-col">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <Navigation className="mr-3 text-blue-600" size={28} />
          Location Tracker
        </h1>

        {/* Location Details Card */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-700">Current Location</h2>
            <Car className={`${currentLocation.latitude ? 'text-green-500' : 'text-gray-400'}`} size={24} />
          </div>
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium text-gray-600">Latitude:</span>{' '}
              {currentLocation.latitude || 'Waiting for location'}
            </p>
            <p>
              <span className="font-medium text-gray-600">Longitude:</span>{' '}
              {currentLocation.longitude || 'Waiting for location'}
            </p>
            <p>
              <span className="font-medium text-gray-600">Accuracy:</span>{' '}
              {currentLocation.accuracy ? `${currentLocation.accuracy} meters` : 'N/A'}
            </p>
            <p>
              <span className="font-medium text-gray-600">Timestamp:</span>{' '}
              {currentLocation.timestamp || 'No recent update'}
            </p>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="space-y-4">
          <button 
            onClick={startLocationListener}
            className="w-full flex items-center justify-center py-3 rounded-lg bg-green-500 text-white hover:bg-green-600"
          >
            <Play className="mr-2" size={20} /> Start Tracking
          </button>
          
          <button 
            onClick={stopLocationListener}
            className="w-full flex items-center justify-center py-3 rounded-lg bg-red-500 text-white hover:bg-red-600"
          >
            <Pause className="mr-2" size={20} /> Stop Tracking
          </button>

          <button 
            onClick={getLastLocation}
            disabled={isLoading}
            className="w-full flex items-center justify-center py-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
          >
            <MapPin className="mr-2" size={20} /> 
            {isLoading ? 'Loading...' : 'Retrieve Journey'}
          </button>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div className="mt-4 text-center bg-blue-100 text-blue-700 p-2 rounded-lg text-sm">
            {statusMessage}
          </div>
        )}
      </div>

      {/* Map Visualization */}
      <div className="flex-1 relative bg-gray-200">
        {/* Map Background Grid */}
        <div 
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: 'linear-gradient(to right, rgba(200,200,200,0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(200,200,200,0.2) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
        />

        {/* Route Line */}
        {journey.length > 1 && (
          <svg className="absolute inset-0 z-20" viewBox="0 0 100 100">
            <polyline 
              points={journey.map(point => `${point.x},${point.y}`).join(' ')}
              fill="none"
              stroke="#1E88E5" 
              strokeWidth="0.5" 
              strokeDasharray="1"
            />
          </svg>
        )}

        {/* Start and End Points */}
        {journey.length > 0 && (
          <>
            {/* Start Point */}
            <div 
              className="absolute z-30 transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${journey[0].x}%`, 
                top: `${journey[0].y}%`
              }}
            >
              <MapPin className="text-green-500" size={32} />
              <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white px-2 py-1 rounded shadow text-xs">
                Start
              </span>
            </div>

            {/* End Point */}
            <div 
              className="absolute z-30 transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${journey[journey.length - 1].x}%`, 
                top: `${journey[journey.length - 1].y}%`
              }}
            >
              <MapPin className="text-red-500" size={32} />
              <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white px-2 py-1 rounded shadow text-xs">
                End
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EnhancedLocationTracker;