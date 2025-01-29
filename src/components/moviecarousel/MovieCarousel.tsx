import React from 'react';
import 'swiper/css';
import 'swiper/css/pagination';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';

import { MovieCardType } from '@/types/types'; // Assuming this is defined correctly
import MovieCard from './MovieCard';

// Define the user type
interface User {
    city: string; // Add other user fields if necessary
}

const MovieCarousel: React.FC = () => {
    const [user, setUser] = React.useState<User | null>(null);
    const [movies, setMovies] = React.useState<MovieCardType[]>([]);

    const getUser = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/auth/getuser`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            const response = await res.json();

            if (response.ok) {
                setUser(response.data);
            } else {
                window.location.href = '/auth/signin';
            }
        } catch (error) {
            console.error(error);
        }
    };

    const getMovies = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/movie/movies`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            const data = await res.json();

            if (data.ok) {
                setMovies(data.data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    React.useEffect(() => {
        getMovies();
        getUser();
    }, []);

    return (
        <div className="sliderout">
            {movies.length > 0 && user && (
                <Swiper
                    slidesPerView={1}
                    spaceBetween={1}
                    pagination={{
                        clickable: true,
                    }}
                    breakpoints={{
                        '@0.00': {
                            slidesPerView: 1,
                            spaceBetween: 2,
                        },
                        '@0.75': {
                            slidesPerView: 2,
                            spaceBetween: 2,
                        },
                        '@1.00': {
                            slidesPerView: 3,
                            spaceBetween: 2,
                        },
                        '@1.50': {
                            slidesPerView: 6,
                            spaceBetween: 2,
                        },
                    }}
                    modules={[Pagination]}
                    className="mySwiper"
                >
                    {movies.map((movie) => (
                        <SwiperSlide key={movie._id}>
                            <MovieCard Movie={movie} user={user} />
                        </SwiperSlide>
                    ))}
                </Swiper>
            )}
        </div>
    );
};

export default MovieCarousel;
