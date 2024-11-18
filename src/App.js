import React, { useState } from "react";
import "./App.css"; // Add this to include the custom styles

function App() {
  const [keyword, setKeyword] = useState("");
  const [macAddress, setMacAddress] = useState("FF:23:12:07:00:01");
  const [phone, setPhone] = useState("123456789");
  const [sms, setSms] = useState({ phone: "1233", content: "hello" });

  const handleBridgeCall = (handler, data) => {
    if (window.WebViewJavascriptBridge) {
      window.WebViewJavascriptBridge.callHandler(handler, data, (response) => {
        console.info(response);
      });
    }
  };

  return (
    <div className="app">
      <div className="title">Device Interaction Dashboard</div>

      {/* BLE Scan */}
      <div className="card">
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="input"
          placeholder="Input keyword"
        />
        <button
          className="button"
          onClick={() => handleBridgeCall("startBleScan", keyword)}
        >
          Start BLE Scan
        </button>
      </div>
      <button
        className="button secondary"
        onClick={() => handleBridgeCall("stopBleScan", "")}
      >
        Stop BLE Scan
      </button>
      <button
        className="button"
        onClick={() => handleBridgeCall("toastMsg", "toastMsg")}
      >
        Toast Message
      </button>
      <button
        className="button"
        onClick={() => handleBridgeCall("startQrCodeScan", 999)}
      >
        Start QR Code
      </button>
      <button
        className="button secondary"
        onClick={() =>
          handleBridgeCall("jump2MainActivity", JSON.stringify({}))
        }
      >
        Jump to Main Activity
      </button>

      {/* BLE Connection */}
      <div className="card">
        <input
          value={macAddress}
          onChange={(e) => setMacAddress(e.target.value)}
          className="input"
          placeholder="Input MAC address"
        />
        <button
          className="button"
          onClick={() => handleBridgeCall("connBleByMacAddress", macAddress)}
        >
          Connect BLE
        </button>
      </div>

      {/* Phone Call */}
      <div className="card">
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="input"
          placeholder="Input phone"
        />
        <button
          className="button secondary"
          onClick={() => handleBridgeCall("callPhone", phone)}
        >
          Call Phone
        </button>
      </div>

      {/* SMS */}
      <div className="card row">
        <input
          value={sms.phone}
          onChange={(e) => setSms({ ...sms, phone: e.target.value })}
          className="input"
          placeholder="SMS Phone"
        />
        <input
          value={sms.content}
          onChange={(e) => setSms({ ...sms, content: e.target.value })}
          className="input"
          placeholder="SMS Content"
        />
      </div>
      <button
        className="button"
        onClick={() => handleBridgeCall("sendSms", sms)}
      >
        Send SMS
      </button>

      {/* MQTT */}
      <button
        className="button"
        onClick={() =>
          handleBridgeCall("connectMqtt", {
            username: "Admin",
            password: "7xzUV@MT",
            clientId: "123",
            hostname: "mqtt.omnivoltaic.com",
            port: 1883,
          })
        }
      >
        Connect MQTT
      </button>
      <button
        className="button"
        onClick={() => handleBridgeCall("mqttSubTopic", { topic: "/a/b/c", qos: 0 })}
      >
        MQTT Subscribe
      </button>
      <button
        className="button secondary"
        onClick={() => handleBridgeCall("mqttUnSubTopic", { topic: "/a/b/c" })}
      >
        MQTT Unsubscribe
      </button>
      <button
        className="button"
        onClick={() =>
          handleBridgeCall("mqttPublishMsg", {
            topic: "/a/b/c",
            qos: 0,
            content: "this is content!",
          })
        }
      >
        MQTT Publish Message
      </button>

      {/* Data Persistence */}
      <button
        className="button secondary"
        onClick={() =>
          handleBridgeCall("saveParam", { key: "this is unique key", value: "json data" })
        }
      >
        Save Parameter
      </button>
      <button
        className="button"
        onClick={() =>
          handleBridgeCall("getParam", { key: "this is unique key" })
        }
      >
        Get Parameter
      </button>
      <button
        className="button"
        onClick={() =>
          handleBridgeCall("removeParam", { key: "this is unique key" })
        }
      >
        Remove Parameter
      </button>

      {/* Advanced Features */}
      <button
        className="button secondary"
        onClick={() => handleBridgeCall("fingerprintVerification", "")}
      >
        Fingerprint Verification
      </button>
      <button
        className="button"
        onClick={() => handleBridgeCall("openOcr", "")}
      >
        Open OCR
      </button>
      <button
        className="button secondary"
        onClick={() => handleBridgeCall("saveImg", "")}
      >
        Save Image
      </button>
      <button
        className="button"
        onClick={() => handleBridgeCall("startLocationListener", "")}
      >
        Start Location Listener
      </button>
      <button
        className="button secondary"
        onClick={() => handleBridgeCall("stopLocationListener", "")}
      >
        Stop Location Listener
      </button>
      <button
        className="button"
        onClick={() => handleBridgeCall("getLastLocation", "")}
      >
        Get Last Location
      </button>
    </div>
  );
}

export default App;
