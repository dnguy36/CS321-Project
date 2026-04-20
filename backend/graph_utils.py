import math


def haversine(lat1, lon1, lat2, lon2):
    R = 6371000
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def get_node_coords(G, node):
    data = G.nodes[node]
    return float(data["y"]), float(data["x"])


def find_nearest_node(G, lat, lon):
    best_node = None
    best_dist = float("inf")
    for node in G.nodes:
        nlat, nlon = get_node_coords(G, node)
        d = haversine(lat, lon, nlat, nlon)
        if d < best_dist:
            best_dist = d
            best_node = node
    return best_node, best_dist
