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

map.on("click", (e) => {
    const { lat, lng } = e.latlng;
    if (!startCoords) {
        setStart(lat, lng);
    } else if (!endCoords) {
        setEnd(lat, lng);
        findRoute();
    }
});

startSelect.addEventListener("change", () => {
    if (startSelect.value) {
        const coords = JSON.parse(startSelect.value);
        setStart(coords.lat, coords.lon);
        if (endCoords) findRoute();
    }
});

endSelect.addEventListener("change", () => {
    if (endSelect.value) {
        const coords = JSON.parse(endSelect.value);
        setEnd(coords.lat, coords.lon);
        if (startCoords) findRoute();
    }
});

routeBtn.addEventListener("click", findRoute);

clearBtn.addEventListener("click", () => {
    startCoords = null;
    endCoords = null;
    if (startMarker) map.removeLayer(startMarker);
    if (endMarker) map.removeLayer(endMarker);
    if (routeLine) map.removeLayer(routeLine);
    startMarker = null;
    endMarker = null;
    routeLine = null;
    startSelect.value = "";
    endSelect.value = "";
    routeBtn.disabled = true;
    routeInfo.classList.add("hidden");
    statusEl.classList.add("hidden");
});

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
