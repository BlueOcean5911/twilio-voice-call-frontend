/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Phone, PhoneCall, Mic, PhoneOff } from "lucide-react";

interface CallInfo {
  leadId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export default function CallBar({
  state,
  callInfo,
  disconnect,
  accept,
  reject,
}: {
  state: string;
  callInfo: CallInfo;
  disconnect: () => void;
  accept: () => void;
  reject: () => void;
}) {
  const [duration, setDuration] = useState<string>("00:00");

  useEffect(() => {
    let intervalId;

    if (state === "open") {
      let ms = 0;
      let sec = 0;
      let min = 0;

      const timer = () => {
        ms++;
        if (ms >= 100) {
          sec++;
          ms = 0;
        }
        if (sec === 60) {
          min++;
          sec = 0;
        }
        if (min === 60) {
          ms = 0;
          sec = 0;
          min = 0;
        }

        const seconds = sec < 10 ? `0${sec}` : sec;
        const minutes = min < 10 ? `0${min}` : min;
        setDuration(`${minutes}:${seconds}`);
      };

      const timeInterval = setInterval(timer, 10);
      return () => {
        if (intervalId) {
          clearInterval(timeInterval);
        }
      };
    }
  }, [state]);

  return (
    <div className="flex flex-col lg:flex-row items-end lg:items-center gap-2 lg:gap-24 justify-between px-4 py-2 bg-white border-b text-sm rounded-lg shadow-lg shadow-gray-900/40">
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
      {state === "pending" && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4">
            <button
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              onClick={() => reject()}
            >
              <Phone className="h-4 w-4 rotate-[130deg]" />
              Decline
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
              onClick={() => accept()}
            >
              <Phone className="h-4 w-4 rotate-[0deg]" />
              Accept
            </button>
          </div>
        </div>
      )}
      {state === "connecting" && (
        <div className="flex items-center gap-2 text-green-600">
          <PhoneCall className="h-5 w-5" />
          Connecting...
        </div>
      )}
      {state === "ringing" && (
        <div className="flex items-center gap-2 text-green-600">
          <PhoneCall className="h-5 w-5" />
          Ringing...
        </div>
      )}
      {state === "open" && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-green-600">
            <PhoneCall className="h-5 w-5" />
          </div>
          {/* <div className="text-gray-600 font-medium">{duration}</div> */}
          <div className="text-gray-600 font-medium">{duration}</div>

          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <Mic className="h-5 w-5" />
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            onClick={() => disconnect()}
          >
            <PhoneOff className="h-4 w-4" />
            Hang Up
          </button>
        </div>
      )}
    </div>
  );
}
