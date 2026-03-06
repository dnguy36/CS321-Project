"""
GMU Campus PathFinder
----
This script calculates the shortest path between points on the 
George Mason University (Fairfax) campus.
Data Source: OpenStreetMap data is licensed under the Open Data Commons Open Database License (ODbL
# The code for graph editing is here https://osmnx.readthedocs.io/en/stable/user-reference.html
# and https://pythongis.org/part2/chapter-09/nb/00-retrieving-osm-data.html
"""
import osmnx as ox


place = "George Mason University, Fairfax, Virginia, USA"

# Retrieves graph nodes and edges from OpenStreetMap, which are walkway connections on campus
graph = ox.graph_from_place(place, network_type='walk') 
# Saves graph of campus as GraphML file
ox.save_graphml(graph, filepath="gmu_campus.graphml") 
# Loads graph as a MultiDGraph with nodes and edges put into a dictionary structure
graph = ox.load_graphml("gmu_campus.graphml") 

#Removes components that are not strongly connected
graph = ox.truncate.largest_component(graph, strongly=False)

# Makes sure that the MultiDGraph has length attribute for each edge (in meters)
graph = ox.distance.add_edge_lengths(graph)

# ETA in seconds
# Average walking speed of healthy human adult retrieved from [Wikipedia](https://en.wikipedia.org/wiki/Preferred_walking_speed)
walking_pace = 1.10 # meters/second
for start_node, end_node, key, data in graph.edges(keys = True, data = True):
    # Calculates the duration of time (seconds) it takes to get from start node to the end node    
    data['travel_duration'] = data['length'] / walking_pace 

# Test graph
'''
for start_node, end_node, key, data in graph.edges(keys = True, data = True):
    print(start_node, end_node, key, data)
    break
'''

# Resaves changes in the graph object to the graphml file
ox.save_graphml(graph, filepath="gmu_campus.graphml")
