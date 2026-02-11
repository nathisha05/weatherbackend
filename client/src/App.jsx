import React, { useState } from 'react';
import './App.css';

function App() {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setWeather(null);

    try {
      const response = await fetch('http://localhost:5011/weather', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, city }),
      });

      const data = await response.json();

      if (response.ok) {
        setWeather(data);
        fetchStoredWeather(); // Refresh stored data after new submission
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
  };

  const fetchStoredWeather = async () => {
    try {
      const response = await fetch('http://localhost:5011/weather');
      const data = await response.json();
      setStoredWeather(data);
    } catch (err) {
      console.error('Failed to fetch stored weather:', err);
    }
  };

  const toggleShowStored = () => {
    setShowStored(!showStored);
    if (!showStored) {
      fetchStoredWeather();
    }
  };

  return (
    <div className="App">
      <div className="weather-card">
        <div className="weather-content">
          <h1 className="weather-title">Weather App</h1>
          <form onSubmit={handleSubmit} className="weather-form">
            <input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              required
            />
            <input
              id="city"
              type="text"
              placeholder="Enter city name"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="input-field"
              required
            />
            <button type="submit" className="weather-button">Get Weather</button>
          </form>
          {weather && (
            <div className="weather-result">
              <h2>Hello {weather.name}, Weather in {weather.city}</h2>
              <p>Temperature: {weather.temperature} °C</p>
              <p>Weather Code: {weather.description}</p>
              <p>Wind Speed: {weather.wind} km/h</p>
            </div>
          )}
          {error && <p className="error-message">{error}</p>}
        </div>
      </div>
    </div>
  );
}

export default App;
