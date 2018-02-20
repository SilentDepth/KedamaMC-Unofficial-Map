'use strict';

var Z1 = 5;
var SCALE = 100;
var FACTOR = SCALE * (1 << Z1);
var ICONS = {};

var $coordInput = document.querySelector('#coord');
var infoWindow;
var map = null;
var markers = [];
var markerVisibility = true;

var bordersV1 = [];
var bordersV2 = [];

var dblclickTimeout;

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
      mapTypeIds: ['journeymap', 'journeymap_night', 'journeymap_topo', 'v1_day', 'v1_night', 'v1_topo']
    }
  });
  infoWindow = new google.maps.InfoWindow();

  regMapTypes();

  regIcons();

  // Draw world border
  bordersV2.push(new google.maps.Circle({
    map: map,
    strokeColor: '#F0F',
    strokeWeigth: 4,
    strokeOpacity: .5,
    fillOpacity: 0,
    clickable: false,
    center: new google.maps.LatLng(0, 0),
    radius: google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(0, 0), calcPosition(4800, 0))
  }));

  // Draw inner ring border
  bordersV2.push(new google.maps.Circle({
    map: map,
    strokeColor: '#FFF',
    strokeWeight: 1,
    strokeOpacity: .5,
    fillOpacity: 0,
    clickable: false,
    center: new google.maps.LatLng(0, 0),
    radius: google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(0, 0), calcPosition(2048, 0))
  }));

  bordersV1.push(new google.maps.Circle({
    map: map,
    visible: false,
    strokeColor: '#FFF',
    strokeWeight: 1,
    strokeOpacity: .5,
    fillOpacity: 0,
    clickable: false,
    center: new google.maps.LatLng(0, 0),
    radius: google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(0, 0), calcPosition(2048, 0))
  }));

  bordersV1.push(new google.maps.Circle({
    map: map,
    visible: false,
    strokeColor: '#FFF',
    strokeWeight: 1,
    strokeOpacity: .5,
    fillOpacity: 0,
    clickable: false,
    center: new google.maps.LatLng(0, 0),
    radius: google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(0, 0), calcPosition(4096, 0))
  }));

  bordersV1.push(new google.maps.Circle({
    map: map,
    visible: false,
    strokeColor: '#F0F',
    strokeWeight: 4,
    strokeOpacity: .5,
    fillOpacity: 0,
    clickable: false,
    center: new google.maps.LatLng(0, 0),
    radius: google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(0, 0), calcPosition(4800, 0))
  }));

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
  // var mapTypeOverworldVM = new google.maps.ImageMapType({
  //   getTileUrl: function (coord, zoom) {
  //     return 'tiles/voxelmap/images/z' + Math.pow(2, zoom - Z1) + '/' + coord.x + ',' + coord.y + '.png';
  //   },
  //   tileSize: new google.maps.Size(256, 256), // size of image.  their native size to display 1 to 1
  //   minZoom: Z1 - 4,
  //   maxZoom: Z1 + 2,
  //   name: 'Minecraft 风格'
  // });
  var mapTypeOverworldJM = new google.maps.ImageMapType({
    getTileUrl: function (coord, zoom) {
      return 'tiles/journeymap/images/z' + Math.pow(2, zoom - Z1) + '/' + coord.x + ',' + coord.y + '.png';
    },
    tileSize: new google.maps.Size(512, 512),
    minZoom: Z1 - 4,
    maxZoom: Z1 + 2,
    name: 'JourneyMap 风格'
  });
  var mapTypeOverworldJMN = new google.maps.ImageMapType({
    getTileUrl: function (coord, zoom) {
      return 'tiles/journeymap_night/images/z' + Math.pow(2, zoom - Z1) + '/' + coord.x + ',' + coord.y + '.png';
    },
    tileSize: new google.maps.Size(512, 512),
    minZoom: Z1 - 4,
    maxZoom: Z1 + 2,
    name: '夜间风格'
  });
  var mapTypeOverworldJMT = new google.maps.ImageMapType({
    getTileUrl: function (coord, zoom) {
      return 'tiles/journeymap_topo/images/z' + Math.pow(2, zoom - Z1) + '/' + coord.x + ',' + coord.y + '.png';
    },
    tileSize: new google.maps.Size(512, 512),
    minZoom: Z1 - 4,
    maxZoom: Z1 + 2,
    name: '等高线风格'
  });
  var mapTypeV1OverworldJM = new google.maps.ImageMapType({
    getTileUrl: function (coord, zoom) {
      return 'tiles/v1/day/z' + Math.pow(2, zoom - Z1) + '/' + coord.x + ',' + coord.y + '.png';
    },
    tileSize: new google.maps.Size(512, 512),
    minZoom: Z1 - 4,
    maxZoom: Z1 + 2,
    name: '日间 (v1)'
  });
  var mapTypeV1OverworldJMN = new google.maps.ImageMapType({
    getTileUrl: function (coord, zoom) {
      return 'tiles/v1/night/z' + Math.pow(2, zoom - Z1) + '/' + coord.x + ',' + coord.y + '.png';
    },
    tileSize: new google.maps.Size(512, 512),
    minZoom: Z1 - 4,
    maxZoom: Z1 + 2,
    name: '夜间 (v1)'
  });
  var mapTypeV1OverworldJMT = new google.maps.ImageMapType({
    getTileUrl: function (coord, zoom) {
      return 'tiles/v1/topo/z' + Math.pow(2, zoom - Z1) + '/' + coord.x + ',' + coord.y + '.png';
    },
    tileSize: new google.maps.Size(512, 512),
    minZoom: Z1 - 4,
    maxZoom: Z1 + 2,
    name: '等高线 (v1)'
  });

  // mapTypeOverworldVM.projection = new ProjectionCartesian();
  mapTypeOverworldJM.projection = new ProjectionCartesian();
  mapTypeOverworldJMN.projection = new ProjectionCartesian();
  mapTypeOverworldJMT.projection = new ProjectionCartesian();
  mapTypeV1OverworldJM.projection = new ProjectionCartesian();
  mapTypeV1OverworldJMN.projection = new ProjectionCartesian();
  mapTypeV1OverworldJMT.projection = new ProjectionCartesian();

  // map.mapTypes.set('voxelmap', mapTypeOverworldVM);
  map.mapTypes.set('journeymap', mapTypeOverworldJM);
  map.mapTypes.set('journeymap_night', mapTypeOverworldJMN);
  map.mapTypes.set('journeymap_topo', mapTypeOverworldJMT);
  map.mapTypes.set('v1_day', mapTypeV1OverworldJM);
  map.mapTypes.set('v1_night', mapTypeV1OverworldJMN);
  map.mapTypes.set('v1_topo', mapTypeV1OverworldJMT);

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
    position: calcPosition(m.x, m.z),
    map: map,
    icon: ICONS[m.type || 'default'],
    title: m.title + "\n(" + m.x + ", " + (m.y !== void 0 ? m.y + ', ' : '') + m.z + ")"
  });
  marker.addListener('click', function () {
    var contents = this.getTitle().split('\n');
    infoWindow.setContent('<strong>' + contents[0] + '</strong><br><span>' + contents[1] + '</span>');
    infoWindow.open(map, this);
  });
  markers.push(marker);
}

