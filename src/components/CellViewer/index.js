import React from 'react';
import * as THREE from 'three';
import OBJLoader from 'three-obj-loader';
import dat from 'dat.gui-mirror/build/dat.gui';
import OrbitControls from 'three-orbitcontrols';

import { effectController, createMaterialMap, createShaderMaterial } from '../../util/constants';

OBJLoader(THREE);
// OrbitControls(THREE);

const MARGIN = 0;

let SCREEN_WIDTH = window.innerWidth;
let SCREEN_HEIGHT = window.innerHeight - 2 * MARGIN;


class CellViewer extends React.Component {
  constructor(props) {
    super(props);

    this.onWindowResize = this.onWindowResize.bind(this);
    this.setupGui = this.setupGui.bind(this);
    this.init = this.init.bind(this);
    this.generateMaterials = this.generateMaterials.bind(this);
    this.animate = this.animate.bind(this);
    this.renderCell = this.renderCell.bind(this);

    this.state = {
      camera: new THREE.PerspectiveCamera(45, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 10000),
      clock: new THREE.Clock(),
      scene: new THREE.Scene(),
      light: new THREE.DirectionalLight(0xffffff),
      pointLight: new THREE.PointLight(0xff3300),
      ambientLight: new THREE.AmbientLight(0x080808),
      manager: new THREE.LoadingManager(),
      renderer: new THREE.WebGLRenderer(),
      currentMaterial: undefined,
      cellMembrane: undefined,
      cellNucleus: undefined,
      cellMembraneMat: undefined,
      cellNucleusMat: undefined,
      resolution: undefined,
      time: 0,
    };
  }

  onWindowResize() {
    const {
      camera,
      renderer,
    } = this.state;
    SCREEN_WIDTH = window.innerWidth;
    SCREEN_HEIGHT = window.innerHeight;

    camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
    camera.updateProjectionMatrix();

    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  }

