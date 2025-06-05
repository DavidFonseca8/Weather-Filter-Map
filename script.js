let isCurrentWeather = false;
const map = L.map('map', {
  center: [40.505, -0.09],
  zoom: 5,
  maxBounds: [
    [-90, -180],
    [90, 180]
  ],
  maxBoundsViscosity: 1.0,  
  minZoom: 3,               
  worldCopyJump: true 
});


const baseLayers = {
  'Satellite': L.tileLayer('https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
    attribution: '© Google',
    noWrap: true,
    bounds: [[-180, -360], [180, 360]],
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    
  }),

  'Map': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    noWrap: true,
    bounds: [[-90, -180], [90, 180]]
  })
};

baseLayers['Satellite'].addTo(map);
L.control.layers(baseLayers, null, { position: 'bottomleft' }).addTo(map);

const API_KEY = 'a759bafd46f6fb88c23a0423dc3290bd';
let markers = [];
let markerCluster = L.markerClusterGroup();

const countryBBoxes = {

//Europe
'AL': '19.192275,39.648260,21.056274,42.661206,300000',
'AD': '1.411815,42.427107,1.786672,42.658892,300000',
'AT': '9.527805,46.371419,17.156986,49.025394,300000',
'BE': '2.494633,49.482068,6.385096,51.542840,300000',
'BA': '15.697920,42.560644,19.632343,45.297889,300000',
'BG': '22.357178,41.236294,28.617554,44.215153,300000',
'HR': '13.454217,42.938254,19.444308,46.563169,300000',
'CZ': '12.091248,48.559563,18.850104,51.047938,300000',
'DK': '8.109544,54.571827,12.791288,57.751021,300000',
'EE': '21.804988,57.513590,28.223153,59.654790,300000',
'FI': '20.496201,59.811303,31.601904,70.147958,300000',
'FR': '-5.085227,42.465408,8.410504,51.188388,300000',
'DE': '5.822267,47.226468,15.075186,55.017961,300000',
'GR': '19.726731,34.920354,26.588977,41.674126,300000',
'HU': '16.058644,45.762744,22.894505,48.585781,300000',
'IS': '-24.609919,63.389154,-13.536882,66.547227,300000',
'IT': '6.513671,36.612024,18.558720,47.106366,300000',
'LV': '20.908559,55.674208,28.224672,58.110397,300000',
'LT': '20.999999,53.885001,26.835938,56.458333,300000',
'LU': '5.963270,49.455999,6.529999,50.200000,300000',
'MT': '14.179393,35.804705,14.573659,36.084909,300000',
'MD': '26.636750,45.447854,30.171331,48.492699,300000',
'ME': '18.454778,41.843070,20.348962,43.564769,300000',
'NL': '3.376642,50.760474,7.216491,53.489158,300000',
'MK': '20.467275,40.862591,23.060917,42.390125,300000',
'NO': '4.534320,57.989987,12.842767,65.663105,300000',
'PL': '13.972766,49.060251,24.171495,54.846322,300000',
'PT': '-9.839184,36.787775,-6.170885,42.255216,300000',
'RO': '20.259543,43.621364,29.820850,48.248252,300000',
'RS': '18.758123,41.918957,23.004038,46.271843,300000',
'SK': '16.790010,47.725498,22.558119,49.627004,300000',
'SI': '13.355593,45.435868,16.432796,46.881783,300000',
'ES': '-9.839184,35.943073,4.444012,43.987961,300000',
'SE': '10.959732,55.378950,24.147743,69.038316,300000',
'CH': '6.002798,45.812013,10.706521,47.782444,300000',
'UA': '22.121119,46.062666,40.209752,52.410821,300000',
'GB': '-10.80761,49.755197,1.842388,59.534793,300000',

'CA': '-167.388290,48.602446,-52.564676,72.250106,300000',
'MX': '-117.724795,6.446476,-64.997827,32.518573,300000',
'US-E': '-97.423904,28.101606,-65.768117,48.979605,300000',
'US-W': '-125.187359,26.121765,-97.273250,49.000626,300000',

'AR': '',
'BO': '',
'BR': '',
'CL': '',
'CO': '',
'EC': '',
'GY': '',
'PY': '',
'PE': '',
'UY': '',
'VE': '',






};

function roundToNearest3Hours(date) {
  const coeff = 1000 * 60 * 60 * 3;
  return new Date(Math.round(date.getTime() / coeff) * coeff);
}

function degToCompass(deg) {
  if (typeof deg !== 'number') return null;
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.floor((deg + 22.5) / 45) % 8];
}

