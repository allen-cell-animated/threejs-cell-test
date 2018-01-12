import * as THREE from 'three';

export const effectController = {

  material: 'shiny',

  speed: 1.0,
  numBlobs: 10,
  resolution: 28,
  isolation: 80,

  floor: true,
  wallx: false,
  wallz: false,

  hue: 0.0,
  saturation: 0.8,
  lightness: 0.1,
  alpha: 0.5,

  lhue: 0.04,
  lsaturation: 1.0,
  llightness: 0.5,

  lx: 0.5,
  ly: 0.5,
  lz: 1.0,

  postprocessing: false,

  dummy() {
  },

};

export function createMaterialMap(
  toonMaterial1,
  toonMaterial2,
  hatchingMaterial,
  hatchingMaterial2,
  dottedMaterial,
  dottedMaterial2,
) {
  return {

    matte:
{
  m: new THREE.MeshPhongMaterial({ color: 0x003056, specular: 0x111111, shininess: 1 }),
  h: 0,
  s: 0.5,
  l: 1,
},
    flat:
{
  m: new THREE.MeshPhongMaterial({
    color: 0x000000, specular: 0x111111, shininess: 1, flatShading: true,
  }),
  h: 0,
  s: 0,
  l: 1,
},
    colors:
{
  m: new THREE.MeshPhongMaterial({
    color: 0x353565, specular: 0xffffff, shininess: 1, vertexColors: THREE.VertexColors,
  }),
  h: 0,
  s: 0,
  l: 1,
},
    plastic:
{
  m: new THREE.MeshPhongMaterial({ color: 0x000000, specular: 0x888888, shininess: 250 }),
  h: 0.6,
  s: 0.8,
  l: 0.1,
},

    toon1:
{
  m: toonMaterial1,
  h: 0.2,
  s: 1,
  l: 0.15,
},

    toon2:
{
  m: toonMaterial2,
  h: 0.4,
  s: 1,
  l: 0.75,
},

    hatching:
{
  m: hatchingMaterial,
  h: 0.2,
  s: 1,
  l: 0.9,
},

    hatching2:
{
  m: hatchingMaterial2,
  h: 0.0,
  s: 0.8,
  l: 0.5,
},

    dotted:
{
  m: dottedMaterial,
  h: 0.2,
  s: 1,
  l: 0.9,
},

    dotted2:
{
  m: dottedMaterial2,
  h: 0.1,
  s: 1,
  l: 0.5,
},

  };
}
