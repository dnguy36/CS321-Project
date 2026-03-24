import heapq
from graph_utils import haversine, get_node_coords


def astar(G, start_node, end_node):
    end_lat, end_lon = get_node_coords(G, end_node)

    open_set = []
    heapq.heappush(open_set, (0, start_node))

    came_from = {}
    g_score = {start_node: 0}
    f_score = {start_node: 0}

    closed_set = set()

    while open_set:
        current_f, current = heapq.heappop(open_set)

        if current == end_node:
            path = []
            node = current
            while node in came_from:
                path.append(node)
                node = came_from[node]
            path.append(start_node)
            path.reverse()
            return path, g_score[end_node]

        if current in closed_set:
            continue
        closed_set.add(current)

        for neighbor in G.neighbors(current):
            if neighbor in closed_set:
                continue

            edge_data = G.edges[current, neighbor, 0] if G.is_multigraph() else G.edges[current, neighbor]
            edge_length = float(edge_data.get("length", 0))

            tentative_g = g_score[current] + edge_length

            if tentative_g < g_score.get(neighbor, float("inf")):
                came_from[neighbor] = current
                g_score[neighbor] = tentative_g
                nlat, nlon = get_node_coords(G, neighbor)
                h = haversine(nlat, nlon, end_lat, end_lon)
                f_score[neighbor] = tentative_g + h
                heapq.heappush(open_set, (f_score[neighbor], neighbor))

    return None, None

