'use strict';

var Z1 = 5;
var SCALE = 10;
var FACTOR = SCALE * (1 << Z1);
var ICONS = {};

var $coordInput = document.querySelector('#coord');
var map = null;
var markers = [];
var markerVisibility = true;

function initialize() {
  map = new google.maps.Map(document.getElementById('map_canvas'), {
    center: new google.maps.LatLng(0, 0),
    zoom: Z1,
    streetViewControl: false,
    zoomControl: true,
    panControl: false,
    scaleControl: false,
    backgroundColor: '#000',
    mapTypeControlOptions: {
      mapTypeIds: ['voxelmap', 'journeymap', 'journeymap_night', 'journeymap_topo']
    }
  });

  regMapTypes();

  regIcons();

  // Draw world border
  new google.maps.Circle({
    map: map,
    strokeColor: '#F0F',
    strokeOpacity: .5,
    fillOpacity: 0,
    clickable: false,
    center: new google.maps.LatLng(0, 0),
    radius: google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(0, 0), calcPostion(4096, 0))
  });

  // Draw protected zone
  new google.maps.Rectangle({
    map: map,
    strokeColor: '#000',
    strokeOpacity: .5,
    fillColor: '#000',
    fillOpacity: .35,
    clickable: false,
    bounds: new google.maps.LatLngBounds(calcPostion(2 - 64, 11 - 64), calcPostion(2 + 64, 11 + 64))
  });

  markerData.forEach(function (m) {
    addMarker(m);
  });

  bindEvents();
}

function ProjectionCartesian() {}
ProjectionCartesian.prototype.fromLatLngToPoint = function (latLng) {
  return new google.maps.Point(latLng.lng() * SCALE, latLng.lat() * SCALE);
};
ProjectionCartesian.prototype.fromPointToLatLng = function (point, noWrap) {
  return new google.maps.LatLng(point.y / SCALE, point.x / SCALE, noWrap);
};

function regMapTypes() {
  var mapTypeOverworldVM = new google.maps.ImageMapType({
    getTileUrl: function (coord, zoom) {
      return 'tiles/voxelmap/images/z' + Math.pow(2, zoom - Z1) + '/' + coord.x + ',' + coord.y + '.png';
    },
    tileSize: new google.maps.Size(256, 256), // size of image.  their native size to display 1 to 1
    minZoom: Z1 - 4,
    maxZoom: Z1 + 2,
    name: 'Minecraft 风格'
  });
  var mapTypeOverworldJM = new google.maps.ImageMapType({
    getTileUrl: function (coord, zoom) {
      return 'tiles/journeymap/images/z' + Math.pow(2, zoom - Z1) + '/' + coord.x + ',' + coord.y + '.png';
    },
    tileSize: new google.maps.Size(512, 512), // size of image.  their native size to display 1 to 1
    minZoom: Z1 - 4,
    maxZoom: Z1 + 2,
    name: 'JourneyMap 风格'
  });
  var mapTypeOverworldJMN = new google.maps.ImageMapType({
    getTileUrl: function (coord, zoom) {
      return 'tiles/journeymap_night/images/z' + Math.pow(2, zoom - Z1) + '/' + coord.x + ',' + coord.y + '.png';
    },
    tileSize: new google.maps.Size(512, 512), // size of image.  their native size to display 1 to 1
    minZoom: Z1 - 4,
    maxZoom: Z1 + 2,
    name: '夜间风格'
  });
  var mapTypeOverworldJMT = new google.maps.ImageMapType({
    getTileUrl: function (coord, zoom) {
      return 'tiles/journeymap_topo/images/z' + Math.pow(2, zoom - Z1) + '/' + coord.x + ',' + coord.y + '.png';
    },
    tileSize: new google.maps.Size(512, 512), // size of image.  their native size to display 1 to 1
    minZoom: Z1 - 4,
    maxZoom: Z1 + 2,
    name: '等高线风格'
  });

  mapTypeOverworldVM.projection = new ProjectionCartesian();
  mapTypeOverworldJM.projection = new ProjectionCartesian();
  mapTypeOverworldJMN.projection = new ProjectionCartesian();
  mapTypeOverworldJMT.projection = new ProjectionCartesian();

  // map.mapTypes.set('voxelmap', mapTypeOverworldVM);
  map.mapTypes.set('journeymap', mapTypeOverworldJM);
  map.mapTypes.set('journeymap_night', mapTypeOverworldJMN);
  map.mapTypes.set('journeymap_topo', mapTypeOverworldJMT);

  map.setMapTypeId('journeymap');
}

function regIcons() {
  ICONS['default'] = {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: "red",
    fillOpacity: 1.0,
    scale: 4,
    strokeColor: "black",
    strokeWeight: 1
  };
  ICONS['portal'] = {
    path: 'M -2,-2.5 2,-2.5, 2,2.5 -2,2.5 z',
    fillColor: "purple",
    fillOpacity: 1,
    scale: 2,
    strokeColor: "black",
    strokeWeight: 2
  };
}

function addMarker(m) {
  var marker = new google.maps.Marker({
    position: calcPostion(m.x, m.z),
    map: map,
    icon: ICONS[m.type || 'default'],
    title: m.title + "\n(" + m.x + ", " + (m.y !== void 0 ? m.y + ', ' : '') + m.z + ")"
  });
  markers.push(marker);
}

function toggleAllMarkers() {
  markerVisibility = !markerVisibility;
  markers.forEach(function (marker) {
    marker.setVisible(markerVisibility);
  });
}

function bindEvents() {
  map.addListener('rightclick', function () {
    toggleAllMarkers();
  });

  map.addListener('mousemove', function (ev) {
    var x = Math.round(ev.latLng.lng() * FACTOR);
    var z = Math.round(ev.latLng.lat() * FACTOR);
    $coordInput.value = x + ' , ' + z;
  });
}

function calcPostion(x, z) {
  return new google.maps.LatLng((z + .5) / FACTOR, (x + .5) / FACTOR);
}
