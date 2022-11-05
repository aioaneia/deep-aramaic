
import os
import sys

import tensorflow        as tf
import numpy             as np
import matplotlib.pyplot as plt
import tensorflow_hub    as hub

from flask import Flask, render_template, request, redirect, url_for, jsonify

from tensorflow.keras.applications.resnet_v2            import ResNet152V2
from tensorflow.keras.applications.xception             import Xception
from tensorflow.keras.layers                            import Dense, Dropout, BatchNormalization, GlobalAveragePooling2D, GlobalMaxPooling2D, Concatenate
from tensorflow.keras.losses                            import SparseCategoricalCrossentropy
from tensorflow.keras.layers.experimental.preprocessing import RandomRotation, Resizing, Rescaling
from tensorflow.keras.models                            import Model, Sequential, load_model
from tensorflow.keras.preprocessing                     import image_dataset_from_directory
from tensorflow.keras.preprocessing.image               import load_img, img_to_array, ImageDataGenerator
from tensorflow.keras.optimizers                        import Adam

#Metrics
from sklearn.metrics import confusion_matrix, classification_report, roc_auc_score

app     = Flask(__name__)
basedir = os.path.abspath(os.path.dirname(__file__))

BATCH_SIZE     = 16
IMG_SIZE       = (224, 224)
IMG_SHAPE      = IMG_SIZE + (3,)
TARGET_SIZE    = (224, 224)
TEST_DATA_PATH = "../datasets/real_image_data"

app.config.update(
  UPLOADED_PATH              = os.path.join(basedir, 'static/uploads'),
  DROPZONE_ALLOWED_FILE_TYPE = 'image',
  DROPZONE_MAX_FILE_SIZE     = 3,
  DROPZONE_MAX_FILES         = 30
)

with tf.device('/cpu:0'):
  data_augmentation = Sequential([
    Resizing(224, 224),
    Rescaling(1. / 255)
  ])

test_dataset = image_dataset_from_directory(TEST_DATA_PATH,
  shuffle    = True,
  batch_size = BATCH_SIZE,
  image_size = IMG_SIZE
)

test_datagen = ImageDataGenerator(
  rescale = 1/255.0
)

testDataset = test_datagen.flow_from_directory(
  directory   = TEST_DATA_PATH,
  target_size = IMG_SIZE,
  batch_size  = BATCH_SIZE,
  color_mode  = 'rgb',
  class_mode  = None,
  shuffle     = False,
  seed        = 42,
)


classNames = test_dataset.class_names
NR_CLASSES = len(classNames)


def make_prediction(model):
  imageBatch, labelBatch = test_dataset.as_numpy_iterator().next()
  predictedBatch         = model.predict(imageBatch)
  predictedId            = np.argmax(predictedBatch, axis = -1)

  plt.figure(figsize = (10, 10))

  for i in range(9):
    ax = plt.subplot(3, 3, i + 1)

    plt.imshow(imageBatch[i].astype("uint8"))
    plt.title(classNames[predictedId[i]])
    plt.axis("off")

  plt.tight_layout()
  plt.show()

def loading_model(MODEL_PATH):
  print('')
  print('--> Loading model ', MODEL_PATH)

  model = load_model(MODEL_PATH, custom_objects = { 'KerasLayer': hub.KerasLayer })

  test_loss, test_acc = model.evaluate(testDataset)

  print('Model {}  Test loss: {} Test Acc: {}'.format(MODEL_PATH, test_loss, test_acc))

  #make_prediction(model)

  return model


print('Loading models')

EFFICIENTNETV2_PATH = "../models/efficientnetv2B0-0.999.h5"
RESNET152v2_PATH    = "../models/efficientnetv2B2-0.988.h5"

resnet152v2    = loading_model(RESNET152v2_PATH)
efficientnetv2 = loading_model(EFFICIENTNETV2_PATH)

deepLModels = [
  { 'id': 1, 'name': 'ResNet152v2',     'model': resnet152v2 },
  { 'id': 2, 'name': 'EfficientNetB7',  'model': efficientnetv2 },
  { 'id': 3, 'name': 'EfficientNetV2L', 'model': efficientnetv2 }
]

