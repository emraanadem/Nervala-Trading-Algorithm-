from flask import request
def shutdown_server():
    func = request.environ.get('werkzeug.server.shutdown')
    if func is None:
        raise RuntimeError('Not running with the Werkzeug Server')
    func()
from flask import Flask
app = Flask(__name__)
@app.get('/shutdown')
def shutdown():
    shutdown_server()
    return 'Server shutting down...'