# Campus Path Optimizer

A baseline MVP web application for navigating George Mason University using A* pathfinding on OpenStreetMap campus data.

## Team Members
- Member 1 – Project Manager / Documentation
- Member 2 – Map Data / Graph Construction
- Member 3 – A* Routing Algorithm
- Member 4 – Backend API
- Member 5 – Frontend UI / Map Rendering

## Project Overview
The Campus Path Optimizer helps users find the optimal walking path between two locations on George Mason University’s campus. The system uses OpenStreetMap data to build a campus graph and applies the A* algorithm to compute routes.

## MVP Features
- Select start location and destination
- Compute shortest walking path using A*
- Display route on interactive campus map
- Show estimated distance and walking time

## Tech Stack
- Python
- FastAPI
- OSMnx
- NetworkX
- Leaflet.js
- HTML / CSS / JavaScript
- GraphML
- JSON

## Project Structure
```text
backend/     FastAPI backend and routing logic
frontend/    Leaflet frontend interface
data/        Graph and POI data
docs/        Diagrams, requirements, and sketches
tests/       Test files
```

## Setup

### Prerequisites

- Python 3.11 - 3.12.x (Anything over 3.12.x gives issues)
- pip

### 1. Clone the repository

```bash
git clone https://github.com/dnguy36/CS321-Project.git
cd CS321-Project
```

### 2. Create a virtual environment (recommended)

```bash
python -m venv venv
source venv/bin/activate        # macOS / Linux
venv\Scripts\activate           # Windows
```

### 3. Install dependencies

```bash
pip install fastapi uvicorn osmnx networkx
```

### 4. Build the walking network graph (first time only)

```bash
python build_graph.py
```

This downloads walking path data from OpenStreetMap for the GMU campus area and saves it to `data/campus_graph.graphml`. It only needs to run once — after that the saved file is reused automatically.

> We already included this file in the repo, so you can skip this step.

### 5. Start the server

```bash
uvicorn main:app --host 0.0.0.0 --port 5000
```

### 6. Open in your browser

```
http://localhost:5000
```
