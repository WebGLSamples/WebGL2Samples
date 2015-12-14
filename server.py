#!/usr/bin/python

import sys
if sys.version_info.major == 2:
    from SimpleHTTPServer import SimpleHTTPRequestHandler
    from SocketServer import TCPServer
elif sys.version_info.major == 3:
    from http.server import SimpleHTTPRequestHandler
    from socketserver import TCPServer

PORT = 10565

Handler = SimpleHTTPRequestHandler

httpd = TCPServer(("", PORT), Handler)

print("serving at port {}".format(PORT))
httpd.serve_forever()
