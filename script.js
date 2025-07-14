let isCurrentWeather = false;
let currentRequestToken = null;
let isLoadingPopups = false;
let filterMode = 'snapshot'; // 'snapshot' ou 'predictive'


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
'TR': '25.813675,35.811111,44.815000,42.107500,300000',
'UA': '22.121119,46.062666,40.209752,52.410821,300000',
'GB': '-10.80761,49.755197,1.842388,59.534793,300000',

'CA': '-167.388290,48.602446,-52.564676,72.250106,300000',
'MX': '-117.724795,6.446476,-64.997827,32.518573,300000',
'US': '-126.780293,24.894862,-67.393325,49.190186,300000',
'WC': '-300.0,-85.0,200.0,85.0,300000',


'AR': '-73.792689,-55.121572,-53.701663,-21.610673,300000',
'BO': '-69.642999,-22.920027,-57.478337,-9.682293,300000',
'BR': '-74.666326,-33.796284,-34.949864,5.100261,300000',
'CL': '-75.806040,-55.334984,-66.538404,-17.428052,300000',
'CO': '-79.066563,-4.120927,-67.382441,12.562740,300000',
'EC': '-80.939413,-5.001056,-75.185202,1.541028,300000',
'GY': '-61.416200,1.101697,-57.250619,8.319818,300000',
'PY': '-61.527519,1.137611,-57.179216,8.361429,300000',
'PE': '-81.460931,-18.358315,-68.835852,-0.003251,300000',
'UY': '-58.463544,-34.957083,-53.099309,-30.104366,300000',
'VE': '-73.550680,0.431338,-60.008184,12.722513,300000',

