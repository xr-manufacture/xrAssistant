import * as THREE from './Assets/Scripts/THREE/build/three.module.js';
import {VRButton} from './Assets/Scripts/THREE/examples/jsm/webxr/VRButton.js';
// import { OrbitControls } from 'https://cdn.skypack.dev/three@<version>/examples/jsm/controls/OrbitControls.js';
// import './Assets/Scripts/THREE/examples/js/controls/OrbitControls.js';

function main(){
	/* Scene */
	const scene = new THREE.Scene();

	/* Camera */
	const camera = new THREE.PerspectiveCamera(
		75,
		window.innerWidth / window.innerHeight,
		0.1,
		1000
	);

	/* Windows renderer */
	const renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.xr.enabled = true;
	document.body.appendChild(renderer.domElement);

	/* Test Geometry */
	const geometry = new THREE.BoxGeometry();
	const material = new THREE.MeshBasicMaterial({
		color : 0x00ff00
	});
	const cube = new THREE.Mesh(geometry, material);
	scene.add(cube);

	camera.position.z = 5;

	document.body.appendChild(VRButton.createButton(renderer));
	
	renderer.setAnimationLoop(function(){
		renderer.render(scene, camera);
	})
}

main();
