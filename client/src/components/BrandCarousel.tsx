import React from 'react';

interface Brand {
  id: number;
  name: string;
  logo: string;
}

const BrandCarousel: React.FC = () => {
  const brands: Brand[] = [
    { id: 1, name: "Brand 1", logo: "https://t3.ftcdn.net/jpg/04/98/42/64/360_F_498426499_uCtXeEK9VwGDjNRYkVCoMZl1JfZth53n.jpg" },
    { id: 2, name: "Brand 2", logo: "https://placehold.co/200x200/1a1a1a/a855f7?text=Brand+2" },
    { id: 3, name: "Brand 3", logo: "https://s3-ap-southeast-1.amazonaws.com/tm-public-file/trusted-logo-GVF.png?dxx" },
    { id: 4, name: "Brand 4", logo: "https://s3-ap-southeast-1.amazonaws.com/tm-public-file/trusted-logo-wdf.png?dxx" },
    { id: 5, name: "Brand 5", logo: "https://s3-ap-southeast-1.amazonaws.com/tm-public-file/trusted-logo-AEG.png?dxx" },
    { id: 6, name: "Brand 6", logo: "https://s3-ap-southeast-1.amazonaws.com/tm-public-file/trusted-logo-viji.png?dxx" },
  ];

  const slide1: Brand[] = brands.slice(0, 6); 
  const slide2: Brand[] = brands.slice(0, 6); 

  const slides: Brand[][] = [slide1, slide2];

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-r from-gray-900 via-black to-gray-900 py-16 border-y border-purple-500/10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.05)_0%,transparent_70%)]" />
      <div className="animate-scroll inline-flex whitespace-nowrap slide">
        {[...slides, ...slides].map((slide, slideIndex) => (
          <div key={slideIndex} className="inline-flex w-[1440px] px-[20px]">
            {slide.map((brand, index) => (
              <div 
                key={`${brand.id}-${index}`} 
                className="inline-flex flex-col items-center mx-8 group transition-all duration-300 hover:scale-105"
              >
                <div className="w-[180px] h-[180px] bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-purple-500/20 shadow-lg flex items-center justify-center overflow-hidden p-6 transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] group-hover:border-purple-500/40 group-hover:bg-gray-800/70">
                  <img 
                    src={brand.logo} 
                    alt={brand.name} 
                    className="max-w-full max-h-full object-contain filter brightness-75 group-hover:brightness-100 transition-all duration-300" 
                  />
                </div>
                <p className="text-sm font-medium text-gray-500 mt-4 text-center group-hover:text-purple-400 transition-colors duration-300">
                  {brand.name}
                </p>
              </div>
            ))}
          </div>
        ))}
      </div>
      <style>
        {`
          @keyframes slideAnimation {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .slide {
            display: inline-flex;
            animation: slideAnimation 40s linear infinite;
          }
      
          @media (max-width: 768px) {
            .slide {
              animation-duration: 30s;
            }
          }
        `}
      </style>
    </div>
  );
};

export default BrandCarousel; 