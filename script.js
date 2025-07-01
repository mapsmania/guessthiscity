const proxyUrl = "/proxy";
let cityname;
let country;
let population;
let description;
let geoJSONLayer;
let clickedSquares = 0;
let gameWon = false;

function calculateBoundingBox(center, size) {
  var halfSize = size / 2;
  var minLng = center[1] - halfSize;
  var minLat = center[0] - halfSize;
  var maxLng = center[1] + halfSize;
  var maxLat = center[0] + halfSize;
  return [minLng, minLat, maxLng, maxLat];
}

fetch(proxyUrl)
  .then((response) => response.json())
  .then((data) => {
    cityname = data.Name;
    country = data.CountryName;
    population = data.Population;
    description = data.Description;
    var centerCoordinates = [data.Latitude, data.Longitude];

    const map = L.map("map", {
      center: centerCoordinates,
      zoom: 13,
      zoomControl: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      touchZoom: false,
      dragging: false,
    });

    const tiles = L.tileLayer(
      "http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png",
      {
        maxZoom: 19,
        attribution:
          '<a href="https://tripgeo.com/" target=’_top’>TripGeo</a>, <a href="https://googlemapsmania.blogspot.com/" target=’_top’">Maps Mania</a> &copy; <a href="http://www.openstreetmap.org/copyright" target=’_top’>OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution" target=’_top’>Carto</a>',
      }
    ).addTo(map);

    var boundingBoxSize = 0.4;
    var bbox = calculateBoundingBox(centerCoordinates, boundingBoxSize);

    var cellSide = 1;
    var options = { units: "kilometers" };
    var squareGrid = turf
      .squareGrid(bbox, cellSide, options)
      .features.map(function (feature, index) {
        feature.properties = { id: index };
        return feature;
      });

    function updateClickedSquaresDisplay() {
      document.getElementById("clickedSquaresDisplay").textContent =
        clickedSquares.toString();
    }

    geoJSONLayer = L.geoJSON(squareGrid, {
      style: function (feature) {
        return { weight: 0.5, fillOpacity: 1 };
      },
      onEachFeature: function (feature, layer) {
        layer.on("click", function () {
          if (!gameWon && layer.options.fillOpacity !== 0) {
            layer.setStyle({ fillOpacity: 0 });
            clickedSquares++;
            updateClickedSquaresDisplay();

            if (clickedSquares === 10) {
              document.getElementById("textInput").value = cityname.substring(0, 1);
            } else if (clickedSquares === 20) {
              const countryDisplay = document.getElementById("countryDisplay");
              countryDisplay.innerHTML = `${country}`;
              countryDisplay.style.display = "block";
              document.getElementById("textInput").value = cityname.substring(0, 2);
            } else if (clickedSquares === 30) {
              document.getElementById("textInput").value = cityname.substring(0, 3);
            } else if (clickedSquares === 40) {
              document.getElementById("textInput").value = cityname.substring(0, 4);
            } else if (clickedSquares === 50) {
              document.getElementById("textInput").value = cityname.substring(0, 5);
            } else if (clickedSquares === 60) {
              document.getElementById("textInput").value = cityname.substring(0, 6);
            } else if (clickedSquares === 70) {
              document.getElementById("textInput").value = cityname.substring(0, 7);
            } else if (clickedSquares === 80) {
              document.getElementById("textInput").value = cityname.substring(0, 8);
            } else if (clickedSquares === 90) {
              document.getElementById("textInput").value = cityname.substring(0, 9);
            } else if (clickedSquares === 100) {
              document.getElementById("textInput").value = cityname.substring(0, 10);
            }
          }
        });
      },
    }).addTo(map);

    var mapBoundsPolygon = L.polygon([
      [
        [-90, -180],
        [-90, 180],
        [90, 180],
        [90, -180],
      ],
    ]);

    var gridBoundsPolygon = L.polygon([
      [
        [bbox[1], bbox[0]],
        [bbox[1], bbox[2]],
        [bbox[3], bbox[2]],
        [bbox[3], bbox[0]],
      ],
    ]);

    var maskPolygon = turf.difference(
      mapBoundsPolygon.toGeoJSON(),
      gridBoundsPolygon.toGeoJSON()
    );

    L.geoJSON(maskPolygon, {
      fillColor: "#ffffff",
      fillOpacity: 1,
      stroke: false,
    }).addTo(map);
  })
  .catch((error) => console.error("Error fetching data:", error));

document.getElementById("closeButton").addEventListener("click", function () {
  var introDiv = document.getElementById("intro");
  if (introDiv) {
    introDiv.parentNode.removeChild(introDiv);
  }
});

document
  .getElementById("submitButton")
  .addEventListener("click", function () {
    var inputText = document.getElementById("textInput").value.trim();

    if (inputText.toLowerCase() === cityname.toLowerCase()) {
      gameWon = true;

      geoJSONLayer.eachLayer(function (layer) {
        layer.setStyle({ fillOpacity: 0 });
      });

      const sidebarDiv = document.createElement("div");
      sidebarDiv.id = "sidebar";

      const truncatedDescription = description.length > 200
        ? description.substring(0, 200) + "..."
        : description;

      sidebarDiv.innerHTML =
        `<br>Today's city is ${cityname}. ${truncatedDescription} ... (read more at <a href="https://www.tripgeo.com/cities/">TripGeo Cities</a>).<br>` +
        `<br>You guessed ${cityname} in ${clickedSquares} squares.<br>` +
        `Come back tomorrow for a new city!<br>` +
        `<div class="button-container"><button id="tweetButton" style="margin-right: 10px;">Tweet Your Score</button></div><br>` +
        `Play more games at <a href="https://www.tripgeo.com/">TripGeo</a>`;

      document.body.appendChild(sidebarDiv);

      const blueSquares = "🟦".repeat(clickedSquares);
      const tweetContent = `${blueSquares} \n I named today's Guess this City in ${clickedSquares} squares! \n Can you beat it? \n https://www.tripgeo.com/guessthiscity`;
      const encodedTweet = encodeURIComponent(tweetContent);
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedTweet}`;

      document.getElementById("tweetButton").addEventListener("click", function () {
        window.open(twitterUrl, "_blank");
      });

      document.getElementById("submitButton").disabled = true;
    }
  });
