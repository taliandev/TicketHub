import React from 'react';

interface Brand {
  id: number;
  name: string;
  logo: string;
}

const BrandCarousel: React.FC = () => {
  const brands: Brand[] = [
    { id: 1, name: "Brand 1", logo: "https://t3.ftcdn.net/jpg/04/98/42/64/360_F_498426499_uCtXeEK9VwGDjNRYkVCoMZl1JfZth53n.jpg" },
    { id: 2, name: "Brand 2", logo: "https://static.vecteezy.com/system/resources/previews/018/791/246/non_2x/three-letter-cube-h-alphabet-letter-logo-icon-design-with-polygon-design-creative-template-for-company-and-business-vector.jpg" },
    { id: 3, name: "Brand 3", logo: "https://s3-ap-southeast-1.amazonaws.com/tm-public-file/trusted-logo-GVF.png?dxx" },
    { id: 4, name: "Brand 4", logo: "https://s3-ap-southeast-1.amazonaws.com/tm-public-file/trusted-logo-wdf.png?dxx" },
    { id: 5, name: "Brand 5", logo: "https://s3-ap-southeast-1.amazonaws.com/tm-public-file/trusted-logo-AEG.png?dxx" },
    { id: 6, name: "Brand 6", logo: "https://s3-ap-southeast-1.amazonaws.com/tm-public-file/trusted-logo-viji.png?dxx" },
  ];

  const slide1: Brand[] = brands.slice(0, 6); 
  const slide2: Brand[] = brands.slice(0, 6); 

  const slides: Brand[][] = [slide1, slide2];

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-r from-gray-100 to-gray-200 py-12">
      <div className="absolute inset-0 bg-gradient-to-r from-white/50 to-transparent pointer-events-none" />
      <div className="animate-scroll inline-flex whitespace-nowrap slide">
        {[...slides, ...slides].map((slide, slideIndex) => (
          <div key={slideIndex} className="inline-flex w-[1440px] px-[20px]">
            {slide.map((brand, index) => (
              <div 
                key={`${brand.id}-${index}`} 
                className="inline-flex flex-col items-center mx-8 group transition-all duration-300 hover:scale-105"
              >
                <div className="w-[180px] h-[180px] bg-white rounded-full shadow-lg flex items-center justify-center overflow-hidden p-4 transition-all duration-300 group-hover:shadow-xl group-hover:bg-gray-50">
                  <img 
                    src={brand.logo} 
                    alt={brand.name} 
                    className="max-w-full max-h-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300" 
                  />
                </div>
                <p className="text-sm font-medium text-gray-700 mt-4 text-center group-hover:text-gray-900 transition-colors duration-300">
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