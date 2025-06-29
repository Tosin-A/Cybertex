from flask import Flask, request, jsonify
import requests
import logging
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Set up basic logging
logging.basicConfig(level=logging.INFO)

@app.route('/')
def health_check():
    return jsonify({"status": "Server is running"}), 200

@app.route('/scan', methods=['POST'])
def scan():
    try:
        data = request.get_json(force=True)
    except Exception as e:
        app.logger.error(f"Invalid JSON payload: {e}")
        return jsonify({"error": "Invalid JSON payload"}), 400

    if not data or "url" not in data:
        app.logger.error("Missing 'url' in request JSON")
        return jsonify({"error": "Missing 'url' in request JSON"}), 400

    domain = data.get("url")
    app.logger.info(f"Received scan request for domain: {domain}")

    try:
        headers_link = f"https://securityheaders.com/?q={domain}&hide=on"
        ssl_check = requests.get(f"https://api.ssllabs.com/api/v3/analyze?host={domain}").json()
        grade = ssl_check.get("endpoints", [{}])[0].get("grade", "Pending")
        headers_response = requests.get(f"https://{domain}", timeout=5)
        security_headers = {
            "Content-Security-Policy": headers_response.headers.get("Content-Security-Policy", "Missing"),
            "X-Frame-Options": headers_response.headers.get("X-Frame-Options", "Missing"),
            "X-Content-Type-Options": headers_response.headers.get("X-Content-Type-Options", "Missing")
        }
        dns_ok = "yes" if "." in domain else "no"
    except Exception as e:
        app.logger.error(f"Error fetching security data: {e}")
        return jsonify({"error": "Failed to fetch security data"}), 500

    return jsonify({
        "domain": domain,
        "sslGrade": grade,
        "headersReport": headers_link,
        "securityHeaders": security_headers,
        "dnsCheck": dns_ok
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
