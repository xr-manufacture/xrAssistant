import * as THREE from './Assets/Scripts/THREE/build/three.module.js';
//import {OrbitControls} from './Assets/Scripts/THREE/examples/js/controls/OrbitControls.js';

class App{
	constructor(){
		const container = document.createElement('div');
		document.body.appendChild( container );

		// write code here
		this camera = new THREE.PerspectiveCamera(
			60, 
			window.innerWidth/window.innerHeight,
			0.1,
			1000
		);
		this.camera.position.set(0,0,4);

		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color(0xaaaaaa);

		const ambient = new THREE.HemisphereLight(
			0xffffff,
			0xbbbbff,
			0.3
		);
		this.scene.add(ambient);

		const light = new THREE.DirectionalLight();
		light.position.set(0.2, 1, 1);
		this.scene.add(light);

		this.renderer = new THREE.WebGLRenderer({antialias: true});
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		container.appendChild(this.renderer.domElement);

		this.renderer.setAnimationLoop(this.render.bind(this));

		// Add geometries
		const geometry = new THREE.BoxBufferGeoemtry();
		const material = new THREE.MeshStandardMaterial({
			color: 0xff0000
		});
		this.mesh = new THREE.Mesh(geometry, material);
		this.scene.add(this.mesh);

		//const controls = new OrbitControls(this.camera, this.renderer.domElement);
		
		window.addEventListener('resize', this.resize.bind(this));
	}

	setupVR(){
	
	}
	
	resize(){
		this.camera.aspect = window.innerWidth/window.innerHeight;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
	}

	render(){
		this.mesh.rotateY(0.01);
		this.renderer.render(this.scene, this.camera);
	}
}

export { App };
