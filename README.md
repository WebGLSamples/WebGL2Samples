WebGL 2 Samples Pack
=====================

[![Build Status](https://travis-ci.org/WebGLSamples/WebGL2Samples.svg?branch=master)](https://travis-ci.org/WebGLSamples/WebGL2Samples)

Run the live **[WebGL 2 Samples Pack](http://webglsamples.org/WebGL2Samples/)**.

Short and easy to understand samples demonstrating WebGL 2 features by [Shuai Shao (Shrek)](https://shrekshao.github.io) and [Trung Le](http://www.trungtuanle.com/). Advised by [Patrick Cozzi](http://www.seas.upenn.edu/~pcozzi/), University of Pennsylvania.

MIT license.  See [LICENSE.md](LICENSE.md).

## Samples

|              | Chrome 49 Windows | 49 OSX 10.10| Firefox 42 Windows| Firefox 42 OSX 10.10|
|--------------|:-----------------:|:--------------------------------------:|:-----------------:|:-----------------------:|
|[draw_instanced](http://webglsamples.org/WebGL2Samples/#draw_instanced)|:white_check_mark: |:white_check_mark:| :x: crash|:white_check_mark:|
|[glsl_discard](http://webglsamples.org/WebGL2Samples/#glsl_discard)|:white_check_mark: |:white_check_mark:| :white_check_mark:|:white_check_mark:|
|[query_occlusion](http://webglsamples.org/WebGL2Samples/#query_occlusion)|:white_check_mark:|:white_check_mark:| :white_check_mark:|:white_check_mark:|
|[sampler_object](http://webglsamples.org/WebGL2Samples/#sampler_filter)|:x:D3D not supported|:white_check_mark:| :x: D3D not supported|:white_check_mark:|
|[sampler_wrap](http://webglsamples.org/WebGL2Samples/#sampler_filter)|:grey_question:|:white_check_mark:| :grey_question:|:white_check_mark:|
|[sampler_filter](http://webglsamples.org/WebGL2Samples/#sampler_filter)|:grey_question:|:white_check_mark:| :grey_question:|:white_check_mark:|

## Running the Samples Locally

Clone this repo:
```
git@github.com:WebGLSamples/WebGL2Samples.git
```

Then run a local web server from the repo's root directory.  for example, if you have [Python](https://www.python.org/) installed, run
```
cd WebGL2Samples
python -m SimpleHTTPServer
```
Then browse to
```
http://localhost:8000/
```

### Build Instructions

The samples do not require a build; however, Node.js and gulp can be used to run JSHint to aid in development.

Install [Node.js](http://nodejs.org/).  From the root directory of this repo, run:
```
npm install
```
To run JSHint on the entire codebase, run
```
npm run jsHint
```
To run JSHint automatically when a file is saved, run the following and leave it open in a console window:
```
npm run jsHint-watch
```

## Contributions

This is a community project.  We welcome contributions!  Check out the [issues](https://github.com/WebGLSamples/WebGL2Samples/issues) for ideas on what to contribute.

When you open a pull request, please make sure that GitHub reports that "All checks have passed", indicated by the white checkmark in a green circle on top of the "Merge pull request" button.  Travis CI is used to run JSHint on your branch, and [CLA assistant](https://cla-assistant.io/) is used for signing a Contributor License Agreement (CLA).  Submit an [issue](https://github.com/WebGLSamples/WebGL2Samples/issues) if you have any questions.

## Acknowledgements

* [three.js example page framework](https://github.com/mrdoob/three.js) by Mr.doob ([@mrdoob](https://github.com/mrdoob)) and contributors
* [OpenGL Samples Pack](https://github.com/g-truc/ogl-samples) by Christophe Riccio ([@Groovounet](https://github.com/Groovounet)) and contributors
* [Cesium](https://github.com/AnalyticalGraphicsInc/cesium) build script by Matt Amato ([@mramato](https://github.com/mramato)) and contributors
* [webgl2-particles](https://github.com/toji/webgl2-particles) by Brandon Jones ([@toji](https://github.com/toji)) and Mr.doob ([@mrdoob](https://github.com/mrdoob))
