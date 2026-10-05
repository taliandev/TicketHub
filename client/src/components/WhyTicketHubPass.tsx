import React, { useState, useEffect } from 'react';
import { 
  Ticket, 
  CheckCircle2, 
  CreditCard, 
  QrCode, 
  Clock, 
  Shield,
  Zap
} from 'lucide-react';

const WhyTicketHubPass: React.FC = () => {
  const [countdown, setCountdown] = useState(582); // 09:42
  const [qrRefresh, setQrRefresh] = useState(15);

  // Countdown timer for seat reservation
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // QR refresh countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setQrRefresh((prev) => (prev > 0 ? prev - 1 : 15));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}s`;
  };

  return (
    <section className="relative py-8 md:py-12 lg:py-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-black" />
      <div className="absolute inset-0 opacity-20">
        <div 
          className="w-full h-full" 
          style={{
            backgroundImage: `
              linear-gradient(rgba(63, 63, 70, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(63, 63, 70, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      <div className="relative container mx-auto px-4">
        {/* Section Title */}
        <div className="text-center mb-6 md:mb-10 lg:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-3 md:mb-4">
            <Shield className="w-3 h-3 md:w-4 md:h-4 text-emerald-400" />
            <span className="text-[10px] md:text-xs font-mono font-bold text-emerald-400 tracking-wider">VERIFIED PLATFORM</span>
          </div>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 mb-2 md:mb-4">
            TẠI SAO CHỌN TICKETHUB?
          </h2>
          <p className="text-gray-400 text-sm md:text-base lg:text-lg max-w-2xl mx-auto px-4">
            Công nghệ vé điện tử thế hệ mới
          </p>
        </div>

        {/* Ticket Pass Container */}
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-zinc-950 border border-zinc-800 rounded-xl md:rounded-2xl overflow-hidden shadow-2xl">
            {/* Grid Background Pattern */}
            <div 
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px'
              }}
            />

            {/* Header: Pass ID & Badge */}
            <div className="relative flex items-center justify-between px-4 py-3 md:px-6 md:py-4 border-b border-zinc-800">
              <div className="flex items-center gap-1.5 md:gap-2">
                <Ticket className="w-4 h-4 md:w-5 md:h-5 text-cyan-400" />
                <span className="font-mono text-[10px] md:text-sm lg:text-base text-zinc-400 tracking-wider">
                  PASS <span className="text-cyan-400">#TK-9482</span>
                </span>
              </div>
              <div className="px-2 py-1 md:px-3 md:py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-1 md:gap-1.5">
                <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[9px] md:text-xs font-mono font-bold text-emerald-400 tracking-wider">
                  AUTHENTIC
                </span>
              </div>
            </div>

            {/* Item 01: Dễ dàng đặt vé */}
            <div className="relative">
              {/* Notch decorations - Hidden on mobile */}
              <div className="hidden md:block absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black border-r border-zinc-800" />
              <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black border-l border-zinc-800" />
              
              <div className="px-4 py-4 md:px-6 md:py-6">
                <div className="flex items-start gap-3 md:gap-4">
                  {/* Number Badge */}
                  <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
                    <span className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-blue-400">
                      01
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-base md:text-xl lg:text-2xl font-bold text-white">
                        Dễ dàng đặt vé
                      </h3>
                      <span className="flex-shrink-0 px-2 py-0.5 md:px-2.5 md:py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-[9px] md:text-xs font-mono font-bold border border-emerald-500/30 whitespace-nowrap">
                        SẴN SÀNG
                      </span>
                    </div>
                    
                    <p className="text-xs md:text-sm lg:text-base text-zinc-400 mb-3 md:mb-4 leading-relaxed">
                      Sơ đồ chỗ ngồi 3D, tự động giữ chỗ
                    </p>

                    {/* Seat Info Widget - Responsive */}
                    <div className="inline-flex items-center gap-2 md:gap-3 px-3 py-2 md:px-4 md:py-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800">
                      <div className="flex items-center gap-1.5 md:gap-2">
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-400" />
                        <span className="font-mono text-[10px] md:text-sm text-zinc-300 font-medium">
                          <span className="hidden sm:inline">ZONE VIP • ROW A • </span>SEAT 12
                        </span>
                      </div>
                      <div className="w-px h-3 md:h-4 bg-zinc-700" />
                      <div className="flex items-center gap-1 md:gap-1.5">
                        <Clock className="w-3 h-3 md:w-3.5 md:h-3.5 text-amber-400" />
                        <span className="font-mono text-[10px] md:text-sm text-amber-400 font-bold tabular-nums">
                          {formatTime(countdown)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-b border-dashed border-zinc-800" />
            </div>

            {/* Item 02: Thanh toán linh hoạt */}
            <div className="relative">
              {/* Notch decorations - Hidden on mobile */}
              <div className="hidden md:block absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black border-r border-zinc-800" />
              <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black border-l border-zinc-800" />
              
              <div className="px-4 py-4 md:px-6 md:py-6">
                <div className="flex items-start gap-3 md:gap-4">
                  {/* Number Badge */}
                  <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30 flex items-center justify-center">
                    <span className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-violet-400 to-fuchsia-400">
                      02
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-base md:text-xl lg:text-2xl font-bold text-white">
                        Thanh toán linh hoạt
                      </h3>
                      <span className="flex-shrink-0 px-2 py-0.5 md:px-2.5 md:py-1 rounded-md bg-zinc-800/80 text-zinc-300 text-[9px] md:text-xs font-mono font-bold border border-zinc-700 whitespace-nowrap">
                        0% PHÍ
                      </span>
                    </div>
                    
                    <p className="text-xs md:text-sm lg:text-base text-zinc-400 mb-3 md:mb-4 leading-relaxed">
                      <span className="hidden md:inline">Khớp lệnh tức thì, </span>Bảng giá minh bạch
                    </p>

                    {/* Payment Methods - Responsive Grid */}
                    <div className="grid grid-cols-2 md:flex md:flex-wrap gap-1.5 md:gap-2">
                      <div className="px-2 py-1.5 md:px-3 md:py-2 rounded-lg bg-zinc-900/80 border border-zinc-800 flex items-center justify-center md:justify-start gap-1.5 md:gap-2">
                        <CreditCard className="w-3 h-3 md:w-4 md:h-4 text-blue-400 flex-shrink-0" />
                        <span className="text-xs md:text-sm font-semibold text-white">VietQR</span>
                        <CheckCircle2 className="hidden md:block w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      
                      <div className="px-2 py-1.5 md:px-3 md:py-2 rounded-lg bg-zinc-900/80 border border-zinc-800 flex items-center justify-center md:justify-start gap-1.5 md:gap-2">
                        <div className="w-3 h-3 md:w-4 md:h-4 rounded bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center text-[8px] md:text-[10px] font-bold text-white flex-shrink-0">
                          M
                        </div>
                        <span className="text-xs md:text-sm font-semibold text-pink-400">MoMo</span>
                        <CheckCircle2 className="hidden md:block w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      
                      <div className="px-2 py-1.5 md:px-3 md:py-2 rounded-lg bg-zinc-900/80 border border-zinc-800 flex items-center justify-center md:justify-start gap-1.5 md:gap-2">
                        <div className="w-3 h-3 md:w-4 md:h-4 rounded bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-[8px] md:text-[10px] font-bold text-white flex-shrink-0">
                          V
                        </div>
                        <span className="text-xs md:text-sm font-semibold text-cyan-400">VNPay</span>
                        <CheckCircle2 className="hidden md:block w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      
                      <div className="px-2 py-1.5 md:px-3 md:py-2 rounded-lg bg-zinc-900/80 border border-zinc-800 flex items-center justify-center md:justify-start gap-1.5 md:gap-2">
                        <CreditCard className="w-3 h-3 md:w-4 md:h-4 text-zinc-400 flex-shrink-0" />
                        <span className="text-xs md:text-sm font-semibold text-zinc-400">Visa</span>
                        <span className="hidden md:inline text-xs text-zinc-600 font-mono">QT</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-b border-dashed border-zinc-800" />
            </div>

            {/* Item 03: Check-in thông minh */}
            <div className="relative">
              {/* Notch decorations - Hidden on mobile */}
              <div className="hidden md:block absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black border-r border-zinc-800" />
              <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black border-l border-zinc-800" />
              
              <div className="px-4 py-4 md:px-6 md:py-6">
                <div className="flex items-start gap-3 md:gap-4">
                  {/* Number Badge */}
                  <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-500/30 flex items-center justify-center">
                    <span className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-green-400">
                      03
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-base md:text-xl lg:text-2xl font-bold text-white">
                        Check-in thông minh
                      </h3>
                      <span className="flex-shrink-0 px-2 py-0.5 md:px-2.5 md:py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-[9px] md:text-xs font-mono font-bold border border-emerald-500/30 whitespace-nowrap flex items-center gap-1 md:gap-1.5">
                        <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        LIVE
                      </span>
                    </div>
                    
                    <p className="text-xs md:text-sm lg:text-base text-zinc-400 mb-3 md:mb-4 leading-relaxed">
                      Quét 1s qua turnstile<span className="hidden md:inline">, vô hiệu hóa ảnh chụp</span>
                    </p>

                    {/* GatePass QR Card - Compact on mobile */}
                    <div className="relative overflow-hidden rounded-lg md:rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 p-3 md:p-4">
                      <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-emerald-500/5 rounded-full blur-3xl" />
                      
                      <div className="relative flex items-center gap-3 md:gap-4">
                        {/* QR Icon */}
                        <div className="flex-shrink-0 w-10 h-10 md:w-14 md:h-14 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                          <QrCode className="w-5 h-5 md:w-8 md:h-8 text-cyan-400" />
                        </div>

                        {/* QR Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm md:text-base font-bold text-white">GatePass QR</span>
                            <span className="px-1.5 py-0.5 md:px-2 md:py-0.5 rounded bg-zinc-800/80 text-zinc-400 text-[9px] md:text-[10px] font-mono border border-zinc-700">
                              SHA-256
                            </span>
                          </div>
                          <div className="flex items-center gap-1 md:gap-1.5 flex-wrap">
                            <Zap className="w-2.5 h-2.5 md:w-3 md:h-3 text-cyan-400 flex-shrink-0" />
                            <span className="text-[10px] md:text-xs text-cyan-400 font-mono">
                              Đổi sau {qrRefresh}s
                            </span>
                            <span className="hidden md:inline text-xs text-zinc-600">•</span>
                            <span className="hidden md:inline text-xs text-emerald-400 font-mono font-bold uppercase">
                              Chống chụp màn hình
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer: Barcode */}
            <div className="relative px-4 py-4 md:px-6 md:py-6 border-t border-zinc-800 bg-zinc-950/50">
              <div className="flex flex-col items-center gap-2 md:gap-3">
                {/* Barcode Visual - Smaller on mobile */}
                <div className="flex items-center justify-center gap-[1.5px] md:gap-[2px] opacity-30">
                  {[4, 2, 6, 2, 4, 2, 6, 3, 2, 4, 2, 6, 2, 4, 3, 2, 6, 2, 4].map((height, idx) => (
                    <div 
                      key={idx} 
                      className="bg-white" 
                      style={{ 
                        width: window.innerWidth < 768 ? '2px' : '3px', 
                        height: `${height * (window.innerWidth < 768 ? 3 : 4)}px` 
                      }} 
                    />
                  ))}
                </div>
                
                {/* Barcode Number */}
                <span className="font-mono text-[10px] md:text-xs text-zinc-600 tracking-widest">
                  TH-8829-0012-VN
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA - Hidden on mobile */}
        <div className="hidden md:block text-center mt-12">
          <p className="text-sm text-zinc-500 mb-4">
            Được tin tưởng bởi hơn 100,000+ người dùng
          </p>
          <div className="flex items-center justify-center gap-2">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div 
                  key={i} 
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 border-2 border-zinc-950"
                />
              ))}
            </div>
            <span className="text-xs text-zinc-600">và nhiều hơn nữa...</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyTicketHubPass;
