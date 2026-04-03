const GMU_CENTER = [38.8316, -77.3089];
const GMU_ZOOM = 16;

const map = L.map("map").setView(GMU_CENTER, GMU_ZOOM);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19
}).addTo(map);

const startIcon = L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const endIcon = L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

let startMarker = null;
let endMarker = null;
let routeLine = null;
let poiMarkers = [];
let startCoords = null;
let endCoords = null;

const startSelect = document.getElementById("start-select");
const endSelect = document.getElementById("end-select");
const routeBtn = document.getElementById("route-btn");
const clearBtn = document.getElementById("clear-btn");
const routeInfo = document.getElementById("route-info");
const distanceEl = document.getElementById("distance");
const walkingTimeEl = document.getElementById("walking-time");
const statusEl = document.getElementById("status");

let pois = [];

async function loadPOIs() {
    try {
        const res = await fetch("/api/pois");
        const data = await res.json();
        pois = data.pois;

        pois.forEach(poi => {
            const opt1 = new Option(poi.name, JSON.stringify({ lat: poi.lat, lon: poi.lon }));
            const opt2 = new Option(poi.name, JSON.stringify({ lat: poi.lat, lon: poi.lon }));
            startSelect.appendChild(opt1);
            endSelect.appendChild(opt2);

            const marker = L.marker([poi.lat, poi.lon])
                .addTo(map)
                .bindPopup(`<b>${poi.name}</b><br>${poi.description}`);
            marker.on("click", () => {
                if (!startCoords) {
                    setStart(poi.lat, poi.lon);
                    startSelect.value = JSON.stringify({ lat: poi.lat, lon: poi.lon });
                } else if (!endCoords) {
                    setEnd(poi.lat, poi.lon);
                    endSelect.value = JSON.stringify({ lat: poi.lat, lon: poi.lon });
                }
            });
            poiMarkers.push(marker);
        });
    } catch (e) {
        console.error("Failed to load POIs:", e);
    }
}

function setStart(lat, lon) {
    startCoords = {lat, lon};

   
    const nearest = getNearestPOI({lat, lon});
    if (nearest && haversine({lat, lon}, nearest) < 70) { // Checks if point-of-interest is within 70 meters of selected location
        startName = nearest.name;
    } else {
        startName = "Selected Map Point";
    }

    if (startMarker) map.removeLayer(startMarker);
    startMarker = L.marker([lat, lon], { icon: startIcon })
        .addTo(map)
        .bindPopup(`Start: ${startName}`)
// ============================================================
// STATE
// ============================================================

let startMarker = null;
let endMarker   = null;
let routeLine   = null;
let startCoords = null;
let endCoords   = null;

const startSelect   = document.getElementById("start-select");
const endSelect     = document.getElementById("end-select");
const routeBtn      = document.getElementById("route-btn");
const clearBtn      = document.getElementById("clear-btn");
const routeInfo     = document.getElementById("route-info");
const distanceEl    = document.getElementById("distance");
const walkingTimeEl = document.getElementById("walking-time");
const statusEl      = document.getElementById("status");

// ============================================================
// LOAD POIs — builds dropdowns and places map markers
// ============================================================

POIS.forEach(poi => {
    // Add to both dropdowns
    const val = JSON.stringify({ lat: poi.lat, lon: poi.lon });
    startSelect.appendChild(new Option(poi.name, val));
    endSelect.appendChild(new Option(poi.name, val));

    // Place a blue marker on the map
    L.marker([poi.lat, poi.lon])
        .addTo(map)
        .bindPopup(`<b>${poi.name}</b><br>${poi.description}`)
        .on("click", () => {
            if (!startCoords) {
                setStart(poi.lat, poi.lon);
                startSelect.value = val;
            } else if (!endCoords) {
                setEnd(poi.lat, poi.lon);
                endSelect.value = val;
                showRoute();
            }
        });
});

// ============================================================
// MARKER HELPERS
// ============================================================

function setStart(lat, lon) {
    startCoords = { lat, lon };
    if (startMarker) map.removeLayer(startMarker);
    startMarker = L.marker([lat, lon], { icon: startIcon }).addTo(map).bindPopup("Start").openPopup();
    updateRouteBtn();
}

function setEnd(lat, lon) {
    endCoords = { lat, lon };
    if (endMarker) map.removeLayer(endMarker);
    endMarker = L.marker([lat, lon], { icon: endIcon }).addTo(map).bindPopup("Destination").openPopup();
    updateRouteBtn();
}

function updateRouteBtn() {
    routeBtn.disabled = !(startCoords && endCoords);
}

// ============================================================
// MAP CLICK — first click = start, second click = end + route
// ============================================================

map.on("click", (e) => {
    const { lat, lng } = e.latlng;
    if (!startCoords) {
        setStart(lat, lng);
    } else if (!endCoords) {
        setEnd(lat, lng);
        showRoute();
    }
});

    return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1-h));
}
function getNearestPOI(coords) { // Nearest point-of-interest based on coordinate
    if (!pois.length) return null;

    let nearest = pois[0];
    let minDist = haversine(coords, nearest);

    for (let i = 1; i < pois.length; i++) {
        const d = haversine(coords, pois[i]);
        if (d < minDist) {
            minDist = d;
            nearest = pois[i];
        }
    }
    return nearest;
}



async function findRoute() {
    if (!startCoords || !endCoords) return;

    showStatus("Calculating route...", "loading");

    try {
        const url = `/api/route?start_lat=${startCoords.lat}&start_lon=${startCoords.lon}&end_lat=${endCoords.lat}&end_lon=${endCoords.lon}`;
        const res = await fetch(url);

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || "Route calculation failed");
        }

        const data = await res.json();

        if (routeLine) map.removeLayer(routeLine);
        routeLine = L.polyline(data.coordinates, {
            color: "#006633",
            weight: 5,
            opacity: 0.8
        }).addTo(map);

        map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });

        distanceEl.textContent = data.distance_meters >= 1000
            ? `${(data.distance_meters / 1000).toFixed(2)} km`
            : `${data.distance_meters} m`;
        walkingTimeEl.textContent = `${data.walking_time_minutes} min`;
        
        routeInfo.classList.remove("hidden");
        statusEl.classList.add("hidden");
    } catch (e) {
        showStatus(e.message, "error");
    }
}

function showStatus(msg, type) {
    statusEl.textContent = msg;
    statusEl.className = type;
}

loadPOIs();
