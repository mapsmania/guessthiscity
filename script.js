// Define the URL to fetch data from your proxy server
const proxyUrl = "/proxy";
let cityname; // Declare cityname globally
let country;
let population;
let description;
let geoJSONLayer; // Declare geoJSONLayer globally
let clickedSquares = 0; // Initialize variable to track number of clicked squares globally
let gameWon = false; // Flag to indicate whether the game is won

// Function to calculate bounding box around a center point
function calculateBoundingBox(center, size) {
  var halfSize = size / 2;
  var minLng = center[1] - halfSize;
  var minLat = center[0] - halfSize;
  var maxLng = center[1] + halfSize;
  var maxLat = center[0] + halfSize;
  return [minLng, minLat, maxLng, maxLat];
}

// Fetch data from the JSON feed via the proxy server
fetch(proxyUrl)
  .then((response) => response.json())
  .then((data) => {
    // Extract city name and center coordinates
    cityname = data.Name; // Assign value to global cityname
    country = data.CountryName;
    population = data.Population;
    description = data.Description;
    var centerCoordinates = [data.Latitude, data.Longitude];

    // Initialize the map with the center coordinates
    const map = L.map("map", {
      center: centerCoordinates,
      zoom: 13,
      zoomControl: false, // Disable zoom control buttons
      scrollWheelZoom: false, // Disable zooming with the scroll wheel
      doubleClickZoom: false, // Disable zooming by double-clicking
      boxZoom: false, // Disable zooming by dragging a box
      touchZoom: false, // Disable zooming by touch gestures
      dragging: false,
    });

    const tiles = L.tileLayer(
      "http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png",
      {
        maxZoom: 19,
        attribution:
          '<a href="https://tripgeo.com/" target=’_top’>TripGeo</a>, <a href="https://googlemapsmania.blogspot.com/ target=’_top’">Maps Mania</a> &copy; <a href="http://www.openstreetmap.org/copyright" target=’_top’>OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution" target=’_top’>Carto</a>',
      }
    ).addTo(map);

    // Define the size of the bounding box (in degrees)
    var boundingBoxSize = 0.4; // Change this value as needed

    // Calculate the bounding box coordinates around the center point
    var bbox = calculateBoundingBox(centerCoordinates, boundingBoxSize);

    // Square Grid
    var cellSide = 1;
    var options = { units: "kilometers" };
    var squareGrid = turf
      .squareGrid(bbox, cellSide, options)
      .features.map(function (feature, index) {
        feature.properties = { id: index }; // Add property with sequential ID
        return feature;
      });

    // Function to update the display of clickedSquares variable in the sidebar
    function updateClickedSquaresDisplay() {
      document.getElementById("clickedSquaresDisplay").textContent =
        clickedSquares.toString();
    }

    // Add GeoJSON layer with click event handler
    geoJSONLayer = L.geoJSON(squareGrid, {
      style: function (feature) {
        return { weight: 0.5, fillOpacity: 1 }; // Initial style for squares
      },
      onEachFeature: function (feature, layer) {
        layer.on("click", function (e) {
          // Check if game is won
          if (!gameWon && layer.options.fillOpacity !== 0) {
            // Update square's opacity to 0
            layer.setStyle({ fillOpacity: 0 });

            // Increment clickedSquares variable
            clickedSquares++;

            // Update the display in the sidebar
            updateClickedSquaresDisplay();

            // Check the value of clickedSquares and update the textInput accordingly
            if (clickedSquares === 10) {
              document.getElementById("textInput").value = cityname.substring(
                0,
                1
              );
            } else if (clickedSquares === 20) {
  const countryDisplay = document.getElementById("countryDisplay");
  countryDisplay.innerHTML = `${country}`;
  countryDisplay.style.display = 'block';  // Show the div
  document.getElementById("textInput").value = cityname.substring(0, 2);
            } else if (clickedSquares === 30) {
              document.getElementById("textInput").value = cityname.substring(
                0,
                3
              );
            } else if (clickedSquares === 40) {
              document.getElementById("textInput").value = cityname.substring(
                0,
                4
              );
            } else if (clickedSquares === 50) {
              document.getElementById("textInput").value = cityname.substring(
                0,
                5
              );
             } else if (clickedSquares === 60) {
              document.getElementById("textInput").value = cityname.substring(
                0,
                6
              );
             } else if (clickedSquares === 70) {
              document.getElementById("textInput").value = cityname.substring(
                0,
                7
              );
             } else if (clickedSquares === 80) {
              document.getElementById("textInput").value = cityname.substring(
                0,
                8
              );  
             } else if (clickedSquares === 90) {
              document.getElementById("textInput").value = cityname.substring(
                0,
                9  
              );
             } else if (clickedSquares === 100) {
              document.getElementById("textInput").value = cityname.substring(
                0,
                10
              );   
            }
          }
        });
      },
    }).addTo(map);

    // Create a bounding box polygon for the entire map
    var mapBoundsPolygon = L.polygon([
      [
        [-90, -180],
        [-90, 180],
        [90, 180],
        [90, -180],
      ],
    ]);

    // Create a bounding box polygon for the grid
    var gridBoundsPolygon = L.polygon([
      [
        [bbox[1], bbox[0]],
        [bbox[1], bbox[2]],
        [bbox[3], bbox[2]],
        [bbox[3], bbox[0]],
      ],
    ]);

    // Subtract the grid bounding box from the map bounding box to create a mask
    var maskPolygon = turf.difference(
      mapBoundsPolygon.toGeoJSON(),
      gridBoundsPolygon.toGeoJSON()
    );

    // Add the mask polygon to the map
    L.geoJSON(maskPolygon, {
      fillColor: "#ffffff", // Fill color to hide the map
      fillOpacity: 1, // Full opacity
      stroke: false, // No stroke
    }).addTo(map);

    // Initial load
    getAverageHighscore();
  })
  .catch((error) => console.error("Error fetching data:", error));

