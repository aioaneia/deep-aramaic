import numpy as np
import os

from flask import Flask, render_template, request, redirect, url_for, jsonify

from tensorflow.keras.preprocessing       import image_dataset_from_directory, image
from tensorflow.keras.preprocessing.image import load_img, img_to_array
from tensorflow.keras.models              import load_model

MODEL_PATH     = "models/model_0.936.h5"
PATH           = "datasets/panamuwa"
BATCH_SIZE     = 16
IMG_SIZE       = (224, 224)
TARGET_SIZE    = (224, 224, 3)
TRAIN_DIR      = os.path.join(PATH, 'train')
VALIDATION_DIR = os.path.join(PATH, 'valid')
TEST_DIR       = os.path.join(PATH, 'test')

app = Flask(__name__)

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

classNames = trainDataset.class_names

# loading the best performing model
def loading_Model():
  model = load_model(MODEL_PATH)

  # Getting test accuracy and loss
  test_loss, test_acc = model.evaluate(testDataset)

  print('Test loss: {} Test Acc: {}'.format(test_loss, test_acc))

  # Summary
  model.summary()

  return model

model = loading_Model()

# Predict an image
def classify(img_path):  
  imageRaw        = load_img(img_path, target_size = TARGET_SIZE)
  image           = img_to_array(imageRaw)
  predictionImage = np.array(image)
  predictionImage = np.expand_dims(image, 0)
  predictions     = model.predict(predictionImage)
  top_indices     = np.argsort(predictions)[0, ::-1][:5]
  top_indice      = np.argmax(predictions[0])
  percent         = 100 * np.max(predictions[0])

  print('-------------------------------------')
  print('Shape ->       ', predictions.shape)
  print('Predictions -> ', predictions[0])
  print('Top Indices -> ', top_indices)
  print('Index ->       ', top_indice)
  print('Percent ->     ', percent)
 
  className = ''

  for i in range(len(classNames)):
    if i == top_indice:
      className = classNames[i]
      break
  
  print('Letter ->      ', className)
  print('-------------------------------------')
  print('')

  return className

#############################
# Routes                    #
#############################
@app.route('/predict', methods=['POST', 'GET'])
def get_data():
  className = classify('./test-image/Alef1.png')

  className = classify('./test-image/Alef2.png')

  className = classify('./test-image/Alef3.png')

  className = classify('./test-image/Bet1.png')

  className = classify('./test-image/Bet2.png')

  return jsonify('The letter from the image is a ', className)

if __name__ == "__main__":
  app.run(debug=False)
