'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const SwiperCarousel = ({ cards }) => {
    const [activeIndex, setActiveIndex] = useState(0);

    return (
        <div className="relative w-[100%] mx-auto py-2 px-4">
            <Swiper
                onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
                onSwiper={(swiper) => setActiveIndex(swiper.realIndex)}
                centeredSlides={true}
                spaceBetween={30}
                loop={true}
                autoplay={{
                    delay: 3000,
                    disableOnInteraction: false,
                }}
                pagination={{ clickable: true }}
                modules={[Pagination, Autoplay]}
                breakpoints={{
                    640: {
                        slidesPerView: 2,
                    },
                    1024: {
                        slidesPerView: 3,
                    },
                    1300: {
                        slidesPerView:4,
                    },

                }}
            >
                {cards.map((card, index) => (
                    <SwiperSlide key={index}>
                        <div
                            className={`transition-all duration-500 ease-in-out transform ${
                                index === activeIndex ? 'scale-105 z-10 shadow-2xl' : 'scale-95'
                            } bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg overflow-hidden flex flex-col h-[30rem] w-full`}
                        >
                            <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] p-4 flex items-center justify-center h-[40%]">
                                <div className="relative w-full h-full rounded-xl overflow-hidden shadow-md">
                                    <Image
                                        src={card.image}
                                        alt={card.imageDescription}
                                        fill
                                        priority
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                    />
                                </div>
                            </div>
                            <div className="p-4 flex flex-col gap-2 text-gray-700 h-[60%] overflow-y-auto">
                                <h2 className="text-xl font-semibold text-teal-900 tracking-wide uppercase">
                                    {card.contentTitle}
                                </h2>
                                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                                    {card.contentText}
                                </p>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default SwiperCarousel;
