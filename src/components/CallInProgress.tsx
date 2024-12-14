import React, { useState, useEffect } from "react";
import { PhoneIcon } from "@heroicons/react/24/solid";

interface CallInProgressProps {
  phoneNumber: string;
  onHangUp: () => void;
}

const CallInProgress: React.FC<CallInProgressProps> = ({
  phoneNumber,
  onHangUp,
}) => {
  const [duration, setDuration] = useState<string>("00:00");

  useEffect(() => {
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

    return () => clearInterval(timeInterval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
        <div className="p-4 border-b">
          <div className="text-2xl font-semibold text-center">{duration}</div>
        </div>

        <div className="p-6">
          <div className="text-center">
            <h4 className="text-xl font-medium">{phoneNumber}</h4>
          </div>
        </div>

        <div className="p-4 flex justify-center">
          <button
            className="w-16 h-16 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center"
            onClick={onHangUp}
          >
            <PhoneIcon className="w-8 h-8 text-red-600 rotate-[135deg]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallInProgress;