function getCountryCenter(bboxString) {
  const [minLon, minLat, maxLon, maxLat] = bboxString.split(',').map(parseFloat);
  const centerLat = (minLat + maxLat) / 2;
  const centerLon = (minLon + maxLon) / 2;
  return [centerLat, centerLon];
}

function applyFilters() {
  markers.forEach(obj => map.removeLayer(obj.marker));
  markers = [];

  map.removeLayer(markerCluster);
  markerCluster = L.markerClusterGroup();

  const getValue = (id, fallback) => {
    const val = document.getElementById(id).value;
    return val === "" ? fallback : parseFloat(val);
  };

  const tempMin = getValue("tempMin", -273);
  const tempMax = getValue("tempMax", 100);
  const windMin = getValue("windMin", 0);
  const windMax = getValue("windMax", 300);
  const humidityMin = getValue("humidityMin", 0);
  const humidityMax = getValue("humidityMax", 100);
  const pressureMin = getValue("pressureMin", 800);
  const pressureMax = getValue("pressureMax", 1100);
  const visibilityMin = getValue("visibilityMin", 0);
  const visibilityMax = getValue("visibilityMax", 100000);
  const cloudMin = getValue("cloudMin", 0);
  const cloudMax = getValue("cloudMax", 100);
  

  const selectedDirs = Array.from(document.querySelectorAll(".wind-dir-group input:checked")).map(el => el.value);

  const date = document.getElementById("dateInput").value;
  const time = timeSlider.value.toString().padStart(2, "0") + ":00";
  const country = document.getElementById("country").value;
  const selectedWeather = document.getElementById("weatherCondition").value;
  const bbox = countryBBoxes[country];

  const [hour, minute] = time.split(":").map(Number);
  const selectedDate = new Date(date);
  selectedDate.setHours(hour, minute, 0, 0);
  const roundedSelectedDate = roundToNearest3Hours(new Date(selectedDate));

  const center = getCountryCenter(bbox);
  map.setView(center, 6);

  fetch(`https://api.openweathermap.org/data/2.5/box/city?bbox=${bbox}&units=metric&appid=${API_KEY}`)
    .then(response => response.json())
    .then(data => {
      data.list.forEach(city => {
        const endpoint = isCurrentWeather
          ? `https://api.openweathermap.org/data/2.5/weather?lat=${city.coord.Lat}&lon=${city.coord.Lon}&units=metric&appid=${API_KEY}`
          : `https://api.openweathermap.org/data/2.5/forecast?lat=${city.coord.Lat}&lon=${city.coord.Lon}&units=metric&appid=${API_KEY}`;

        fetch(endpoint)
          .then(res => res.json())
          .then(forecast => {
            let entry;

            if (isCurrentWeather) {
              entry = {
                dt_txt: new Date().toISOString(),
                main: forecast.main,
                wind: forecast.wind || {},
                clouds: forecast.clouds,
                visibility: forecast.visibility,
                weather: forecast.weather
              };
            } else {
              entry = forecast.list.find(e => {
                const entryDate = new Date(e.dt_txt);
                return roundToNearest3Hours(entryDate).getTime() === roundedSelectedDate.getTime();
              });

              if (!entry) return;
            }

            const windDeg = entry.wind?.deg;
            const windDir = degToCompass(windDeg);

            if (
              (selectedDirs.length && (!windDir || !selectedDirs.includes(windDir))) ||
              entry.main.temp < tempMin || entry.main.temp > tempMax ||
              entry.wind.speed * 3.6 < windMin || entry.wind.speed * 3.6 > windMax ||
              entry.main.humidity < humidityMin || entry.main.humidity > humidityMax ||
              entry.main.pressure < pressureMin || entry.main.pressure > pressureMax ||
              (entry.visibility ?? 10000) < visibilityMin || (entry.visibility ?? 10000) > visibilityMax ||
              entry.clouds.all < cloudMin || entry.clouds.all > cloudMax ||
              (selectedWeather && entry.weather[0].main !== selectedWeather)
            ) {
              return;
            }

            const iconCode = isCurrentWeather ? forecast.weather[0].icon : entry.weather[0].icon;
            const iconUrl = `http://openweathermap.org/img/wn/${iconCode}@4x.png`;

            const weatherIcon = L.icon({
              iconUrl: iconUrl,
              iconSize: [50, 50],
              iconAnchor: [25, 50],
              popupAnchor: [0, -40]
            });

            const popup = `
              <div class="weather-popup">
                <h3>${city.name}</h3>
                <p><strong>Date:</strong> ${entry.dt_txt}</p>
                <p>🌡 <strong>Temp:</strong> ${entry.main.temp}°C</p>
                <p>💨 <strong>Wind:</strong> ${(entry.wind.speed * 3.6).toFixed(1)} km/h (${windDir ?? "N/A"})</p>
                <p>💧 <strong>Humidity:</strong> ${entry.main.humidity}%</p>
                <p>🔽 <strong>Pressure:</strong> ${entry.main.pressure} hPa</p>
                <p>👁 <strong>Visibility:</strong> ${entry.visibility ?? 10000} m</p>
                <p>☁ <strong>Cloudiness:</strong> ${entry.clouds.all}%</p>
              </div>
            `;

            const leafletMarker = L.marker([city.coord.Lat, city.coord.Lon], { icon: weatherIcon })
              .bindPopup(popup)
            markerCluster.addLayer(leafletMarker)
            markers.push({
              marker: leafletMarker,
              temp: entry.main.temp,
              humidity: entry.main.humidity
            });

          });
      });
      map.addLayer(markerCluster);

      setTimeout(() => {
  const count = markers.length;
  const avgTemp = (markers.reduce((sum, m) => sum + m.temp, 0) / count).toFixed(1);
  const avgHumidity = (markers.reduce((sum, m) => sum + m.humidity, 0) / count).toFixed(1);

  document.getElementById("summaryPanel").innerHTML = `
    <p><strong>🔎 Matching Cities:</strong> ${count}</p>
    <p><strong>🌡 Avg Temp:</strong> ${avgTemp}°C</p>
    <p><strong>💧 Avg Humidity:</strong> ${avgHumidity}%</p>
  `;
}, 15000);

    })
    .catch(err => console.error("Error fetching city box data:", err));
}

