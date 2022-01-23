import numpy as np
import os

from flask import Flask, render_template, request, redirect, url_for, jsonify

from tensorflow.keras.preprocessing       import image_dataset_from_directory, image
from tensorflow.keras.preprocessing.image import load_img, img_to_array
from tensorflow.keras.models              import load_model

app = Flask(__name__)

PATH           = "../datasets/real_image_data"
BATCH_SIZE     = 32
IMG_SIZE       = (224, 224)
TARGET_SIZE    = (224, 224, 3)
TRAIN_DIR      = os.path.join(PATH, 'train')
VALIDATION_DIR = os.path.join(PATH, 'valid')
TEST_DIR       = os.path.join(PATH, 'test')
basedir        = os.path.abspath(os.path.dirname(__file__))

app.config.update(
  UPLOADED_PATH              = os.path.join(basedir, 'static/uploads'),
  DROPZONE_ALLOWED_FILE_TYPE = 'image',
  DROPZONE_MAX_FILE_SIZE     = 3,
  DROPZONE_MAX_FILES         = 30
)

testDataset = image_dataset_from_directory(TEST_DIR,
  shuffle    = True,
  batch_size = BATCH_SIZE,
  image_size = IMG_SIZE
)

classNames = testDataset.class_names


#####################################
# Loading the best performing model #
#####################################
def loading_model(MODEL_PATH):
  print('Loading model: ', MODEL_PATH)

  model = load_model(MODEL_PATH)

  test_loss, test_acc = model.evaluate(testDataset)

  print('Test loss: {} Test Acc: {}'.format(test_loss, test_acc))

  #model.summary()

  return model

print('Loading models')

EFFICIENT_NET_B7_PATH = "../models/model_EfficientNetB7_0.990.h5"
MOBILE_NET_V3_PATH    = "../models/model_MobileNetV3_0.987.h5"
RESNET50_V2_PATH      = "../models/model_ResNet50v2_0.804.h5"
RESNET152_PATH        = "../models/model_ResNet152_0.991.h5"
RESNET152_V2_PATH     = "../models/model_ResNet152v2_0.886.h5"
VGG19_PATH            = "../models/model_VGG_0.968.h5"
XCEPTION_PATH         = "../models/model_Xception_0.689.h5"

efficientNetB7Model = loading_model(EFFICIENT_NET_B7_PATH)
mobileNetv3Model    = loading_model(MOBILE_NET_V3_PATH)
resNet50v2Model     = loading_model(RESNET50_V2_PATH)
resNet152Model      = loading_model(RESNET152_PATH)
resNet152v2Model    = loading_model(RESNET152_V2_PATH)
vgg19Model          = loading_model(VGG19_PATH)
xceptionModel       = loading_model(XCEPTION_PATH)

deepLModels = [
  { 'id': 1, 'name': 'EfficientNetB7', 'model': efficientNetB7Model },
  { 'id': 2, 'name': 'MobileNetv3',    'model': mobileNetv3Model },
  { 'id': 3, 'name': 'ResNet50v2',     'model': resNet50v2Model },
  { 'id': 4, 'name': 'ResNet152',      'model': resNet152Model },
  { 'id': 5, 'name': 'ResNet152v2',    'model': resNet152v2Model },
  { 'id': 6, 'name': 'VGG19',          'model': vgg19Model },
  { 'id': 7, 'name': 'Xception',       'model': xceptionModel }
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
  imageRaw        = load_img(imgPath, target_size = TARGET_SIZE)
  image           = img_to_array(imageRaw)
  predictionImage = np.array(image)
  predictionImage = np.expand_dims(image, 0)

  return predictionImage

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
