from flask import Flask, request, jsonify
from util import get_location_names,get_estimated_price
app = Flask(__name__)

@app.route('/get_location_names', methods=['GET'])
def get_location():
    response = jsonify({
        'locations': get_location_names()
    })
    response.headers.add('Access-Control-Allow-Origin', '*')

    return response

@app.route('/predict_home_price', methods=[ 'POST'])
def predict_home_price():
    total_sqft = float(request.form['total_sqft'])
    location = request.form['location']
    bhk = int(request.form['bhk'])
    bath = int(request.form['bath'])

    response = jsonify({
        'estimated_price': get_estimated_price(location,total_sqft,bhk,bath)
    })
    response.headers.add('Access-Control-Allow-Origin', '*')

    return response

@app.route('/')
def hello():
    return "Initial Page"


if __name__ == "__main__":
    print("Starting python Flask server for Home prediction...")
    app.run(host="0.0.0.0", port=8090)
    app.run(host="0.0.0.0", port=8090)