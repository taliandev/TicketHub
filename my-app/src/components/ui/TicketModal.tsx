import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface TicketModalProps {
  open: boolean;
  onClose: () => void;
  ticket: {
    type: string;
    eventTitle: string;
    eventDate: string;
    eventAddress: string;
    name: string;
    ticketCode: string;
    qrCode: string;
  };
}

const TicketModal: React.FC<TicketModalProps> = ({ open, onClose, ticket }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && ticket.qrCode) {
      QRCode.toCanvas(canvasRef.current, ticket.qrCode, {
        width: 120,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
    }
  }, [ticket.qrCode]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-[#f8fafd] rounded-lg shadow-lg w-full max-w-3xl p-8 relative flex flex-col md:flex-row animate-fadeIn">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        {/* Left: Ticket Info */}
        <div className="flex-1 flex flex-col justify-between">
          <div className="flex">
            <div className="bg-[#3b548c] text-white flex flex-col justify-center items-center px-6 py-8 rounded-l-lg min-w-[100px]">
              <span className="text-lg tracking-widest" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', letterSpacing: '0.2em' }}>{ticket.type}</span>
            </div>
            <div className="flex-1 pl-8 pt-4">
              <h2 className="text-3xl font-bold mb-6">{ticket.eventTitle}</h2>
              <div className="flex gap-8 mb-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Name</div>
                  <div className="bg-[#e6eef3] px-4 py-2 text-xl font-mono font-bold rounded">{ticket.name}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Date</div>
                  <div className="bg-[#e6eef3] px-4 py-2 text-xl font-mono font-bold rounded">{ticket.eventDate}</div>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Event Address</div>
                <div className="bg-[#e6eef3] px-4 py-2 text-lg font-mono rounded">{ticket.eventAddress}</div>
              </div>
            </div>
          </div>
        </div>
        {/* Right: QR code */}
        <div className="flex flex-col items-center justify-center px-8 pt-4">
          <div className="text-xs text-gray-500 mb-2">Scan to check in</div>
          <canvas ref={canvasRef} className="w-[120px] h-[120px]" />
          <div className="mt-2 text-center text-xs text-gray-700 font-mono">
            ID {ticket.ticketCode}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease; }
      `}</style>
    </div>
  );
};

export default TicketModal; 