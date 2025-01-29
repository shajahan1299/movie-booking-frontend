import React, { useState, useEffect } from 'react';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { Navigation, Pagination, Mousewheel, Keyboard } from 'swiper/modules';
import Image from 'next/image';

const HomeSlider = () => {
  // Define the state type explicitly
  const [windowSize, setWindowSize] = useState<{ width: number | undefined; height: number | undefined }>({
    width: undefined,
    height: undefined,
  });

  // Set the window size after the component mounts
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Initialize the size on component mount
    handleResize();

    // Add event listener for window resize
    window.addEventListener('resize', handleResize);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const [banners] = useState([
    {
      imgUrl: 'https://assets-in.bmscdn.com/promotions/cms/creatives/1737621257955_webshowcase1240x300.jpg',
    },
    {
      imgUrl: 'https://assets-in.bmscdn.com/promotions/cms/creatives/1737545843128_chennaiwebshowcase1240x300.jpg',
    },
  ]);

  return (
    <Swiper
      cssMode={true}
      navigation={true}
      pagination={true}
      mousewheel={true}
      keyboard={true}
      modules={[Navigation, Pagination, Mousewheel, Keyboard]}
      className="mySwiper"
    >
      {banners.map((banner, index) => {
        return (
          <SwiperSlide key={index}>
            <Image
              src={banner.imgUrl}
              alt=""
              width={windowSize.width || 0} // Ensure we have a valid width
              height={windowSize.height ? windowSize.height / 2 : 0} // Ensure we have a valid height
              style={{
                objectFit: 'cover',
              }}
            />
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
};

export default HomeSlider;