// Add event listener to the close button
document.getElementById("closeButton").addEventListener("click", function () {
  // Remove the 'intro' div from the DOM
  var introDiv = document.getElementById("intro");
  if (introDiv) {
    introDiv.parentNode.removeChild(introDiv);
  }
});

async function submitHighscore(highscore) {
  const response = await fetch("/highscore", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ highscore, cityName: cityname }), // Include city name in the request body
  });
  const data = await response.json();
}

async function getAverageHighscore() {
  const response = await fetch("/average-highscore");
  const data = await response.json();
  return data; // Return the data received from the server
}

async function getHighscores() {
  const response = await fetch("/highscores.json");
  const data = await response.json();
  return data; // Return the data received from the server
}

// Function to handle submission of text input
document
  .getElementById("submitButton")
  .addEventListener("click", async function () {
    var inputText = document.getElementById("textInput").value.trim();

    // Check if submitted text is the correct city name
    if (inputText.toLowerCase() === cityname.toLowerCase()) {
      // Set gameWon flag to true
      gameWon = true;

      // Set opacity of all squares to 0
      geoJSONLayer.eachLayer(function (layer) {
        layer.setStyle({ fillOpacity: 0 });
      });

      // Get average highscore and number of scores from the server
      const data = await getAverageHighscore();

      // Create and append the sidebar div
     // Create and append the sidebar div
const sidebarDiv = document.createElement("div");
sidebarDiv.id = "sidebar";

// Limit description to 200 characters
const truncatedDescription = description.length > 200 ? description.substring(0, 200) + "..." : description;

sidebarDiv.innerHTML = 
  `<br>Today's city is ${cityname}. ${truncatedDescription} ... (read more at <a href="https://www.tripgeo.com/cities/">TripGeo Cities</a>).<br>` +
  `<br> You guessed ${cityname} in ${clickedSquares} squares.<br>` +
  `The average number of squares to guess ${cityname} is ${data.averageHighscore.toFixed(2)} from ${data.numberOfScores} players.<br>` +
  `Come back tomorrow for a new city! <br>` +
  `<div class="button-container"><button id="tweetButton" style="margin-right: 10px;">Tweet Your Score</button><button id="leaderboardButton">Show Leaderboard</button></div><br>` +
 `Play more games at <a href="https://www.tripgeo.com/">TripGeo</a>`;

document.body.appendChild(sidebarDiv);
      
      // Construct the tweet content
      const blueSquares = "🟦".repeat(clickedSquares);
      const tweetContent = `${blueSquares} \n I named today's Guess this City in ${clickedSquares} squares! \n Can you beat it? \n https://www.tripgeo.com/guessthiscity`;

      // Encode the tweet content for the URL
      const encodedTweet = encodeURIComponent(tweetContent);

      // Construct the Twitter URL
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedTweet}`;

      // Add event listener to the button to open the tweet URL
      document
        .getElementById("tweetButton")
        .addEventListener("click", function () {
          window.open(twitterUrl, "_blank");
        });

      // Add class to the leaderboard button
      document
        .getElementById("leaderboardButton")
        .classList.add("leaderButton");

      // Disable the submit button
      document.getElementById("submitButton").disabled = true;

      // Submit the highscore as clickedSquares
      await submitHighscore(clickedSquares);
    }
  });

// Event listener for the leaderboard button
document.addEventListener("click", async function (event) {
  if (event.target && event.target.id === "leaderboardButton") {
    const sidebarDiv = document.getElementById("sidebar");
    if (sidebarDiv) {
      // Clear the sidebar content
      sidebarDiv.innerHTML = "";

      // Fetch the highscores
      const highscores = await getHighscores();

      // Sort the highscores in ascending order
      highscores.sort((a, b) => a - b);

      // Display the highscores
      let leaderboardHTML = "<h3>Leaderboard</h3>(Your score in bold)<ol>";
      let highlighted = false; // Flag to track if the current player's score has been highlighted
      highscores.forEach((score, index) => {
        let displayScore = `Score: ${score}`;
        if (score === 0) {
          displayScore += " (big fat cheat)";
        }
        if (score === clickedSquares && !highlighted) {
          leaderboardHTML += `<li><b>${displayScore}</b></li>`;
          highlighted = true; // Set the flag to true after highlighting the current player's score
        } else {
          leaderboardHTML += `<li>${displayScore}</li>`;
        }
      });
      leaderboardHTML += "</ol>";
      sidebarDiv.innerHTML = leaderboardHTML;

      // Create the tweet button
      const tweetButton = document.createElement("button");
      tweetButton.id = "tweetButton";
      tweetButton.style.marginRight = "10px";
      tweetButton.innerText = "Tweet Your Score";
      sidebarDiv.appendChild(tweetButton);

      // Construct the tweet content
      const blueSquares = "🟦".repeat(clickedSquares);
      const tweetContent = `${blueSquares} \n I named today's Guess this City in ${clickedSquares} squares! \n Can you beat it? \n https://www.tripgeo.com/guessthiscity`;

      // Encode the tweet content for the URL
      const encodedTweet = encodeURIComponent(tweetContent);

      // Construct the Twitter URL
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedTweet}`;

      // Add event listener to the tweet button to open the tweet URL
      tweetButton.addEventListener("click", function () {
        window.open(twitterUrl, "_blank");
      });
    }
  }
});

// Initial load
getAverageHighscore();
