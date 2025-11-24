import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  img: string;
  views: number;
}

const BannerSlider = ({ events }: { events: Event[] }) => {
  const settings = {
    dots: true,
    customPaging: () => (
      <div
        style={{
          width: '35px',
          height: '3px',
          background: 'rgba(255,255,255,0.7)',
          margin: '0 6px',
          borderRadius: '3px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          transition: 'background 0.3s',
        }}
      />
    ),
    appendDots: dots => (
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: '10px',
          display: 'flex',
          justifyContent: 'center',
          zIndex: 20,
          pointerEvents: 'none'
        }}
      >
        <div style={{ display: 'flex', gap: 8, pointerEvents: 'auto' }}>{dots}</div>
      </div>
    ),
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
  };

  return (
    <div className="mb-8 relative">
      <Slider {...settings}>
        {events.map(event => (
          <div key={event._id} className="relative h-[350px] md:h-[400px] rounded-lg overflow-hidden">
            <img
              src={event.img}
              alt={event.title}
              className="w-full h-full object-cover"
              style={{ filter: "brightness(0.6)" }}
            />
            <div className="absolute inset-0 flex flex-col justify-center items-end pr-12 text-right">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">{event.title}</h2>
              <p className="text-white mb-4 max-w-md">{event.description}</p>
              <Link to={`/events/${event._id}`}>
                <button className="bg-blue-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-600 transition">
                  View More
                </button>
              </Link>
            </div>
          </div>
        ))}
      </Slider>
      <style jsx>{`
        /* Tùy chỉnh nút mũi tên */
        .slick-prev,
        .slick-next {
          z-index: 10;
          width: 40px;
          height: 40px;
          color: gray;
          border-radius: 50%;
        }
        .slick-prev {
          left: 10px;
        }
        .slick-next {
          right: 10px;
        }
        .slick-prev:before,
        .slick-next:before {
          font-size: 24px;
          color: gray;
        }

        .slick-prev:focus,
        /* Tùy chỉnh chấm điều hướng */
        .slick-dots {
          bottom: 10px;
        }
        .slick-dots li button:before {
          font-size: 12px;
          color: white;
        }
        .slick-dots li.slick-active button:before {
          color: #00ff00; /* Màu chấm khi active */
        }
      `}</style>
    </div>
  );
};

export default BannerSlider; 