import  json
import pickle
import numpy as np

__location = None
__data_column = None
__model = None

def get_location_names():
    load_saved_artifacts()
    return __location

def get_data_columns():
    return __data_column

def load_saved_artifacts():
    print('Loading saved artifacts...')
    global __location
    global __data_column

    with open('./artifacts/columns.json', 'r') as f:
        __data_column = json.load(f)['data_columns']
        __location = __data_column[3:]

    global __model
    if __model is None:
        with open('./artifacts/banglore_home_prices_model.pickle', 'rb') as f:
            __model = pickle.load(f)
    print("loading saved artifacts...done")

def get_estimated_price(location,sqft,bhk,bath):
    load_saved_artifacts()
    try:
        loc_index = __data_column.index(location.lower())
    except:
        loc_index = -1

    x = np.zeros(len(__data_column))
    x[0] = sqft
    x[1] = bath
    x[2] = bhk
    if loc_index >= 0:
        x[loc_index] = 1

    return round(__model.predict([x])[0], 2)

if __name__ == '__main__':
    load_saved_artifacts()
    print(get_location_names())
    print(get_estimated_price('1st Phase JP Nagar',1000, 3, 3))
    print(get_estimated_price('1st Phase JP Nagar', 1000, 2, 2))
    print(get_estimated_price('Kalhalli', 1000, 2, 2)) # other location
    print(get_estimated_price('Ejipura', 1000, 2, 2))  # other location