import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Khám phá sự kiện
                <span className="block text-yellow-300">tuyệt vời</span>
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                Đặt vé sự kiện nhanh chóng, an toàn và tiện lợi. Hàng nghìn sự kiện đang chờ bạn khám phá.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/events"
                  className="bg-yellow-400 text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-yellow-300 transition-colors text-center"
                >
                  Khám phá sự kiện
                </Link>
                <Link 
                  href="/register"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors text-center"
                >
                  Tạo sự kiện
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/20 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold">1000+</div>
                    <div className="text-sm">Sự kiện</div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold">50K+</div>
                    <div className="text-sm">Người tham gia</div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold">99%</div>
                    <div className="text-sm">Hài lòng</div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold">24/7</div>
                    <div className="text-sm">Hỗ trợ</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tại sao chọn TicketHub?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Nền tảng bán vé sự kiện hàng đầu với những tính năng vượt trội
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">An toàn tuyệt đối</h3>
              <p className="text-gray-600">Thanh toán bảo mật, vé điện tử an toàn với QR code</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Nhanh chóng</h3>
              <p className="text-gray-600">Đặt vé chỉ trong vài giây, nhận vé ngay lập tức</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Hỗ trợ 24/7</h3>
              <p className="text-gray-600">Đội ngũ hỗ trợ chuyên nghiệp sẵn sàng giúp đỡ</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Khám phá theo danh mục
            </h2>
            <p className="text-xl text-gray-600">
              Tìm sự kiện phù hợp với sở thích của bạn
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: 'Âm nhạc', icon: '🎵', color: 'bg-red-500' },
              { name: 'Công nghệ', icon: '💻', color: 'bg-blue-500' },
              { name: 'Thể thao', icon: '⚽', color: 'bg-green-500' },
              { name: 'Giải trí', icon: '🎭', color: 'bg-purple-500' },
              { name: 'Kinh doanh', icon: '💼', color: 'bg-yellow-500' },
              { name: 'Ẩm thực', icon: '🍕', color: 'bg-orange-500' },
            ].map((category) => (
              <Link 
                key={category.name}
                href={`/events?category=${category.name}`}
                className="group"
              >
                <div className={`${category.color} rounded-lg p-6 text-center text-white hover:scale-105 transition-transform`}>
                  <div className="text-3xl mb-2">{category.icon}</div>
                  <div className="font-semibold">{category.name}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Sẵn sàng tạo sự kiện của riêng bạn?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Tham gia cùng hàng nghìn người tổ chức sự kiện thành công trên TicketHub
          </p>
          <Link 
            href="/register"
            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors inline-block"
          >
            Bắt đầu ngay
          </Link>
        </div>
      </section>
    </div>
  );
}
