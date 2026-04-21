import json
import os
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from build_graph import load_campus_graph
from graph_utils import find_nearest_node, get_node_coords
from routing import astar

app = FastAPI(title="Campus Path Optimizer")

G = None
POIS = []

WALKING_SPEED_MPS = 1.4


@app.on_event("startup")
async def startup():
    global G, POIS
    G = load_campus_graph()
    poi_path = os.path.join(os.path.dirname(__file__), "data", "pois.json")
    if os.path.exists(poi_path):
        with open(poi_path) as f:
            POIS = json.load(f)


@app.get("/api/pois")
async def get_pois():
    return {"pois": POIS}


@app.get("/api/route")
async def get_route(start_lat: float, start_lon: float, end_lat: float, end_lon: float):
    if G is None:
        raise HTTPException(status_code=503, detail="Graph not loaded yet")

    start_node, start_dist = find_nearest_node(G, start_lat, start_lon)
    end_node, end_dist = find_nearest_node(G, end_lat, end_lon)

    if start_node is None or end_node is None:
        raise HTTPException(status_code=400, detail="Could not snap points to graph")

    if start_dist > 500 or end_dist > 500:
        raise HTTPException(status_code=400, detail="Selected points are too far from the campus walking network")

    path, total_distance = astar(G, start_node, end_node)

    if path is None:
        raise HTTPException(status_code=404, detail="No route found between the selected points")

    coordinates = []
    for node in path:
        lat, lon = get_node_coords(G, node)
        coordinates.append([lat, lon])

    walking_time_minutes = (total_distance / WALKING_SPEED_MPS) / 60

    return {
        "coordinates": coordinates,
        "distance_meters": round(total_distance, 1),
        "walking_time_minutes": round(walking_time_minutes, 1),
        "start_snapped": list(get_node_coords(G, start_node)),
        "end_snapped": list(get_node_coords(G, end_node))
    }


FRONTEND_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend")

app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")

@app.get("/")
async def root():
    return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))
