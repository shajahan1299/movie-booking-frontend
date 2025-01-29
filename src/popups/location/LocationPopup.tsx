"use client";
import React from "react";
import "../Popup.css";
import { toast } from "react-toastify";

interface CityOption {
  label: string;
  value: string;
}

const LocationPopup = ({
  setShowLocationPopup,
}: {
  setShowLocationPopup: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [cities, setCities] = React.useState<CityOption[]>([]);
  const [selectedCity, setSelectedCity] = React.useState<string>("");

  const getCities = () => {
    const indianCities = [
      "Jabalpur",
      "Mumbai",
      "Delhi",
      "Bangalore",
      "Hyderabad",
      "Chennai",
      "Kolkata",
      "Pune",
      "Ahmedabad",
      "Jaipur",
      "Surat",
      "Lucknow",
      "Kanpur",
      "Nagpur",
      "Indore",
      "Thane",
      "Bhopal",
      "Visakhapatnam",
      "Pimpri-Chinchwad",
      "Patna",
      "Vadodara",
    ];

    const cityOptions: CityOption[] = indianCities.map((city) => ({
      label: city,
      value: city,
    }));

    setCities(cityOptions);
  };

  React.useEffect(() => {
    getCities();
  }, []);

  const handleSave = () => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/auth/changeCity`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        city: selectedCity,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setShowLocationPopup(false);
          window.location.reload();
        }
      })
      .catch((err) => {
        toast(err.message, {
          type: "error",
        });
        console.error(err);
      });
  };

  return (
    <div className="popup-bg">
      <div className="popup-cont">
        <select
          className="select"
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
        >
          <option value="" disabled>
            Select your city
          </option>
          {cities.map((city) => (
            <option key={city.value} value={city.value}>
              {city.label}
            </option>
          ))}
        </select>

        <button className="btn" onClick={handleSave}>
          Save
        </button>
      </div>
    </div>
  );
};

export default LocationPopup;
