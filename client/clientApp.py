import numpy as np
import os

from flask import Flask, render_template, request, redirect, url_for, jsonify

from tensorflow.keras.preprocessing       import image_dataset_from_directory, image
from tensorflow.keras.preprocessing.image import load_img, img_to_array
from tensorflow.keras.models              import load_model

RESNET101_PATH = "../models/model_ResNet101_0.964.h5"
RESNET152_PATH = "../models/model_ResNet152_0.929.h5"
VGG19_PATH     = "../models/model_VGG19_0.893.h5"
MODEL_PATH     = RESNET152_PATH
MODELS         = []
PATH           = "../datasets/panamuwa"
BATCH_SIZE     = 32
IMG_SIZE       = (224, 224)
TARGET_SIZE    = (224, 224, 3)
TRAIN_DIR      = os.path.join(PATH, 'train')
VALIDATION_DIR = os.path.join(PATH, 'valid')
TEST_DIR       = os.path.join(PATH, 'test')
basedir        = os.path.abspath(os.path.dirname(__file__))

app = Flask(__name__)

app.config.update(
  UPLOADED_PATH              = os.path.join(basedir, 'static/uploads'),
  DROPZONE_ALLOWED_FILE_TYPE = 'image',
  DROPZONE_MAX_FILE_SIZE     = 3,
  DROPZONE_MAX_FILES         = 30
)

#####################################
# Datasets                          #
#####################################
trainDataset = image_dataset_from_directory(TRAIN_DIR,
  validation_split = 0.2,
  subset           = "training",
  seed             = 1337,
  image_size       = IMG_SIZE,
  batch_size       = BATCH_SIZE,
  shuffle          = True
)

validationDataset = image_dataset_from_directory(VALIDATION_DIR,
  validation_split = 0.2,
  subset           = "validation",
  seed             = 1337,
  shuffle          = True,
  image_size       = IMG_SIZE,
  batch_size       = BATCH_SIZE
)

testDataset = image_dataset_from_directory(TEST_DIR, 
  shuffle    = True, 
  batch_size = BATCH_SIZE, 
  image_size = IMG_SIZE
)

#####################################
# Loading the best performing model #
#####################################
def loading_Model():
  model               = load_model(MODEL_PATH)

  test_loss, test_acc = model.evaluate(testDataset)

  print('Test loss: {} Test Acc: {}'.format(test_loss, test_acc))

  model.summary()

  return model

model = loading_Model()

#############################
# Predict an image          #
#############################
def classify(img_path):  
  imageRaw        = load_img(img_path, target_size = TARGET_SIZE)
  image           = img_to_array(imageRaw)
  predictionImage = np.array(image)
  predictionImage = np.expand_dims(image, 0)
  predictions     = model.predict(predictionImage)
  top_indices     = np.argsort(predictions)[0, ::-1][:3]
  top_indice      = np.argmax(predictions[0])

  top_percents    = np.sort(predictions)[0, ::-1][:3]
  percent         =  round((100 * np.max(predictions[0])), 3)

  print('-------------------------------------')
  print('Shape ->        ', predictions.shape)
  print('Predictions ->  ', predictions[0])
  print('Top Indices ->  ', top_indices)
  print('Top Percents -> ', top_percents)
  print('Index ->        ', top_indice)
  print('Percent ->      ', percent)

  classNames = trainDataset.class_names 

  predictionObjects = []

  # for i in range(len(classNames)):
  #   if i == top_indice:
  #     predictionObj = {
  #       'letter':     classNames[i],
  #       'prediction': percent
  #     }
  #     predictionObjects.append(predictionObj)
  #     break

  for i in range(len(classNames)):
    for j in range(len(top_indices)):
      if i == top_indices[j]:
        predictionObj = {
          'letter':     classNames[i],
          'prediction': round((100 * top_percents[j]), 3) 
        }
        predictionObjects.append(predictionObj)

  print('Letters ->      ', predictionObjects)
  print('-------------------------------------')
  print('')

  return predictionObjects

#############################
# Routes                    #
#############################

@app.route('/image', methods=['GET'])
def upload():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
  f = request.files.get('file')
  modelV = request.form['select']

  print('modelV', modelV)
  
  if f.filename.split('.')[1] != 'png':
    return 'PNG only!', 400
    
  file_path = os.path.join(app.config['UPLOADED_PATH'], f.filename)

  f.save(file_path)

  predictions = classify(file_path)

  print('prediction --> ', predictions)

  data = {
    'filename' : f.filename,
    'predictions' : predictions
  }

  return render_template('index.html', data = data)

@app.route('/display/<filename>')
def display_image(filename):
	return redirect(url_for('static', filename='uploads/' + filename), code = 301)

@app.route('/show/<lettername>')
def show_letter(lettername):
	return redirect(url_for('static', filename='images/alphabet/' + lettername + '.png'), code = 301)

if __name__ == "__main__":
  app.run(debug = False)
