const GMU_CENTER = [38.8316, -77.3089];
const GMU_ZOOM = 16;

// Initialize the Leaflet map
const map = L.map("map").setView(GMU_CENTER, GMU_ZOOM);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19
}).addTo(map);

// ============================================================
// HARDCODED DATA
// ============================================================

const POIS = [
    { name: "Johnson Center",           lat: 38.8316, lon: -77.3089, description: "Student union and dining" },
    { name: "Fenwick Library",           lat: 38.8322, lon: -77.3073, description: "Main university library" },
    { name: "Engineering Building",      lat: 38.8279, lon: -77.3056, description: "Volgenau School of Engineering" },
    { name: "The Hub",                   lat: 38.8303, lon: -77.3077, description: "Dining and student services" },
    { name: "Merten Hall",               lat: 38.8340, lon: -77.3078, description: "Administrative offices" },
    { name: "Robinson Hall",             lat: 38.8330, lon: -77.3060, description: "Classrooms and offices" },
    { name: "Peterson Hall",             lat: 38.8295, lon: -77.3095, description: "Family housing and classrooms" },
    { name: "David King Hall",           lat: 38.8310, lon: -77.3055, description: "Classrooms and lecture halls" },
    { name: "Exploratory Hall",          lat: 38.8298, lon: -77.3070, description: "Science and research building" },
    { name: "Innovation Hall",           lat: 38.8283, lon: -77.3043, description: "Computer science and IT" },
    { name: "Nguyen Engineering Building",lat: 38.8274, lon: -77.3063, description: "Research and engineering labs" },
    { name: "EagleBank Arena",           lat: 38.8275, lon: -77.3125, description: "Events and athletics venue" }
];

// Hardcoded sample route drawn between Johnson Center and Innovation Hall.
const HARDCODED_ROUTE = {
    coordinates: [
        [38.8317757, -77.3085995],
        [38.8318385, -77.3085033],
        [38.8318642, -77.3084436],
        [38.8315318, -77.3082231],
        [38.8312502, -77.3081598],
        [38.8310889, -77.3080714],
        [38.8311464, -77.3078909],
        [38.8310046, -77.3077982],
        [38.8309382, -77.3076349],
        [38.8308749, -77.3074757],
        [38.8308957, -77.307425 ],
        [38.8309747, -77.3072171],
        [38.8308785, -77.3071481],
        [38.8307225, -77.3070449],
        [38.8304188, -77.3068416],
        [38.8302839, -77.3067514],
        [38.8301498, -77.3066641],
        [38.829879,  -77.3064887],
        [38.8297996, -77.3064329],
        [38.8296521, -77.3063292],
        [38.829599,  -77.3062941],
        [38.829545,  -77.3062532],
        [38.8294968, -77.3060164],
        [38.8294836, -77.3059831],
        [38.8294509, -77.3058133],
        [38.8294181, -77.3056425],
        [38.8294091, -77.3056241],
        [38.8292558, -77.305559 ],
        [38.8291240, -77.3055142],
        [38.8289471, -77.3053667],
        [38.8286410, -77.3051747],
        [38.8286566, -77.3051252],
        [38.8286004, -77.3050848],
        [38.8279936, -77.3046692],
        [38.8280660, -77.304515 ],
        [38.8280892, -77.3044655],
        [38.8283825, -77.3043451]
    ],
    distance_meters: 682.7,
    walking_time_minutes: 8.1
};

// ============================================================
// MARKER ICONS
// ============================================================

const startIcon = L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const endIcon = L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

// ============================================================
// STATE
// ============================================================

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

// ============================================================
// DROPDOWN CHANGES
// ============================================================

startSelect.addEventListener("change", () => {
    if (!startSelect.value) return;
    const { lat, lon } = JSON.parse(startSelect.value);
    setStart(lat, lon);
    if (endCoords) showRoute();
});

endSelect.addEventListener("change", () => {
    if (!endSelect.value) return;
    const { lat, lon } = JSON.parse(endSelect.value);
    setEnd(lat, lon);
    if (startCoords) showRoute();
});

routeBtn.addEventListener("click", showRoute);

// ============================================================
// CLEAR
// ============================================================

clearBtn.addEventListener("click", () => {
    startCoords = null;
    endCoords   = null;
    if (startMarker) map.removeLayer(startMarker);
    if (endMarker)   map.removeLayer(endMarker);
    if (routeLine)   map.removeLayer(routeLine);
    startMarker = null;
    endMarker   = null;
    routeLine   = null;
    startSelect.value = "";
    endSelect.value   = "";
    routeBtn.disabled = true;
    routeInfo.classList.add("hidden");
    statusEl.classList.add("hidden");
});

// ============================================================
// SHOW ROUTE — draws the hardcoded route on the map
// In a real version this would call the backend API instead.
// ============================================================

function showRoute() {
    if (!startCoords || !endCoords) return;

    const data = HARDCODED_ROUTE;

    if (routeLine) map.removeLayer(routeLine);
    routeLine = L.polyline(data.coordinates, {
        color: "#006633",
        weight: 5,
        opacity: 0.8
    }).addTo(map);

    map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });

    distanceEl.textContent    = `${data.distance_meters} m`;
    walkingTimeEl.textContent = `${data.walking_time_minutes} min`;

    routeInfo.classList.remove("hidden");
    statusEl.classList.add("hidden");
}
