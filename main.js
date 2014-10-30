/* --- this is the 3D.js section, for graphics mostly --- */
var camera;
var scene;
var renderer;

var skybox;

var time = new Date().getTime();
var cameraPositionTheta = 0;

var boxes = new Array();

var boost = 5;

var PARTICLES_COUNT = 20000;

var music = new Array(
  'audio/gost_cursed.mp3',
  'audio/wormhole.mp3',
  'audio/Warriors.mp3'
);

var clock = new THREE.Clock();

var particles;
var particlesMaterial;
var particlesHue = 0;

var sceneW = 2000;
var sceneH = 2000;
var leftMost = -(sceneW/2);
var topMost = -(sceneH/2);


init();

function init() {

    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );

    //move the camera backwards to see stuffs
    camera.position.z = 100;

    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({alpha: true});
    renderer.setSize(window.innerWidth, window.innerHeight);

    //the renderer's canvas domElement is added to the body
    document.body.appendChild(renderer.domElement);

    //draw the boxes
    drawBoxes();
    
    //draw the particles
    drawParticles();

    renderer.setClearColor(0x000000, 1);
    renderer.render(scene, camera);
}

function drawParticles(){
    //set up geometry
    particles = new THREE.Geometry();
    
    //set up material
    particlesMaterial = new THREE.PointCloudMaterial({
       //initialize the colour as red
        color: 0,
        //size scale of our particles
        size: 3,
        map: THREE.ImageUtils.loadTexture(
            'texture/flame.png'
        ),
        //do some blending
        transparent: true,
        //what kind of blending
        blending: THREE.NormalBlending
    });
    
    //now we have to add the particles to our geometry.
    for(var i=0; i<PARTICLES_COUNT; i++){
        //randomize the positions of our particles
        var x = Math.random() * sceneW*2 + leftMost*2;
        var y = Math.random() * sceneH*2 + topMost*2;
        var z = Math.random() * sceneW*2 + leftMost*2;
        
        //create our 3d vector
        var vertex = new THREE.Vector3(x, y, z);
        
        //push it to our geometry
        particles.vertices.push(vertex);
    }
    
    //initialize our mesh from geometry and material
    var pointCloud = new THREE.PointCloud(particles, particlesMaterial);
    
    scene.add(pointCloud);
}

function drawBoxes(){
  var size = 15;
  var i = 0;
  var num = 10;

  //create a new mesh with geometry
  var geo = new THREE.BoxGeometry(
    size, size, size
  );

  for(var x = -num; x < num; x += 2){
    var j = 0;
    boxes[i] = new Array();

    for(var y = -num; y < num; y += 2){
      var mat = new THREE.MeshPhongMaterial(
        {
          color: randomColour(),
          ambient: 0x808080,
          specular: 0xFFFFFF,
        });

      var box = new THREE.Mesh(geo, mat);
      box.position.x = x * size;
      box.position.y = y * size;
      box.position.z = 0;

      //add the box to the scene
      scene.add(box);

      //add to the array of boxes
      boxes[i].push(box);

      j++;
    }
    i++;
  }

  //create a point light
  var Light1 = new THREE.PointLight(0xFFFFFF);

  //set its position
  Light1.position.x = -100;
  Light1.position.y = -100;
  Light1.position.z = 100;

  var Light2 = new THREE.PointLight(0xFFFFFF);

  //set its position
  Light2.position.x = 100;
  Light2.position.y = 100;
  Light2.position.z = 100;

  var Light3 = new THREE.PointLight(0xFFFFFF);

  //set its position
  Light3.position.x = 0;
  Light3.position.y = -100;
  Light3.position.z = 100;

  var Light4 = new THREE.PointLight(0xFFFFFF);

  //set its position
  Light4.position.x = -100;
  Light4.position.y = 0;
  Light4.position.z = 100;


  //add the light to scene
  scene.add(Light1);
  scene.add(Light2);

}

/* --- this is the 3D.js section, for graphics mostly --- */


/* --- this is the music section, for music mostly --- */
var audioCtx = new AudioContext();
var analyser = audioCtx.createAnalyser();
var source;

getData(music[1]);

source.connect(analyser);

analyser.fftSize = 256;
var bufferLength = analyser.frequencyBinCount;
var dataArray = new Uint8Array(bufferLength);

// use XHR to load an audio track, and
// decodeAudioData to decode it and stick it in a buffer.
// Then we put the buffer into the source

function getData(url) {
  source = audioCtx.createBufferSource();
  request = new XMLHttpRequest();

  request.open('GET', url, true);

  request.responseType = 'arraybuffer';


  request.onload = function() {
    var audioData = request.response;

    audioCtx.decodeAudioData(audioData, function(buffer) {
        source.buffer = buffer;

        source.connect(audioCtx.destination);
        source.loop = false;
        source.start();
        animate();
      },

      function(e){"Error with decoding audio data" + e.err});

  }

  request.send();
}
/* --- this is the music section, for music mostly --- */

function animate() {
  //get music data
  analyser.getByteFrequencyData(dataArray);

  var k = 0;

  var td = new Date().getTime() - time;
  time = new Date().getTime();

  for(var i = 0; i < boxes.length; i++){
    for(var j = 0; j < boxes[i].length; j++) {
      var scale = (dataArray[k] + boost) / 30;
      boxes[i][j].scale.z = (scale < 1 ? 1 : scale);
      //boxes[i][j].rotation.x = time * 0.001;
      k += (k < dataArray.length ? 1 : 0);
    }
  }

  cameraPositionTheta += 0.003;
    
  //update the particles hue
  particlesHue = (particlesHue + time/40)%1;
  particlesMaterial.color.setHSL(particlesHue, 1, 2);
    
  //update the particles
  for(var i=0; i<particles.vertices.length; i++){      
      particles.vertices[i].y += 5 * Math.random();
      particles.vertices[i].y %= 2000;
  }
 
  //tell particles to update
  particles.verticesNeedUpdate = true;

  //pan the background
  camera.position.x = 150 + Math.sin(cameraPositionTheta) * -150;
  camera.position.y = 150 + Math.cos(cameraPositionTheta) * -150;

  camera.lookAt(scene.position);

  renderer.render(scene, camera);

  requestAnimationFrame(animate);
}

//random colours!
function randomColour(){
  var min, max, range;
  min = 0; max = 255;
  range = max - min + 1;

  var r, g, b;
  r = (Math.floor(Math.random() * range)) * 65536;
  g = (Math.floor(Math.random() * range)) * 256;
  b = (Math.floor(Math.random() * range));
  return r + g + b;
}
