
import * as THREE from './Assets/Scripts/THREE/build/three.module.js';

import Stats from './Assets/Scripts/THREE/examples/jsm/libs/stats.module.js';

import { OrbitControls } from './Assets/Scripts/THREE/examples/jsm/controls/OrbitControls.js';
// import { OBJLoader } from './Assets/Scripts/THREE/examples/jsm/loaders/OBJLoader.js';
import {GLTFLoader} from './Assets/Scripts/THREE/examples/jsm/loaders/GLTFLoader.js';
import {STLLoader} from './Assets/Scripts/THREE/examples/jsm/loaders/STLLoader.js';
import { VRButton } from './Assets/Scripts/THREE/examples/jsm/webxr/VRButton.js';
import { XRControllerModelFactory } from './Assets/Scripts/THREE/examples/jsm/webxr/XRControllerModelFactory.js';
import { XRHandModelFactory } from './Assets/Scripts/THREE/examples/jsm/webxr/XRHandModelFactory.js';
import { CanvasUI } from './Assets/Scripts/canvas/CanvasUI.js';
//import { controllers } from './Assets/Scripts/THREE/examples/jsm/libs/dat.gui.module.js';

const clock = new THREE.Clock();

let container, stats;

let camera, scene, renderer;
let raycaster, workingMatrix, workingVector;

let controllers, highlight;

let handModels, currentHandModel, hand1, hand2;
let controller1, controller2;
let controllerGrip1, controllerGrip2;
let controls;

let ui;

let pointLight;

init();
animate();

function init() {

	container = document.createElement( 'div' );
	document.body.appendChild( container );

	camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 5000 );
	//camera.position.z = 2000;
	camera.position.set(0, 1.6, 0);

	//cubemap
	const path = './Assets/Images/';
	const format = '.jpg';
	const urls = [
		path + 'px' + format, path + 'nx' + format,
		path + 'py' + format, path + 'ny' + format,
		path + 'pz' + format, path + 'nz' + format
	];

	const reflectionCube = new THREE.CubeTextureLoader().load( urls );
	const refractionCube = new THREE.CubeTextureLoader().load( urls );
	refractionCube.mapping = THREE.CubeRefractionMapping;

	scene = new THREE.Scene();
	scene.background = reflectionCube;

	//lights
	scene.add(new THREE.AmbientLight(0xffffff));

	//pointLight = new THREE.PointLight( 0xffffff, 2 );
	scene.add(new THREE.PointLight(0xffffff, 2));

	//Load models
	loadModels('stl', 'https://drive.google.com/file/d/1cn284pT72Qt7gUkdk_ZXeUZWOdJKmYF_/view?usp=sharing');
	// loadModels('stl', './Assets/Scripts/THREE/examples/models/stl/binary/colored.stl');

	//materials
	const cubeMaterial3 = new THREE.MeshLambertMaterial( { color: 0xff6600, envMap: reflectionCube, combine: THREE.MixOperation, reflectivity: 0.3 } );
	const cubeMaterial2 = new THREE.MeshLambertMaterial( { color: 0xffee00, envMap: refractionCube, refractionRatio: 0.95 } );
	const cubeMaterial1 = new THREE.MeshLambertMaterial( { color: 0xffffff, envMap: reflectionCube } );

	//renderer
	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );

	// Raycaster
	raycaster = new THREE.Raycaster();
	workingMatrix = new THREE.Matrix4();
	workingVector = new THREE.Vector3();


	//controls
	controls = new OrbitControls(camera, container);
	controls.target.set(0, 1.6, 0);
	controls.update();

	//const controls = new OrbitControls( camera, renderer.domElement );
	//controls.enableZoom = false;
	//controls.enablePan = false;
	//controls.minPolarAngle = Math.PI / 4;
	//controls.maxPolarAngle = Math.PI / 1.5;

	setupXR();

	//stats
	stats = new Stats();
	container.appendChild( stats.dom );

	window.addEventListener('resize', onWindowResize);
}

async function loadModels(model_type, model_url){
	// Ref: https://discoverthreejs.com/book/first-steps/load-models/https://sbcode.net/threejs/loaders-stl/
	var loader;
	const material = new THREE.MeshPhysicalMaterial({
		color: 0xb2ffc8,
		side: THREE.DoubleSide,
		roughness: 0.1,
		metalness: .25
	});
	switch(model_type){
		case "gltf":
			loader = new GLTFLoader();
		case "stl":
			loader = new STLLoader();
	}
	loader.load(
		model_url,
		function(geometry){
			const mesh = new THREE.Mesh(geometry, material);
			scene.add(mesh);
			mesh.position.z = 5;
		},
		(xhr) => {
			console.log((xhr.loaded/xhr.total*100)+'% loaded');
		},
		(error)=>{
			console.log(error);
		}
	);
}

function setupXR() {
	renderer.xr.enabled = true;
	document.body.appendChild(VRButton.createButton(renderer));

	// Controllers and Hand Tracking
	const controllerModelFactory = new XRControllerModelFactory();
	const handModelFactory = new XRHandModelFactory().setPath("./Assets/Scripts/THREE/examples/models/fbx/");

	// Controller 1
	controller1 = renderer.xr.getController(0);
	scene.add(controller1);

	// Controller 2
	controller2 = renderer.xr.getController(1);
	scene.add(controller2);

	// Controller Grip 1
	controllerGrip1 = renderer.xr.getControllerGrip(0);
	controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
	scene.add(controllerGrip1);

	// Controller Grip 2
	controllerGrip2 = renderer.xr.getControllerGrip(1);
	controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2));
	scene.add(controllerGrip2);

	// Hand 1
	hand1 = renderer.xr.getHand(0);
	hand1.add(handModelFactory.createHandModel(hand1, "spheres"));
	scene.add(hand1);

	// Hand 2
	hand2 = renderer.xr.getHand(1);
	hand2.add(handModelFactory.createHandModel(hand2, "spheres"));
	scene.add(hand2);

	// Handle controllers/hands
	const geometry = new THREE.BufferGeometry().setFromPoints([
		new THREE.Vector3(0, 0, 0),
		new THREE.Vector3(0, 0, -1)
	]);

	const line = new THREE.Line(geometry);
	line.name = 'line';
	line.scale.z = 5;

	controller1.add(line.clone());
	controller2.add(line.clone());

	ui = createUI();
}

function createUI() {
	const css = {
		header: {
			type: "text",
			position: {
				top: 0
			},
			paddingTop: 30,
			height: 70
		},
		main: {
			type: "text",
			position: {
				top: 70
			},
			height: 140,
			backgroundColor: "#bbb",
			fontColor: "#000"
		},
		footer: {
			type: "text",
			position: {
				bottom: 0
			},
			paddingTop: 30,
			height: 70
		}
	}

	const content = {
		header: "Welcome to the Walt Head Exhibit!",
		main: "This application is a test of capabilities of WebXR using Handtracking and VR controllers. ",
		footer: "Pratik Pradhan"
	}

	const ui = new CanvasUI(content, css);
	//ui.update();
	ui.mesh.position.set(0, 1.5, -1.2);
	camera.attach(ui.mesh);

	return ui;
}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

	/*requestAnimationFrame( animate )*/;
	render();

}

function render() {
	stats.update();
	if(renderer.xr.isPresenting) ui.update();

	renderer.render( scene, camera );
	renderer.setAnimationLoop(render);

}