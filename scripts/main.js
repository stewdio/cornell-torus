

/*


	Hello !

	This is “Three.js in a Hurry” -- some example code with helpful 
	comments and relevant documentation URLs to get you up to speed 
	quickly. Three’s website is packed with great docs and examples. 
	Download the latest version and learn more here:

	https://threejs.org/


*/




//  JavaScript modules. 
//  As of May 2020, Three is officially moving to modules and deprecating
//  their old non-module format. I think that’s a bummer because now you
//  MUST run a server in order to play with the latest Three code -- even
//  for the simplest examples. Such is progress?
//  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules

import * as THREE from './third-party/three.module.js'
import Stats from './third-party/stats.module.js'
import { GUI } from './third-party/dat.gui.module.js'
import { OrbitControls } from './third-party/OrbitControls.js'
import { RectAreaLightUniformsLib } from './third-party/RectAreaLightUniformsLib.js'






    //////////////////
   //              //
  //   Overhead   //
 //              //
//////////////////


//  Some bits that we’ll reference across different function scopes,
//  so we’ll define them here in the outermost scope.
//  https://developer.mozilla.org/en-US/docs/Glossary/Scope

let 
camera,
scene,
renderer, 
controls,
stats,
gui


//  And one more thing; an empty object that we’ll fill with some properties
//  for use with our DAT.GUI module, ie. the live value editor.

const params = {}


function setupThree(){


	//  DOM container for Three’s CANVAS element.
	//  https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement
	//  https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild

	const container = document.createElement( 'div' )
	document.body.appendChild( container )


	//  Perspective camera.
	//  https://threejs.org/docs/#api/en/cameras/PerspectiveCamera

	const
	fieldOfView = 75,
	aspectRatio = window.innerWidth / window.innerHeight,
	near = 0.1,
	far  = 1000

	camera = new THREE.PerspectiveCamera( 
		
		fieldOfView, 
		aspectRatio,
		near,
		far 
	)
	camera.position.set( 0, 1.65, 6 )

	
	//  Scene.
	//  https://threejs.org/docs/#api/en/scenes/Scene

	scene = new THREE.Scene()
	scene.add( camera )


	//  WebGL renderer.
	//  https://threejs.org/docs/#api/en/renderers/WebGLRenderer

	renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
	renderer.setPixelRatio( window.devicePixelRatio )
	renderer.setSize( window.innerWidth, window.innerHeight )
	renderer.shadowMap.enabled = true
	renderer.shadowMap.type = THREE.PCFSoftShadowMap
	renderer.physicallyCorrectLights = true
	renderer.toneMapping = THREE.ACESFilmicToneMapping
	renderer.outputEncoding = THREE.sRGBEncoding
	container.appendChild( renderer.domElement )


	//  Orbit controls.
	//  https://threejs.org/docs/#examples/en/controls/OrbitControls
	
	controls = new OrbitControls( camera, renderer.domElement )
	controls.update()


	//  When our window size changes
	//  we must update our camera and our controls.

	window.addEventListener( 'resize', function(){
	
		camera.aspect = window.innerWidth / window.innerHeight
		camera.updateProjectionMatrix()
		renderer.setSize( window.innerWidth, window.innerHeight )
		controls.update()

	}, false )


	//  Performance statistics.
	//  https://github.com/mrdoob/stats.js/

	stats = new Stats()
	document.body.appendChild( stats.domElement )


	//  The original Graphic User Interface (GUI)
	//  from Google’s Data Arts Team (DAT).
	//  https://workshop.chromeexperiments.com/examples/gui/#1--Basic-Usage

	gui = new GUI()
	gui.open()
}






    /////////////////////
   //                 //
  //   Cornell Box   //
 //                 //
/////////////////////


//  Our Cornell Box may be pretty, but it’s ultimately not very accurate.
//  We’re not doing real ray tracing; just faking some bits for speed and
//  efficiency. What is a real Cornell Box? Answer:
//  https://en.wikipedia.org/wiki/Cornell_box

