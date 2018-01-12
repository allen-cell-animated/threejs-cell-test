import * as THREE from 'three';
import { createMaterialMap } from './constants';
import STLLoader from 'three-stl-loader';

import { ShaderToon } from '../../thirdparty/threejs/ShaderToon_module';

const threeStlLoader = STLLoader(THREE);


class ThreeScene {
  constructor() {
    this.MARGIN = 0;

    this.SCREEN_WIDTH = window.innerWidth;
    this.SCREEN_HEIGHT = window.innerHeight - (2 * this.MARGIN);
    this.camera = new THREE.PerspectiveCamera(45, this.SCREEN_WIDTH / this.SCREEN_HEIGHT, 0.1, 2);
    this.scene = new THREE.Scene();
    this.light = new THREE.DirectionalLight(0xffffff);
    this.pointLight = new THREE.PointLight(0xff3300);
    this.ambientLight = new THREE.AmbientLight(0x080808);
    this.manager = new THREE.LoadingManager();
    this.renderer = new THREE.WebGLRenderer();
  }

  createDomElement() {
    const {
      camera,
      scene,
      light,
      pointLight,
      ambientLight,
      renderer,
    } = this;
    // CAMERA
    const lightContainer = new THREE.Object3D();

    camera.position.set(-0.5, 0.5, 1);
    // SCENE
    scene.background = new THREE.Color(0xFFFFFF);
    // LIGHTS
    light.position.set(0.5, 0.5, 1);
    lightContainer.add(light);

    pointLight.position.set(0, 0, 3);
    lightContainer.add(pointLight);

    lightContainer.add(ambientLight);

    scene.add(lightContainer);
    this.lightContainer = lightContainer;
    // RENDERER
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(this.SCREEN_WIDTH, this.SCREEN_HEIGHT);

    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = `${this.MARGIN}px`;
    renderer.domElement.style.left = '0px';

    renderer.gammaInput = true;
    renderer.gammaOutput = true;

    return renderer.domElement;
  }

  createShaderMaterial(id) {
    const {
      light,
      ambientLight,
    } = this;
    const shader = ShaderToon[id];

    const u = THREE.UniformsUtils.clone(shader.uniforms);

    const vs = shader.vertexShader;
    const fs = shader.fragmentShader;

    const material = new THREE.ShaderMaterial({
      uniforms: u,
      vertexShader: vs,
      fragmentShader: fs,
    });
    material.uniforms.uDirLightPos.value = light.position;
    material.uniforms.uDirLightColor.value = light.color;


    material.uniforms.uAmbientLightColor.value = ambientLight.color;
    return material;
  }

  generateMaterials() {
    // toons
    const toonMaterial1 = this.createShaderMaterial('toon1');
    const toonMaterial2 = this.createShaderMaterial('toon2');
    const hatchingMaterial = this.createShaderMaterial('hatching');
    const hatchingMaterial2 = this.createShaderMaterial('hatching');
    const dottedMaterial = this.createShaderMaterial('dotted');
    const dottedMaterial2 = this.createShaderMaterial('dotted');

    const materialsMap = createMaterialMap(
      toonMaterial1,
      toonMaterial2,
      hatchingMaterial,
      hatchingMaterial2,
      dottedMaterial,
      dottedMaterial2,
    );

    hatchingMaterial2.uniforms.uBaseColor.value.setRGB(0, 0, 0);
    hatchingMaterial2.uniforms.uLineColor1.value.setHSL(0, 0.8, 0.5);
    hatchingMaterial2.uniforms.uLineColor2.value.setHSL(0, 0.8, 0.5);
    hatchingMaterial2.uniforms.uLineColor3.value.setHSL(0, 0.8, 0.5);
    hatchingMaterial2.uniforms.uLineColor4.value.setHSL(0.1, 0.8, 0.5);
    dottedMaterial2.uniforms.uBaseColor.value.setRGB(0, 0, 0);
    dottedMaterial2.uniforms.uLineColor1.value.setHSL(0.05, 1.0, 0.5);

    const newMembraneMaterial = Object.assign(
      materialsMap.toon1.m,
      {
        transparent: true,
        opacity: 0.35,
        uniforms: {
          opacity: { type: 'f', value: 0.15 },
        },
      },
    );

    return {
      cellMembraneMat: newMembraneMaterial,
      cellNucleusMat: materialsMap.matte.m,
      cellStructureMat: materialsMap.colors.m,
    };
  }

  static loadStl(filename, material) {
    const onProgress = function (xhr) {
      if (xhr.lengthComputable) {
        const percentComplete = xhr.loaded / xhr.total * 100;
        console.log(`${Math.round(percentComplete, 2)}% downloaded`);
      }
    };
    const onError = function (xhr) {
      console.log('MESH LOAD ERROR');
    };
    const loaderstl = new threeStlLoader();
    return new Promise((resolve, reject) => {
      loaderstl.load(filename, (geometry) => {
        const rawgeometry = new THREE.Geometry().fromBufferGeometry(geometry);
        rawgeometry.mergeVertices();
        rawgeometry.computeVertexNormals();
        const geo = new THREE.BufferGeometry().fromGeometry(rawgeometry);
        const object = new THREE.Mesh(geo, material);
        resolve(object);
      }, onProgress, onError);
    });
  }

  loadObj(structure, material) {
    const {
      manager,
    } = this;
    manager.onProgress = function manageronProgress(item, loaded, total) {
      console.log(item, loaded, total);
    };

    function onProgress(xhr) {
      if (xhr.lengthComputable) {
        const percentComplete = xhr.loaded / (xhr.total * 100);
        console.log(`${Math.round(percentComplete, 2)}% downloaded`);
      }
    }

    const loader = new THREE.OBJLoader(manager);

    return new Promise((resolve, reject) => {
      loader.load(structure, (object) => {
        object.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material = material;
            child.geometry.computeBoundingBox();
          } else {
            reject(new Error('There is no mesh in this object'));
          }
        });

        resolve(object);
      }, onProgress, reject);
    });
  }
}


export default ThreeScene;
