const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const request = require('request'); // Add the request module
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

const highscoresFile = 'highscores.json';

// Function to read highscores from the JSON file
const readHighscores = () => {
  if (fs.existsSync(highscoresFile)) {
    const data = fs.readFileSync(highscoresFile);
    return JSON.parse(data);
  }
  return [];
};

// Function to write highscores to the JSON file
const writeHighscores = (highscores) => {
  fs.writeFileSync(highscoresFile, JSON.stringify(highscores, null, 2));
};

// Function to write highscores to the JSON file
const writeCity = (city) => {
  fs.writeFileSync(highscoresFile, JSON.stringify(city, null, 2));
};

// Function to get the start of today in UTC
const startOfToday = () => {
  const now = new Date();
  now.setUTCHours(0, 0, 0, 0); // Set the time to midnight UTC
  return now;
};

// Endpoint to get the average highscore
app.get('/average-highscore', (req, res) => {
  const highscores = readHighscores();
  const today = startOfToday();

  // Filter highscores for today
  const todaysScores = highscores.filter(score => new Date(score.date) >= today);
  const totalScores = todaysScores.reduce((acc, score) => acc + score.highscore, 0);
  const numberPlayers = todaysScores.length;
  const averageHighscore = numberPlayers ? totalScores / numberPlayers : 0;

  res.json({ averageHighscore, numberOfScores: numberPlayers });
});

// Endpoint to submit a new highscore
app.post('/highscore', (req, res) => {
  const newScore = req.body.highscore;
  if (typeof newScore === 'number' && newScore >= 0) {
    const highscores = readHighscores();
    highscores.push({ highscore: newScore, date: new Date() });
    writeHighscores(highscores);
    res.json({ success: true, highscore: newScore });
  } else {
    res.status(400).json({ success: false, message: 'Invalid score' });
  }
});

// Endpoint to get highscores
app.get('/highscores.json', (req, res) => {
  const highscores = readHighscores();
  const today = startOfToday();

  // Filter highscores for today
  const todaysScores = highscores.filter(score => new Date(score.date) >= today);
  res.json(todaysScores.map(score => score.highscore));
});

// Proxy endpoint to fetch JSON data from an external source
app.get('/proxy', (req, res) => {
  const url = 'https://s3.tripgeo.com/guessthecity/today.json';
  request({ url }).pipe(res);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
});
