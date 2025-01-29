"use client"
import React from 'react'
import DatePicker from "react-horizontal-datepicker"
import './BuyTicketsPage.css'
import Link from 'next/link'
import { usePathname, useParams } from 'next/navigation'

interface Movie {
  _id: string
  title: string
  description: string
  portraitImgUrl: string
  landscapeImgUrl: string
  rating: number
  genre: string[]
  duration: number
  cast: string[]
  crew: string[]
  language: string
}

interface Theatre {
  _id: string
  name: string
  location: string
}

const BuyTicketsPage = () => {
  const pathname = usePathname()
  const params = useParams()
  const [selectedDate, setSelectedDate] = React.useState<string>(new Date().toISOString().split('T')[0]) // YYYY-MM-DD format
  const { movieid, cityname } = params as { movieid: string; cityname: string }
  const [movie, setMovie] = React.useState<Movie | null>(null)
  const [theatres, setTheatres] = React.useState<Theatre[] | null>(null)

  const getMovie = React.useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/movie/movies/${movieid}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      const data = await response.json()
      if (data.ok) {
        setMovie(data.data)
      }
    } catch (err) {
      console.error(err)
    }
  }, [movieid])

  const getTheatres = React.useCallback(
    async (date: string) => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API}/movie/screensbymovieschedule/${cityname}/${date}/${movieid}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          }
        )

        const data = await response.json()
        if (data.ok) {
          setTheatres(data.data)
        }
      } catch (err) {
        console.error(err)
      }
    },
    [cityname, movieid]
  )

  React.useEffect(() => {
    getMovie()
  }, [getMovie])

  React.useEffect(() => {
    getTheatres(selectedDate)
  }, [getTheatres, selectedDate])

  return (
    <>
      {movie && (
        <div className="buytickets">
          <div className="s1">
            <div className="head">
              <h1>
                {movie.title} - {movie.language}
              </h1>
              <h3>{movie.genre.join(", ")}</h3>
            </div>
            <DatePicker
              getSelectedDay={(date: Date) => {
                const formattedDate = date.toISOString().split('T')[0]
                setSelectedDate(formattedDate)
              }}
              endDate={100}
              selectDate={new Date(selectedDate)}
              labelFormat={"MMMM"}
              color={"rgb(248, 68, 100)"}
            />
          </div>

          {theatres && theatres.length > 0 && (
            <div className="screens">
              {theatres.map((screen) => (
                <div className="screen" key={screen._id}>
                  <div>
                    <h2>{screen.name}</h2>
                    <h3>{screen.location}</h3>
                  </div>
                  <Link
                    href={`${pathname}/${screen._id}?date=${selectedDate}`}
                    className="theme_btn1 linkstylenone"
                  >
                    Select
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default BuyTicketsPage