const walls = []
function setupCornellBox(){

	Object.assign( params, {

		wallRoughness: 0,
		wallMetalness: 0.1,
		wallEnvMapIntensity: 0.2
	})

	const 
	cornellBox = new THREE.Object3D(),
	boxSize = 4,
	wallGeometry = new THREE.PlaneBufferGeometry( boxSize, boxSize ),
	wallMaterialWhite = new THREE.MeshStandardMaterial({ color: 0xFFFFFF })

	scene.add( cornellBox )


	const wallBottomWhite = new THREE.Mesh(

		wallGeometry,
		wallMaterialWhite
	)	
	wallBottomWhite.position.set( 0, 0, 0 )
	wallBottomWhite.rotation.x = Math.PI / -2

	const wallBackWhite = new THREE.Mesh(

		wallGeometry,
		wallMaterialWhite
	)
	wallBackWhite.position.set( 0, boxSize / 2, boxSize / -2 )

	const wallTopWhite = new THREE.Mesh(

		wallGeometry,
		wallMaterialWhite
	)	
	wallTopWhite.position.set( 0, boxSize, 0 )
	wallTopWhite.rotation.x = Math.PI / 2

	const wallLeftRed = new THREE.Mesh(

		wallGeometry,
		new THREE.MeshStandardMaterial({ color: 0xFF0000 })
	)
	wallLeftRed.position.set( boxSize / -2, boxSize / 2, 0 )
	wallLeftRed.rotation.y = Math.PI / 2

	const wallRightGreen = new THREE.Mesh(

		wallGeometry,
		new THREE.MeshStandardMaterial({ color: 0x00FF00 })
	)
	wallRightGreen.position.set( boxSize / 2, boxSize / 2, 0 )
	wallRightGreen.rotation.y = Math.PI / -2


	//  All walls should render both sides,
	//  receive light and shadow,
	//  and attach to the Cornell Box object.
	//  Let’s hold on to them in a “walls” Array
	//  so it’s easy to update all at once.

	walls.push(
		
		wallBottomWhite,
		wallBackWhite,
		wallTopWhite,
		wallLeftRed,
		wallRightGreen
	)
	walls.forEach( function( wall ){

		Object.assign( wall.material, {

			side:            THREE.DoubleSide,
			roughness:       params.wallRoughness,
			metalness:       params.wallMetalness,
			envMapIntensity: params.wallEnvMapIntensity
		})
		wall.receiveShadow = true
		cornellBox.add( wall )
	})


	//  Walls DAT.GUI parameters.
	//  We’ll make use of the above “walls” Array again!
	//  https://workshop.chromeexperiments.com/examples/gui/#1--Basic-Usage

	const wallsFolder = gui.addFolder( 'Walls' )

	wallsFolder
	.add( params, 'wallRoughness', 0, 1 )
	.step( 0.1 )
	.onChange( function( value ){

		walls.forEach( function( wall ){

			wall.material.roughness = value
		})
	})
	.name( 'Roughness' )

	wallsFolder
	.add( params, 'wallMetalness', 0, 1 )
	.step( 0.1 )
	.onChange( function( value ){

		walls.forEach( function( wall ){

			wall.material.metalness = value
		})
	})
	.name( 'Metalness' )

	wallsFolder
	.add( params, 'wallEnvMapIntensity', 0, 1 )
	.step( 0.1 )
	.onChange( function( value ){

		walls.forEach( function( wall ){

			wall.material.envMapIntensity = value
		})
	})
	.name( 'Environment' )




	//  Time for some lights!

	params.lightColor = 0xFFFFFF
	params.lightIntensity = 0.8
	

	//  Spot light.
	//  https://threejs.org/docs/#api/en/lights/SpotLight
	//  https://threejs.org/docs/#api/en/lights/shadows/SpotLightShadow
	
	const spotLight = new THREE.SpotLight( 0xFFFFFF, params.lightIntensity )
	spotLight.position.set( 0, boxSize * 2 - 0.01, 0 )
	spotLight.castShadow = true
	spotLight.decay = 0.8
	spotLight.shadow.mapSize.width  = 1024
	spotLight.shadow.mapSize.height = 1024
	spotLight.shadow.camera.near = boxSize / 2
	spotLight.shadow.camera.far  = boxSize * 2
	spotLight.shadow.camera.fov  = 30
	spotLight.penumbra = 0.5
	cornellBox.add( spotLight )


	//  Rectangle area light.
	//  Important note: These lights do NOT cast shadows.
	//  https://threejs.org/examples/#webgl_lights_rectarealight

	RectAreaLightUniformsLib.init()

	const 
	rectLight = new THREE.RectAreaLight(

		0xFFFFFF, 
		params.lightIntensity * 20,
		boxSize / 4, 
		boxSize / 4
	),
	rectLightMesh = new THREE.Mesh(

		new THREE.PlaneBufferGeometry(),
		new THREE.MeshBasicMaterial({ side: THREE.BackSide })
	)
	
	rectLightMesh.scale.x = rectLight.width
	rectLightMesh.scale.y = rectLight.height	
	rectLight.add( rectLightMesh )
	rectLight.position.set( 0, boxSize - 0.1, 0 )
	rectLight.lookAt( new THREE.Vector3() )
	cornellBox.add( rectLight )


	const lightFolder = gui.addFolder( 'Light' )
	lightFolder.open()
	
	lightFolder
	.add( renderer, 'toneMappingExposure', 0, 2 )
	.step( 0.1 )
	.name( 'Exposure' )

	lightFolder
	.add( params, 'lightIntensity', 0, 1 )
	.step( 0.1 )
	.onChange( function( value ){

		spotLight.intensity = value
		rectLight.intensity = value * 20
		rectLightMesh.material.color
		.copy( rectLight.color )
		.multiplyScalar( 0.1 + value * 0.9 )
	})
	.name( 'Intensity' )

	lightFolder
	.addColor( params, 'lightColor' )
	.onChange( function( value ){

		spotLight.color.setHex( value )
		rectLight.color.setHex( value )
		rectLightMesh.material.color
		.copy( rectLight.color )
		.multiplyScalar( rectLight.intensity )
	})
	.name( 'Color' )




	//  Orbit controls (changing the target).
	//  We’d like the target of our orbit to be the center of our Cornell Box.
	//  https://threejs.org/docs/#examples/en/controls/OrbitControls

	camera.position.set( 0, boxSize / 2, 6 )
	controls.target = new THREE.Vector3( 0, boxSize / 2, boxSize / 2 )
	controls.update()
}






    /////////////////
   //             //
  //   Content   //
 //             //
