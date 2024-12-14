import React from "react";
import { Phone, PhoneCall, Mic, PhoneOff } from "lucide-react";
import { Connection } from "twilio-client";

interface CallInfo {
  leadId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export default function CallBar({
  connection,
  callInfo,
}: {
  connection: Connection;
  callInfo: CallInfo;
}) {
  return (
    <div className="flex items-center gap-24 justify-between px-4 py-2 bg-white border-b text-sm rounded-lg shadow-lg shadow-gray-900/40">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-base">
          <span className="font-medium">Call with</span>
          <span className="text-blue-600 font-medium">
            {callInfo.firstName} {callInfo.lastName}
          </span>
        </div>
        <span className="text-gray-600">{callInfo.phoneNumber}</span>
        <button className="flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
          Show Caller Details
        </button>
      </div>
      {connection && connection.status() === Connection.State.Pending && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4">
            <button
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              onClick={() => connection.reject()}
            >
              <Phone className="h-4 w-4 rotate-[130deg]" />
              Decline
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
              onClick={() => connection.accept()}
            >
              <Phone className="h-4 w-4 rotate-[0deg]" />
              Accept
            </button>
          </div>
        </div>
      )}
      {connection && connection.status() === Connection.State.Connecting && (
        <div className="flex items-center gap-2 text-green-600">
          <PhoneCall className="h-5 w-5" />
          Connecting...
        </div>
      )}
      {connection && connection.status() === Connection.State.Ringing && (
        <div className="flex items-center gap-2 text-green-600">
          <PhoneCall className="h-5 w-5" />
          Ringing...
        </div>
      )}
      {connection && connection.status() === Connection.State.Open && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-green-600">
            <PhoneCall className="h-5 w-5" />
          </div>
          <div className="text-gray-600 font-medium">00:01</div>

          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <Mic className="h-5 w-5" />
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            onClick={() => connection.disconnect()}
          >
            <PhoneOff className="h-4 w-4" />
            Hang Up
          </button>
        </div>
      )}
    </div>
  );
}
