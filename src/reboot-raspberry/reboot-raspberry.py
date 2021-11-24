#!/usr/bin/env python3
"""
This Python3 script is a http server that listens on 8081 port and will shutdown the
computer when a GET request is received.
"""
from http.server import HTTPServer, BaseHTTPRequestHandler

class Server(BaseHTTPRequestHandler):
    def _set_headers(self):
        self.send_header('Access-Control-Allow-Credentials', 'true')
        self.send_header('Access-Control-Allow-Origin', 'http://localhost:8080')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header("Access-Control-Allow-Headers", "X-Requested-With, Content-type")
        self.end_headers()

    def reboot(self):
        import os
        return os.system("sudo ./reboot-raspberry.sh")

    def do_GET(self):
        # Send the html message to announce the reboot
        res = self.reboot()
        if res == 0:
            self.send_response(200, "ok")
            self._set_headers()
            self.wfile.write(bytes("Rebooted", "utf-8"))
        else:
            self.send_response(403, "Unauthorized")
            self._set_headers()
            self.wfile.write(bytes("Error", "utf-8"))


def run(server_class=HTTPServer, handler_class=Server, address="localhost", port=8081):
    http_server = server_class((address, port), handler_class)
    print("Starting the reboot http server on port", port)
    http_server.serve_forever()

if __name__ == "__main__":
    run()
