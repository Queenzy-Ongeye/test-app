import React, { useState } from "react";
import "./App.css"; // Assuming you have an external CSS file for styling

const App = () => {
  const [keyword, setKeyword] = useState("OVES");
  const [macAddress, setMacAddress] = useState("FF:23:12:07:00:01");
  const [phone, setPhone] = useState("123456789");
  const [sms, setSms] = useState({ phone: "1233", content: "hello" });

  const callHandler = (handlerName, data) => {
    if (window.WebViewJavascriptBridge) {
      window.WebViewJavascriptBridge.callHandler(handlerName, data, (response) =>
        console.info(response)
      );
    } else {
      console.error("WebViewJavascriptBridge is not available.");
    }
  };

  const startBleScan = () => callHandler("startBleScan", keyword);
  const stopBleScan = () => callHandler("stopBleScan", "");
  const toastMsg = () => callHandler("toastMsg", "Toast Message");
  const startQrCode = () => callHandler("startQrCodeScan", 999);
  const jumpToMainActivity = () => callHandler("jump2MainActivity", JSON.stringify({ items: [] }));
  const connBleByMacAddress = () => callHandler("connBleByMacAddress", macAddress);
  const callPhone = () => callHandler("callPhone", phone);
  const sendSms = () => callHandler("sendSms", sms);

  return (
    <div className="app">
      <div className="container">
        <h1 className="title">Device Interaction Dashboard</h1>
        <div className="card">
          <input
            className="input"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Input keyword"
          />
          <button className="button" onClick={startBleScan}>
            Start BLE Scan
          </button>
        </div>

        <button className="button secondary" onClick={stopBleScan}>
          Stop BLE Scan
        </button>
        <button className="button" onClick={toastMsg}>
          Toast Message
        </button>
        <button className="button" onClick={startQrCode}>
          Start QR Code
        </button>
        <button className="button secondary" onClick={jumpToMainActivity}>
          Jump to Main Activity
        </button>

        <div className="card">
          <input
            className="input"
            value={macAddress}
            onChange={(e) => setMacAddress(e.target.value)}
            placeholder="Input MAC address"
          />
          <button className="button" onClick={connBleByMacAddress}>
            Connect BLE
          </button>
        </div>

        <div className="card">
          <input
            className="input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Input phone"
          />
          <button className="button secondary" onClick={callPhone}>
            Call Phone
          </button>
        </div>

        <div className="card">
          <input
            className="input"
            value={sms.phone}
            onChange={(e) => setSms({ ...sms, phone: e.target.value })}
            placeholder="SMS Phone"
          />
          <input
            className="input"
            value={sms.content}
            onChange={(e) => setSms({ ...sms, content: e.target.value })}
            placeholder="SMS Content"
          />
          <button className="button" onClick={sendSms}>
            Send SMS
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
