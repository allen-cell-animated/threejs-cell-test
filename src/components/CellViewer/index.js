import React from 'react';
import * as THREE from 'three';
import OBJLoader from 'three-obj-loader';
import OrbitControls from 'three-orbitcontrols';
import ThreeScene from '../../util/threejsScene';
import { effectController } from '../../util/constants';


OBJLoader(THREE);
// OrbitControls(THREE);

const MARGIN = 0;

let SCREEN_WIDTH = window.innerWidth;
let SCREEN_HEIGHT = window.innerHeight - (2 * MARGIN);


class CellViewer extends React.Component {
  constructor(props) {
    super(props);

    this.onWindowResize = this.onWindowResize.bind(this);
    this.init = this.init.bind(this);
    this.animate = this.animate.bind(this);
    this.renderCell = this.renderCell.bind(this);
    this.threeScene = new ThreeScene();
    this.clock = new THREE.Clock();
    this.time = 0;
    this.resolution = undefined;
  }

  componentDidMount() {
    this.init();
    this.animate();
  }

  onWindowResize() {
    const { threeScene } = this;

    SCREEN_WIDTH = window.innerWidth;
    SCREEN_HEIGHT = window.innerHeight;

    threeScene.camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
    threeScene.camera.updateProjectionMatrix();
    threeScene.renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  }

  init() {
    const {
      membrane,
      nucleus,
      structure,
    } = this.props;
    const { threeScene } = this;
    const container = document.getElementById('container');
    const materials = threeScene.generateMaterials();
    const domElement = threeScene.createDomElement();
    const bbox = new THREE.Box3();

    // LOAD MESHES
    Promise.all([ThreeScene.loadStl(membrane, materials.cellMembraneMat),
      ThreeScene.loadStl(nucleus, materials.cellNucleusMat),
      ThreeScene.loadStl(structure, materials.cellStructureMat)]).then((objects) => {
      const pivot = new THREE.Object3D();
      // const center = objects[0].children[0].geometry.boundingBox;
      objects.forEach((object) => {
        // object.position.y -= (center.max.y - center.min.y) / 2;
        // object.position.x -= (center.max.x - center.min.x) / 2;
        // object.position.z -= (center.max.z - center.min.z) / 2;
        const box = new THREE.Box3().setFromObject(object);
        bbox.union(box);
        pivot.add(object);
      });
      threeScene.scene.add(pivot);
    });
    container.appendChild(domElement);

    // CONTROLS
    const controls = new OrbitControls(threeScene.camera, domElement);

    // EVENTS
    window.addEventListener('resize', this.onWindowResize, false);
  }


  animate() {
    requestAnimationFrame(this.animate);
    this.renderCell();
  }


  renderCell() {
    let { time } = this;
    const { clock, threeScene } = this;
    const delta = clock.getDelta();
    const increment = delta * 0.5 * effectController.speed;

    time += increment;

    if (effectController.resolution !== this.resolution) {
      this.resolution = effectController.resolution;
    }
    // lights
    threeScene.light.position.set(effectController.lx, effectController.ly, effectController.lz);
    threeScene.light.position.normalize();

    threeScene.pointLight.color.setHSL(
      effectController.lhue,
      effectController.lsaturation,
      effectController.llightness,
    );
    threeScene.lightContainer.rotation.setFromRotationMatrix(threeScene.camera.matrixWorld);
    threeScene.renderer.clear();
    threeScene.renderer.render(threeScene.scene, threeScene.camera);
  }

  render() {
    return (
      <div>
        <div id="container" />
      </div>
    );
  }
}

export default CellViewer;
