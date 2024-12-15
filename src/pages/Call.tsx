/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import axios from "axios";
import React, { useEffect, useState } from "react";
import DialPad from "@/components/DialPad";
import CallBar from "@/components/CallBar";
import { parsePhoneNumberWithError } from "libphonenumber-js";
import { PhoneCall } from "lucide-react";

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
  [CallSid: string]: CallInfo;
}

const Call = () => {
  const [device, setDevice] = useState<any>(null);
  const [connections, setConnections] = React.useState<any[] | []>([]);
  const [callMapping, setCallMapping] = useState<CallMapping>({});
  const [logs, setLogs] = useState<string[]>([]);
  const [showDialPad, setShowDialPad] = useState<boolean>(false);

  const [aivioPhoneNumber, setAivioPhoneNumber] = useState<string>("");

  const addLog = (message: string): void => {
    setLogs((prev) => [...prev, message]);
  };

  const formatToE164 = (phoneNumber: string): string | null => {
    try {
      // Parse without region restriction
      const parsedNumber = parsePhoneNumberWithError(phoneNumber);

      if (!parsedNumber || !parsedNumber.isValid()) {
        return null;
      }

      return parsedNumber.format("E.164");
    } catch (error) {
      console.error("Phone number parsing error:", error);
      return null;
    }
  };

  const initializeTwilio = async () => {
    if (typeof window === "undefined") return;

    const { Device, Connection } = await import("twilio-client");
    try {
      const response = await axios.get(
        `https://api.twillio-call.aivio.io/token/${aivioPhoneNumber}`
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

      newDevice.on("connect", (conn: any) => {
        addLog("Connection successfully established." + " " + conn.parameters);
      });

      newDevice.on("disconnect", (conn: any) => {
        addLog("Call ended." + " " + conn.parameters.CallSid);
      });

      newDevice.on("incoming", (conn: any) => {
        console.log(conn.parameters);
        addLog("Incoming connection from " + " " + conn.parameters.From);

        conn.on("reject", () => {
          console.log("Incoming Call rejected.", conn.parameters);
          setConnections((prev) =>
            prev.filter(
              (conn) => conn.parameters.CallSid !== conn.parameters.CallSid
            )
          );
          setCallMapping((prev) => {
            const newMapping = { ...prev };
            delete newMapping[conn.parameters.CallSid];
            return newMapping;
          });
        });
        conn.on("cancel", () => {
          console.log("Incoming Call canceled.", conn.parameters);
          setConnections((prev) =>
            prev.filter(
              (conn) => conn.parameters.CallSid !== conn.parameters.CallSid
            )
          );
          setCallMapping((prev) => {
            const newMapping = { ...prev };
            delete newMapping[conn.parameters.CallSid];
            return newMapping;
          });
        });
        conn.on("disconnect", () => {
          console.log("Incoming Call disconnected.", conn.parameters);
          setConnections((prev) =>
            prev.filter(
              (conn) => conn.parameters.CallSid !== conn.parameters.CallSid
            )
          );
          setCallMapping((prev) => {
            const newMapping = { ...prev };
            delete newMapping[conn.parameters.CallSid];
            return newMapping;
          });
        });

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

      newDevice.on("offline", async (device: any) => {
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
    if (!device || !phoneNumber) return;

    const formattedNumber = formatToE164(phoneNumber);
    if (!formattedNumber) {
      addLog("Invalid phone number format. Please include country code.");
      return;
    }

    setShowDialPad(false);

    const outgoingConnection = device.connect({ To: phoneNumber });
    setConnections((prev: any[]) => [...prev, outgoingConnection]);

    outgoingConnection.on("accept", () => {
      console.log("Outgoing Call accepted.", outgoingConnection.parameters);
      const CallSid = outgoingConnection.parameters.CallSid;

      setCallMapping((prev) => ({
        ...prev,
        [CallSid]: {
          leadId: "12345",
          firstName: "John",
          lastName: "Doe",
          phoneNumber: phoneNumber,
        },
      }));
    });

    outgoingConnection.on("disconnect", (conn: any) => {
      console.log("Outgoing Call disconnected.", conn.parameters);
      setConnections((prev) =>
        prev.filter(
          (connection) =>
            connection.parameters.CallSid !== conn.parameters.CallSid
        )
      );
    });

    outgoingConnection.on("closed", (conn: any) => {
      console.log("Outgoing Call closed.", conn.parameters);
      setConnections((prev) =>
        prev.filter(
          (connection) =>
            connection.parameters.CallSid !== conn.parameters.CallSid
        )
      );
    });

    outgoingConnection.on("cancel", (conn: any) => {
      console.log("Outgoing Call canceled.", conn.parameters);
      setConnections((prev) =>
        prev.filter(
          (connection) =>
            connection.parameters.CallSid !== conn.parameters.CallSid
        )
      );
    });

    outgoingConnection.on("ringing", (conn: any) => {
      console.log("Outgoing Call ringing.", conn.parameters);
    });
  };

  useEffect(() => {
    console.log("callMapping", callMapping);
    console.log("connections", connections);
  }, [callMapping, connections]);

  const refreshToken = async () => {
    try {
      const response = await axios.get(
        `https://api.twillio-call.aivio.io/token/${aivioPhoneNumber}`
      );
      const data: TokenResponse = response.data;
      addLog("Fetching refreshed token successfully");
      return data.token;
    } catch (err) {
      addLog("Failed to fetch refreshed access token: " + err);
    }
  };

  return (
    <div className="container">
      <div className="card text-center log-container">
        <div className="flex gap-4">
          <input
            id="FromPhoneNumber"
            type="tel"
            value={aivioPhoneNumber}
            onChange={(e) => setAivioPhoneNumber(e.target.value)}
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
      {connections.length > 0 &&
        connections.map((connection, index) => (
          <div key={index} className="fixed bottom-0 right-24 px-8 py-2">
            {callMapping[connection.parameters.CallSid] && (
              <CallBar
                state={connection.status()}
                callInfo={callMapping[connection.parameters.CallSid]}
                reject={() => connection.reject()}
                accept={() => connection.accept()}
                disconnect={() => connection.disconnect()}
              />
            )}
          </div>
        ))}
      <div className="fixed bottom-0 right-0 px-8 py-2">
        {device &&
          (device.status() == "ready" || device.status() == "busy") && (
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
