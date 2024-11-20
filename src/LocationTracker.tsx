"use client";

import React from "react";
import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
} from "./ui-components";

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

export default function LocationTracker() {
  const [currentLocation, setCurrentLocation] = useState({
    latitude: "Not available",
    longitude: "Not available",
    accuracy: "Not available",
    timestamp: "Not available",
  });
  const [statusMessage, setStatusMessage] = useState("Idle");

  const apiKey = "AIzaSyBA9bzem6pdx8Ke_ubaEnp9WTu42SJCfhw"; // Replace with your Google Maps API key

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

  const getLastLocation = () => {
    if (typeof window !== "undefined" && window.WebViewJavascriptBridge) {
      console.log("Calling getLastLocation...");
      window.WebViewJavascriptBridge.callHandler(
        "getLastLocation",
        "",
        (responseData: any) => {
          console.log("Response from getLastLocation:", responseData);
          if (responseData) {
            setCurrentLocation({
              latitude: responseData.latitude?.toString() || "Not available",
              longitude: responseData.longitude?.toString() || "Not available",
              accuracy: responseData.accuracy?.toString() || "Not available",
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
    getLastLocation();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl font-bold text-center">
            Location Tracker
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 sm:p-4 text-sm sm:text-base">
            <strong className="block mb-1">Status:</strong>
            <span>{statusMessage}</span>
          </div>
          <div className="bg-white border border-gray-200 rounded-md p-3 sm:p-4 shadow text-sm sm:text-base">
            <h3 className="text-base sm:text-lg font-semibold mb-2">
              Current Location:
            </h3>
            <dl className="grid grid-cols-2 gap-2">
              <dt className="font-semibold">Latitude:</dt>
              <dd>{currentLocation.latitude}</dd>
              <dt className="font-semibold">Longitude:</dt>
              <dd>{currentLocation.longitude}</dd>
              <dt className="font-semibold">Accuracy:</dt>
              <dd>{currentLocation.accuracy} meters</dd>
              <dt className="font-semibold">Timestamp:</dt>
              <dd>
                {currentLocation.timestamp !== "Not available"
                  ? new Date(currentLocation.timestamp).toLocaleString()
                  : "Not available"}
              </dd>
            </dl>
          </div>
          {currentLocation.latitude !== "Not available" && (
            <div className="mt-4 sm:mt-6">
              <iframe
                title="Google Maps"
                width="100%"
                height="300"
                className="border-0 rounded-md"
                src={`https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${currentLocation.latitude},${currentLocation.longitude}&zoom=15`}
                allowFullScreen
              ></iframe>
            </div>
          )}
          <Button onClick={getLastLocation} className="w-full mt-4">
            Refresh Location
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
