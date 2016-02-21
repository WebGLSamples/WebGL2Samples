(function() {
    'use strict';

    var GLTF = {};

    var AttributeSize = {
        5120: 1, // BYTE
        5121: 1, // UNSIGNED_BYTE
        5122: 2, // SHORT
        5123: 2, // UNSIGNED_SHORT
        5126: 4  // FLOAT
    };

    var NumberOfComponent = {
        'SCALAR': 1,
        'VEC2': 2,
        'VEC3': 3,
        'VEC4': 4,
        'MAT2': 4,
        'MAT3': 9,
        'MAT4': 16
    };

    GLTF.Mesh = function(data) {
        var accessors = GLTF.accessors;
        this.positions = new Float32Array();
        this.normals = new Float32Array();
        this.indices = new Uint16Array();
    };


    function parseGltf(json, onload) {
        GLTF.scenes = json.scenes;
        GLTF.nodes = json.nodes;
        GLTF.meshes = json.meshes;
        GLTF.accessors = json.accessors;
        GLTF.buffers = json.buffers;
        GLTF.bufferViews = json.bufferViews;

        // Iterate through every scene
        for (var sceneName in json.scenes) {

            var scene = json.scenes[scene];
            // Iterate through every node within scene
            for (var i = 0; i < in .nodes) {

                // Get node attributes
                console.log(node);
            }
        }

        onload(json);

    }

    window.loadGltf = function(url, onload) {
        loadJSON(url, function(response) {
            // Parse JSON string into object
            var jsonObj = JSON.parse(response);
            parseGltf(jsonObj, onload);
        });
    };

    // native json loading technique from @KryptoniteDove:
    // http://codepen.io/KryptoniteDove/post/load-json-file-locally-using-pure-javascript

    function loadJSON(src, callback) {
        var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
        xobj.open('GET', src, true);
        xobj.onreadystatechange = function () {
            if (xobj.readyState == 4 && // Request finished, response ready
                xobj.status == "200") { // Status OK
                callback(xobj.responseText);
            }
        };
        xobj.send(null);
    }

    function loadArrayBuffer(url, callback) {
        var xobj = new XMLHttpRequest();
        xobj.responseType = 'arraybuffer';
        xobj.open('GET', src, true);
        xobj.onload = function(event) {
            var arrayBuffer = xobj.response;
            if (arrayBUffer) {
                callback(arrayBuffer);
            }
        }
        xobj.send(null);
    }
})(this);

