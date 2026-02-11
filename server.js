const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5011;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/weatherapp';

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

const weatherSchema = new mongoose.Schema({
  name: String,
  city: String,
  weatherDetails: {
    temperature: Number,
    description: Number,
    wind: Number,
  },
  createdAt: { type: Date, default: Date.now },
});

const Weather = mongoose.model('Weather', weatherSchema);

app.get('/health', (req, res) => {
  if (mongoose.connection.readyState === 1) {
    res.status(200).json({ status: 'OK' });
  } else {
    res.status(500).json({ status: 'DB not connected' });
  }
});

app.post('/weather', async (req, res) => {
  const { name, city } = req.body;

  if (!name || !city) {
    return res.status(400).json({ error: 'Name and city are required' });
  }

  try {

    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}`);
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      return res.status(404).json({ error: 'City not found' });
    }

    const { latitude, longitude, name: cityName } = geoData.results[0];

    const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
    const weatherData = await weatherRes.json();

    const weatherDetails = {
      temperature: weatherData.current_weather.temperature,
      description: weatherData.current_weather.weathercode,
      wind: weatherData.current_weather.windspeed,
    };

    const newWeather = new Weather({
      name,
      city: cityName,
      weatherDetails,
    });
    await newWeather.save();

    res.json({
      name,
      city: cityName,
      temperature: weatherDetails.temperature,
      description: weatherDetails.description,
      wind: weatherDetails.wind,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
