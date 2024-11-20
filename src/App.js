import { Oval } from 'react-loader-spinner';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFrown, faStar, faStarHalf } from '@fortawesome/free-solid-svg-icons';
import './App.css';

function Grp204WeatherApp() {
  const [input, setInput] = useState('');
  const [weather, setWeather] = useState({
    loading: false,
    data: {},
    error: false,
  });
  const [forecast, setForecast] = useState([]);
  const [favorites, setFavorites] = useState(
    JSON.parse(localStorage.getItem('favorites')) || []
  );
  const [location, setLocation] = useState(null);
  const [theme, setTheme] = useState('day');

  const api_key = 'f00c38e0279b7bc85480c3fe775d518c';

  useEffect(() => {
    detectLocation();
    const hour = new Date().getHours();
    setTheme(hour >= 6 && hour < 18 ? 'day' : 'night');
  }, []);

  const detectLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherByCoords(latitude, longitude);
      },
      () => alert("Impossible d'obtenir votre localisation.")
    );
  };

  const fetchWeatherByCoords = async (lat, lon) => {
    setWeather({ ...weather, loading: true });
    try {
      const res = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${api_key}`
      );
      setWeather({ data: res.data, loading: false, error: false });
    } catch (error) {
      setWeather({ ...weather, error: true, loading: false });
    }
  };

  const fetchForecast = async (city) => {
    try {
      const res = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${api_key}`
      );
      const dailyForecast = res.data.list.filter((item, index) => index % 8 === 0);
      setForecast(dailyForecast);
    } catch (error) {
      console.error('Erreur de prévision : ', error);
    }
  };

  const search = async (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      setInput('');
      setWeather({ ...weather, loading: true });
      try {
        const res = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
          params: { q: input, units: 'metric', appid: api_key },
        });
        setWeather({ data: res.data, loading: false, error: false });
        fetchForecast(input);
      } catch (error) {
        setWeather({ ...weather, data: {}, error: true, loading: false });
      }
    }
  };

  const addToFavorites = (city) => {
    if (!favorites.includes(city)) {
      const updatedFavorites = [...favorites, city];
      setFavorites(updatedFavorites);
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    }
  };

  const loadFromFavorites = (city) => {
    setInput(city);
    search({ key: 'Enter' });
  };

  const toDateFunction = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    return date.toLocaleDateString('fr-FR', options);
  };

  return (
    <div className={`App ${theme}`}>
      <h1 className="app-name">Application Météo grp204</h1>
      <div className="search-bar">
        <input
          type="text"
          className="city-search"
          placeholder="Entrez le nom de la ville..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={search}
        />
        <button onClick={detectLocation}>Localisation</button>
      </div>
      <div className="favorites">
        {favorites.map((city) => (
          <button key={city} onClick={() => loadFromFavorites(city)}>
            {city}
          </button>
        ))}
      </div>
      {weather.loading && <Oval type="Oval" color="black" height={100} width={100} />}
      {weather.error && (
        <span className="error-message">
          <FontAwesomeIcon icon={faFrown} /> Ville introuvable
        </span>
      )}
      {weather.data.main && (
        <div>
          <h2>
            {weather.data.name}, {weather.data.sys.country}
            <button onClick={() => addToFavorites(weather.data.name)}>
              <FontAwesomeIcon icon={faStar} />
            </button>
          </h2>
          <span>{toDateFunction(weather.data.dt)}</span>
          <img
            src={`https://openweathermap.org/img/wn/${weather.data.weather[0].icon}@2x.png`}
            alt={weather.data.weather[0].description}
          />
          <p>{Math.round(weather.data.main.temp)}°C</p>
          <p>Vitesse du vent : {weather.data.wind.speed} m/s</p>
        </div>
      )}
      <div className="forecast">
        {forecast.map((day) => (
          <div key={day.dt} className="forecast-day">
            <span>{toDateFunction(day.dt)}</span>
            <img
              src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
              alt={day.weather[0].description}
            />
            <p>{Math.round(day.main.temp)}°C</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Grp204WeatherApp;