function toggleAllMarkers(toggleStatus) {
  markerVisibility = toggleStatus !== undefined ? toggleStatus : !markerVisibility;
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

  map.addListener('click', function (ev) {
    console.log(ev);
    var x = Math.round(ev.latLng.lng() * FACTOR);
    var z = Math.round(ev.latLng.lat() * FACTOR);
    infoWindow.setContent('(' + x + ',' + z + ')');
    infoWindow.setPosition(ev.latLng);
    dblclickTimeout = setTimeout(function () {
      infoWindow.open(map);
    }, 200);
  });

  map.addListener('dblclick', function () {
    if (dblclickTimeout) {
      clearTimeout(dblclickTimeout);
    }
  });

  map.addListener('maptypeid_changed', function () {
    if (map.mapTypeId.startsWith('v1')) {
      toggleAllMarkers(false);
      bordersV2.forEach(function (border) {
        border.setVisible(false);
      });
      bordersV1.forEach(function (border) {
        border.setVisible(true);
      });
    } else {
      toggleAllMarkers(true);
      bordersV1.forEach(function (border) {
        border.setVisible(false);
      });
      bordersV2.forEach(function (border) {
        border.setVisible(true);
      });
    }
  });
}

function calcPosition(x, z) {
  return new google.maps.LatLng((z + .5) / FACTOR, (x + .5) / FACTOR);
}
