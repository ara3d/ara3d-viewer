"use strict";
/*

Ara 3D Web Viewer
Copyright Ara 3D, 2018
Licensed under the terms of the MIT License

A simple and easy to use 3D Model Web-Viewer built with Three.JS that eliminates a lot of boilerplate.
This is based on a combination of examples from the Three.JS web-site.

Example usage:

<html>
<head>
<title>Simple Ara Viewer Example</title>
</head>
<script src="../dist/ara-viewer.js"></script>
<body>
</body>
<script>
    ara.view({ url: './dragon.ply' });
</script>
</html>
*/
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var dat = __importStar(require("./node_modules/dat.gui/build/dat.gui.js"));
var Detector = __importStar(require("./node_modules/three/examples/js/Detector.js"));
// BEGIN: Deep merge copy and paste (With mods)
// The MIT License (MIT)
// Copyright (c) 2012 Nicholas Fisher
// https://github.com/KyleAMathews/deepmerge/blob/master/license.txt
var DeepMerge = /** @class */ (function () {
    function DeepMerge() {
    }
    DeepMerge.prototype.isMergeableObject = function (val) {
        return val && typeof val === 'object';
    };
    DeepMerge.prototype.emptyTarget = function (val) {
        return Array.isArray(val) ? [] : {};
    };
    DeepMerge.prototype.cloneIfNecessary = function (value, optionsArgument) {
        var clone = optionsArgument && optionsArgument.clone === true;
        return (clone && this.isMergeableObject(value)) ? this.deepMerge(this.emptyTarget(value), value, optionsArgument) : value;
    };
    DeepMerge.prototype.defaultArrayMerge = function (target, source, optionsArgument) {
        var destination = target.slice();
        for (var i = 0; i < destination.length; ++i) {
            var e = destination[i];
            if (typeof destination[i] === 'undefined')
                destination[i] = this.cloneIfNecessary(e, optionsArgument);
            else if (this.isMergeableObject(e))
                destination[i] = this.deepMerge(target[i], e, optionsArgument);
            else if (target.indexOf(e) === -1)
                destination.push(this.cloneIfNecessary(e, optionsArgument));
        }
        return destination;
    };
    DeepMerge.prototype.mergeObject = function (target, source, optionsArgument) {
        var destination = {};
        if (this.isMergeableObject(target))
            for (var key in target)
                destination[key] = this.cloneIfNecessary(target[key], optionsArgument);
        for (var key in source)
            if (!this.isMergeableObject(source[key]) || !target[key])
                destination[key] = this.cloneIfNecessary(source[key], optionsArgument);
            else
                destination[key] = this.deepMerge(target[key], source[key], optionsArgument);
        return destination;
    };
    DeepMerge.prototype.deepMerge = function (target, source, optionsArgument) {
        var array = Array.isArray(source);
        var options = optionsArgument || { arrayMerge: this.defaultArrayMerge };
        var arrayMerge = options.arrayMerge || this.defaultArrayMerge;
        if (array)
            return Array.isArray(target) ? arrayMerge(target, source, optionsArgument) : this.cloneIfNecessary(source, optionsArgument);
        else
            return this.mergeObject(target, source, optionsArgument);
    };
    return DeepMerge;
}());
// END: Deepmerge
var ara = {
    view: function (options) {
        // Check WebGL presence
        if (!Detector.webgl) {
            Detector.addGetWebGLMessage();
            return;
        }
        // Variables 
        var container, stats, gui;
        var camera, cameraTarget, scene, renderer, material, plane, sunlight, light1, light2, settings;
        var objects = [];
        // Default options object (merged with passed options)
        var defaultOptions = {
            width: window.innerWidth,
            height: window.innerHeight,
            near: 1,
            far: 15,
            camera: {
                fov: 35,
                position: {
                    x: 3,
                    y: 0.15,
                    z: 3
                },
                target: {
                    x: 0,
                    y: -0.1,
                    z: 0,
                }
            },
            background: {
                color: 0x72645b,
            },
            fog: {
                color: 0x72645b,
                near: 0.01,
                far: 1500,
            },
            plane: {
                size: 400,
                material: {
                    color: 0x999999,
                    specular: 0x101010
                },
                position: {
                    x: 0, y: -0.5, z: 0
                }
            },
            sunlight: {
                skyColor: 0x443333,
                groundColor: 0x111122,
                intensity: 1,
            },
            light1: {
                position: { x: 1, y: 1, z: 1 },
                color: 0xffffff,
                intensity: 1.35,
            },
            light2: {
                position: { x: 1, y: 1, z: 1 },
                color: 0xffffff,
                intensity: 1.35,
            },
            material: {
                color: 0x0055ff,
                flatShading: true,
                emissive: 0,
                emissiveIntensity: 0,
                wireframe: false,
                wireframeLinewidth: 0.1,
            },
            object: {
                scale: 0.01,
                position: { x: 0, y: 0, z: -5 },
            }
        };
        // Initialization of scene, loading of objects, and launch animation loop
        init();
        loadIntoScene(settings.url);
        animate();
        // Called every frame in case settings are updated 
        function updateScene() {
            camera.fov = settings.camera.fov;
            camera.aspect = settings.camera.aspectRatio;
            camera.near = settings.camera.near;
            camera.far = settings.camera.far;
            camera.position = toVec(settings.camera.position);
            cameraTarget = toVec(settings.camera.target);
            scene.background = new THREE.Color(settings.background.color);
            scene.fog = new THREE.Fog(settings.fog.color, settings.fog.near, settings.fog.far);
            plane.material.setValues(settings.plane.material);
            plane.geometry.set;
            light1.position = toVec(settings.light1.position);
            light1.color = settings.light1.color;
            light1.intensity = settings.light1.intensity;
            light2.position = toVec(settings.light2.position);
            light2.color = settings.light2.color;
            light2.intensity = settings.light2.intensity;
            sunlight.skyColor = settings.sunlight.skyColor;
            sunlight.groundColor = settings.sunlight.groundColor;
            sunlight.intensity = settings.sunlight.intensity;
            plane.position.y = toVec(settings.plane.position);
        }
        // Scene initialization
        function init() {
            // Initialize the settings 
            settings = (new DeepMerge()).deepMerge(defaultOptions, options, undefined);
            if (settings.camera.aspectRatio === undefined)
                settings.camera.aspectRatio = settings.width / settings.height;
            // DOM Element Container 
            container = document.createElement('div');
            container.ondrop = dropHandler;
            container.ondragover = dragOverHandler;
            document.body.appendChild(container);
            // Create scene, camera, and orbit controls 
            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera();
            new THREE.OrbitControls(camera, container);
            // Create a new DAT.gui controller 
            gui = new dat.GUI();
            // Ground            
            plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(), new THREE.MeshPhongMaterial());
            plane.rotation.x = -Math.PI / 2;
            plane.receiveShadow = true;
            scene.add(plane);
            // Lights
            sunlight = new THREE.HemisphereLight();
            scene.add(sunlight);
            light1 = addShadowedLight(scene);
            light2 = addShadowedLight(scene);
            // Material 
            material = new THREE.MeshPhongMaterial(settings.material);
            // THREE JS renderer
            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.gammaInput = true;
            renderer.gammaOutput = true;
            renderer.shadowMap.enabled = true;
            container.appendChild(renderer.domElement);
            // Stats display 
            stats = new Stats();
            container.appendChild(stats.dom);
            // Resize listener 
            window.addEventListener('resize', onWindowResize, false);
        }
        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
        function loadIntoScene(fileName) {
            var extPos = fileName.lastIndexOf(".");
            var ext = fileName.slice(extPos + 1).toLowerCase();
            // Used with PLY example
            // Used with STL example 
            //const material = new THREE.MeshPhongMaterial( { color: 0xff5533, specular: 0x111111, shininess: 200 } );
            switch (ext) {
                case "3ds": {
                    var loader = new THREE.TDSLoader();
                    loader.load(fileName, function (obj) {
                        objects.push(obj);
                        scene.add(obj);
                    });
                    return;
                }
                case "fbx": {
                    var loader = new THREE.FBXLoader();
                    loader.load(fileName, function (obj) {
                        objects.push(obj);
                        scene.add(obj);
                    });
                    return;
                }
                case "dae": {
                    var loader = new THREE.ColladaLoader();
                    loader.load(fileName, function (obj) {
                        objects.push(obj);
                        scene.add(obj);
                    });
                    return;
                }
                case "gltf": {
                    var loader = new THREE.GLTFLoader();
                    loader.load(fileName, function (obj) {
                        objects.push(obj.scene);
                        scene.add(obj);
                    });
                    return;
                }
                case "gcode": {
                    var loader = new THREE.GCodeLoader();
                    loader.load(fileName, function (obj) {
                        objects.push(obj);
                        scene.add(obj);
                    });
                    return;
                }
                case "obj": {
                    var loader = new THREE.OBJLoader();
                    loader.load(fileName, function (obj) {
                        objects.push(obj);
                        scene.add(obj);
                    });
                    return;
                }
                case "pcd": {
                    var loader = new THREE.PCDLoader();
                    loader.load(fileName, function (obj) {
                        objects.push(obj);
                        scene.add(obj);
                    });
                    return;
                }
                case "ply": {
                    var loader = new THREE.PLYLoader();
                    loader.load(fileName, function (geometry) {
                        geometry.computeVertexNormals();
                        var obj = new THREE.Mesh(geometry);
                        objects.push(obj);
                        scene.add(obj);
                    });
                    return;
                }
                case "stl": {
                    var loader = new THREE.STLLoader();
                    loader.load(fileName, function (geometry) {
                        geometry.computeVertexNormals();
                        var obj = new THREE.Mesh(geometry);
                        objects.push(obj);
                        scene.add(obj);
                    });
                    return;
                }
                default:
                    throw new Error("Unrecognized file type extension '" + ext + "' for file " + fileName);
            }
        }
        function updateObjects() {
            scene.traverse(function (child) {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    var scale = scalarToVec(settings.object.scale);
                    child.scale.copy(scale);
                    child.material = material;
                    child.position.copy(settings.object.position);
                }
            });
        }
        // Helper functions 
        function toVec(obj) {
            return new THREE.Vector3(obj.x, obj.y, obj.z);
        }
        function scalarToVec(x) {
            return new THREE.Vector3(x, x, x);
        }
        function addShadowedLight(scene) {
            var directionalLight = new THREE.DirectionalLight();
            scene.add(directionalLight);
            directionalLight.castShadow = true;
            var d = 1;
            directionalLight.shadow.camera.left = -d;
            directionalLight.shadow.camera.right = d;
            directionalLight.shadow.camera.top = d;
            directionalLight.shadow.camera.bottom = -d;
            directionalLight.shadow.camera.near = 1;
            directionalLight.shadow.camera.far = 4;
            directionalLight.shadow.mapSize.width = 1024;
            directionalLight.shadow.mapSize.height = 1024;
            directionalLight.shadow.bias = -0.001;
            return directionalLight;
        }
        // https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop
        function dragOverHandler(ev) {
            console.log('File(s) in drop zone');
            // Prevent default behavior (Prevent file from being opened)
            ev.preventDefault();
        }
        function droppedFile(file) {
            // TODO: deal with other data ... 
            var fileName = file.name;
            loadIntoScene("../data/" + fileName);
        }
        function dropHandler(ev) {
            console.log('File(s) dropped');
            // Prevent default behavior (Prevent file from being opened)
            ev.preventDefault();
            if (ev.dataTransfer.items) {
                // Use DataTransferItemList interface to access the file(s)
                for (var i = 0; i < ev.dataTransfer.items.length; i++) {
                    // If dropped items aren't files, reject them
                    if (ev.dataTransfer.items[i].kind === 'file') {
                        var file = ev.dataTransfer.items[i].getAsFile();
                        droppedFile(file);
                    }
                }
            }
            else {
                // Use DataTransfer interface to access the file(s)
                for (var i = 0; i < ev.dataTransfer.files.length; i++) {
                    droppedFile(ev.dataTransfer.files[i]);
                }
            }
            // Pass event to removeDragData for cleanup
            removeDragData(ev);
        }
        function removeDragData(ev) {
            if (ev.dataTransfer.items) {
                // Use DataTransferItemList interface to remove the drag data
                ev.dataTransfer.items.clear();
            }
            else {
                // Use DataTransfer interface to remove the drag data
                ev.dataTransfer.clearData();
            }
        }
        // Calls render, and asks the framework to prepare the next frame 
        function animate() {
            requestAnimationFrame(animate);
            render();
            stats.update();
        }
        // Updates scene objects, moves the camera, and draws the scene 
        function render() {
            updateObjects();
            updateScene();
            var timer = Date.now() * 0.0005;
            camera.position.x = Math.sin(timer) * 2.5;
            camera.position.z = Math.cos(timer) * 2.5;
            camera.lookAt(cameraTarget);
            renderer.render(scene, camera);
        }
    }
};
