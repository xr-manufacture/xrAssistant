import * as THREE from './Assets/Scripts/THREE/build/three.module.js';
import {OrbitControls} from './Assets/Scripts/THREE/examples/js/controls/OrbitControls.js';

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

		this.renderer = new THREE.WebGLRenderer({antialias: true});
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		container.appendChild(this.renderer.domElement);

		this.renderer.setAnimationLoop(this.render.bind(this));
		
		window.addEventListener('resize', this.resize.bind(this));
	}

	setupVR(){
	
	}
	
	resize(){
	
	}

	render(){
		this.renderer.render(this.scene, this.camera);
	}
}

export { App };
