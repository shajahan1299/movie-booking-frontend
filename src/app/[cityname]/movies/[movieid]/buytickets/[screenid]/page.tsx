"use client";
import React from "react";
import "./SelectSeat.css";
import { useParams, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";

// Define the Razorpay class
interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description?: string;
    image?: string;
    order_id?: string;
    handler: (response: RazorpayResponse) => void;
    prefill?: {
      name?: string;
      email?: string;
      contact?: string;
    };
    notes?: Record<string, string>;
    theme?: {
      color?: string;
    };
  }
  
  interface RazorpayResponse {
    razorpay_payment_id: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
  }
  
  declare class Razorpay {
    constructor(options: RazorpayOptions);
    open(): void;
    on(event: string, callback: (response: RazorpayResponse) => void): void;
  }
  

// Interfaces for typing
interface Seat {
  seat_id: string;
  price: number;
  row: string;
  col: number;
}

interface SeatType {
  type: string;
  price: number;
  rows: {
    rowname: string;
    cols: {
      seats: Seat[];
    }[];
  }[];
}

interface Schedule {
  _id: string;
  showTime: string;
  notAvailableSeats: { row: string; col: number; seat_id: string }[];
}

interface Screen {
  screen: {
    name: string;
    seats: SeatType[];
  };
  movieSchedulesforDate: Schedule[];
}

interface Movie {
  title: string;
  genre: string[];
}

const SelectSeatPage: React.FC = () => {
  const params = useParams();
  const searchParams = useSearchParams();

  const date = searchParams.get("date") || "";
  const { movieid, screenid } = params as {
    movieid: string;
    screenid: string;
  };

  const [screen, setScreen] = React.useState<Screen | null>(null);
  const [selectedTime, setSelectedTime] = React.useState<Schedule | null>(null);
  const [movie, setMovie] = React.useState<Movie | null>(null);
  const [selectedSeats, setSelectedSeats] = React.useState<Seat[]>([]);

  const getschedules = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/movie/schedulebymovie/${screenid}/${date}/${movieid}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      const response = await res.json();
      if (response.ok) {
        setScreen(response.data);
        setSelectedTime(response.data.movieSchedulesforDate[0]);
      } else {
        console.error(response);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getMovie = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/movie/movies/${movieid}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      const data = await res.json();
      if (data.ok) {
        setMovie(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  React.useEffect(() => {
    getschedules();
    getMovie();
  }, []);

  const selectdeselectseat = (seat: Seat) => {
    const isSelected = selectedSeats.some(
      (s) =>
        s.row === seat.row &&
        s.col === seat.col &&
        s.seat_id === seat.seat_id
    );

    if (isSelected) {
      setSelectedSeats((prev) =>
        prev.filter(
          (s) =>
            s.row !== seat.row ||
            s.col !== seat.col ||
            s.seat_id !== seat.seat_id
        )
      );
    } else {
      setSelectedSeats((prev) => [...prev, seat]);
    }
  };

  const generateSeatLayout = () => {
    if (!screen || !selectedTime) return null;

    const scheduleIndex = screen.movieSchedulesforDate.findIndex(
      (t) => t.showTime === selectedTime.showTime
    );
    const unavailableSeats =
      screen.movieSchedulesforDate[scheduleIndex].notAvailableSeats;

    return (
      <div>
        {screen.screen.seats.map((seatType, index) => (
          <div className="seat-type" key={index}>
            <h2>
              {seatType.type} - Rs. {seatType.price}
            </h2>
            <div className="seat-rows">
              {seatType.rows.map((row, rowIndex) => (
                <div className="seat-row" key={rowIndex}>
                  <p className="rowname">{row.rowname}</p>
                  <div className="seat-cols">
                    {row.cols.map((col, colIndex) => (
                      <div className="seat-col" key={colIndex}>
                        {col.seats.map((seat, seatIndex) => (
                          <div key={seatIndex}>
                            {unavailableSeats.find(
                              (s) =>
                                s.row === row.rowname &&
                                s.seat_id === seat.seat_id &&
                                s.col === colIndex
                            ) ? (
                              <span className="seat-unavailable">
                                {seatIndex + 1}
                              </span>
                            ) : (
                              <span
                                className={
                                  selectedSeats.find(
                                    (s) =>
                                      s.row === row.rowname &&
                                      s.seat_id === seat.seat_id &&
                                      s.col === colIndex
                                  )
                                    ? "seat-selected"
                                    : "seat-available"
                                }
                                onClick={() =>
                                  selectdeselectseat({
                                    row: row.rowname,
                                    col: colIndex,
                                    seat_id: seat.seat_id,
                                    price: seatType.price,
                                  })
                                }
                              >
                                {seatIndex + 1}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                  <br />
                  <br />
                  <br />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };
  React.useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
        console.log("Razorpay SDK loaded successfully");
    };
    script.onerror = () => {
        console.error("Failed to load Razorpay SDK");
    };
    document.body.appendChild(script);

    return () => {
        document.body.removeChild(script);
    };
}, []);

  const handlePayment = () => {
    if (typeof Razorpay === "undefined") {
      toast.error("Razorpay SDK failed to load. Please refresh the page.");
      return;
    }

    const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY!,
        amount: selectedSeats.reduce((acc, seat) => acc + seat.price, 0) * 100, // Amount in paise
        currency: "INR",
        name: "Movie Ticket Booking",
        description: `Booking for ${movie?.title}`,
        handler: function (response) {
          handleBooking(response.razorpay_payment_id);
        },
        prefill: {
          name: "Customer Name",
          email: "customer@example.com",
          contact: "9999999999"
        },
        theme: {
          color: "#F37254"
        }
      };
      
      const razorpay = new Razorpay(options);
      razorpay.open();
      
  };

  const handleBooking = async (paymentId: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/movie/bookticket`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            showTime: selectedTime?.showTime,
            showDate: date,
            movieId: movieid,
            screenId: screenid,
            seats: selectedSeats,
            totalPrice: selectedSeats.reduce(
              (acc, seat) => acc + seat.price,
              0
            ),
            paymentId: paymentId,
            paymentType: "online",
          }),
        }
      );
      const response = await res.json();
      if (response.ok) {
        toast.success("Booking Successful");
      } else {
        console.error(response);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="selectseatpage">
      {movie && screen && (
        <div className="s1">
          <div className="head">
            <h1>
              {movie.title} - {screen?.screen?.name}
            </h1>
            <h3>{movie.genre.join(" / ")}</h3>
          </div>
        </div>
      )}
      {screen && (
        <div className="selectseat">
          <div className="timecont">
            {screen.movieSchedulesforDate.map((time, index) => (
              <h3
                className={
                  selectedTime?._id === time._id ? "time selected" : "time"
                }
                onClick={() => {
                  setSelectedTime(time);
                  setSelectedSeats([]);
                }}
                key={index}
              >
                {time.showTime}
              </h3>
            ))}
          </div>
          <div className="indicators">
            <div>
              <span className="seat-unavailable"></span>
              <p>Not available</p>
            </div>
            <div>
              <span className="seat-available"></span>
              <p>Available</p>
            </div>
            <div>
              <span className="seat-selected"></span>
              <p>Selected</p>
            </div>
          </div>
          {generateSeatLayout()}
          <div className="totalcont">
            <div className="total">
              <h2>Total</h2>
              <h3>
                Rs. {selectedSeats.reduce((acc, seat) => acc + seat.price, 0)}
              </h3>
            </div>
            <button
              className="theme_btn1 linkstylenone"
              onClick={handlePayment}
            >
              Pay & Book Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectSeatPage;
