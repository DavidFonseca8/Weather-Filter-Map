let isCurrentWeather = false;
let currentRequestToken = null;
let isLoadingPopups = false;
let filterMode = 'snapshot';
let popupDataStore = {};
let summaryDataByHour = {};
let currentSummaryHourIndex = 0;

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

function formatDateForDisplay(date) {
    if (!(date instanceof Date) || isNaN(date)) return "Invalid Date";
    const year = date.getUTCFullYear();
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = date.getUTCDate().toString().padStart(2, '0');
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function parseDateString(dt_txt) {
    if (typeof dt_txt !== 'string') return new Date(NaN);
    if (dt_txt.includes('T')) return new Date(dt_txt);
    return new Date(dt_txt.replace(' ', 'T') + 'Z');
}

function clearAll() {
    currentRequestToken = null;
    if (markerCluster) {
        markerCluster.clearLayers();
        map.removeLayer(markerCluster);
    }
    markerCluster = L.markerClusterGroup();
    map.addLayer(markerCluster);
    markers = [];
    popupDataStore = {};
    summaryDataByHour = {};
    document.getElementById("summary-data-content").innerHTML = `<p>No data yet.</p>`;
    document.getElementById("summary-nav-controls").classList.add("hidden");
    isLoadingPopups = false;
    document.getElementById("applyBtn").disabled = false;
}

async function applyFilters() {
    if (isLoadingPopups) return;
    isLoadingPopups = true;
    document.getElementById("applyBtn").disabled = true;
    document.getElementById("summary-data-content").innerHTML = `<p>⏳ Loading results...</p>`;
    
    currentRequestToken = Symbol("weatherRequest");
    const thisToken = currentRequestToken;

    if (markerCluster) {
        markerCluster.clearLayers();
        map.removeLayer(markerCluster);
    }
    markerCluster = L.markerClusterGroup();
    map.addLayer(markerCluster);
    markers = [];
    popupDataStore = {};
    summaryDataByHour = {};

    const getValue = (id, fallback) => {
        const val = document.getElementById(id).value;
        return val === "" ? fallback : parseFloat(val);
    };

    const filters = {
        tempMin: getValue("tempMin", -273), tempMax: getValue("tempMax", 100),
        windMin: getValue("windMin", 0), windMax: getValue("windMax", 300),
        humidityMin: getValue("humidityMin", 0), humidityMax: getValue("humidityMax", 100),
        pressureMin: getValue("pressureMin", 800), pressureMax: getValue("pressureMax", 1100),
        visibilityMin: getValue("visibilityMin", 0), visibilityMax: getValue("visibilityMax", 100000),
        cloudMin: getValue("cloudMin", 0), cloudMax: getValue("cloudMax", 100),
        selectedDirs: Array.from(document.querySelectorAll(".wind-dir-group input:checked")).map(el => el.value),
        selectedWeather: document.getElementById("weatherCondition").value
    };
    
    const country = document.getElementById("country").value;
    const bbox = countryBBoxes[country];
    let searchType, timeSelection = { start: null, end: null };

    if (filterMode === 'predictive') searchType = 'predictive';
    else if (isCurrentWeather) searchType = 'current';
    else searchType = (document.getElementById('timeModeSelector').value === 'exact') ? 'exact_forecast' : 'range_forecast';

    if (searchType === 'exact_forecast') {
        const dateStr = document.getElementById("dateInput").value;
        if (!dateStr) {
            alert("Please select a forecast date.");
            clearAll();
            return;
        }
        const [year, month, day] = dateStr.split('-').map(Number);
        const hour = parseInt(document.getElementById('timeSlider').value);
        timeSelection.start = new Date(Date.UTC(year, month - 1, day, hour));
        timeSelection.end = new Date(Date.UTC(year, month - 1, day, hour));

    } else if (searchType === 'range_forecast') {
        const startDateStr = document.getElementById("dateInputStart").value;
        const endDateStr = document.getElementById("dateInputEnd").value;
        if (!startDateStr || !endDateStr) {
            alert("Please select a start and end date for the range.");
            clearAll();
            return;
        }
        const [startYear, startMonth, startDay] = startDateStr.split('-').map(Number);
        const [endYear, endMonth, endDay] = endDateStr.split('-').map(Number);
        const startHour = parseInt(document.getElementById('timeSliderStart').value);
        const endHour = parseInt(document.getElementById('timeSliderEnd').value);
        
        timeSelection.start = new Date(Date.UTC(startYear, startMonth - 1, startDay, startHour));
        timeSelection.end = new Date(Date.UTC(endYear, endMonth - 1, endDay, endHour));
    }

    const center = getCountryCenter(bbox);
    map.setView(center, 6);

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/box/city?bbox=${bbox}&units=metric&appid=${API_KEY}`);
        const data = await response.json();
        const cities = data.list || [];

        for (const city of cities) {
            if (thisToken !== currentRequestToken) break;
            await processCity(city, searchType, timeSelection, filters);
        }
        
    } catch (err) {
        console.error("Error fetching city box data:", err);
    } finally {
        if (thisToken === currentRequestToken) {
            finalizeSummary(searchType);
            isLoadingPopups = false;
            document.getElementById("applyBtn").disabled = false;
        }
    }
}

async function processCity(city, searchType, timeSelection, filters) {
    const endpoint = (searchType === 'current')
        ? `https://api.openweathermap.org/data/2.5/weather?lat=${city.coord.Lat}&lon=${city.coord.Lon}&units=metric&appid=${API_KEY}`
        : `https://api.openweathermap.org/data/2.5/forecast?lat=${city.coord.Lat}&lon=${city.coord.Lon}&units=metric&appid=${API_KEY}`;
    
    try {
        const res = await fetch(endpoint);
        const weatherData = await res.json();
        if (!weatherData || (weatherData.cod && weatherData.cod.toString() !== '200')) return;

        let entriesInScope = [];
        const forecastList = weatherData.list || [];

        switch (searchType) {
            case 'current':
                weatherData.dt_txt = new Date(weatherData.dt * 1000).toISOString();
                entriesInScope = [weatherData];
                break;
            case 'predictive':
                entriesInScope = forecastList;
                break;
            case 'exact_forecast':
            case 'range_forecast':
                entriesInScope = forecastList.filter(e => {
                    const entryDate = parseDateString(e.dt_txt);
                    return entryDate >= timeSelection.start && entryDate <= timeSelection.end;
                });
                break;
        }

        const matchingEntries = entriesInScope.filter(entry => {
            const windDir = degToCompass(entry.wind?.deg);
            return !(
                (filters.selectedDirs.length && (!windDir || !filters.selectedDirs.includes(windDir))) ||
                entry.main.temp < filters.tempMin || entry.main.temp > filters.tempMax ||
                (entry.wind.speed * 3.6) < filters.windMin || (entry.wind.speed * 3.6) > filters.windMax ||
                entry.main.humidity < filters.humidityMin || entry.main.humidity > filters.humidityMax ||
                entry.main.pressure < filters.pressureMin || entry.main.pressure > filters.pressureMax ||
                (entry.visibility ?? 10000) < filters.visibilityMin || (entry.visibility ?? 10000) > filters.visibilityMax ||
                entry.clouds.all < filters.cloudMin || entry.clouds.all > filters.cloudMax ||
                (filters.selectedWeather && entry.weather[0].main !== filters.selectedWeather)
            );
        });
        
        if (matchingEntries.length === 0) return;

        const representativeEntry = (filterMode === 'predictive') ? matchingEntries[0] : entriesInScope[0];
        if (!representativeEntry) return;
        
        const iconCode = representativeEntry.weather[0].icon;
        const iconUrl = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
        const weatherIcon = L.icon({ iconUrl, iconSize: [50, 50], iconAnchor: [25, 50], popupAnchor: [0, -40] });
        
        const entriesForPopup = (filterMode === 'predictive') ? [matchingEntries[0]] : entriesInScope;
        let popupContent;

        if (entriesForPopup.length > 1) {
          popupDataStore[city.id] = entriesForPopup;
          popupContent = createNavigablePopupHTML(city, entriesForPopup, 0);
        } else if (entriesForPopup.length === 1) {
          popupContent = createPopupHTML(city, entriesForPopup[0]);
        } else {
          return;
        }

        setTimeout(() => {
          addGraphButton(city, entriesForPopup);
        }, 100);
        
        const leafletMarker = L.marker([city.coord.Lat, city.coord.Lon], { icon: weatherIcon }).addTo(markerCluster);

        leafletMarker.on('popupopen', () => {
          const entriesToUse = (filterMode === 'predictive') ? [matchingEntries[0]] : entriesInScope;
          addGraphButton(city, entriesToUse);
        });

        leafletMarker.bindPopup(popupContent);
        
        markers.push({ allEntries: entriesInScope });
        updateProgressiveSummary(searchType);

    } catch (err) {
        console.warn(`Could not process city ${city.name}:`, err);
    }
}

function updateProgressiveSummary(searchType) {
    const count = markers.length;
    if (count === 0) {
        document.getElementById("summary-data-content").innerHTML = `<p>Searching...</p>`;
        return;
    }
    
    if (searchType === 'range_forecast') {
         document.getElementById("summary-data-content").innerHTML = `
            <p><strong>🔎 Found Cities:</strong> ${count}</p>
            <p><em>Processing...</em></p>
        `;
        return;
    }

    const allTemps = markers.flatMap(m => m.allEntries.map(e => e.main.temp));
    if (allTemps.length === 0) return;

    const allHumidities = markers.flatMap(m => m.allEntries.map(e => e.main.humidity));
    const avgTemp = (allTemps.reduce((a, b) => a + b, 0) / allTemps.length).toFixed(1);
    const minTemp = Math.min(...allTemps).toFixed(1);
    const maxTemp = Math.max(...allTemps).toFixed(1);
    const avgHumidity = (allHumidities.reduce((a, b) => a + b, 0) / allHumidities.length).toFixed(1);

    document.getElementById("summary-data-content").innerHTML = `
        <p><strong>🔎 Matching Cities:</strong> ${count}</p>
        <p>📉 <strong>Min Temp:</strong> ${minTemp}°C</p>
        <p><strong>🌡 Avg Temp:</strong> ${avgTemp}°C</p>
        <p>📈 <strong>Max Temp:</strong> ${maxTemp}°C</p>
        <p><strong>💧 Avg Humidity:</strong> ${avgHumidity}%</p>
        <p><em>Processing...</em></p>
    `;
}

function finalizeSummary(searchType) {
    if (markers.length === 0) {
        document.getElementById("summary-data-content").innerHTML = `<p>No matching results.</p>`;
        return;
    }
    
    markers.forEach(markerData => {
        markerData.allEntries.forEach(entry => {
            const timestamp = parseDateString(entry.dt_txt).getTime();
            if (isNaN(timestamp)) return;
            if (!summaryDataByHour[timestamp]) {
                summaryDataByHour[timestamp] = { temps: [], humidities: [], count: 0 };
            }
            summaryDataByHour[timestamp].temps.push(entry.main.temp);
            summaryDataByHour[timestamp].humidities.push(entry.main.humidity);
            summaryDataByHour[timestamp].count++;
        });
    });

    if (searchType === 'range_forecast') {
        const sortedHours = Object.keys(summaryDataByHour).sort();
        if (sortedHours.length > 0) {
            document.getElementById("summary-nav-controls").classList.remove("hidden");
            updateSummaryPanel(0);
        } else {
            document.getElementById("summary-data-content").innerHTML = `<p>No data available for this range.</p>`;
        }
    } else {
        const allTemps = markers.flatMap(m => m.allEntries.map(e => e.main.temp));
        const allHumidities = markers.flatMap(m => m.allEntries.map(e => e.main.humidity));
        const avgTemp = (allTemps.reduce((a, b) => a + b, 0) / allTemps.length).toFixed(1);
        const minTemp = Math.min(...allTemps).toFixed(1);
        const maxTemp = Math.max(...allTemps).toFixed(1);
        const avgHumidity = (allHumidities.reduce((a, b) => a + b, 0) / allHumidities.length).toFixed(1);
        document.getElementById("summary-data-content").innerHTML = `
            <p><strong>🔎 Matching Cities:</strong> ${markers.length}</p>
            <p>📉 <strong>Min Temp:</strong> ${minTemp}°C</p>
            <p><strong>🌡 Avg Temp:</strong> ${avgTemp}°C</p>
            <p>📈 <strong>Max Temp:</strong> ${maxTemp}°C</p>
            <p><strong>💧 Avg Humidity:</strong> ${avgHumidity}%</p>
        `;
        document.getElementById("summary-nav-controls").classList.add("hidden");
    }
}


function toggleCurrentWeather() {
  if (filterMode === 'predictive') return;
  isCurrentWeather = !isCurrentWeather;
  document.getElementById("toggleCurrentBtn").classList.toggle("active", isCurrentWeather);
  document.getElementById("forecastControls").classList.toggle("disabled", isCurrentWeather);
}

function handleForecastInteraction() {
    if (isCurrentWeather) {
        isCurrentWeather = false;
        document.getElementById("toggleCurrentBtn").classList.remove("active");
        document.getElementById("forecastControls").classList.remove("disabled");
    }
}

function initializeDatePickers() {
    const dateInput = document.getElementById("dateInput");
    const dateInputStart = document.getElementById("dateInputStart");
    const dateInputEnd = document.getElementById("dateInputEnd");

    const today = new Date();
    const fiveDaysLater = new Date();
    fiveDaysLater.setDate(today.getDate() + 5);

    const formatDate = (date) => date.toISOString().split("T")[0];

    const todayStr = formatDate(today);
    const fiveDaysLaterStr = formatDate(fiveDaysLater);

    [dateInput, dateInputStart, dateInputEnd].forEach(input => {
        if (input) {
            input.min = todayStr;
            input.max = fiveDaysLaterStr;
        }
    });
    
    dateInputStart.addEventListener('change', () => {
        if (dateInputStart.value) {
            dateInputEnd.min = dateInputStart.value;
            // Se a data de fim for anterior, ajusta-a
            if (dateInputEnd.value < dateInputStart.value) {
                dateInputEnd.value = dateInputStart.value;
            }
        }
    });
}


document.addEventListener('DOMContentLoaded', () => {
    updateTimeModeUI();
    initializeDatePickers();
    document.getElementById('timeModeSelector').addEventListener('change', handleForecastInteraction);
    document.getElementById('timeSlider').addEventListener('input', handleForecastInteraction);
    document.getElementById('timeSliderStart').addEventListener('input', handleForecastInteraction);
    document.getElementById('timeSliderEnd').addEventListener('input', handleForecastInteraction);
    document.getElementById('dateInput').addEventListener('change', handleForecastInteraction);
    document.getElementById('dateInputStart').addEventListener('change', handleForecastInteraction);
    document.getElementById('dateInputEnd').addEventListener('change', handleForecastInteraction);
});

function updateSummaryPanel(index) {
    const sortedTimestamps = Object.keys(summaryDataByHour).sort();
    if (index < 0 || index >= sortedTimestamps.length) return;
    currentSummaryHourIndex = index;
    const timestamp = sortedTimestamps[index];
    const dataForHour = summaryDataByHour[timestamp];
    
    const formattedTime = formatDateForDisplay(new Date(parseInt(timestamp)));
    
    const temps = dataForHour.temps;
    const humidities = dataForHour.humidities;
    const avgTemp = (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1);
    const minTemp = Math.min(...temps).toFixed(1);
    const maxTemp = Math.max(...temps).toFixed(1);
    const avgHumidity = (humidities.reduce((a, b) => a + b, 0) / humidities.length).toFixed(1);
    const summaryContentDiv = document.getElementById("summary-data-content");
    summaryContentDiv.innerHTML = `
        <p style="text-align:center; font-weight: bold;">${formattedTime}</p>
        <p><strong>🔎 Matching Cities:</strong> ${dataForHour.count}</p>
        <p>📉 <strong>Min Temp:</strong> ${minTemp}°C</p>
        <p><strong>🌡 Avg Temp:</strong> ${avgTemp}°C</p>
        <p>📈 <strong>Max Temp:</strong> ${maxTemp}°C</p>
        <p><strong>💧 Avg Humidity:</strong> ${avgHumidity}%</p>
    `;
    const navText = document.getElementById("summary-nav-text");
    navText.textContent = `${index + 1} / ${sortedTimestamps.length}`;
}

function navigateSummary(direction) {
    const sortedTimestamps = Object.keys(summaryDataByHour).sort();
    let newIndex = currentSummaryHourIndex;
    if (direction === 'next') {
        newIndex = (currentSummaryHourIndex + 1) % sortedTimestamps.length;
    } else {
        newIndex = (currentSummaryHourIndex - 1 + sortedTimestamps.length) % sortedTimestamps.length;
    }
    updateSummaryPanel(newIndex);
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

function createPopupHTML(city, entry) {
    const windDir = degToCompass(entry.wind?.deg);
    const formattedDate = formatDateForDisplay(parseDateString(entry.dt_txt));

    return `
      <div class="weather-popup">
        <h3>${city.name}</h3>
        <div class="popup-data-content">
          <p><strong>Date:</strong> ${formattedDate}</p>
          <p>🌡 <strong>Temp:</strong> ${entry.main.temp}°C</p>
          <p>💨 <strong>Wind:</strong> ${(entry.wind.speed * 3.6).toFixed(1)} km/h (${windDir ?? "N/A"})</p>
          <p>🌦 <strong>Condition:</strong> ${entry.weather[0].description}</p>
          <p>💧 <strong>Humidity:</strong> ${entry.main.humidity}%</p>
          <p>🔽 <strong>Pressure:</strong> ${entry.main.pressure} hPa</p>
          <p>👁 <strong>Visibility:</strong> ${entry.visibility ?? 10000} m</p>
          <p>☁ <strong>Cloudiness:</strong> ${entry.clouds.all}%</p>
        </div>
      </div>
    `;
}

function createNavigablePopupHTML(city, entries, initialIndex) {
    const entry = entries[initialIndex];
    const windDir = degToCompass(entry.wind?.deg);
    const formattedDate = formatDateForDisplay(parseDateString(entry.dt_txt));

    return `
        <div class="weather-popup" id="popup-city-${city.id}">
            <h3>${city.name}</h3>
            <div class="popup-data-content">
                <p><strong>Date:</strong> ${formattedDate}</p>
                <p>🌡 <strong>Temp:</strong> ${entry.main.temp}°C</p>
                <p>💨 <strong>Wind:</strong> ${(entry.wind.speed * 3.6).toFixed(1)} km/h (${windDir ?? "N/A"})</p>
                <p>🌦 <strong>Condition:</strong> ${entry.weather[0].description}</p>
                <p>💧 <strong>Humidity:</strong> ${entry.main.humidity}%</p>
                <p>🔽 <strong>Pressure:</strong> ${entry.main.pressure} hPa</p>
                <p>👁 <strong>Visibility:</strong> ${entry.visibility ?? 10000} m</p>
                <p>☁ <strong>Cloudiness:</strong> ${entry.clouds.all}%</p>
            </div>
            <div class="popup-nav" data-city-id="${city.id}" data-current-index="${initialIndex}">
                <span class="arrow" onclick="navigatePopup(event, 'prev')">←</span>
                <span class="nav-text">${initialIndex + 1} / ${entries.length}</span>
                <span class="arrow" onclick="navigatePopup(event, 'next')">→</span>
            </div>
        </div>
    `;
}

function navigatePopup(event, direction) {
    event.stopPropagation();
    const navContainer = event.target.closest('.popup-nav');
    const cityId = navContainer.dataset.cityId;
    let currentIndex = parseInt(navContainer.dataset.currentIndex);
    const entries = popupDataStore[cityId];
    if (!entries) return;
    if (direction === 'next') {
        currentIndex = (currentIndex + 1) % entries.length;
    } else {
        currentIndex = (currentIndex - 1 + entries.length) % entries.length;
    }
    const popupContentDiv = document.getElementById(`popup-city-${cityId}`);
    if (!popupContentDiv) return;
    const dataContainer = popupContentDiv.querySelector('.popup-data-content');
    const newEntry = entries[currentIndex];
    const windDir = degToCompass(newEntry.wind?.deg);
    const formattedDate = formatDateForDisplay(parseDateString(newEntry.dt_txt));

    dataContainer.innerHTML = `
        <p><strong>Date:</strong> ${formattedDate}</p>
        <p>🌡 <strong>Temp:</strong> ${newEntry.main.temp}°C</p>
        <p>💨 <strong>Wind:</strong> ${(newEntry.wind.speed * 3.6).toFixed(1)} km/h (${windDir ?? "N/A"})</p>
        <p>🌦 <strong>Condition:</strong> ${newEntry.weather[0].description}</p>
        <p>💧 <strong>Humidity:</strong> ${newEntry.main.humidity}%</p>
        <p>🔽 <strong>Pressure:</strong> ${newEntry.main.pressure} hPa</p>
        <p>👁 <strong>Visibility:</strong> ${newEntry.visibility ?? 10000} m</p>
        <p>☁ <strong>Cloudiness:</strong> ${newEntry.clouds.all}%</p>
    `;
    navContainer.dataset.currentIndex = currentIndex;
    navContainer.querySelector('.nav-text').textContent = `${currentIndex + 1} / ${entries.length}`;
}

function updateTimeModeUI() {
    const mode = document.getElementById('timeModeSelector').value;
    const exactControls = document.getElementById('exactTimeControls');
    const rangeControls = document.getElementById('timeRangeControls');
    if (mode === 'exact') {
        exactControls.classList.remove('hidden');
        rangeControls.classList.add('hidden');
    } else {
        exactControls.classList.add('hidden');
        rangeControls.classList.remove('hidden');
    }
}

const timeSliderStart = document.getElementById("timeSliderStart");
const timeLabelStart = document.getElementById("timeLabelStart");
timeSliderStart.addEventListener("input", () => {
  const hour = parseInt(timeSliderStart.value);
  timeLabelStart.textContent = hour.toString().padStart(2, "0") + ":00";
});

const timeSliderEnd = document.getElementById("timeSliderEnd");
const timeLabelEnd = document.getElementById("timeLabelEnd");
timeSliderEnd.addEventListener("input", () => {
  const hour = parseInt(timeSliderEnd.value);
  timeLabelEnd.textContent = hour.toString().padStart(2, "0") + ":00";
});

function updateUIMode() {
    const snapshotControls = document.getElementById('snapshotControls');
    if (filterMode === 'predictive') {
        snapshotControls.classList.add('disabled');
        if (isCurrentWeather) {
            toggleCurrentWeather();
        }
    } else {
        snapshotControls.classList.remove('disabled');
    }
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

  handleForecastInteraction();
  if(isCurrentWeather) {
      toggleCurrentWeather();
  }

  document.getElementById("weatherCondition").selectedIndex = 0;
  timeSlider.value = 0;
  timeLabel.textContent = "00:00";
  timeSliderStart.value = 0;
  timeLabelStart.textContent = "00:00";
  timeSliderEnd.value = 21;
  timeLabelEnd.textContent = "21:00";
  updateTimeModeUI();
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

function createGraph(cityId, parameter, entries) {
  const ctx = document.getElementById('popupGraph').getContext('2d');
  if (window.popupChart) window.popupChart.destroy();

  const labels = entries.map(e => formatDateForDisplay(parseDateString(e.dt_txt)));
  const values = entries.map(e => {
    switch (parameter) {
      case 'temperature': return e.main.temp;
      case 'humidity': return e.main.humidity;
      case 'pressure': return e.main.pressure;
      case 'visibility': return e.visibility ?? 10000;
      case 'clouds': return e.clouds.all;
      case 'wind': return e.wind.speed * 3.6;
      default: return 0;
    }
  });

  const backgroundColors = entries.map(e => {
    const temp = e.main.temp;
    const pass = (parameter !== 'temperature') || (temp >= 10 && temp <= 30);
    return pass ? 'rgba(75, 192, 192, 0.6)' : 'rgba(255, 99, 132, 0.6)';
  });

  window.popupChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: parameter,
        data: values,
        backgroundColor: backgroundColors
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { autoSkip: true, maxTicksLimit: 12 } }
      }
    }
  });

  document.getElementById('graphContainer').classList.remove('hidden');
}

