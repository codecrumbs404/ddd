import React, { useEffect, useState } from "react";

const apikey = "52da8421a9fab4e182d053a96925f398";

function SearchForm() {
  const [location, setLocation] = useState("");
  const [weatherData, setWeatherData] = useState(null);

  useEffect(() => {
    console.log("Attempting to retrieve location...");
    if (navigator.geolocation) {
      const geoOptions = {
        timeout: 10000, // 10 seconds timeout
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
          const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apikey}`;

          try {
            const response = await fetch(url);
            const data = await response.json();
            console.log("Weather data fetched:", data);
            setWeatherData(data);
          } catch (error) {
            console.error("Error fetching weather data:", error);
          }
        },
        (error) => {
          console.error("Error getting geolocation:", error);
          alert("Unable to detect your location. Please enter it manually.");
        },
        geoOptions
      );
    } else {
      alert("Geolocation is not supported by your browser. Please enter your location manually.");
    }
  }, []);

  const handleInputChange = (event) => {
    setLocation(event.target.value);
  };

  async function weather(event) {
    event.preventDefault();

    if (!location) return;

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apikey}`
      );
      const data = await response.json();
      console.log("Weather data fetched for manual location:", data);
      setWeatherData(data);
      setLocation("");

      const backend = await fetch("http://localhost:5001/api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          city_name: data.name,
          temperature: (data.main.temp - 273.15).toFixed(2),
          weather_condition: data.weather[0].description,
        }),
      });

      if (!backend.ok) {
        console.error("Error in saving weather data:");
      } else {
        console.log("Weather data saved successfully");
      }
    } catch (error) {
      console.error("Error fetching weather data:", error);
    }
  }

  return (
    <div className="h-screen bg-stone-500 flex justify-center">
      <div className="w-auto bg-purple-400 p-6 rounded-lg shadow-md mb-auto mt-4">
        <p className="text-white text-xl mb-4">Weather App</p>
        <form method="POST" className="flex flex-col gap-4" onSubmit={weather}>
          <span className="text-white">Enter Your Location:</span>
          <input
            type="text"
            value={location}
            onChange={handleInputChange}
            placeholder="Enter your location"
            className="p-2 rounded-md border border-gray-300"
          />

          <button
            type="submit"
            className="bg-orange-200 p-2 rounded-sm hover:bg-orange-300 transition"
          >
            Get Info
          </button>
        </form>

        {weatherData && (
          <div className="mt-4 text-white">
            <h2>Weather in {weatherData.name}:</h2>
            <p>Temperature: {Math.round(weatherData.main.temp - 273.15)}°C</p>
            <p>Weather: {weatherData.weather[0].description}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchForm;
