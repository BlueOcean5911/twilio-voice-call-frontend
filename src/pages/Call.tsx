"use client";

import axios from "axios";
import React, { useState, useEffect } from "react";
import DialPad from "@/components/DialPad";
import CallBar from "@/components/CallBar";
import { PhoneCall } from "lucide-react";
import { Connection, Device } from "twilio-client";

interface TokenResponse {
  token: string;
  identify: string;
}

interface CallInfo {
  leadId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

interface CallMapping {
  [callSid: string]: CallInfo;
}

const Call = () => {
  const [device, setDevice] = useState<Device | null>(null);
  const [connections, setConnections] = React.useState<Connection[] | []>([]);
  const [callMapping, setCallMapping] = useState<CallMapping>({});
  const [logs, setLogs] = useState<string[]>([]);
  const [showDialPad, setShowDialPad] = useState<boolean>(false);

  const [fromNumber, setFromNumber] = useState<string>("");

  useEffect(() => {
    console.log("Device:", device);
    console.log("Connections:", connections);
  }, [connections, device]);

  const addLog = (message: string): void => {
    setLogs((prev) => [...prev, message]);
  };

  const initializeTwilio = async () => {
    const { Device, Connection } = await import("twilio-client");
    try {
      const response = await axios.get(
        `https://api.twillio-call.aivio.io/token/${fromNumber}`
      );
      const data: TokenResponse = response.data;
      const newDevice = new Device(data.token, {
        codecPreferences: [Connection.Codec.PCMU, Connection.Codec.Opus],
        fakeLocalDTMF: true,
        enableRingingState: true,
        debug: true,
        allowIncomingWhileBusy: true,
        edge: ["ashburn", "dublin", "singapore"],
      });

      newDevice.on("ready", () => {
        addLog("Device Ready!");
      });

      newDevice.on("error", (error) => addLog("Twilio.Device Error: " + error));

      newDevice.on("connect", (conn: Connection) => {
        addLog("Connection successfully established." + " " + conn.parameters);
      });

      newDevice.on("disconnect", (conn: Connection) => {
        addLog("Call ended." + " " + conn.parameters.CallSid);
      });

      newDevice.on("incoming", (conn: Connection) => {
        console.log(conn.parameters);
        addLog("Incoming connection from " + " " + conn.parameters.From);
        addConnectionHandler(conn);
        setConnections((prev) => [...prev, conn]);
        setCallMapping((prev) => ({
          ...prev,
          [conn.parameters.CallSid]: {
            leadId: "123",
            firstName: "John",
            lastName: "Doe",
            phoneNumber: conn.parameters.From,
          },
        }));
      });

      newDevice.on("offline", async (device: Device) => {
        const accessToken = await refreshToken();
        if (accessToken) {
          device.setup(accessToken);
          addLog("Token refreshed. Device is now online.");
        }
      });

      setDevice(newDevice);
    } catch (err) {
      addLog("Could not get a token from server!" + err);
    }
  };

  const handleDial = (phoneNumber: string) => {
    if (!device) return;

    setShowDialPad(false);

    const outgoingConnection = device.connect({ To: phoneNumber });
    addConnectionHandler(outgoingConnection);
    setConnections((prev: Connection[]) => [...prev, outgoingConnection]);
    setCallMapping((prev) => ({
      ...prev,
      [outgoingConnection.parameters.callSid]: {
        leadId: "12345",
        firstName: "John",
        lastName: "Doe",
        phoneNumber: phoneNumber,
      },
    }));
  };

  const refreshToken = async () => {
    try {
      const response = await axios.get(
        "https://api.twillio-call.aivio.io/token"
      );
      const data: TokenResponse = response.data;
      addLog("Fetching refreshed token successfully");
      return data.token;
    } catch (err) {
      addLog("Failed to fetch refreshed access token: " + err);
    }
  };

  const addConnectionHandler = (connection: Connection) => {
    connection.on("pending", function (connection: Connection) {
      addLog("Pending..." + " " + connection.parameters.CallSid);
      connection.on("connecting", function (connection: Connection) {
        addLog("Connecting..." + " " + connection.parameters.CallSid);
      });
      connection.on("ringing", function () {
        addLog("Ringing..." + " " + connection.parameters.CallSid);
      });
      connection.on("open", function () {
        addLog("Connected!" + " " + connection.parameters.CallSid);
      });
      connection.on("closed", function (connection: Connection) {
        addLog("Call ended." + " " + connection.parameters.CallSid);
        setConnections((prev) =>
          prev.filter(
            (conn) => conn.parameters.CallSid !== connection.parameters.CallSid
          )
        );
      });
    });

    connection.on("accept", function (connection: Connection) {
      addLog("Accepted..." + " " + connection.parameters.CallSid);
    });
    connection.on("reject", () => {
      setConnections((prev) =>
        prev.filter(
          (conn) => conn.parameters.CallSid !== connection.parameters.CallSid
        )
      );
    });
  };

  return (
    <div className="container">
      <div className="card text-center log-container">
        <div className="flex gap-4">
          <input
            type="text"
            value={fromNumber}
            onChange={(e) => setFromNumber(e.target.value)}
          />
          <button
            className="flex items-center justify-center"
            onClick={() => initializeTwilio()}
          >
            Connect Twilio Device
          </button>
        </div>
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
      {connections.length &&
        connections.map((connection) => (
          <div
            key={connection.parameters.CallSid}
            className="fixed bottom-0 right-24 px-8 py-2"
          >
            <CallBar
              callInfo={callMapping[connection.parameters.CallSid]}
              connection={connection}
            />
          </div>
        ))}
      <div className="fixed bottom-0 right-0 px-8 py-2">
        {connections.length === 0 && device && device.status() == "ready" && (
          <div
            className="flex items-center justify-center gap-2 text-green-600 rounded-full p-4 m-2 shadow-[0_0_15px_5px_rgba(0,0,0,0.2)] hover:shadow-[0_0_20px_8px_rgba(0,0,0,0.25)] transition-shadow duration-300 cursor-pointer"
            onClick={() => {
              setShowDialPad(true);
            }}
          >
            <PhoneCall className="h-8 w-8" />
          </div>
        )}
      </div>

      {showDialPad && (
        <DialPad onDial={handleDial} onClose={() => setShowDialPad(false)} />
      )}
    </div>
  );
};

export default Call;
