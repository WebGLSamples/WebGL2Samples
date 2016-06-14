var MinimalGLTFLoader;
(function() {
    'use strict';

    /**
     * 
     */
    var glTFModel = MinimalGLTFLoader.glTFModel = function () {
        this.defaultScene = '';
        this.scenes = {};
        //this.bufferData = null;

        this.json = null;
    };

    // var Scene = glTFModel.prototype.Scene = function () {
    //     this.meshes = [];
    // };


    var glTFLoader = MinimalGLTFLoader.glTFLoader = function () {
        this._init();
    };

    glTFLoader.prototype._init = function() {
        this._parseDone = false;
        this._loadDone = false;

        this._bufferRequested = 0;
        this._bufferLoaded = 0;
        this._buffers = {};
        this._bufferTasks = {};

        this._bufferViews = {};

        this._pendingTasks = 0;
        this._finishedPendingTasks = 0;

        this.onload = null;


        this.glTF = new glTFModel();
        //this.glTF.bufferData = this._bufferViews;
    };


    // Data store classes
    var Scene = MinimalGLTFLoader.Scene = function () {
        //this.nodes = [];
        this.meshes = [];
    };

    // var Node = MinimalGLTFLoader.Node = function () {
    //     var meshes = [];
    //     var children = [];
    // };

    var Mesh = MinimalGLTFLoader.Mesh = function () {
        this.primitives = [];
    };

    var Primitive = MinimalGLTFLoader.Primitive = function () {
        this.indices = null;

        this.vertexBuffer = null;
        this.attributes = {};
    };




    // var Task = MinimalGLTFLoader.Task = function () {
    //     this.run = null;
    // };

    glTFLoader.prototype._getBufferViewData = function(json, bufferViewID, callback) {
        var bufferViewData = this._bufferViews[bufferViewID];
        if(!bufferViewData) {
            // load bufferView for the first time
            var bufferView = json.bufferViews[bufferViewID];
            var bufferData = this._buffers[bufferView.buffer];
            if (bufferData) {
                // buffer already loaded
                console.log("first load bufferView, buffer already loaded " + bufferViewID);
                this._bufferViews[bufferViewID] = bufferData.slice(bufferView.byteOffset, bufferView.byteOffset + bufferView.byteLength);
                callback(bufferViewData);
            } else {
                // buffer not yet loaded
                // add pending task to _bufferTasks
                console.log("first load bufferView, buffer not loaded " + bufferViewID);
                this._pendingTasks++;
                var bufferTask = this._bufferTasks[bufferView.buffer];
                if (!bufferTask) {
                    bufferTask = [];
                }
                bufferTask.push(function(data) {
                    this._bufferViews[bufferViewID] = data.slice(bufferView.byteOffset, bufferView.byteOffset + bufferView.byteLength);
                    this._finishedPendingTasks++;
                    callback(bufferViewData);
                });
            }

        } else {
            // no need to load buffer from file
            // use cached ones
            console.log("use cached bufferView " + bufferViewID);
            callback(bufferViewData);
        }
    };
    
    // glTFLoader.prototype._doNextLoadTaskInList = function () {
    // };

    glTFLoader.prototype._checkComplete = function () {
        if (this._bufferRequested === this._bufferLoaded
            // && other resources finish loading
            ) {
            this._loadDone = true;
        }

        if (this._loadDone && this._parseDone && this._pendingTasks === this._finishedPendingTasks) {
            this.onload(this.glTF);
        }
    };


    glTFLoader.prototype._parseGLTF = function(json) {

        init();

        this.glTF.json = json;

        // Iterate through every scene
        for (var sceneID in json.scenes) {
            var newScene = new Scene();
            this.glTF.scenes.push(newScene);

            var scene = json.scenes[sceneID];
            var nodes = scene.nodes;
            var nodeLen = nodes.length;

            // Iterate through every node within scene
            for (var n = 0; n < nodeLen; ++n) {
                var nodeName = nodes[n];
                var node = json.nodes[nodeName];

                // Traverse node
                this._parseNode(json, node, newScene);
            }
        }

        this._parseDone = true;
        this._checkComplete();
    };


    var translationVec3 = vec3.create();
    var rotationQuat = new quat();
    var scaleVec3 = vec3.create();
    var TRMatrix = mat4.create();
    
    glTFLoader.prototype._parseNode = function(json, node, newScene, matrix) {

        if (matrix === undefined) {
            matrix = mat4.create();
        }

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
            // TODO: these labels are optional
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
                var newMesh = new Mesh();
                newScene.meshes.push(newMesh);

                var meshName = meshes[m];
                var mesh = json.meshes[meshName];

                // Iterate through primitives
                var primitives = mesh.primitives;
                var primitiveLen = primitives.length;

                for (var p = 0; p < primitiveLen; ++p) {
                    var newPrimitive = new Primitive();
                    newMesh.primitives.push(newPrimitive);

                    var primitive = primitives[p];
                    
                    _parseIndices(json, primitive, newPrimitive);
                    _parseAttributes(json, primitive, newPrimitive, curMatrix);
                }
            }
        }


        // Go through all the children recursively
        var children = node.children;
        var childreLen = children.length;
        for (var c = 0; c < childreLen; ++c) {
            var childName = children[c];
            var childNode = json.nodes[childName];
            this._parseNode(json, childNode, scene, onload, curMatrix);
        }

    };


    glTFLoader.prototype._parseIndices = function(json, primitive, newPrimitive) {

        var accessorName = primitive.indices;
        var accessor = json.accessors[accessorName];

        this._getBufferViewData(json, accessor.bufferView, function(bufferViewData) {
            newPrimitive.indices = _getAccessorData(bufferViewData, accessor);
            this._checkComplete();
        });
    };

    glTFLoader.prototype._parseAttributes = function(json, primitive, newPrimitive, curMatrix) {

        for (attributeName in primitive.attributes) {
            var accessorName = primitive.attributes[attributeName];
            var accessor = json.accessors[accessorName];

            this._getBufferViewData(json, accessor.bufferView, function(bufferViewData) {
                newPrimitive.attributes[attributeName] = _getAccessorData(bufferViewData, accessor);

                // TODO: Matrix transformation

                this._checkComplete();
            });
        }
    };



    /**
     * load a glTF model
     * 
     * @param {String} uri uri of the .glTF file. Other resources (bins, images) are assumed to be in the same base path
     * @param {Function} callback the onload callback function
     */
    glTFLoader.prototype.loadGLTF = function (uri, callback) {
        this.onload = callback || function() {
            console.log('glTF model loaded.');
        };

        this._init();

        this.baseUri = _getBaseUri(uri);

        _loadJSON(url, function(response) {
            // Parse JSON string into object
            var json = JSON.parse(response);

            // Launch loading resources: buffers, images, etc.
            if (json.buffers) {
                for (b in json.buffers) {
                    this._bufferRequested++;
                    _loadArrayBuffer(json.buffers[b].uri, function(resource) {
                        this._buffers[name] = resource;
                        this._bufferLoaded++;
                        if (this._bufferTasks[name]) {
                            var i,len;
                            for (i = 0, len = this._bufferTasks[name].length; i < len; ++i) {
                                (this._bufferTasks[name])[i].run(resource);
                            }
                        }
                        this._checkComplete();
                    });
                }
            }

            // Meanwhile start glTF scene parsing
            this._parseGLTF(json);
        });
    };



    // -------------- Scope limited ---------------
    
    var ComponentType2AttributeSize = {
        5120: 1, // BYTE
        5121: 1, // UNSIGNED_BYTE
        5122: 2, // SHORT
        5123: 2, // UNSIGNED_SHORT
        5126: 4  // FLOAT
    };

    var Type2NumOfComponent = {
        'SCALAR': 1,
        'VEC2': 2,
        'VEC3': 3,
        'VEC4': 4,
        'MAT2': 4,
        'MAT3': 9,
        'MAT4': 16
    };

    function _arrayBuffer2TypedArray(resource, byteOffset, countOfComponentType, componentType) {
        switch(componentType) {
            // @todo: finish
            case 5122: return new Int16Array(resource, byteOffset, countOfComponentType);
            case 5123: return new Uint16Array(resource, byteOffset, countOfComponentType);
            case 5126: return new Float32Array(resource, byteOffset, countOfComponentType);
            default: return null; 
        }
    }

    function _getAccessorData(bufferViewData, accessor) {
        return _arrayBuffer2TypedArray(
            bufferViewData, 
            accessor.byteOffset, 
            accessor.count * Type2NumOfComponent[accessor.type],
            accessor.componentType
            );
    }

    function _getBaseUri(uri) {
        
        // https://github.com/AnalyticalGraphicsInc/cesium/blob/master/Source/Core/getBaseUri.js
        
        var basePath = '';
        var i = uri.lastIndexOf('/');
        if(i !== -1) {
            basePath = uri.substring(0, i + 1);
        }
        
        return basePath;
    }

    function _loadJSON(src, callback) {

        // native json loading technique from @KryptoniteDove:
        // http://codepen.io/KryptoniteDove/post/load-json-file-locally-using-pure-javascript

        var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
        xobj.open('GET', src, true);
        xobj.onreadystatechange = function () {
            if (xobj.readyState === 4 && // Request finished, response ready
                xobj.status === "200") { // Status OK
                callback(xobj.responseText);
            }
        };
        xobj.send(null);
    }

    function _loadArrayBuffer(url, callback) {
        var xobj = new XMLHttpRequest();
        xobj.responseType = 'arraybuffer';
        xobj.open('GET', url, true);
        xobj.onreadystatechange = function () {
            if (xobj.readyState === 4 && // Request finished, response ready
                xobj.status === "200") { // Status OK
                var arrayBuffer = xobj.response;
                if (arrayBuffer && callback) {
                    callback(arrayBuffer);
                }
            }
        }
        xobj.send(null);
    }

})();