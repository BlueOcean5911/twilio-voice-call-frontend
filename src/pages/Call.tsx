"use client";
import axios from "axios";
import React, { useState, useEffect } from "react";
import DialPad from "@/components/DialPad";
import CallInProgress from "@/components/CallInProgress";
import IncomingCallModal from "@/components/CallIncomingModal";
import { Connection } from "twilio-client";
interface TokenResponse {
  token: string;
  identify: string;
}

const Call: React.FC = () => {
  const [device, setDevice] = useState<Twilio.Device | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [showDialPad, setShowDialPad] = useState<boolean>(false);

  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [showCallInProgress, setShowCallInProgress] = useState(false);
  const [incomingCall, setIncomingCall] = useState<Connection | null>(null);
  const [incomingNumber, setIncomingNumber] = useState<string>("");

  // Add this to your device initialization (inside useEffect)

  const addLog = (message: string): void => {
    setLogs((prev) => [...prev, message]);
  };

  useEffect(() => {
    const initializeTwilio = async () => {
      try {
        const response = await axios.get(
          "https://api.twillio-call.aivio.io/token"
        );
        const data: TokenResponse = response.data;
        // const data: TokenResponse = await response.json();
        const { Device, Connection } = await import("twilio-client");
        const newDevice = new Device(data.token, {
          codecPreferences: [Connection.Codec.PCMU, Connection.Codec.Opus],
          fakeLocalDTMF: true,
          enableRingingState: true,
          debug: true,
          allowIncomingWhileBusy: true,
          edge: ["ashburn", "dublin", "singapore"],
        });

        newDevice.on("ready", () => addLog("Device Ready!"));
        newDevice.on("error", (error) =>
          addLog("Twilio.Device Error: " + error)
        );
        newDevice.on("connect", () => {
          addLog("Successfully established call ! ");
          setShowCallInProgress(true);
        });
        newDevice.on("disconnect", () => {
          addLog("Call ended.");
          setShowCallInProgress(false);
        });
        newDevice.on("incoming", (connection) => {
          console.log(connection.parameters);
          addLog("Incoming connection from " + connection.parameters.From);
          setIncomingNumber(connection.parameters.From);
          setIncomingCall(connection);
        });
        setDevice(newDevice);
      } catch (err) {
        addLog("Could not get a token from server!" + err);
      }
    };

    initializeTwilio();
  }, []);

  const handleDial = (phoneNumber: string) => {
    if (!device) return;

    setShowDialPad(false);
    setPhoneNumber(phoneNumber);
    const outgoingConnection = device.connect({ To: phoneNumber });
    outgoingConnection.on("ringing", function () {
      addLog("Ringing...");
    });
  };

  const handleHangUp = () => {
    if (!device) return;
    device.disconnectAll();
    setShowCallInProgress(false);
  };

  return (
    <div className="container">
      <div className="card text-center log-container">
        <h3>Device log</h3>
        <div id="log">
          {logs.map((log, index) => (
            <p key={index}>&gt; {log}</p>
          ))}
        </div>

        <div className="btn-container">
          <button
            id="btnOpenNumberPad"
            className="btn btn-default btn-circle btn-lg"
            onClick={() => {
              setShowDialPad(true);
            }}
          >
            Call
          </button>
        </div>
      </div>

      {showDialPad && (
        <DialPad onDial={handleDial} onClose={() => setShowDialPad(false)} />
      )}

      {showCallInProgress && phoneNumber && (
        <CallInProgress phoneNumber={phoneNumber} onHangUp={handleHangUp} />
      )}

      {incomingCall && (
        <IncomingCallModal
          phoneNumber={incomingNumber}
          onAccept={() => {
            incomingCall.accept();
            addLog("Accepted call...");
            setIncomingCall(null);
            setShowCallInProgress(true);
            setPhoneNumber(incomingNumber);
          }}
          onReject={() => {
            incomingCall.reject();
            addLog("Rejected call...");
            setIncomingCall(null);
          }}
        />
      )}
    </div>
  );
};

export default Call;
