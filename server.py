import webbrowser
from http.server import SimpleHTTPRequestHandler, HTTPServer
import platform

class CustomHTTPRequestHandler(SimpleHTTPRequestHandler):
    pass  # Customize this handler if needed

def run_server(port=8000):
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

    # Start serving the HTTP server
    httpd.serve_forever()

if __name__ == "__main__":
    run_server()
