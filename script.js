var markerArray = [];
var map = null;
var markerVisibility = true;

// functions to add, hide, and delete markers

function addMarker(x, y, icon, title) {
  var marker = new google.maps.Marker({
    position: new google.maps.LatLng((y + .5) / 256, (x + .5) / 256),
    map: map,
    icon: icon,
    title: title + "\n(" + x + ", " + y + ")"
  });
  markerArray.push(marker);
}

function toggleAllMarkers() {
  markerVisibility = !markerVisibility;
  for (i in markerArray) {
    markerArray[i].setVisible(markerVisibility);
  }
}

function deleteAllMarkers() {
  for (i in markerArray) {
    markerArray[i].setMap(null);
  }
  markerArray.length = 0;
}

// custom projection
// lat range is [-4,4] corresponding to y [-512,512] in the zoom level 0 image set
// lng range is [-4,4] corresponding to x [-512,512] in the zoom level 0 image set
// in terms of game coordinates:
//   inGameX = lng * 1024
//   inGameZ = lat * 1024

function ProjectionCartesian() {}

// this is surely off as I am using images of size 256 and not 512.  someone smarter than me figure
// it out
ProjectionCartesian.prototype.fromLatLngToPoint = function (latLng) {
  return new google.maps.Point(latLng.lng() * 512 / 32, latLng.lat() * 512 / 32);
};

ProjectionCartesian.prototype.fromPointToLatLng = function (point, noWrap) {
  return new google.maps.LatLng(point.y / 512 * 32, point.x / 512 * 32, noWrap);
};

// icon definitions for markers

var iconSpawn = {
  path: google.maps.SymbolPath.CIRCLE,
  fillColor: "red",
  fillOpacity: 1.0,
  scale: 4,
  strokeColor: "black",
  strokeWeight: 1
};

var iconPortal = {
  path: 'M -1,-1 1,-1 1,1 -1,1 z',
  fillColor: "purple",
  fillOpacity: 1.0,
  scale: 4,
  strokeColor: "black",
  strokeWeight: 1
};

// the initialization function, called when the page body loads

function initialize() {
  var mapOptions = {
    center: new google.maps.LatLng(0, 0),
    zoom: 4,
    streetViewControl: false,
    zoomControl: true,
    panControl: false,
    scaleControl: false,
    mapTypeControlOptions: {
      mapTypeIds: ['overworld']
    }
  };

  map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);

  // can define multiple mapTypes (similar to how standard google maps has satellite, map, hybrid).
  var mapTypeOverworld = new google.maps.ImageMapType({
    getTileUrl: function (coord, zoom) {
      var z = Math.pow(2, zoom - 4);
      return 'Overworld/images/z' + z + '/' + coord.x + ',' + coord.y + '.png';
    },
    tileSize: new google.maps.Size(256, 256), // size of image.  their native size to display 1 to 1
    maxZoom: 6,
    minZoom: 0,
    name: 'Overworld'
  });

  // use the custom latitude and logitude projection
  mapTypeOverworld.projection = new ProjectionCartesian();

  // add the map type to the map
  map.mapTypes.set('overworld', mapTypeOverworld);
  map.setMapTypeId('overworld');

  // listener for clicks on the map surface
  google.maps.event.addListener(map, 'rightclick', function (event) {
    toggleAllMarkers();
  });

  markers.forEach(function (m) {
    addMarker(m.x, m.z, m.icon || iconSpawn, m.title);
  });
}