function addGraphButton(city, entries) {
  const popupEl = document.getElementById(`popup-city-${city.id}`);
  if (!popupEl) return;

  const existing = popupEl.querySelector('.graph-btn');
  if (existing) return; // Avoid adding twice

  const btn = document.createElement('button');
  btn.textContent = 'Show Graph';
  btn.className = 'graph-btn';
  btn.onclick = () => {
    const param = prompt('Choose parameter:\n- temperature\n- humidity\n- pressure\n- visibility\n- clouds\n- wind', 'temperature');
    if (param) {
      createGraph(city.id, param, entries);
    }
  };

  popupEl.appendChild(btn);
}

let currentCityId = null;
let currentCityEntries = [];

function createGraph(cityId, parameter, entries) {
  currentCityId = cityId;
  currentCityEntries = entries;

  const container = document.getElementById('graphContainer');
  const ctx = document.getElementById('popupGraph').getContext('2d');

  if (window.popupChart) window.popupChart.destroy();

  if (!document.getElementById('parameterSelect')) {
    const closeBtn = document.createElement('button');
    closeBtn.id = 'closeGraphBtn';
    closeBtn.textContent = 'Close ✖';
    closeBtn.onclick = () => container.classList.add('hidden');
    container.prepend(closeBtn);

    const select = document.createElement('select');
    select.id = 'parameterSelect';
    select.onchange = (e) => createGraph(currentCityId, e.target.value, currentCityEntries);
    const params = ['temperature', 'humidity', 'pressure', 'visibility', 'clouds', 'wind', 'all'];
    params.forEach(p => {
      const option = document.createElement('option');
      option.value = p;
      option.textContent = p[0].toUpperCase() + p.slice(1);
      select.appendChild(option);
    });
    container.insertBefore(select, ctx.canvas);
  }

  document.getElementById('parameterSelect').value = parameter;

  const labels = entries.map(e => formatDateForDisplay(parseDateString(e.dt_txt)));

  let datasets = [];

  if (parameter === 'all') {
    const binaryColors = entries.map(e => {
      const allMatch = ['temperature', 'humidity', 'pressure', 'visibility', 'clouds', 'wind']
        .every(param => matchesFilter(param, e));
      return allMatch ? 'rgba(75,192,192,0.5)' : 'rgba(255,99,132,0.5)';
    });

    datasets = [{
      label: 'Overall Match',
      data: entries.map((_, i) => 1),
      backgroundColor: binaryColors
    }];
  } else {
    datasets = [{
      label: parameter,
      data: entries.map(e => getValueForParameter(parameter, e)),
      backgroundColor: entries.map(e => matchesFilter(parameter, e) ? 'rgba(75,192,192,0.5)' : 'rgba(255,99,132,0.5)')
    }];
  }

  window.popupChart = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets },
    options: {
      responsive: true,
      plugins: { legend: { display: true } },
      scales: {
        x: { ticks: { autoSkip: true, maxTicksLimit: 12 } },
        y: parameter === 'all' ? { beginAtZero: true, max: 1 } : {}
      }
    }
  });

  container.classList.remove('hidden');
}

