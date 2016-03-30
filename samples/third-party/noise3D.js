(function(exports) {
    "use strict";
    /*global window,vec3*/

    exports = exports || window;

    function step(edge, x) {
        return [
            (x[0] < edge[0]) ? 0.0 : 1.0,
            (x[1] < edge[1]) ? 0.0 : 1.0,
            (x[2] < edge[2]) ? 0.0 : 1.0
        ];
    }

    function step_vec4(edge, x) {
        return [
            (x[0] < edge[0]) ? 0.0 : 1.0,
            (x[1] < edge[1]) ? 0.0 : 1.0,
            (x[2] < edge[2]) ? 0.0 : 1.0,
            (x[3] < edge[3]) ? 0.0 : 1.0
        ];
    }

    function min(x, y) {
        return [
            y[0] < x[0] ? y[0] : x[0],
            y[1] < x[1] ? y[1] : x[1],
            y[2] < x[2] ? y[2] : x[2]
        ];
    }

    function max(x, y) {
        return [
            y[0] > x[0] ? y[0] : x[0],
            y[1] > x[1] ? y[1] : x[1],
            y[2] > x[2] ? y[2] : x[2]
        ];
    }

    function max_vec4(x, y) {
        return [
            y[0] > x[0] ? y[0] : x[0],
            y[1] > x[1] ? y[1] : x[1],
            y[2] > x[2] ? y[2] : x[2],
            y[3] > x[3] ? y[3] : x[3]
        ];
    }

    function vec4_dot(left, right) {
        return left[0] * right[0] +
        left[1] * right[1] +
        left[2] * right[2] +
        left[3] * right[3];
    }

    //
    // Description : Array and textureless GLSL 2D/3D/4D simplex
    //               noise functions.
    //      Author : Ian McEwan, Ashima Arts.
    //  Maintainer : ijm
    //     Lastmod : 20110822 (ijm)
    //     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
    //               Distributed under the MIT License. See LICENSE file.
    //               https://github.com/ashima/webgl-noise
    //
    function mod289_vec3(x) {
        var temp = (1.0 / 289.0);
        return [
            x[0] - Math.floor(x[0] * temp) * 289.0,
            x[1] - Math.floor(x[1] * temp) * 289.0,
            x[2] - Math.floor(x[2] * temp) * 289.0
        ];
    }

    function mod289_vec4(x) {
        var temp = (1.0 / 289.0);
        return [
            x[0] - Math.floor(x[0] * temp) * 289.0,
            x[1] - Math.floor(x[1] * temp) * 289.0,
            x[2] - Math.floor(x[2] * temp) * 289.0,
            x[3] - Math.floor(x[3] * temp) * 289.0
        ];
    }

    function permute_vec4(x) {
        return mod289_vec4([
            ((x[0]*34.0)+1.0)*x[0],
            ((x[1]*34.0)+1.0)*x[1],
            ((x[2]*34.0)+1.0)*x[2],
            ((x[3]*34.0)+1.0)*x[3]
        ]);
    }

    function taylorInvSqrt_vec4(r) {
        return [
            1.79284291400159 - 0.85373472095314 * r[0],
            1.79284291400159 - 0.85373472095314 * r[1],
            1.79284291400159 - 0.85373472095314 * r[2],
            1.79284291400159 - 0.85373472095314 * r[3]
        ];
    }

    exports.snoise = function(v) {
        // const vec2  C = vec2(1.0f/6.0f, 1.0f/3.0f) ;
        // const vec4  D = vec4(0.0f, 0.5f, 1.0f, 2.0f);
        var C = [1.0/6.0, 1.0/3.0];
        var D = [0.0, 0.5, 1.0, 2.0];

        // vec3 i  = floor(v + dot(v, vec3(C.y, C.y, C.y)) );
        // vec3 x0 =   v - i + dot(i, vec3(C.x, C.x, C.x) );
        var temp0 = vec3.create();
        var temp3 = vec3.dot(v, [C[1], C[1], C[1]]);
        vec3.add(temp0, [temp3, temp3, temp3], v);
        var i  = [Math.floor(temp0[0]), Math.floor(temp0[1]), Math.floor(temp0[2])];
        var temp1 = vec3.create();
        vec3.subtract(temp1, v, i);
        var temp2 = vec3.dot(i, [C[0], C[0], C[0]]);
        var x0 = vec3.create();
        vec3.add(x0, [temp2, temp2, temp2], temp1);

        // vec3 g = step(vec3(x0.y, x0.z, x0.x), vec3(x0.x, x0.y, x0.z));
        // vec3 l = 1.0f - g;
        // vec3 i1 = min( vec3(g.x, g.y, g.z), vec3(l.z, l.x, l.y) );
        // vec3 i2 = max( vec3(g.x, g.y, g.z), vec3(l.z, l.x, l.y) );
        var g = step([x0[1], x0[2], x0[0]], [x0[0], x0[1], x0[2]]);
        var l = [1.0 - g[0], 1.0 - g[1], 1.0 - g[2]];
        var i1 = min([g[0], g[1], g[2]], [l[2], l[0], l[1]]);
        var i2 = max([g[0], g[1], g[2]], [l[2], l[0], l[1]]);

        // vec3 x1 = x0 - i1 + vec3(C.x, C.x, C.x);
        // vec3 x2 = x0 - i2 + vec3(C.y, C.y, C.y); // 2.0*C.x = 1/3 = C.y
        // vec3 x3 = x0 - vec3(D.y, D.y, D.y);      // -1.0+3.0*C.x = -0.5 = -D.y
        var temp4 = vec3.create();
        vec3.subtract(temp4, x0, i1);
        var x1 = vec3.create();
        vec3.add(x1, [C[0], C[0], C[0]], temp4);
        var temp5 = vec3.create();
        vec3.subtract(temp5, x0, i2);
        var x2 = vec3.create();
        vec3.add(x2, [C[1], C[1], C[1]], temp5);
        var x3 = vec3.create();
        vec3.subtract(x3, x0, [D[1], D[1], D[1]]);

        // i = mod289(i);
        // vec4 p = permute( permute( permute(
        //                  i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
        //                + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
        //                + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
        i = mod289_vec3(i);
        var p = permute_vec4([i[2] + 0.0, i[2] + i1[2], i[2] + i2[2], i[2] + 1.0]);
        p[0] += i[1] + 0.0;
        p[1] += i[1] + i1[1];
        p[2] += i[1] + i2[1];
        p[3] += i[1] + 1.0;
        p = permute_vec4(p);
        p[0] += i[0] + 0.0;
        p[1] += i[0] + i1[0];
        p[2] += i[0] + i2[0];
        p[3] += i[0] + 1.0;
        p = permute_vec4(p);

        // float n_ = 0.142857142857f; // 1.0/7.0
        // vec3  ns = n_ * vec3(D.w, D.y, D.z) - vec3(D.x, D.z, D.x);
//        var n_ = 0.142857142857; // 1.0/7.0
//        var  ns = [
//            n_ * D[3] - D[0],
//            n_ * D[1] - D[2],
//            n_ * D[2] - D[0]
//        ];
        var ns = [
            0.28571430,
            -0.92857140,
            0.14285715
        ];

        // vec4 j = p - 49.0f * floor(p * ns.z * ns.z);  //  mod(p,7*7)
        var j = [
            p[0] - 49.0 * Math.floor(p[0] * ns[2] * ns[2]),
            p[1] - 49.0 * Math.floor(p[1] * ns[2] * ns[2]),
            p[2] - 49.0 * Math.floor(p[2] * ns[2] * ns[2]),
            p[3] - 49.0 * Math.floor(p[3] * ns[2] * ns[2])
        ];

        // vec4 x_ = floor(j * ns.z);
        // vec4 y_ = floor(j - 7.0f * x_ );    // mod(j,N)
        var x_ = [
            Math.floor(j[0] * ns[2]),
            Math.floor(j[1] * ns[2]),
            Math.floor(j[2] * ns[2]),
            Math.floor(j[3] * ns[2])
        ];
        var y_ = [
            Math.floor(j[0] - 7.0 * x_[0] ),
            Math.floor(j[1] - 7.0 * x_[1] ),
            Math.floor(j[2] - 7.0 * x_[2] ),
            Math.floor(j[3] - 7.0 * x_[3] )
        ];

        // vec4 x = x_ *ns.x + vec4(ns.y, ns.y, ns.y, ns.y);
        // vec4 y = y_ *ns.x + vec4(ns.y, ns.y, ns.y, ns.y);
        // vec4 h = 1.0f - abs(x) - abs(y);
        var x = [
            x_[0] *ns[0] + ns[1],
            x_[1] *ns[0] + ns[1],
            x_[2] *ns[0] + ns[1],
            x_[3] *ns[0] + ns[1]
        ];
        var y = [
            y_[0] *ns[0] + ns[1],
            y_[1] *ns[0] + ns[1],
            y_[2] *ns[0] + ns[1],
            y_[3] *ns[0] + ns[1]
        ];
        var h = [
            1.0 - Math.abs(x[0]) - Math.abs(y[0]),
            1.0 - Math.abs(x[1]) - Math.abs(y[1]),
            1.0 - Math.abs(x[2]) - Math.abs(y[2]),
            1.0 - Math.abs(x[3]) - Math.abs(y[3])
        ];

        // vec4 b0 = vec4( vec2(x.x, x.y), vec2(y.x, y.y) );
        // vec4 b1 = vec4( vec2(x.z, x.w), vec2(y.z, y.w) );
        var b0 = [x[0], x[1], y[0], y[1]];
        var b1 = [x[2], x[3], y[2], y[3]];

        // vec4 s0 = floor(b0)*2.0f + 1.0f;
        // vec4 s1 = floor(b1)*2.0f + 1.0f;
        // vec4 sh = -step(h, vec4(0.0));

        var s0 = [
            Math.floor(b0[0])*2.0 + 1.0,
            Math.floor(b0[1])*2.0 + 1.0,
            Math.floor(b0[2])*2.0 + 1.0,
            Math.floor(b0[3])*2.0 + 1.0
        ];
        var s1 = [
            Math.floor(b1[0])*2.0 + 1.0,
            Math.floor(b1[1])*2.0 + 1.0,
            Math.floor(b1[2])*2.0 + 1.0,
            Math.floor(b1[3])*2.0 + 1.0
        ];
        var sh = step_vec4(h, [0.0, 0.0, 0.0, 0.0]);
        sh[0] = -sh[0];
        sh[1] = -sh[1];
        sh[2] = -sh[2];
        sh[3] = -sh[3];

        // vec4 a0 = vec4(b0.x, b0.z, b0.y, b0.w) + vec4(s0.x, s0.z, s0.y, s0.w) * vec4(sh.x, sh.x, sh.y, sh.y) ;
        // vec4 a1 = vec4(b1.x, b1.z, b1.y, b1.w) + vec4(s1.x, s1.z, s1.y, s1.w) * vec4(sh.z, sh.z, sh.w, sh.w) ;
        var a0 = [
            b0[0] + s0[0] * sh[0],
            b0[2] + s0[2] * sh[0],
            b0[1] + s0[1] * sh[1],
            b0[3] + s0[3] * sh[1]
        ];
        var a1 = [
            b1[0] + s1[0] * sh[2],
            b1[2] + s1[2] * sh[2],
            b1[1] + s1[1] * sh[3],
            b1[3] + s1[3] * sh[3]
        ];

        // vec3 p0 = vec3(a0.x, a0.y, h.x);
        // vec3 p1 = vec3(a0.z, a0.w, h.y);
        // vec3 p2 = vec3(a1.x, a1.y, h.z);
        // vec3 p3 = vec3(a1.z, a1.w, h.w);
        var p0 = [a0[0], a0[1], h[0]];
        var p1 = [a0[2], a0[3], h[1]];
        var p2 = [a1[0], a1[1], h[2]];
        var p3 = [a1[2], a1[3], h[3]];

        // vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
        // p0 *= norm.x;
        // p1 *= norm.y;
        // p2 *= norm.z;
        // p3 *= norm.w;
        var norm = taylorInvSqrt_vec4([vec3.dot(p0,p0), vec3.dot(p1,p1), vec3.dot(p2, p2), vec3.dot(p3,p3)]);
        p0 = [p0[0]*norm[0], p0[1]*norm[0], p0[2]*norm[0]];
        p1 = [p1[0]*norm[1], p1[1]*norm[1], p1[2]*norm[1]];
        p2 = [p2[0]*norm[2], p2[1]*norm[2], p2[2]*norm[2]];
        p3 = [p3[0]*norm[3], p3[1]*norm[3], p3[2]*norm[3]];

        // vec4 m = max(0.6f - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        // m = m * m;
        var m = max_vec4([
            0.6 - vec3.dot(x0,x0),
            0.6 - vec3.dot(x1,x1),
            0.6 - vec3.dot(x2,x2),
            0.6 - vec3.dot(x3,x3)
        ], [
            0.0,
            0.0,
            0.0,
            0.0
        ]);
        m[0] *= m[0];
        m[1] *= m[1];
        m[2] *= m[2];
        m[3] *= m[3];

        // return 42.0f * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
        //                          dot(p2,x2), dot(p3,x3) ) );
        return 42.0 * vec4_dot([
            m[0] * m[0],
            m[1] * m[1],
            m[2] * m[2],
            m[3] * m[3]
        ], [
            vec3.dot(p0,x0),
            vec3.dot(p1,x1),
            vec3.dot(p2,x2),
            vec3.dot(p3,x3)
        ]);
    };

}());
