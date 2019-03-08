console.log("HALLO MAPBOX");


mapboxgl.accessToken = 'pk.eyJ1IjoiZ2FycmV0dG1vb3JlIiwiYSI6ImNqc3Z6cHFwYTBjZHQ0NHFqY24xMGk0cjkifQ.7hW8_qmtE4IOihBvhK4qxw'


const geojson = {
    "type": "FeatureCollection",
    "features": markerCoords.map( function(coord){
        let marker = {
            "type": "Feature",
            "properties": {
                "message": "Here i am",
                "icon": {
                    "iconSize": [50, 50], // size of the icon
                    "iconAnchor": [25, 25], // point of the icon which will correspond to marker's location
                    "popupAnchor": [0, -25], // point from which the popup should open relative to the iconAnchor
                    "className": 'dot'
                }
            
            },
            "geometry": {
                "type": "Point",
                "coordinates": coord
            }
        }
        return marker;
    })
}

var map = new mapboxgl.Map({
    container: 'map', // id of containing div
    style: 'mapbox://styles/garrettmoore/cjsq95h7r22071flht9lsebdn',
    center: markerCoords[0],
    zoom: 9
});

// geojson.features.forEach(function(marker){
//     new mapboxgl.Marker({anchor: 'center'})
//         .setLngLat(marker.geometry.coordinates)
//         .addTo(map)
// })


map.on('load', function(){
    let layers = map.getStyle().layers;
    let labelLayerId;
    for (let i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
            labelLayerId = layers[i].id;
            break;
        }
    }
    map.addLayer({
        "id": "3d-buildings",
        "source": "composite",
        "source-layer": "building",
        "filter": ["==", "extrude", "true"],
        "type": "fill-extrusion",
        "minzoom": 12,
        "paint": {
            "fill-extrusion-color": "#009e60",
            "fill-extrusion-height": [
                "interpolate",
                ["linear"],
                ["zoom"],
                12,
                0,
                12.05,
                ["get" , "height"]
            ],
            "fill-extrusion-base": [
                "interpolate",
                ["linear"],
                ["zoom"],
                12,
                0,
                12.05,
                ["get" , "min_height"]
            ],
            "fill-extrusion-opacity": 0.6
        }
    }, labelLayerId)
});

geojson.features.forEach(function (marker) {
	// create a DOM element for the marker
	var el = document.createElement('div');
	el.className = 'marker';
    el.style.backgroundImage = 'url(../img/redrecord.png)';
	el.style.width = marker.properties.icon.iconSize[0] + 'px';
	el.style.height = marker.properties.icon.iconSize[1] + 'px';

	el.addEventListener('click', function () {
		document.getElementById('message').textContent = marker.properties.message
	});

	// add marker to map
	new mapboxgl.Marker({element: el, anchor: 'center'})
		.setLngLat(marker.geometry.coordinates)
		.addTo(map);
});