'OC': '94.795636,-51.762677,180.678330,6.859817,300000', 
'AF': '-18.677543,-35.185184,50.930710,37.156608,300000',
'AS': '26.000000,-11.000000,180.000000,81.000000,300000',
'RS': '27.667973,42.208509,190.195313,81.340196,300000'

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
  if (isLoadingPopups) return;
  isLoadingPopups = true;
  document.getElementById("applyBtn").disabled = true;
  document.getElementById("summaryPanel").innerHTML = `<p>⏳ Loading Results...</p>`;


  currentRequestToken = Symbol("weatherRequest");
  const thisToken = currentRequestToken;

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
  const country = document.getElementById("country").value;
  const selectedWeather = document.getElementById("weatherCondition").value;
  const bbox = countryBBoxes[country];
  
  let roundedSelectedDate;
  if (filterMode === 'snapshot') {
    const date = document.getElementById("dateInput").value;
    const time = timeSlider.value.toString().padStart(2, "0") + ":00";
    const [hour, minute] = time.split(":").map(Number);
    const selectedDate = new Date(date);
    selectedDate.setHours(hour, minute, 0, 0);
    roundedSelectedDate = roundToNearest3Hours(new Date(selectedDate));
  }
  
  const center = getCountryCenter(bbox);
  map.setView(center, 6);

  fetch(`https://api.openweathermap.org/data/2.5/box/city?bbox=${bbox}&units=metric&appid=${API_KEY}`)
    .then(response => response.json())
    .then(data => {
      const cities = data.list;
      const concurrencyLimit = 5;

      async function processCity(city) {
        if (thisToken !== currentRequestToken) return;
        
        // Em modo 'predictive', apenas o endpoint de previsão é relevante
        const isSnapshotCurrent = filterMode === 'snapshot' && isCurrentWeather;
        const endpoint = isSnapshotCurrent
          ? `https://api.openweathermap.org/data/2.5/weather?lat=${city.coord.Lat}&lon=${city.coord.Lon}&units=metric&appid=${API_KEY}`
          : `https://api.openweathermap.org/data/2.5/forecast?lat=${city.coord.Lat}&lon=${city.coord.Lon}&units=metric&appid=${API_KEY}`;

        try {
          const res = await fetch(endpoint);
          const forecastData = await res.json();
          if (thisToken !== currentRequestToken) return;
          
          let entries = [];
          if (isSnapshotCurrent) {
              entries = [{
                dt_txt: new Date().toISOString(),
                main: forecastData.main,
                wind: forecastData.wind || {},
                clouds: forecastData.clouds,
                visibility: forecastData.visibility,
                weather: forecastData.weather
              }];
          } else if (filterMode === 'snapshot') {
              const foundEntry = forecastData.list.find(e => {
                  const entryDate = new Date(e.dt_txt);
                  return roundToNearest3Hours(entryDate).getTime() === roundedSelectedDate.getTime();
              });
              if(foundEntry) entries = [foundEntry];
          } else { // Predictive mode
              entries = forecastData.list;
          }

          for (const entry of entries) {
              const windDeg = entry.wind?.deg;
              const windDir = degToCompass(windDeg);

              if (
                (selectedDirs.length && (!windDir || !selectedDirs.includes(windDir))) ||
                entry.main.temp < tempMin || entry.main.temp > tempMax ||
                (entry.wind.speed * 3.6) < windMin || (entry.wind.speed * 3.6) > windMax ||
                entry.main.humidity < humidityMin || entry.main.humidity > humidityMax ||
                entry.main.pressure < pressureMin || entry.main.pressure > pressureMax ||
                (entry.visibility ?? 10000) < visibilityMin || (entry.visibility ?? 10000) > visibilityMax ||
                entry.clouds.all < cloudMin || entry.clouds.all > cloudMax ||
                (selectedWeather && entry.weather[0].main !== selectedWeather)
              ) {
                continue; // Passa para a próxima entrada se não corresponder
              }

              // Se encontrou uma correspondência
              if (thisToken !== currentRequestToken) return;

              const iconCode = entry.weather[0].icon;
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

              const leafletMarker = L.marker([city.coord.Lat, city.coord.Lon], { icon: weatherIcon }).bindPopup(popup);
              markerCluster.addLayer(leafletMarker); 

              markers.push({
                marker: leafletMarker,
                temp: entry.main.temp,
                humidity: entry.main.humidity
              });

              updateWeatherSummaryLoading();
              
              // No modo predictive, paramos após a primeira correspondência para esta cidade
              if(filterMode === 'predictive') {
                  return; 
              }
          }
        } catch (err) {
          console.warn("Error fetching forecast:", err);
        }
      }

      async function processInBatches() {
        const queue = [...cities];
        const active = [];

        while (queue.length > 0) {
          while (active.length < concurrencyLimit && queue.length > 0) {
            const city = queue.shift();
            const p = processCity(city);
            active.push(p);
            p.finally(() => {
              const i = active.indexOf(p);
              if (i !== -1) active.splice(i, 1);
            });
          }
          await Promise.race(active);
        }

        await Promise.allSettled(active);
        if (thisToken !== currentRequestToken) return;
        
        map.addLayer(markerCluster);
        
        const count = markers.length;
        if (count === 0) {
          document.getElementById("summaryPanel").innerHTML = `<p>No matching results.</p>`;
        } else if (filterMode === 'predictive') {
           document.getElementById("summaryPanel").innerHTML = `<p>Found <strong>${count}</strong> cities where your desired weather conditions will occur in the next 5 days.</p>`;
        } else { // Modo Snapshot
          const temps = markers.map(m => m.temp);
          const humidities = markers.map(m => m.humidity);
          const avgTemp = (temps.reduce((a, b) => a + b, 0) / count).toFixed(1);
          const minTemp = Math.min(...temps).toFixed(1);
          const maxTemp = Math.max(...temps).toFixed(1);
          const avgHumidity = (humidities.reduce((a, b) => a + b, 0) / count).toFixed(1);

          document.getElementById("summaryPanel").innerHTML = `
            <p><strong>🔎 Matching Cities:</strong> ${count}</p>
            <p>📉 <strong>Min Temp:</strong> ${minTemp}°C</p>
            <p><strong>🌡 Avg Temp:</strong> ${avgTemp}°C</p>
            <p>📈 <strong>Max Temp:</strong> ${maxTemp}°C</p>
            <p><strong>💧 Avg Humidity:</strong> ${avgHumidity}%</p>
          `;
        }

        isLoadingPopups = false;
        document.getElementById("applyBtn").disabled = false;
      }

      processInBatches();
    })
    .catch(err => {
      console.error("Error fetching city box data:", err);
      isLoadingPopups = false;
      document.getElementById("applyBtn").disabled = false;
    });
}

// Lógica de UI para modo de filtro
function updateUIMode() {
    const snapshotControls = document.getElementById('snapshotControls');
    if (filterMode === 'predictive') {
        snapshotControls.classList.add('disabled');
        // Se o 'Current Weather' estava ativo, desativa-o
        if (isCurrentWeather) {
            toggleCurrentWeather();
        }
    } else {
        snapshotControls.classList.remove('disabled');
    }
}