function getValueForParameter(param, entry) {
  switch (param) {
    case 'temperature': return entry.main.temp;
    case 'humidity': return entry.main.humidity;
    case 'pressure': return entry.main.pressure;
    case 'visibility': return entry.visibility ?? 10000;
    case 'clouds': return entry.clouds.all;
    case 'wind': return entry.wind.speed * 3.6;
    default: return 0;
  }
}

function matchesFilter(param, entry) {
  const val = getValueForParameter(param, entry);
  const getVal = (id, def) => {
    const input = document.getElementById(id);
    if (!input || input.value === '') return def;
    return parseFloat(input.value);
  };

  switch (param) {
    case 'temperature':
      return val >= getVal('tempMin', -273) && val <= getVal('tempMax', 100);
    case 'humidity':
      return val >= getVal('humidityMin', 0) && val <= getVal('humidityMax', 100);
    case 'pressure':
      return val >= getVal('pressureMin', 800) && val <= getVal('pressureMax', 1100);
    case 'visibility':
      return val >= getVal('visibilityMin', 0) && val <= getVal('visibilityMax', 100000);
    case 'clouds':
      return val >= getVal('cloudMin', 0) && val <= getVal('cloudMax', 100);
    case 'wind':
      return val >= getVal('windMin', 0) && val <= getVal('windMax', 300);
    default:
      return true;
  }
}

function addGraphButton(city, entries) {
  const popupEl = document.getElementById(`popup-city-${city.id}`);
  if (!popupEl) return;

  if (popupEl.querySelector('.graph-btn')) return;

  const btn = document.createElement('button');
  btn.textContent = 'Show Graph';
  btn.className = 'graph-btn';
  btn.onclick = () => createGraph(city.id, 'temperature', entries);
  popupEl.appendChild(btn);
}



