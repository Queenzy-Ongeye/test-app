'use client'

import React, { useState } from "react"
import './App.css'

function App() {
  const [locationData, setLocationData] = useState(null)
  const [debugMessage, setDebugMessage] = useState("")

  // Function to communicate with the WebView bridge
  const callWebViewJavascriptBridge = (handlerName, data, callback) => {
    if (window.WebViewJavascriptBridge) {
      window.WebViewJavascriptBridge.callHandler(handlerName, data, (response) => {
        console.log(`${handlerName} response:`, response)
        if (callback) callback(response)
      })
    } else {
      console.warn("WebViewJavascriptBridge is not available.")
      setDebugMessage("WebViewJavascriptBridge is not available.")
    }
  }

  // Start Location Listener
  const startLocationListener = () => {
    setDebugMessage("Starting location listener...")
    callWebViewJavascriptBridge("startLocationListener", "", () => {
      setDebugMessage("Location listener started. Wait a few seconds before fetching the last location.")
    })
  }

  // Fetch Last Location
  const getLastLocation = () => {
    setDebugMessage("Fetching last known location...")
    callWebViewJavascriptBridge("getLastLocation", "", (response) => {
      try {
        const parsedResponse = JSON.parse(response)
        console.log("Parsed Response:", parsedResponse)

        if (parsedResponse.data) {
          const locationData = JSON.parse(parsedResponse.data)
          console.log("Parsed Location Data:", locationData)

          if (locationData.latitude !== undefined && locationData.longitude !== undefined) {
            const location = {
              latitude: parseFloat(locationData.latitude),
              longitude: parseFloat(locationData.longitude),
            }
            setLocationData(location)
            setDebugMessage("Location data fetched successfully.")
          } else {
            setDebugMessage("Latitude or Longitude missing in location data.")
          }
        } else {
          setDebugMessage("`data` field is missing or invalid.")
        }
      } catch (error) {
        setDebugMessage("Error parsing response. Check the logs for details.")
        console.error("Error parsing response:", error)
      }
    })
  }

  return (
    <div className="container">
      <h1 className="title">Location Listener</h1>
      <div className="button-container">
        <button
          onClick={startLocationListener}
          className="button button-blue"
        >
          Start Location Listener
        </button>
        <button
          onClick={getLastLocation}
          className="button button-green"
        >
          Get Last Location
        </button>
      </div>

      {debugMessage && <p className="debug-message">{debugMessage}</p>}

      {locationData ? (
        <div className="coordinates">
          <p><strong>Latitude:</strong> {locationData.latitude}</p>
          <p><strong>Longitude:</strong> {locationData.longitude}</p>
        </div>
      ) : (
        <p className="no-location-message">No location data available.</p>
      )}
    </div>
  )
}

export default App
