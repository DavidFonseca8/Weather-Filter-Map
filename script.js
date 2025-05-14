let isCurrentWeather = false;
const map = L.map('map', {
  center: [40.505, -0.09],
  zoom: 5,
  maxBounds: [
    [-90, -180], // Southwest limit
    [90, 180]    // Northeast limit
  ],
  maxBoundsViscosity: 1.0,  // Fully restrict panning outside
  minZoom: 3,               // Optional: prevent zooming too far out
  worldCopyJump: true       // Keeps the map from duplicating horizontally
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

'NL': '3.376642,50.760474,7.216491,53.489158,300000',
'PT': '-9.839184,36.787775,-6.170885,42.255216,300000',
'ES': '-9.839184,35.943073,4.444012,43.987961,300000',
'CH': '6.002798,45.812013,10.706521,47.782444,300000',
'GB': '-10.80761,49.755197,1.842388,59.534793,300000',






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
  markers.forEach(marker => map.removeLayer(marker));
  markers = [];

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
  const time = document.getElementById("time").value || "00:00";
  const country = document.getElementById("country").value;
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
              entry.clouds.all < cloudMin || entry.clouds.all > cloudMax
            ) {
              return;
            }

            const iconCode = isCurrentWeather ? forecast.weather[0].icon : entry.weather[0].icon;
            const iconUrl = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;

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

            const marker = L.marker([city.coord.Lat, city.coord.Lon], { icon: weatherIcon })
              .addTo(map)
              .bindPopup(popup);

            markers.push(marker);
          });
      });
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

  // Smooth layout update
  requestAnimationFrame(() => {
    setTimeout(() => {
      // Only invalidate after the animation finishes
      map.invalidateSize({ pan: false });
      const center = map.getCenter();
      map.setView(center, map.getZoom());
    }, 350); // match CSS transition time
  });
});


