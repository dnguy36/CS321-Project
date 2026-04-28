import os
import osmnx as ox
import networkx as nx

# ============================================================
# build_graph.py
# Downloads walking path data from OpenStreetMap for the GMU
# campus area and saves it as a GraphML file for reuse.
#
# KEY LIBRARIES & DOCUMENTATION:
#   - OSMnx: https://osmnx.readthedocs.io/en/stable/
#     A Python library to download and analyze street networks
#     from OpenStreetMap. It builds NetworkX graph objects.
#
#   - NetworkX: https://networkx.org/documentation/stable/
#     A Python library for creating and manipulating graphs.
#     OSMnx returns a NetworkX MultiDiGraph where:
#       - Each node has 'x' (longitude) and 'y' (latitude) attributes
#       - Each edge has a 'length' attribute (meters)
#
#   - GraphML format: https://networkx.org/documentation/stable/reference/readwrite/graphml.html
#     An XML-based file format for storing graphs. OSMnx can
#     save/load graphs in this format so we don't have to
#     re-download from OpenStreetMap every time.
#
#   - OpenStreetMap: https://www.openstreetmap.org/
#     The source of all the map/path data. OSMnx queries the
#     Overpass API to pull walking paths, roads, etc.
# ============================================================

# Path to the /data folder where we store the graph file
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
GRAPHML_PATH = os.path.join(DATA_DIR, "campus_graph.graphml")

# Center coordinates of GMU
GMU_CENTER = (38.8316, -77.3089)

# Radius in meters around the center point to download data for (Increase if we need a larger area).
GMU_DIST = 1200


def build_campus_graph():
    os.makedirs(DATA_DIR, exist_ok=True)
    print("Downloading walking network from OpenStreetMap...")

    # Download walking network from OSM
    G = ox.graph_from_point(GMU_CENTER, dist=GMU_DIST, network_type="walk")

    # Project to UTM to get accurate edge lengths in meters, then project back to lat/lon (EPSG:4326) for use with Leaflet
    G = ox.project_graph(G)
    G = ox.project_graph(G, to_crs="EPSG:4326")

    # Make sure every edge has a 'length' attribute
    # u = start node, v = end node, data = edge attribute dict
    for u, v, data in G.edges(data=True):
        if "length" not in data:
            data["length"] = 0.0

    # Save to GraphML so we can reload without downloading again
    ox.save_graphml(G, GRAPHML_PATH)
    print(f"Graph saved to {GRAPHML_PATH}")
    print(f"Nodes: {G.number_of_nodes()}, Edges: {G.number_of_edges()}")
    return G


def load_campus_graph():
    if os.path.exists(GRAPHML_PATH):
        print(f"Loading graph from {GRAPHML_PATH}...")
        G = ox.load_graphml(GRAPHML_PATH)
        for u, v, data in G.edges(data=True):
            if isinstance(data.get("length"), str):
                data["length"] = float(data["length"])
        print(f"Graph loaded. Nodes: {G.number_of_nodes()}, Edges: {G.number_of_edges()}")
        return G
    else:
        return build_campus_graph()


if __name__ == "__main__":
    build_campus_graph()