function toggleCurrentWeather() {
  isCurrentWeather = !isCurrentWeather;
  document.getElementById("toggleCurrentBtn").classList.toggle("active", isCurrentWeather);

  document.getElementById("dateInput").disabled = isCurrentWeather;
  document.getElementById("time").disabled = isCurrentWeather;
}

const sidebar = document.querySelector(".sidebar");
const mapContainer = document.querySelector(".map-container");

document.getElementById("toggleSidebarBtn").addEventListener("click", () => {
  const isHidden = sidebar.classList.toggle("hidden");

  mapContainer.style.marginLeft = isHidden ? "0" : "320px";
  requestAnimationFrame(() => {
    setTimeout(() => {

      map.invalidateSize({ pan: false });
      const center = map.getCenter();
      map.setView(center, map.getZoom());
    }, 300); 
  });
});

// Section toggle logic
document.getElementById("modeSwitchBtn").addEventListener("click", () => {
  const isWeather = document.body.classList.contains("blue-theme");
  document.body.classList.toggle("blue-theme", !isWeather);
  document.body.classList.toggle("green-theme", isWeather);

  document.getElementById("weatherSection").style.display = isWeather ? "none" : "block";
  document.getElementById("soilSection").style.display = isWeather ? "block" : "none";
  document.getElementById("modeSwitchBtn").textContent = isWeather ? "☁ Weather Mode" : "🌿 Soil Mode";

  if (isWeather) {
    // Switched to Soil mode: clear map markers
    markers.forEach(obj => map.removeLayer(obj.marker));
    markers = [];
  }
});

function resetFilters() {
  const inputs = document.querySelectorAll(".sidebar input");
  inputs.forEach(input => {
    if (input.type === "checkbox") {
      input.checked = false;
    } else {
      input.value = "";
    }
  });

  const selects = document.querySelectorAll(".sidebar select");
  selects.forEach(select => {
    select.selectedIndex = 0;
  });

  document.getElementById("dateInput").disabled = false;
  document.getElementById("weatherCondition").selectedIndex = 0;
  timeSlider.value = 0;
  timeLabel.textContent = "00:00";


}

document.getElementById("resetFiltersBtn").addEventListener("click", resetFilters);

const legendPanel = document.getElementById("legend");
const toggleLegendBtn = document.getElementById("toggleLegendBtn");

toggleLegendBtn.addEventListener("click", () => {
  legendPanel.classList.toggle("hidden");
});


const timeSlider = document.getElementById("timeSlider");
const timeLabel = document.getElementById("timeLabel");

timeSlider.addEventListener("input", () => {
  const hour = parseInt(timeSlider.value);
  const formatted = hour.toString().padStart(2, "0") + ":00";
  timeLabel.textContent = formatted;
});