defaultModel = deepLModels[0]

def getModelById(modelId):
  model = ''

  for deepLModel in deepLModels:
    if modelId == deepLModel['id']:
      model = deepLModel

  if not model:
    model = defaultModel

  print(model['name'])

  return model['model']


def getModelNameById(modelId):
  model = ''

  for deepLModel in deepLModels:
    if modelId == deepLModel['id']:
      model = deepLModel

  return model['name']

def loadImage(imgPath):
  image     = load_img(imgPath, target_size = TARGET_SIZE)
  input_arr = img_to_array(image)
  input_arr = np.array([input_arr])
  input_arr = input_arr.astype('float32') / 255. 

  return input_arr

#############################
# Predict an image          #
#############################
def predictByCompactBilinearPooling(imgPath):  
  image          = loadImage(imgPath)
  returnObjects  = []

  for deepLModel in deepLModels:
    predictions    = deepLModel['model'].predict(image)
    maxPredIndex   = np.argmax(predictions[0])
    maxPredPercent = round((100 * np.max(predictions[0])), 2)

    for i in range(len(classNames)):
      if i == maxPredIndex:
        predictionObj = {
          'letter':     classNames[i],
          'prediction': maxPredPercent,
          'model':      deepLModel['name']
        }

        returnObjects.append(predictionObj)
        break

  print('')
  print('-------------------------------------')
  for obj in returnObjects:
    print('Prediction -> Letter: {} Accuracy: {} Model: {}'.format(obj['letter'], obj['prediction'], obj['model']))
  print('-------------------------------------')
  print('')

  return returnObjects

#############################
# Predict an image #
#############################
def predictByModel(imgPath, modelId):  
  image         = loadImage(imgPath)
  model         = getModelById(modelId)

  predictions   = model.predict(image)
  top_indices   = np.argsort(predictions)[0, ::-1][:3]
  top_indice    = np.argmax(predictions[0])
  top_percents  = np.sort(predictions)[0, ::-1][:3]
  percent       = round((100 * np.max(predictions[0])), 3)
  returnObjects = []

  for i in range(len(classNames)):
    for j in range(len(top_indices)):
      if i == top_indices[j]:
        predictionObj = {
          'letter':     classNames[i],
          'prediction': round((100 * top_percents[j]), 2)
        }
        returnObjects.append(predictionObj)

  print('-------------------------------------')
  #print('Shape ->        ', predictions.shape)
  #print('Predictions ->  ', predictions[0])
  print('Top Indices ->  ', top_indices)
  print('Top Percents -> ', top_percents)
  print('Index ->        ', top_indice)
  print('Percent ->      ', percent)
  print('Letters ->      ', returnObjects)
  print('-------------------------------------')
  print('')

  return returnObjects

#############################
# Route                     #
#############################
@app.route('/image', methods=['GET'])
def upload():
    return render_template('index.html')

#############################
# Routes                    #
#############################
@app.route('/predict', methods=['POST'])
def predict():
  f       = request.files.get('file')
  modelId = int(request.form['select'])

  print('modelId', modelId)
  
  if f.filename.split('.')[1] != 'png':
    return 'PNG only!', 400
    
  filePath = os.path.join(app.config['UPLOADED_PATH'], f.filename)

  f.save(filePath)

  #predictByCompactBilinearPooling(filePath)

  predictions = predictByModel(filePath, modelId)

  print('prediction --> ', predictions)

  data = {
    'filename':    f.filename,
    'predictions': predictions,
    'modelName':   getModelNameById(modelId)
  }

  return render_template('index.html', data = data)

#############################
# Routes                    #
#############################
@app.route('/display/<filename>')
def display_image(filename):
	return redirect(url_for('static', filename='uploads/' + filename), code = 301)

#############################
# Routes                    #
#############################
@app.route('/show/<lettername>')
def show_letter(lettername):
	return redirect(url_for('static', filename='images/alphabet/' + lettername + '.png'), code = 301)

#############################
# Main                      #
#############################
if __name__ == "__main__":
  app.run(debug = False)
