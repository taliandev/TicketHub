import React from 'react';

// Mock QR Code component (in real app, you'd use a QR code library)
const QRCode = ({ value, size = 100 }: { value: string; size?: number }) => (
  <div 
    className="bg-black flex items-center justify-center text-white text-xs font-mono border-2 border-black"
    style={{ width: size, height: size }}
  >
    <div className="text-center">
      <div className="text-[6px] leading-none">QR CODE</div>
      <div className="text-[4px] mt-1">{value.slice(-8)}</div>
    </div>
  </div>
);

interface UserTicket {
  _id: string;
  orderId: string;
  ticketId: string;
  userId: string;
  qrCodeData: string;
  used: boolean;
  checkInTime?: Date;
  seatNumber?: string;
  extraInfo: {
    eventTitle?: string;
    eventDate?: string;
    eventTime?: string;
    venue?: string;
    address?: string;
    customerName?: string;
    ticketType?: string;
    price?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface TicketUIProps {
  ticket: UserTicket;
}

// Export the component
const TicketUI: React.FC<TicketUIProps> = ({ ticket }) => {
  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '•');
  };

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
      <div className="flex">
        {/* Left sidebar with "TICKET TYPE" text */}
        <div className="bg-blue-700 w-20 flex items-center justify-center relative">
          <div 
            className="text-white text-sm font-bold tracking-wider"
            style={{
              writingMode: 'vertical-lr',
              textOrientation: 'mixed'
            }}
          >
            TICKET TYPE
          </div>
          {/* Decorative dots */}
          <div className="absolute right-0 flex flex-col space-y-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="w-1 h-1 bg-gray-300 rounded-full"></div>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-6">
          <div className="flex justify-between items-start">
            {/* Left content */}
            <div className="flex-1">
              {/* Title */}
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {ticket.extraInfo.eventTitle || 'Ticket Title'}
              </h2>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-6">
                {/* Name and Date */}
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Name</div>
                    <div className="bg-gray-100 px-3 py-2 rounded text-gray-800 font-medium">
                      {ticket.extraInfo.customerName || 'CUSTOMER NAME'}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Date</div>
                    <div className="bg-gray-100 px-3 py-2 rounded text-gray-800 font-medium">
                      {formatDate(ticket.extraInfo.eventDate)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Event Address */}
              <div className="mt-6">
                <div className="text-sm text-gray-600 mb-1">Event Address</div>
                <div className="bg-gray-100 px-3 py-2 rounded text-gray-800">
                  {ticket.extraInfo.address || 'Event Address, City, State ZIP'}
                </div>
              </div>

              {/* Additional info in smaller text */}
              <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500">
                {ticket.seatNumber && (
                  <span>Seat: {ticket.seatNumber}</span>
                )}
                {ticket.extraInfo.eventTime && (
                  <span>Time: {ticket.extraInfo.eventTime}</span>
                )}
                {ticket.extraInfo.ticketType && (
                  <span>Type: {ticket.extraInfo.ticketType}</span>
                )}
                {ticket.used && (
                  <span className="text-green-600 font-medium">✓ Used</span>
                )}
              </div>
            </div>

            {/* Right side - QR Code */}
            <div className="flex flex-col items-center ml-8">
              <div className="text-xs text-gray-500 mb-2">Scan to check in</div>
              <QRCode value={ticket.qrCodeData} size={100} />
              <div className="text-xs text-gray-500 mt-2 text-center">
                ID #{ticket.ticketId.slice(-10).toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom border with decorative elements */}
      <div className="border-t border-gray-200 h-1 bg-gray-50"></div>
    </div>
  );
};


export default TicketUI;
