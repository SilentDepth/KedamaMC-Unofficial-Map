const Tile = require('../src/tile');

// let t = new Tile('../tiles/voxelmap/images/z1/0,0.png');
// t.zoomIn().write('E:/Repo/kedamamc-unofficial-map/test');

new Promise((resolve) => {
  'use strict';
  console.log(1)
  resolve()
}).then(() => {
  'use strict';
  console.log(2)
  return Promise.resolve('hello world')
}).catch(() => {
  'use strict';
  console.log('no')
}).then(val => {
  'use strict';
  console.log(3)
  console.log(val)
})