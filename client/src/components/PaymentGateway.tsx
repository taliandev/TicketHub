import React, { useState } from 'react';
import axiosInstance from '@/lib/axios';

interface PaymentGatewayProps {
  amount: number;
  ticketId: string;
  reservationId?: string;
  onSuccess: () => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

interface BankInfo {
  name: string;
  accountNumber: string;
  accountName: string;
  qrCode?: string;
}

const PaymentGateway: React.FC<PaymentGatewayProps> = ({
  amount,
  ticketId,
  reservationId,
  onSuccess,
  onError,
  onCancel
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [paymentUrl, setPaymentUrl] = useState<string>('');
  const [transactionId, setTransactionId] = useState<string>('');

  const bankAccounts: BankInfo[] = [
    {
      name: 'Vietcombank',
      accountNumber: '1234567890',
      accountName: 'CONG TY TICKETHUB',
      qrCode: '/qr-codes/vietcombank-qr.png'
    },
    {
      name: 'BIDV',
      accountNumber: '9876543210',
      accountName: 'CONG TY TICKETHUB',
      qrCode: '/qr-codes/bidv-qr.png'
    },
    {
      name: 'Techcombank',
      accountNumber: '1122334455',
      accountName: 'CONG TY TICKETHUB',
      qrCode: '/qr-codes/techcombank-qr.png'
    }
  ];

  const handlePaymentMethodSelect = async (method: string) => {
    setSelectedMethod(method);
    setLoading(true);

    try {
      switch (method) {
        case 'credit_card': {
          // Tạo thanh toán Credit Card
          const creditCardResponse = await axiosInstance.post('/api/payments/credit-card', {
            amount,
            ticketId,
            returnUrl: `${window.location.origin}/payment-success`
          });
          setPaymentUrl(creditCardResponse.data.paymentUrl);
          setTransactionId(creditCardResponse.data.transactionId);
          break;
        }

        case 'COD': {
          // Tạo thanh toán COD
          const codResponse = await axiosInstance.post('/api/payments/cod', {
            amount,
            ticketId,
            returnUrl: `${window.location.origin}/payment-success`
          });
          setPaymentUrl(codResponse.data.paymentUrl);
          setTransactionId(codResponse.data.transactionId);
          break;
        }
        
        case 'bank_transfer': {
          // Tạo thông tin chuyển khoản
          setTransactionId(`TXN-${Date.now()}`);
          break;
        }
        
        case 'qr_code': {
          // Tạo QR code thanh toán
          const qrResponse = await axiosInstance.post('/api/payments/create-qr', {
            amount,
            ticketId,
            description: `Thanh toan ve su kien - ${ticketId}`,
            reservationId,
          });
          setQrCodeUrl(qrResponse.data.qrCodeUrl);
          setTransactionId(qrResponse.data.transactionId);
          break;
        }
        
        case 'momo': {
          // Tạo thanh toán Momo
          const momoResponse = await axiosInstance.post('/api/payments/momo', {
            amount,
            ticketId,
            returnUrl: `${window.location.origin}/payment-success`,
            reservationId,
          });
          setPaymentUrl(momoResponse.data.payUrl);
          setTransactionId(momoResponse.data.transactionId);
          break;
        }
        
        case 'vnpay': {
          // Tạo thanh toán VNPay
          const vnpayResponse = await axiosInstance.post('/api/payments/vnpay', {
            amount,
            ticketId,
            returnUrl: `${window.location.origin}/payment-success`,
            reservationId,
          });
          setPaymentUrl(vnpayResponse.data.paymentUrl);
          setTransactionId(vnpayResponse.data.transactionId);
          break;
        }
      }
    } catch (error) {
      onError('Không thể khởi tạo thanh toán. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleBankTransfer = () => {
    // Copy thông tin tài khoản
    const bankInfo = bankAccounts[0]; // Mặc định Vietcombank
    const transferInfo = `Ngân hàng: ${bankInfo.name}\nSố tài khoản: ${bankInfo.accountNumber}\nTên tài khoản: ${bankInfo.accountName}\nNội dung: ${transactionId}`;
    
    navigator.clipboard.writeText(transferInfo).then(() => {
      alert('Đã copy thông tin chuyển khoản vào clipboard!');
    });
  };

  const checkPaymentStatus = async () => {
    if (!transactionId) return;
    
    try {
      const response = await axiosInstance.get(`/api/payments/status/${transactionId}`);
      if (response.data.status === 'paid') {
        onSuccess();
      } else {
        alert('Thanh toán chưa hoàn tất. Vui lòng thử lại sau.');
      }
    } catch (error) {
      onError('Không thể kiểm tra trạng thái thanh toán.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Chọn phương thức thanh toán</h2>
      
      <div className="mb-6">
        <div className="text-center mb-4">
          <div className="text-3xl font-bold text-blue-600">
            {amount.toLocaleString()} đ
          </div>
          <div className="text-gray-600">Số tiền cần thanh toán</div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Bank Transfer */}
        <button
          onClick={() => handlePaymentMethodSelect('bank_transfer')}
          className={`p-4 border rounded-lg text-left transition-colors ${
            selectedMethod === 'bank_transfer' 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div>
              <div className="font-semibold">Chuyển khoản ngân hàng</div>
              <div className="text-sm text-gray-600">Chuyển khoản trực tiếp</div>
            </div>
          </div>
        </button>

        {/* QR Code */}
        <button
          onClick={() => handlePaymentMethodSelect('qr_code')}
          className={`p-4 border rounded-lg text-left transition-colors ${
            selectedMethod === 'qr_code' 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z" />
              </svg>
            </div>
            <div>
              <div className="font-semibold">Quét mã QR</div>
              <div className="text-sm text-gray-600">Thanh toán nhanh</div>
            </div>
          </div>
        </button>

        {/* Momo */}
        <button
          onClick={() => handlePaymentMethodSelect('momo')}
          className={`p-4 border rounded-lg text-left transition-colors ${
            selectedMethod === 'momo' 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center">
            <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-pink-600 font-bold text-sm">M</span>
            </div>
            <div>
              <div className="font-semibold">Ví MoMo</div>
              <div className="text-sm text-gray-600">Thanh toán qua ví điện tử</div>
            </div>
          </div>
        </button>

        {/* VNPay */}
        <button
          onClick={() => handlePaymentMethodSelect('vnpay')}
          className={`p-4 border rounded-lg text-left transition-colors ${
            selectedMethod === 'vnpay' 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-blue-600 font-bold text-xs">VN</span>
            </div>
            <div>
              <div className="font-semibold">VNPay</div>
              <div className="text-sm text-gray-600">Cổng thanh toán VNPay</div>
            </div>
          </div>
        </button>
      </div>

      {/* Payment Details */}
      {selectedMethod && (
        <div className="border-t pt-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Đang khởi tạo thanh toán...</p>
            </div>
          ) : (
            <div>
              {selectedMethod === 'bank_transfer' && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Thông tin chuyển khoản</h3>
                  <div className="space-y-3">
                    {bankAccounts.map((bank, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="font-medium text-lg mb-2">{bank.name}</div>
                        <div className="space-y-1 text-sm">
                          <div><span className="font-medium">Số tài khoản:</span> {bank.accountNumber}</div>
                          <div><span className="font-medium">Tên tài khoản:</span> {bank.accountName}</div>
                          <div><span className="font-medium">Nội dung:</span> <span className="bg-yellow-100 px-2 py-1 rounded">{transactionId}</span></div>
                        </div>
                        {bank.qrCode && (
                          <div className="mt-3">
                            <img src={bank.qrCode} alt={`QR ${bank.name}`} className="w-32 h-32 mx-auto" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={handleBankTransfer}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Copy thông tin
                    </button>
                    <button
                      onClick={checkPaymentStatus}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Kiểm tra thanh toán
                    </button>
                  </div>
                </div>
              )}

              {selectedMethod === 'qr_code' && qrCodeUrl && (
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <h3 className="text-lg font-semibold mb-4">Quét mã QR để thanh toán</h3>
                  <div className="bg-white p-4 rounded-lg inline-block">
                    <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-3">Mã giao dịch: {transactionId}</p>
                    <button
                      onClick={checkPaymentStatus}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Kiểm tra thanh toán
                    </button>
                  </div>
                </div>
              )}

              {(selectedMethod === 'momo' || selectedMethod === 'vnpay') && paymentUrl && (
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <h3 className="text-lg font-semibold mb-4">Chuyển hướng đến trang thanh toán</h3>
                  <p className="text-gray-600 mb-4">Bạn sẽ được chuyển hướng đến trang thanh toán an toàn.</p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => window.open(paymentUrl, '_blank')}
                      className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                    >
                      Tiếp tục thanh toán
                    </button>
                    <button
                      onClick={checkPaymentStatus}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Kiểm tra trạng thái
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={onCancel}
          className="flex-1 py-2 px-4 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
        >
          Hủy
        </button>
        {selectedMethod && !loading && (
          <button
            onClick={() => checkPaymentStatus()}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Kiểm tra thanh toán
          </button>
        )}
      </div>
    </div>
  );
};

export default PaymentGateway; 