/////////////////


let torus
function setupContent(){


	//  Create parameters for our Torus knot.

	Object.assign( params, {

		torusRoughness: 0.1,
		torusMetalness: 1.0,
		torusEnvMapIntensity: 1.0,
		torusColor: 0xCC9933
	})


	//  Torus knot.
	//  https://threejs.org/docs/#api/en/geometries/TorusKnotBufferGeometry

	torus = new THREE.Mesh(

		new THREE.TorusKnotBufferGeometry( 

			  0.5,//  Radius of the torus.
			  0.2,//  Radius of the tube. 
			150,  //  Tubular segments.
			 20   //  Radial segments.
		),
		new THREE.MeshStandardMaterial({
		
			color:     params.torusColor,
			roughness: params.torusRoughness,
			metalness: params.torusMetalness,
			envMapIntensity: params.torusEnvMapIntensity
		})
	)
	torus.position.set( 0, 1, 0 )
	torus.receiveShadow = true
	torus.castShadow = true
	scene.add( torus )


	//  Create DAT.GUI controls for our Torus knot.

	const torusFolder = gui.addFolder( 'Torus' )
	torusFolder.open()

	torusFolder
	.add( params, 'torusRoughness', 0, 1 )
	.step( 0.1 )
	.onChange( function( value ){

		torus.material.roughness = value
	})
	.name( 'Roughness' )

	torusFolder
	.add( params, 'torusMetalness', 0, 1 )
	.step( 0.1 )
	.onChange( function( value ){

		torus.material.metalness = value
	})
	.name( 'Metalness' )

	torusFolder
	.add( params, 'torusEnvMapIntensity', 0, 1 )
	.step( 0.1 )
	.onChange( function( value ){

		torus.material.envMapIntensity = value
	})
	.name( 'Environment' )

	torusFolder
	.addColor( params, 'torusColor' )
	.onChange( function( value ){

		torus.material.color.setHex( value )
	})
	.name( 'Color' )



	//  Environment map.
	//  https://threejs.org/examples/webgl_materials_envmaps_exr.html

	const pmremGenerator = new THREE.PMREMGenerator( renderer )
	pmremGenerator.compileEquirectangularShader()
	THREE.DefaultLoadingManager.onLoad = function(){

		pmremGenerator.dispose()
	}
	let cubeRenderTarget
	new THREE.TextureLoader()
	.load( 'media/office.png', function( texture ){

		texture.encoding = THREE.sRGBEncoding
		const cubeRenderTarget = pmremGenerator.fromEquirectangular( texture )
		
		torus.material.envMap = cubeRenderTarget.texture
		torus.material.needsUpdate = true

		walls.forEach( function( wall ){

			wall.material.envMap = cubeRenderTarget.texture
			wall.material.needsUpdate = true
		})

		texture.dispose()
	})
}






    //////////////
   //          //
  //   Loop   //
 //          //
//////////////


let timePrevious
function loop( time ){

	const timeDelta = timePrevious ? time - timePrevious : 0
	timePrevious = time

	torus.position.y  = 1.3 + Math.sin( time / 2000 ) / 5
	torus.rotation.y -= timeDelta * 0.0001

	renderer.render( scene, camera )
	stats.update()

	
	//  Request Animation Frame.
	//  Aim to re-render and re-paint 60 frames per second.
	//  https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
	
	requestAnimationFrame( loop )
}






    //////////////
   //          //
  //   Boot   //
 //          //
//////////////


window.addEventListener( 'DOMContentLoaded', function(){

	setupThree()
	setupCornellBox()
	setupContent()
	loop()
	
	document.querySelector( 'section' ).style.display = 'none'
	document.body.style.overflow = 'hidden'
})







