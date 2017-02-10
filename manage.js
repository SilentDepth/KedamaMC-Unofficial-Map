'use strict';

function CoordMapType(tileSizeW, tileSizeH) {
  this.tileSize = new google.maps.Size(tileSizeW, tileSizeH);
}
CoordMapType.prototype.getTile = function (coord, zoom, ownDocument) {
  var div = ownDocument.createElement('div');
  div.innerHTML = coord;
  div.style.width = this.tileSize.width + 'px';
  div.style.height = this.tileSize.height + 'px';
  div.style.fontSize = this.tileSize.width / 10 + 'px';
  div.style.color = '#FFF';
  div.style.textAlign = 'center';
  div.style.lineHeight = this.tileSize.height + 'px';
  div.style.textShadow = '0 0 10px #000';
  div.style.border = '1px solid rgba(255,255,255,.5)';
  return div;
};

function enableManage() {
  map.overlayMapTypes.insertAt(0, new CoordMapType(512, 512));
}