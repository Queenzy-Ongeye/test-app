"use client";

import React, { useEffect, useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
} from "./ui-components";

interface Location {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
}

interface WebViewJavascriptBridge {
  callHandler: (
    handlerName: string,
    data: any,
    callback: (response: any) => void
  ) => void;
}

declare global {
  interface Window {
    WebViewJavascriptBridge?: WebViewJavascriptBridge;
  }
}

const MapPinIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const NavigationIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
  </svg>
);

const CrosshairIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="22" y1="12" x2="18" y2="12"></line>
    <line x1="6" y1="12" x2="2" y2="12"></line>
    <line x1="12" y1="6" x2="12" y2="2"></line>
    <line x1="12" y1="22" x2="12" y2="18"></line>
  </svg>
);

export default function LocationTracker() {
  const [startingLocation, setStartingLocation] = useState<Location | null>(
    null
  );
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [distance, setDistance] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("Idle");

  const apiKey = "YOUR_GOOGLE_MAPS_API_KEY"; // Replace with your Google Maps API key

  const containerStyle = {
    width: "100%",
    height: "300px",
    borderRadius: "0.375rem",
  };

  useEffect(() => {
    if (typeof window !== "undefined" && !window.WebViewJavascriptBridge) {
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

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const toRad = (value: number): number => (value * Math.PI) / 180;

    const R = 6371; // Radius of Earth in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  };

  const setStartLocation = () => {
    if (typeof window !== "undefined" && window.WebViewJavascriptBridge) {
      console.log("Fetching starting location...");
      window.WebViewJavascriptBridge.callHandler(
        "getLastLocation",
        "",
        (responseData: Location) => {
          console.log("Starting location set:", responseData);
          if (responseData) {
            setStartingLocation(responseData);
            setStatusMessage("Starting location set successfully!");
          } else {
            setStatusMessage("Failed to set starting location.");
          }
        }
      );
    }
  };

  const getLastLocation = () => {
    if (typeof window !== "undefined" && window.WebViewJavascriptBridge) {
      console.log("Fetching last location...");
      window.WebViewJavascriptBridge.callHandler(
        "getLastLocation",
        "",
        (responseData: Location) => {
          console.log("Last location retrieved:", responseData);
          if (responseData) {
            setCurrentLocation(responseData);

            if (startingLocation) {
              const dist = calculateDistance(
                startingLocation.latitude,
                startingLocation.longitude,
                responseData.latitude,
                responseData.longitude
              );
              setDistance(dist.toFixed(2)); // Limit to 2 decimal places
              setStatusMessage(
                `Distance traveled: ${dist.toFixed(2)} kilometers`
              );
            } else {
              setStatusMessage("No starting location set.");
            }
          } else {
            setStatusMessage("Failed to retrieve last location.");
          }
        }
      );
    }
  };

  const renderMap = () => {
    if (!currentLocation) {
      return null;
    }

    const center = {
      lat: currentLocation.latitude,
      lng: currentLocation.longitude,
    };

    return (
      <LoadScript googleMapsApiKey={apiKey}>
        <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={15}>
          <Marker position={center} title="Current Location" />
        </GoogleMap>
      </LoadScript>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-200 p-4 sm:p-6 flex items-center justify-center">
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="bg-primary text-primary-foreground">
          <CardTitle className="text-2xl sm:text-3xl font-bold text-center flex items-center justify-center">
            <MapPinIcon />
            <span className="ml-2">Location Tracker</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-sm sm:text-base shadow-inner">
            <strong className="block mb-1 text-blue-700">Status:</strong>
            <span className="text-blue-600" aria-live="polite">
              {statusMessage}
            </span>
          </div>
          <div className="bg-white border border-gray-200 rounded-md p-4 shadow-md text-sm sm:text-base">
            <h3 className="text-lg sm:text-xl font-semibold mb-3 text-gray-800 flex items-center">
              <CrosshairIcon />
              <span className="ml-2">Current Location:</span>
            </h3>
            <dl className="grid grid-cols-2 gap-3">
              <dt className="font-semibold text-gray-600">Latitude:</dt>
              <dd className="text-gray-800">
                {currentLocation?.latitude?.toFixed(6) ?? "Not available"}
              </dd>
              <dt className="font-semibold text-gray-600">Longitude:</dt>
              <dd className="text-gray-800">
                {currentLocation?.longitude?.toFixed(6) ?? "Not available"}
              </dd>
              <dt className="font-semibold text-gray-600">Accuracy:</dt>
              <dd className="text-gray-800">
                {currentLocation?.accuracy
                  ? `${currentLocation.accuracy.toFixed(2)} meters`
                  : "Not available"}
              </dd>
              <dt className="font-semibold text-gray-600">Timestamp:</dt>
              <dd className="text-gray-800">
                {currentLocation?.timestamp
                  ? new Date(currentLocation.timestamp).toLocaleString()
                  : "Not available"}
              </dd>
              {distance && (
                <>
                  <dt className="font-semibold text-gray-600">Distance:</dt>
                  <dd className="text-gray-800">{distance} km</dd>
                </>
              )}
            </dl>
          </div>
          <div className="mt-6">{renderMap()}</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button
              onClick={setStartLocation}
              className="w-full flex items-center justify-center"
              variant="outline"
            >
              <NavigationIcon />
              <span className="ml-2">Set Start Location</span>
            </Button>
            <Button
              onClick={getLastLocation}
              className="w-full flex items-center justify-center"
            >
              <MapPinIcon />
              <span className="ml-2">Get Last Location</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
