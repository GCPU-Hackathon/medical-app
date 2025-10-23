#!/usr/bin/env python3
"""
Simple health check service for Segmentation Agent
Runs on http://localhost:8001
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import threading
import time

class HealthCheckHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = {
                'status': 'ok',
                'service': 'Segmentation Agent',
                'timestamp': time.time(),
                'description': 'Medical image segmentation service is running'
            }
            
            self.wfile.write(json.dumps(response).encode())
        else:
            self.send_response(404)
            self.end_headers()
    
    def log_message(self, format, *args):
        # Suppress logging
        pass

def run_server():
    server = HTTPServer(('localhost', 8001), HealthCheckHandler)
    print("Segmentation Agent health check running on http://localhost:8001")
    print("Health endpoint: http://localhost:8001/health")
    server.serve_forever()

if __name__ == '__main__':
    run_server()
