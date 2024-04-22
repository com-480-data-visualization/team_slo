import webbrowser
from http.server import SimpleHTTPRequestHandler, HTTPServer
import platform
import argparse
import signal
import sys
import os

class CustomHTTPRequestHandler(SimpleHTTPRequestHandler):
    pass  # Customize this handler if needed

# Define a global server instance variable
httpd = None

def run_server(port=8000):
    global httpd  # Declare httpd as global so that we can access it from other functions
    
    handler = CustomHTTPRequestHandler
    httpd = HTTPServer(("localhost", port), handler)
    
    # Print server information
    print(f"Serving HTTP on http://localhost:{port}/")

    # Open the server URL in Google Chrome
    # Specify the path to the Chrome browser executable based on your OS
    # For example, for Windows, it could be "C:/Program Files/Google/Chrome/Application/chrome.exe"
    # For macOS, you can use "open -a /Applications/Google\ Chrome.app"
    # For Linux, you can use "google-chrome" or "google-chrome-stable"
    if platform.system() == 'Darwin':  # macOS
        chrome_path = "open -a /Applications/Google\ Chrome.app %s"
    elif platform.system() == 'Windows':  # Windows
        chrome_path = "C:/Program Files/Google/Chrome/Application/chrome.exe %s"
    else:  # Linux
        chrome_path = "/usr/bin/google-chrome %s"

    # Use the webbrowser module to open the URL in Google Chrome
    webbrowser.get(chrome_path).open(f"http://localhost:{port}/")

    # Define a signal handler to shut down the server on interrupt
    def signal_handler(sig, frame):
        print("\nShutting down the server...")
        httpd.shutdown()
        sys.exit(0)
    
    # Register the signal handler for SIGINT
    signal.signal(signal.SIGINT, signal_handler)
    
    # Start serving the HTTP server
    httpd.serve_forever()

def stop_server():
    global httpd
    if httpd is None:
        print("No server is currently running.")
        return
    
    print("Stopping server...")
    httpd.shutdown()  # Gracefully stop the server
    httpd.server_close()  # Close the server
    httpd = None
    print("Server stopped.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run or stop the server")
    parser.add_argument("--quit", action="store_true", help="Stop the server")

    args = parser.parse_args()
    
    if args.quit:
        stop_server()  # Call the function to stop the server
    else:
        run_server()  # Start the server normally