  setupGui() {
    const {
      materials,
      cellMembrane,
      cellNucleus,
      currentMaterial,
    } = this.state;

    let h;
    let matHue;
    let matSat;
    let matLum;
    let matAlpha;

    function createHandler(id) {
      return function handler() {
        const matOld = materials[currentMaterial];
        matOld.h = matHue.getValue();
        matOld.s = matSat.getValue();
        matOld.l = matLum.getValue();

        this.setState({ currentMaterial: id });

        const mat = materials[id];

        cellMembrane.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material = mat.m;
            child.material.transparent = true;
          }
        });
        cellNucleus.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material = mat.m;
          }
        });

        matHue.setValue(mat.h);
        matSat.setValue(mat.s);
        matLum.setValue(mat.l);
      };
    }
    const gui = new dat.GUI();

    // material (type)
    h = gui.addFolder('Materials');

    for (const m in materials) {
      effectController[m] = createHandler(m);
      h.add(effectController, m).name(m);
    }

    // material (color)

    h = gui.addFolder('Material color');

    matHue = h.add(effectController, 'hue', 0.0, 1.0, 0.025);
    matSat = h.add(effectController, 'saturation', 0.0, 1.0, 0.025);
    matLum = h.add(effectController, 'lightness', 0.0, 1.0, 0.025);
    matAlpha = h.add(effectController, 'alpha', 0.0, 1.0, 0.025);

    // light (point)

    h = gui.addFolder('Point light color');

    h.add(effectController, 'lhue', 0.0, 1.0, 0.025).name('hue');
    h.add(effectController, 'lsaturation', 0.0, 1.0, 0.025).name('saturation');
    h.add(effectController, 'llightness', 0.0, 1.0, 0.025).name('lightness');

    // light (directional)

    h = gui.addFolder('Directional light orientation');

    h.add(effectController, 'lx', -1.0, 1.0, 0.025).name('x');
    h.add(effectController, 'ly', -1.0, 1.0, 0.025).name('y');
    h.add(effectController, 'lz', -1.0, 1.0, 0.025).name('z');

    // simulation

    h = gui.addFolder('Simulation');

    h.add(effectController, 'speed', 0.1, 8.0, 0.05);
    h.add(effectController, 'numBlobs', 1, 50, 1);
    h.add(effectController, 'resolution', 14, 100, 1);
    h.add(effectController, 'isolation', 10, 300, 1);

    h.add(effectController, 'floor');
    h.add(effectController, 'wallx');
    h.add(effectController, 'wallz');

    // rendering

    h = gui.addFolder('Rendering');
    h.add(effectController, 'postprocessing');
  }

  init() {
    const {
      camera,
      scene,
      light,
      pointLight,
      ambientLight,
      manager,
      renderer,
      cellMembraneMat,
      cellNucleusMat,
    } = this.state;
    // CAMERA
    const container = document.getElementById('container');

    camera.position.set(-500, 500, 1500);
    // SCENE
    scene.background = new THREE.Color(0xFFFFFF);

    // LIGHTS
    light.position.set(0.5, 0.5, 1);
    scene.add(light);

    pointLight.position.set(0, 0, 100);
    scene.add(pointLight);

    scene.add(ambientLight);
    this.setState({
      camera, light, pointLight, scene,
    });
    // GUI
    this.setupGui();
    // LOAD MESHES

    manager.onProgress = function manageronProgress(item, loaded, total) {
      console.log(item, loaded, total);
    };

    const onProgress = function (xhr) {
      if (xhr.lengthComputable) {
        const percentComplete = xhr.loaded / xhr.total * 100;
        console.log(`${Math.round(percentComplete, 2)}% downloaded`);
      }
    };
    const onError = function (xhr) {
    };

    const loader = new THREE.OBJLoader(manager);

    loader.load('cell06/mesh/cell.obj', (cellMembrane) => {
      cellMembrane.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = cellMembraneMat;
        }
      });
      // object.position.y = - 95;
      scene.add(cellMembrane);
      // this.setState({ cellMembrane, scene });
    }, onProgress, onError);
    const loader2 = new THREE.OBJLoader(manager);
    loader2.load('cell06/mesh/nucleus.obj', (cellNucleus) => {
      cellNucleus.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = cellNucleusMat;
        }
      });
      // object.position.y = - 95;
      scene.add(cellNucleus);
      // this.setState({ cellNucleus, scene });
    }, onProgress, onError);

    // RENDERER

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);

    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = `${MARGIN}px`;
    renderer.domElement.style.left = '0px';
    container.appendChild(renderer.domElement);

    renderer.gammaInput = true;
    renderer.gammaOutput = true;

    this.setState({ renderer });
    // CONTROLS

    const controls = new OrbitControls(camera, renderer.domElement);

    // STATS


    // EVENTS
    window.addEventListener('resize', this.onWindowResize, false);
  }


  generateMaterials() {
    // environment map
    const {
      light,
      ambientLight,
    } = this.state;
    // toons
    const toonMaterial1 = createShaderMaterial('toon1', light, ambientLight);
    const toonMaterial2 = createShaderMaterial('toon2', light, ambientLight);
    const hatchingMaterial = createShaderMaterial('hatching', light, ambientLight);
    const hatchingMaterial2 = createShaderMaterial('hatching', light, ambientLight);
    const dottedMaterial = createShaderMaterial('dotted', light, ambientLight);
    const dottedMaterial2 = createShaderMaterial('dotted', light, ambientLight);
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

    this.setState({
      cellMembraneMat: newMembraneMaterial,
      cellNucleusMat: materialsMap.matte.m,
    });
    return materialsMap;
  }


  animate() {
    requestAnimationFrame(this.animate);

    this.renderCell();
    // stats.update();
  }

  renderCell() {
    const {
      time,
      clock,
      camera,
      scene,
      light,
      pointLight,
      renderer,
      resolution,
    } = this.state;
    const delta = clock.getDelta();

    this.setState({ time: time + delta * effectController.speed * 0.5 });
    // marching cubes

    if (effectController.resolution !== resolution) {
      this.setState({
        resolution: effectController.resolution,
      });
    }
    // lights

    light.position.set(effectController.lx, effectController.ly, effectController.lz);
    light.position.normalize();

    pointLight.color.setHSL(
      effectController.lhue,
      effectController.lsaturation,
      effectController.llightness,
    );

    renderer.clear();
    renderer.render(scene, camera);
    this.setState({ renderer, light, pointLight });
  }

  componentWillMount() {
    this.setState({ materials: this.generateMaterials() });
  }

  componentDidMount() {
    this.init();
    this.animate();
  }

  render() {
    // const stats = new Stats();
    return (
      <div>
        <div id="container" />
        <div id="info">
          <a href="http://threejs.org" target="_blank" rel="noopener">three.js</a> - cell viewer
        </div>
      </div>

    );
  }
}

export default CellViewer;
