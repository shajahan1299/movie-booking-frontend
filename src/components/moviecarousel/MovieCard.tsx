import React from 'react'
import { useRouter } from 'next/navigation';
import { BsFillStarFill } from 'react-icons/bs';
import './MovieCard.css';

// Define the Movie interface
interface Movie {
    _id: string;
    title: string;
    genre: string[];
    rating: number;
    portraitImgUrl: string;
}

// Define the User interface
interface User {
    city: string;
}

// Define the Props interface
interface MovieCardProps {
    Movie: Movie;
    user: User;
}

const MovieCard: React.FC<MovieCardProps> = ({ Movie, user }) => {
    const router = useRouter();
    const { _id, title, genre, rating, portraitImgUrl } = Movie;
    const { city } = user;

    return (
        <div
            className='moviecard'
            onClick={() => {
                router.push(`/${city}/movies/${_id}`);
            }}
        >
            <div
                className='movieimg'
                style={{
                    backgroundImage: `url(${portraitImgUrl})`
                }}
            >
                <p className='rating'>
                    <BsFillStarFill className='star' />&nbsp;&nbsp;
                    {rating}/10
                </p>
            </div>
            <div className='details'>
                <p className='title'>{title}</p>
                <p className='type'>{genre.join(", ")}</p>
            </div>
        </div>
    );
};

export default MovieCard;
