(function () {
    'use strict';

    window.getShaderSource = function(id) {
        return document.getElementById(id).textContent.replace(/^\s+|\s+$/g, '');
    };

    function createShader(gl, source, type) {
        var shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        return shader;
    }

    window.createProgram = function(gl, vertexShaderSource, fragmentShaderSource) {
        var program = gl.createProgram();
        var vshader = createShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
        var fshader = createShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
        gl.attachShader(program, vshader);
        gl.deleteShader(vshader);
        gl.attachShader(program, fshader);
        gl.deleteShader(fshader);
        gl.linkProgram(program);

        console.log(gl.getProgramInfoLog(program));
        console.log(gl.getShaderInfoLog(vshader));
        console.log(gl.getShaderInfoLog(fshader));

        return program;
    };

    window.loadImage = function(url, onload) {
        var img = new Image();
        img.src = url;
        img.onload = function() {
            onload(img);
        };
    };
})();