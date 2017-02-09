'use strict';

var markerArray = [];
var map = null;
var markerVisibility = true;
var iconSpawn;
var iconPortal;
var $coordInput;

// functions to add, hide, and delete markers

function projectMarker(m) {
  return new google.maps.LatLng((m.z + .5) / 256, (m.x + .5) / 256);
}

function addMarker(m) {
  var marker = new google.maps.Marker({
    position: projectMarker(m),
    map: map,
    icon: m.icon || iconSpawn,
    title: m.title + "\n(" + m.x + ", " + (m.y !== void 0 ? m.y + ', ' : '') + m.z + ")"
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

function initialize() {
  iconSpawn = {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: "red",
    fillOpacity: 1.0,
    scale: 4,
    strokeColor: "black",
    strokeWeight: 1
  };
  iconPortal = {
    path: 'M -1,-1 1,-1 1,1 -1,1 z',
    fillColor: "purple",
    fillOpacity: 1.0,
    scale: 4,
    strokeColor: "black",
    strokeWeight: 1
  };

  var mapOptions = {
    center: new google.maps.LatLng(0, 0),
    zoom: 4,
    streetViewControl: false,
    zoomControl: true,
    panControl: false,
    scaleControl: false,
    backgroundColor: '#000',
    mapTypeControlOptions: {
      mapTypeIds: ['voxelmap', 'journeymap', 'journeymap_night', 'journeymap_topo']
    }
  };

  map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);

  // can define multiple mapTypes (similar to how standard google maps has satellite, map, hybrid).
  var mapTypeOverworldVM = new google.maps.ImageMapType({
    getTileUrl: function (coord, zoom) {
      var z = Math.pow(2, zoom - 4);
      return 'tiles/voxelmap/images/z' + z + '/' + coord.x + ',' + coord.y + '.png';
    },
    tileSize: new google.maps.Size(256, 256), // size of image.  their native size to display 1 to 1
    maxZoom: 6,
    minZoom: 0,
    name: 'Minecraft 风格'
  });
  var mapTypeOverworldJM = new google.maps.ImageMapType({
    getTileUrl: function (coord, zoom) {
      var z = Math.pow(2, zoom - 4);
      return 'tiles/journeymap/images/z' + z + '/' + coord.x + ',' + coord.y + '.png';
    },
    tileSize: new google.maps.Size(512, 512), // size of image.  their native size to display 1 to 1
    maxZoom: 6,
    minZoom: 0,
    name: 'JourneyMap 风格'
  });
  var mapTypeOverworldJMN = new google.maps.ImageMapType({
    getTileUrl: function (coord, zoom) {
      var z = Math.pow(2, zoom - 4);
      return 'tiles/journeymap_night/images/z' + z + '/' + coord.x + ',' + coord.y + '.png';
    },
    tileSize: new google.maps.Size(512, 512), // size of image.  their native size to display 1 to 1
    maxZoom: 6,
    minZoom: 0,
    name: '夜间风格'
  });
  var mapTypeOverworldJMT = new google.maps.ImageMapType({
    getTileUrl: function (coord, zoom) {
      var z = Math.pow(2, zoom - 4);
      return 'tiles/journeymap_topo/images/z' + z + '/' + coord.x + ',' + coord.y + '.png';
    },
    tileSize: new google.maps.Size(512, 512), // size of image.  their native size to display 1 to 1
    maxZoom: 6,
    minZoom: 0,
    name: '等高线风格'
  });

  // use the custom latitude and logitude projection
  mapTypeOverworldVM.projection = new ProjectionCartesian();
  mapTypeOverworldJM.projection = new ProjectionCartesian();
  mapTypeOverworldJMN.projection = new ProjectionCartesian();
  mapTypeOverworldJMT.projection = new ProjectionCartesian();

  // add the map type to the map
  map.mapTypes.set('voxelmap', mapTypeOverworldVM);
  map.mapTypes.set('journeymap', mapTypeOverworldJM);
  map.mapTypes.set('journeymap_night', mapTypeOverworldJMN);
  // map.mapTypes.set('journeymap_topo', mapTypeOverworldJMT);
  map.setMapTypeId('journeymap');

  // listener for clicks on the map surface
  google.maps.event.addListener(map, 'rightclick', function (event) {
    toggleAllMarkers();
  });

  markers.forEach(function (m) {
    addMarker(m);
  });

  $coordInput = document.querySelector('#coord');
  map.addListener('mousemove', function (ev) {
    var x = Math.round(ev.latLng.lng() * 256);
    var z = Math.round(ev.latLng.lat() * 256);
    $coordInput.value = x + ' , ' + z;
  });
}

function changeApiSrc(ev) {
  if (ev.target.tagName !== 'A') return;
  localStorage.apiSrc = ev.target.dataset.id;
  location.reload();
}
