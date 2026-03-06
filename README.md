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
