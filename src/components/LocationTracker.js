import React, { useEffect, useState } from 'react';
import { MapPin, Car } from 'lucide-react';

const LocationTracker = () => {
  const [currentLocation, setCurrentLocation] = useState({
    latitude: null,
    longitude: null,
    accuracy: null,
    timestamp: null,
  });
  const [journey, setJourney] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');
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
          x: (parsedData.longitude + 180) / 360 * 100, // Convert to percentage
          y: (90 - parsedData.latitude) / 180 * 100, // Convert to percentage
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

  // First point (if journey exists)
  const startPoint = journey.length > 0 ? journey[0] : null;
  // Last point (if journey exists)
  const endPoint = journey.length > 0 ? journey[journey.length - 1] : null;

  return (
    <div className="w-full h-screen relative bg-gray-100">
      {/* Map Background */}
      <div 
        className="absolute inset-0 bg-gray-200 opacity-50"
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

      {/* Start Point */}
      {startPoint && (
        <div 
          className="absolute flex items-center z-30"
          style={{
            left: `${startPoint.x}%`, 
            top: `${startPoint.y}%`
          }}
        >
          <MapPin 
            className="text-green-500" 
            size={24}
          />
          <span className="ml-2 bg-white p-1 rounded shadow text-xs">
            Start
          </span>
        </div>
      )}

      {/* End Point */}
      {endPoint && (
        <div 
          className="absolute flex items-center z-30"
          style={{
            left: `${endPoint.x}%`, 
            top: `${endPoint.y}%`
          }}
        >
          <MapPin 
            className="text-red-500" 
            size={24}
          />
          <span className="ml-2 bg-white p-1 rounded shadow text-xs">
            End
          </span>
        </div>
      )}

      {/* Control Buttons */}
      <div className="absolute top-4 left-4 z-50 flex gap-2">
        <button 
          className="bg-green-500 text-white px-4 py-2 rounded"
          onClick={startLocationListener}
        >
          Start Tracking
        </button>
        <button 
          className="bg-red-500 text-white px-4 py-2 rounded"
          onClick={stopLocationListener}
        >
          Stop Tracking
        </button>
        <button 
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={getLastLocation}
        >
          Get Journey
        </button>
      </div>

      {/* Location Information */}
      <div className="absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow-md z-50 w-64">
        <div className="font-bold text-lg mb-2">Current Location</div>
        <div className="text-sm">
          <p><strong>Latitude:</strong> {currentLocation.latitude || 'N/A'}</p>
          <p><strong>Longitude:</strong> {currentLocation.longitude || 'N/A'}</p>
          <p><strong>Accuracy:</strong> {currentLocation.accuracy || 'N/A'} meters</p>
          <p><strong>Timestamp:</strong> {currentLocation.timestamp || 'N/A'}</p>
        </div>
        {statusMessage && (
          <div className="mt-2 text-blue-600 italic">
            {statusMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationTracker;