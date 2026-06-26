from flask import Flask, render_template
from getdata import getjson

app = Flask(__name__)

@app.route('/')
def index():
    data = getjson()
    return render_template('index.html', data=data)

if __name__=='__main__':
    app.run(port=5006)