function toggleCurrentWeather() {
  // Impede a ativação se estiver em modo predictive
  if (filterMode === 'predictive') return;
  
  isCurrentWeather = !isCurrentWeather;
  document.getElementById("toggleCurrentBtn").classList.toggle("active", isCurrentWeather);

  document.getElementById("dateInput").disabled = isCurrentWeather;
  document.getElementById("timeSlider").disabled = isCurrentWeather;
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

  if(isCurrentWeather) {
      toggleCurrentWeather();
  }
  document.getElementById("dateInput").disabled = false;
  document.getElementById("timeSlider").disabled = false;
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

function clearPopups() {
  currentRequestToken = null;
  isLoadingPopups = false;
  document.getElementById("applyBtn").disabled = false;

  markers.forEach(obj => map.removeLayer(obj.marker));
  markers = [];
  markerCluster.clearLayers();
  document.getElementById("summaryPanel").innerHTML = `<p>No matching results.</p>`;
}

function updateWeatherSummaryLoading() {
  const count = markers.length;

  if (count === 0) {
    document.getElementById("summaryPanel").innerHTML = `<p>⏳ Loading Results...</p>`;
    return;
  }

  // No modo 'predictive', apenas mostramos a contagem
  if (filterMode === 'predictive') {
      document.getElementById("summaryPanel").innerHTML = `
        <p><strong>🔎 Matching Cities:</strong> ${count}</p>
        <p><em>⏳ Loading more...</em></p>
      `;
      return;
  }

  const temps = markers.map(m => m.temp);
  const humidities = markers.map(m => m.humidity);

  const avgTemp = (temps.reduce((a, b) => a + b, 0) / count).toFixed(1);
  const minTemp = Math.min(...temps).toFixed(1);
  const maxTemp = Math.max(...temps).toFixed(1);

  const avgHumidity = (humidities.reduce((a, b) => a + b, 0) / count).toFixed(1);

  document.getElementById("summaryPanel").innerHTML = `
            <p><strong>🔎 Matching Cities:</strong> ${count}</p>
            <p>📉 <strong>Min Temp:</strong> ${minTemp}°C</p>
            <p><strong>🌡 Avg Temp:</strong> ${avgTemp}°C</p>
            <p>📈 <strong>Max Temp:</strong> ${maxTemp}°C</p>
            <p><strong>💧 Avg Humidity:</strong> ${avgHumidity}%</p>
    <p><em>⏳ Loading...</em></p>
  `;
}

const citySearchInput = document.getElementById("citySearchInput");
const suggestionsList = document.getElementById("searchSuggestions");
let debounceTimeout;

citySearchInput.addEventListener("input", () => {
  const query = citySearchInput.value.trim();
  clearTimeout(debounceTimeout);

  if (query.length < 2) {
    suggestionsList.innerHTML = "";
    return;
  }

  debounceTimeout = setTimeout(() => {
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`)
      .then(res => res.json())
      .then(data => {
        suggestionsList.innerHTML = "";
        data.forEach(place => {
          const li = document.createElement("li");
          li.textContent = place.display_name;
          li.addEventListener("click", () => {
            map.setView([parseFloat(place.lat), parseFloat(place.lon)], 20);
            suggestionsList.innerHTML = "";
            citySearchInput.value = "";
          });
          suggestionsList.appendChild(li);
        });
      });
  }, 300);
});

document.addEventListener("click", e => {
  if (!e.target.closest(".search-bar-header")) {
    suggestionsList.innerHTML = "";
  }
});

document.getElementById("toggleSummaryBtn").addEventListener("click", () => {
  const panel = document.getElementById("summaryPanel");
  panel.classList.toggle("hidden");
});

// NOVO: Listeners para o seletor de modo
document.getElementById("snapshotModeBtn").addEventListener('click', () => {
    filterMode = 'snapshot';
    document.getElementById('snapshotModeBtn').classList.add('active-mode');
    document.getElementById('predictiveModeBtn').classList.remove('active-mode');
    updateUIMode();
});

document.getElementById("predictiveModeBtn").addEventListener('click', () => {
    filterMode = 'predictive';
    document.getElementById('predictiveModeBtn').classList.add('active-mode');
    document.getElementById('snapshotModeBtn').classList.remove('active-mode');
    updateUIMode();
});