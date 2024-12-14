interface IncomingCallModalProps {
  phoneNumber: string;
  onAccept: () => void;
  onReject: () => void;
}

const IncomingCallModal: React.FC<IncomingCallModalProps> = ({
  phoneNumber,
  onAccept,
  onReject,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4">Incoming Call</h3>
          <p className="text-gray-600 mb-6">
            Call from: <span className="font-medium">{phoneNumber}</span>
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={onReject}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full"
            >
              Reject
            </button>
            <button
              onClick={onAccept}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;
