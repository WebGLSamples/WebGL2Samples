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
    // @todo: multiple buffer view
    GLTF.Scene = function() {
        //this.vertices = [];
        //this.indices = [];
        this.vertices = null;
        this.indices = null;
    };
    
    GLTF.CachedBuffer = function(name, resource) {
        this.name = name;
        this.buffer = resource;
    };
    
    function arrayBuffer2TypedArray(resource, byteOffset, length, componentType) {
        switch(componentType) {
            // @todo: finish
            case 5122: return new Int16Array(resource, byteOffset, length);
            case 5123: return new Uint16Array(resource, byteOffset, length);
            case 5126: return new Float32Array(resource, byteOffset, length);
            default: return null; 
        }
    }

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
                traverseNode(json, node, newScene, onload);
            }
        }
    };
    
    
    var translationVec3;
    var rotationQuat;
    var scaleVec3;
    var TRMatrix;
    
    var traverseNode = function(json, node, scene, onload, matrix = mat4.create()) {

        var curMatrix = mat4.create();
        
        if (node.hasOwnProperty('matrix')) {
            // matrix
            for(var i = 0; i < 16; ++i) {
                curMatrix[i] = node.matrix[i];
            }
            mat4.multiply(curMatrix, matrix, curMatrix);
            //mat4.multiply(curMatrix, curMatrix, matrix);
        } else {
            // translation, rotation, scale (TRS)
            // @todo: these labels are optional
            vec3.set(translationVec3, node.translation[0], node.translation[1], node.translation[2]);
            quat.set(rotationQuat, node.rotation[0], node.rotation[1], node.rotation[2], node.rotation[3]);
            mat4.fromRotationTranslation(TRMatrix, rotationQuat, translationVec3);
            mat4.multiply(curMatrix, curMatrix, TRMatrix);
            vec3.set(scaleVec3, node.scale[0], node.scale[1], node.scale[2]);
            mat4.scale(curMatrix, curMatrix, scaleVec3);
        }
            
        // Iterate through every mesh within node
        var meshes = node.meshes;
        if(!!meshes) {
            var meshLen = meshes.length;
            for (var m = 0; m < meshLen; ++m) {
                var meshName = meshes[m];
                var mesh = json.meshes[meshName];

                // Iterate through primitives
                var primitives = mesh.primitives;
                var primitiveLen = primitives.length;

                for (var p = 0; p < primitiveLen; ++p) {
                    var primitive = primitives[p];

                    // Get indices first
                    parseIndices(json, primitive, scene, function() {

                        // Get attributes
                        parseAttributes(json, primitive, scene, onload, curMatrix);
                    });
                }
            }
        }


        // Go through all the children recursively
        var children = node.children;
        var childreLen = children.length;
        for (var c = 0; c < childreLen; ++c) {
            var childName = children[c];
            var childNode = json.nodes[childName];
            traverseNode(json, childNode, scene, onload, curMatrix);
        }
    };

    var parseIndices = function(json, primitive, scene, callback) {

        var accessorName = primitive.indices;
        var accessor = json.accessors[accessorName];

        // Get the buffer that contains data for this accessor
        var bufferViewName = accessor.bufferView;
        var bufferView = json.bufferViews[bufferViewName];
        var bufferName = bufferView.buffer;
        var buffer = json.buffers[bufferName];
        var uri = GLTF.baseUri + buffer.uri;


        if(!scene.indices) {
            
        }

        // @todo: optimize so we only need to load resources once
        loadArrayBuffer(uri, function(resource) {

            // var byteOffset = bufferView.byteOffset;
            // var byteLength = bufferView.byteLength;
            // var attributeSize = AttributeSize[accessor.componentType];
            // var numberOfComponents = NumberOfComponents[accessor.type];
            // var count = accessor.count; // Number of attributes

            // @todo: assuming float32
            //var data = new Int16Array(resource, byteOffset, count * numberOfComponents);
            //var data = arrayBuffer2TypedArray(resource, byteOffset, count * numberOfComponents, accessor.componentType);
            
            // var data = arrayBuffer2TypedArray(resource, byteOffset, byteLength / attributeSize, accessor.componentType);

            // if (data) {
            //     scene.indices = data;
            //     callback();
            // }
            
            
            // @todo: multiple cached buffer   
            if (!scene.indices) {
                var byteOffset = bufferView.byteOffset;
                var byteLength = bufferView.byteLength;
                var attributeSize = AttributeSize[accessor.componentType];
                var numberOfComponents = NumberOfComponents[accessor.type];
                var count = accessor.count; // Number of attributes
                scene.indices = arrayBuffer2TypedArray(resource, byteOffset, byteLength / attributeSize, accessor.componentType);
                callback();
            }
            //callback();
        });
    };

    
    var tmpVec4;
    var inverseTransposeMatrix;
    
    var parseAttributes = function(json, primitive, scene, callback, matrix) {
        var accessors = json.accessors;

        // Get all the attributes
        var attributes = primitive.attributes;

        // *N.B*: Attribute semantics can be of the form
        //        [semantic]_[set_index], e.g., TEXCOORD_0, TEXCOORD_1, etc.

        
        // Update scene byte stride
        //scene.byteStride = attribute.byteStride;

        // Get the buffer that contains data attributes

        // @todo: Can we trust that all vertex attributes are stored
        // in the same buffer?
        var bufferViewName;
        var bufferView;
        var bufferName;
        var buffer;
        var uri;


        var attribute;
        for (var semantic in attributes) {
            var accessorName = attributes[semantic];
            attribute = accessors[accessorName];
            
            // ?
            bufferViewName = attribute.bufferView;
            bufferView = json.bufferViews[bufferViewName];
            bufferName = bufferView.buffer;
            buffer = json.buffers[bufferName];
            uri = GLTF.baseUri + buffer.uri;

            if (semantic.substring(0, 8) === 'POSITION') {
                // @todo: ?? bytestride is accessor specific. 
                scene.positionByteOffset = attribute.byteOffset;
                //scene.positionByteOffset = bufferView.byteOffset;
                scene.positionByteStride = attribute.byteStride;
                scene.positionNumberOfComponents = NumberOfComponents[attribute.type];
            } else if (semantic.substring(0, 6) === 'NORMAL') {
                scene.normalByteOffset = attribute.byteOffset;
                
                //? two types of vertex attribute order?
                
                // p,p,p,...,p, n,n,n,n,..., t,t,t,t...
                // p,n,t, p,n,t, ...
                
                //scene.normalByteOffset = bufferView.byteOffset;
                scene.normalByteStride = attribute.byteStride;
                scene.normalNumberOfComponents = NumberOfComponents[attribute.type];
            } else if (semantic.substring(0, 8) === 'TEXCOORD') {
                scene.texcoordByteOffset = attribute.byteOffset;
                //scene.texcoordByteOffset = bufferView.byteOffset;
                scene.texcoordByteStride = attribute.byteStride;
                scene.texcoordNumberOfComponents = NumberOfComponents[attribute.type];
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



        // @todo: optimize so we only need to load resources once
        loadArrayBuffer(uri, function(resource) {
            
            var data;
            
            var stride;
            var offset;
            var count;
            
            // apply transformations
            // attributes are interleaved
            for (var semantic in attributes) {
                var accessorName = attributes[semantic];
                attribute = accessors[accessorName];
                
                data = arrayBuffer2TypedArray(resource, bufferView.byteOffset, bufferView.byteLength / AttributeSize[attribute.componentType], attribute.componentType); 

                if (semantic.substring(0, 8) === 'POSITION') {
                    //stride = scene.positionByteStride / AttributeSize[attribute.componentType];
                    stride = attribute.byteStride / AttributeSize[attribute.componentType];
                    
                    // @todo: offset is specific to accessor
                    //offset = scene.positionByteOffset / AttributeSize[attribute.componentType];
                    offset = attribute.byteOffset / AttributeSize[attribute.componentType];
                    count = attribute.count;

                    for (var i = 0; i < count; ++i) {
                        // @todo: add vec2 and other(needed?) support
                        if(scene.positionNumberOfComponents === 3) {
                            vec4.set(tmpVec4, data[stride * i + offset]
                                            , data[stride * i + offset + 1]
                                            , data[stride * i + offset + 2]
                                            , 1);
                            vec4.transformMat4(tmpVec4, tmpVec4, matrix);
                            vec4.scale(tmpVec4, tmpVec4, 1 / tmpVec4[3]);
                            data[stride * i + offset] = tmpVec4[0];
                            data[stride * i + offset + 1] = tmpVec4[1];
                            data[stride * i + offset + 2] = tmpVec4[2];
                        }
                    }
                } else if (semantic.substring(0, 6) === 'NORMAL') {
                    //stride = scene.normalByteStride / AttributeSize[attribute.componentType];
                    //offset = scene.normalByteOffset / AttributeSize[attribute.componentType];
                    stride = attribute.byteStride / AttributeSize[attribute.componentType];
                    offset = attribute.byteOffset / AttributeSize[attribute.componentType];
                    count = attribute.count;
                    mat4.invert(inverseTransposeMatrix, matrix);
                    mat4.transpose(inverseTransposeMatrix, inverseTransposeMatrix);                    

                    for (var i = 0; i < count; ++i) {
                        // @todo: add vec2 and other(needed?) support
                        vec4.set(tmpVec4, data[stride * i + offset]
                                        , data[stride * i + offset + 1]
                                        , data[stride * i + offset + 2]
                                        , 0);
                        vec4.transformMat4(tmpVec4, tmpVec4, inverseTransposeMatrix);
                        vec4.normalize(tmpVec4, tmpVec4);
                        data[stride * i + offset] = tmpVec4[0];
                        data[stride * i + offset + 1] = tmpVec4[1];
                        data[stride * i + offset + 2] = tmpVec4[2];
                    }
                }
            }
            
            if (data) {
                scene.vertices = data;

                // Completed loading
                callback(scene);
            }
        });
    };

    window.loadGltfGeometry = function(url, onload) {
        
        // @todo: currently using a relative path to load gl-matrix-min
        (function(src, callback){
            // http://stackoverflow.com/questions/950087/include-a-javascript-file-in-another-javascript-file
            
            // Adding the script tag to the head as suggested before
            var head = document.getElementsByTagName('head')[0];
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = src;

            // Then bind the event to the callback function.
            // There are several events for cross browser compatibility.
            script.onreadystatechange = callback;
            script.onload = callback;

            // Fire the loading
            head.appendChild(script);
        })('third-party/gl-matrix-min.js', 
            (function() {
            // Save path to load .bin file
            GLTF.baseUri = getBaseUri(url);
            
            // matrix transform preparation
            translationVec3 = vec3.create();
            rotationQuat = vec4.create();
            scaleVec3 = vec3.create();
            TRMatrix = mat4.create();
            
            tmpVec4 = vec4.create();
            inverseTransposeMatrix = mat4.create();

            loadJSON(url, function(response) {
                // Parse JSON string into object
                var jsonObj = JSON.parse(response);
                parseGltf(jsonObj, onload);
            });
        })); 
 
    };
    
    function getBaseUri(uri) {
        
        // https://github.com/AnalyticalGraphicsInc/cesium/blob/master/Source/Core/getBaseUri.js
        
        var basePath = '';
        var i = uri.lastIndexOf('/');
        if(i !== -1) {
            basePath = uri.substring(0, i + 1);
        }
        
        return basePath;
    }

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

