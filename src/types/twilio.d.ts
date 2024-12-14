declare namespace Twilio {
  interface Device {
    connect: (params: { To: string }) => Connection;
    disconnectAll: () => void;
    on: (event: string, handler: (device?: Device) => void) => void;
  }

  interface Connection {
    on: (event: string, handler: () => void) => void;
    disconnect: () => void;
  }
}
