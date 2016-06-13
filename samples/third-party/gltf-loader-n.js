var glTFLoader;
(function() {
    'use strict';

    glTFLoader = function (callback) {
        var onload = callback || function() {
            console.log('glTF model loaded.');
        };

        var parseDone = false;
        var loadDone = false;

        var bufferRequested = 0;
        var bufferLoaded = 0;
        var buffers = {};

        var loadTaskList = [];
    };

    glTFLoader.prototype.Scene = function () {
        var meshes = [];    // list of primitives
    };

    glTFLoader.prototype.loadBuffer = function(name, uri, callback) {
        var buffer = this.buffers[name];
        if(!buffer) {
            // load buffer for the first time
            console.log("first load buffer");
            this.bufferRequested += 1;
            _loadArrayBuffer(uri, function(resource) {

                this.buffers[name] = resource;
                this.bufferLoaded += 1;
                if (this.checkComplete()) {

                }

                //?
                callback(resource);
            });
        } else {
            // no need to load buffer from file
            // use cached ones
            console.log("use cached buffer");
            callback(buffer);
        }
    };
    
    glTF.prototype.checkComplete = function () {

    };







    // -------------- Scope limited ---------------
    
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

    function _arrayBuffer2TypedArray(resource, byteOffset, length, componentType) {
        switch(componentType) {
            // @todo: finish
            case 5122: return new Int16Array(resource, byteOffset, length);
            case 5123: return new Uint16Array(resource, byteOffset, length);
            case 5126: return new Float32Array(resource, byteOffset, length);
            default: return null; 
        }
    }

    function _loadArrayBuffer(url, callback) {
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

})();