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

    var NumberOfComponents = {
        'SCALAR': 1,
        'VEC2': 2,
        'VEC3': 3,
        'VEC4': 4,
        'MAT2': 4,
        'MAT3': 9,
        'MAT4': 16
    };

    // @todo: load multiple scences
    GLTF.Scene = function() {
        this.positions = [];
        this.normals = [];
        this.texcoords = [];
        this.indices = []
    };

    var parseGltf = function(json, onload) {

        var newScene = new GLTF.Scene;

        // Iterate through every scene
        for (var sceneName in json.scenes) {
            var scene = json.scenes[sceneName];
            var nodes = scene.nodes;
            var nodeLen = nodes.length;

            // Iterate through every node within scene
            for (var n = 0; n < nodeLen; ++n) {
                var nodeName = nodes[n];
                var node = json.nodes[nodeName];

                // Traverse node
                traverseNode(json, node, newScene);
            }
        }

        onload(newScene);
    };

    var traverseNode = function(json, node, scene) {

        // Iterate through every mesh within node
        var meshes = node.meshes;
        var meshLen = meshes.length;

        for (var m = 0; m < meshLen; ++m) {
            var meshName = meshes[m];
            var mesh = json.meshes[meshName];

            // Iterate through primitives
            var primitives = mesh.primitives;
            var primitiveLen = primitives.length;

            for (var p = 0; p < primitiveLen; ++p) {
                var primitive = primitives[p];

                // Get attributes
                parseAttributes(json, primitive, scene);

                // Get indices
                parseIndices(json, primitive, scene);
            }
        }

        // Go through all the children recursively
        var children = node.children;
        var childreLen = children.length;
        for (var c = 0; c < childreLen; ++c) {
            var childName = children[c];
            var childNode = json.nodes[childName];
            traverseNode(childNode);
        }
    };

    var parseIndices = function(json, primitive, scene) {

        var accessorName = primitive.indices;
        var accessor = json.accessors[accessorName];

        // Get the buffer that contains data for this accessor
        var bufferViewName = accessor.bufferView;
        var bufferView = json.bufferViews[bufferViewName];
        var bufferName = bufferView.buffer;
        var buffer = json.buffers[bufferName];
        var uri = GLTF.relativePath + buffer.uri;

        // @todo: optimize so we only need to load resources once
        loadArrayBuffer(uri, function(resource) {

            var byteOffset = bufferView.byteOffset;
            var attributeSize = AttributeSize[accessor.componentType];
            var numberOfComponents = NumberOfComponents[accessor.type];
            var count = accessor.count; // Number of attributes

            // @todo: assuming float32
            var data = new Int16Array(resource, byteOffset, count * numberOfComponents);

            if (data) {
                scene.indices = data;
            }
        });
    };

    var parseAttributes = function(json, primitive, scene) {
        var accessors = json.accessors;

        // Get all the attributes
        var attributes = primitive.attributes;

        // *N.B*: Attribute semantics can be of the form
        //        [semantic]_[set_index], e.g., TEXCOORD_0, TEXCOORD_1, etc.
        for (var semantic in attributes) {
            var accessorName = attributes[semantic];
            var attribute = accessors[accessorName];
            var attributeData = parseAttributeData(json, attribute, semantic, scene);
        }
    };

    var parseAttributeData = function(json, attribute, semantic, scene) {

        // Get the buffer that contains data for this attribute
        var bufferViewName = attribute.bufferView;
        var bufferView = json.bufferViews[bufferViewName];
        var bufferName = bufferView.buffer;
        var buffer = json.buffers[bufferName];
        var uri = GLTF.relativePath + buffer.uri;

        // @todo: optimize so we only need to load resources once
        loadArrayBuffer(uri, function(resource) {

            var byteOffset = bufferView.byteOffset;
            var attributeSize = AttributeSize[attribute.componentType];
            var numberOfComponents = NumberOfComponents[attribute.type];
            var count = attribute.count; // Number of attributes

            // @todo: assuming float32
            var data = new Float32Array(resource, byteOffset, count * numberOfComponents);

            if (data) {
                if (semantic.substring(0, 8) === 'POSITION') {
                    scene.positions = data;
                } else if (semantic.substring(0, 6) === 'NORMAL') {
                    scene.normals = data;
                } else if (semantic.substring(0, 8) === 'TEXCOORD') {
                    scene.texcoords = data;
                } else if (semantic.substring(0, 5) === 'COLOR') {
                    // @todo: Parse
                } else if (semantic.substring(0, 5) === 'JOINT') {
                    // @todo: Parse
                } else if (semantic.substring(0, 11) === 'JOINTMATRIX') {
                    // @todo: Parse
                } else if (semantic.substring(0, 6) === 'WEIGHT') {
                    // @todo: Parse
                }
            }
        });
    }

    window.loadGltf = function(relativePath, filename, onload) {

        var url = relativePath + filename;
        // Save relative path to load .bin file
        GLTF.relativePath = relativePath;

        loadJSON(url, function(response) {
            // Parse JSON string into object
            var jsonObj = JSON.parse(response);
            parseGltf(jsonObj, onload);
        });
    };

    function loadJSON(src, callback) {

        // native json loading technique from @KryptoniteDove:
        // http://codepen.io/KryptoniteDove/post/load-json-file-locally-using-pure-javascript

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
        xobj.open('GET', url, true);
        xobj.onreadystatechange = function () {
            if (xobj.readyState == 4 && // Request finished, response ready
                xobj.status == "200") { // Status OK
                var arrayBuffer = xobj.response;
                if (arrayBuffer && callback) {
                    callback(arrayBuffer);
                }
            }
        }
        xobj.send(null);
    }
})(this);

