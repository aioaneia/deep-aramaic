import numpy             as np
import pandas            as pd
import matplotlib.pyplot as plt
import tensorflow        as tf
import seaborn           as sns
import os

from flask                                              import Flask, render_template, request, redirect, url_for, jsonify

from tensorflow.keras                                   import Input
from tensorflow.keras.models                            import Model, Sequential
from tensorflow.keras.layers                            import MaxPooling2D, Dense, Dropout, Flatten, GlobalAveragePooling2D, Reshape
from tensorflow.keras.preprocessing                     import image_dataset_from_directory, image
from tensorflow.keras.preprocessing.image               import load_img, img_to_array
from tensorflow.keras.applications.mobilenet_v2         import MobileNetV2, preprocess_input, decode_predictions
from tensorflow.keras.applications.resnet50             import ResNet50, decode_predictions
from tensorflow.keras.applications                      import DenseNet121, VGG16
from tensorflow.keras.models                            import load_model
from tensorflow.keras.layers.experimental.preprocessing import RandomFlip, RandomRotation
from tensorflow.keras.optimizers                        import Adam, SGD
from tensorflow.keras.callbacks                         import ModelCheckpoint, EarlyStopping
from tensorflow.keras.losses                            import SparseCategoricalCrossentropy, CategoricalCrossentropy
from tensorflow.data.experimental                       import cardinality

from keras_adabound                                     import AdaBound

PATH               = "dataset/panamuwa"
BATCH_SIZE         = 16
IMG_SIZE           = (224, 224)
IMG_SHAPE          = IMG_SIZE + (3,)
EPOCHS             = 10
LEARNING_RATE      = 0.001
BETA_1             = 0.9
BETA_2             = 0.999
NR_CLASSES         = 22
WEIGHTS            = 'imagenet'
POOLING            = 'avg'

app = Flask(__name__)

trainDir      = os.path.join(PATH, 'train')
validationDir = os.path.join(PATH, 'valid')
testDir       = os.path.join(PATH, 'test')

trainDataset = image_dataset_from_directory(
  trainDir,
  shuffle          = True,
  # validation_split = 0.2,
  # subset           = "training",
  # seed             = 123,
  image_size       = IMG_SIZE,
  batch_size       = BATCH_SIZE
)

validationDataset = image_dataset_from_directory(
  validationDir,
  subset     = "validation",
  shuffle    = True,
  image_size = IMG_SIZE,
  batch_size = BATCH_SIZE
)

testDataset = image_dataset_from_directory(
  testDir, 
  shuffle    = True, 
  batch_size = BATCH_SIZE, 
  image_size = IMG_SIZE
)

classNames = trainDataset.class_names
train_num  = cardinality(trainDataset)
test_num   = cardinality(validationDataset)
valid_num  = cardinality(testDataset)


print('Number of train batches:      %d' % train_num)
print('Number of validation batches: %d' % test_num)
print('Number of test batches:       %d' % valid_num)

dataAugmentation = Sequential([
  RandomFlip('horizontal'),
  RandomRotation(0.2),
])

AdamOpt = Adam(
  learning_rate = LEARNING_RATE, 
  beta_1        = BETA_1, 
  beta_2        = BETA_2, 
  epsilon       = 1e-08
)

SgdOpt = SGD(
  learning_rate = 0.1
)

AdaOpt = AdaBound(
  learning_rate = 0.001, 
  final_lr      = 0.1
)

mobileNetModel = MobileNetV2(
  input_shape = IMG_SHAPE,
  include_top = False,
  weights     = WEIGHTS,
  pooling     = POOLING
)

vggModel = VGG16(
  input_shape = (224,224, 3),
  include_top = False,
  weights     = "imagenet",
)

plt.figure(figsize = (12, 12))

for images, labels in trainDataset.take(1):
  for i in range(9):
    ax = plt.subplot(3, 3, i + 1)

    plt.imshow(images[i].numpy().astype("uint8"))
    plt.title(classNames[labels[i]])
    plt.axis("off")

# for better data performance using buffered prefetching 
AUTOTUNE = tf.data.AUTOTUNE

trainDataset      = trainDataset.prefetch(buffer_size      = AUTOTUNE)
validationDataset = validationDataset.prefetch(buffer_size = AUTOTUNE)
testDataset       = testDataset.prefetch(buffer_size       = AUTOTUNE)

for img, _ in trainDataset.take(1):
  plt.figure(figsize = (10, 10))
  
  first_image = img[0]
  
  for i in range(9):
    ax = plt.subplot(3, 3, i + 1)
    augmented_image = dataAugmentation(tf.expand_dims(first_image, 0))
    plt.imshow(augmented_image[0] / 255)
    plt.axis('off')

# Create a model
def create_Sequential_model():
  model = Sequential()

  vggModel.trainable = False

  model.add(vggModel)

  model.add(Flatten())

  model.add(Dense(2048, activation = 'relu', kernel_initializer = 'he_normal'))

  model.add(Dropout(0.35))

  model.add(Dense(2048, activation = 'relu', kernel_initializer = 'he_normal'))

  model.add(Dropout(0.35))

  model.add(Dense(22, activation='softmax', kernel_initializer = 'glorot_normal'))

  return model

# Create a model
def create_Mobile_Model():
  mobileNetModel.trainable = False

  inputs = Input(shape = IMG_SHAPE)

  x = dataAugmentation(inputs)

  x = preprocess_input(x)

  x = mobileNetModel(x, training = False)

  x = Flatten()(x)

  x = Dense(2048, activation = 'relu')(x)

  x = Dense(2048, activation = 'relu')(x)

  x = Dropout(0.5)(x)

  predictions = Dense(NR_CLASSES, activation = 'softmax')(x)

  model = Model(inputs, predictions)

  return model

# loading the best performing model
def loading_Model():
  model = tf.keras.models.load_model('/content/models/model_0.989.h5')

  # Getting test accuracy and loss
  test_loss, test_acc = model.evaluate(testDataset)

  print('Test loss: {} Test Acc: {}'.format(test_loss, test_acc))

model = create_Sequential_model()

#############################
# Compile                   #
#############################
model.compile(
  optimizer = AdamOpt,
  loss      = SparseCategoricalCrossentropy(),
  metrics   = ['accuracy']
)

#############################
# Summary                   #
#############################
model.summary()

#############################
# Train                     #
#############################
history = model.fit(
  trainDataset,
  epochs           = EPOCHS,
  validation_data  = validationDataset,
  callbacks        = [
    EarlyStopping(monitor = 'val_accuracy', patience = 10),
    ModelCheckpoint(
      'models/model_{val_accuracy:.3f}.h5',
      save_best_only    = True,
      save_weights_only = False,
      monitor           = 'val_accuracy'
    )
  ]
)

#############################
# Metrics                   #
#############################
acc     = history.history['accuracy']
valAcc  = history.history['val_accuracy']
loss    = history.history['loss']
valLoss = history.history['val_loss']

plt.figure(figsize = (8, 8))
plt.subplot(2, 1, 1)
plt.plot(acc,    label = 'Training Accuracy')
plt.plot(valAcc, label = 'Validation Accuracy')
plt.legend(loc = 'lower right')
plt.ylabel('Accuracy')
plt.ylim([min(plt.ylim()), 1])
plt.title('Training and Validation Accuracy')

plt.subplot(2, 1, 2)
plt.plot(loss,    label = 'Training Loss')
plt.plot(valLoss, label = 'Validation Loss')
plt.legend(loc = 'upper right')
plt.ylabel('Cross Entropy')
plt.ylim([0, max(plt.ylim())])
plt.title('Training and Validation Loss')
plt.xlabel('epoch')

plt.show()

#############################
# Evaluation                #
#############################
loss, accuracy = model.evaluate(testDataset)

print('Model accuracy ---> ', accuracy)

#############################
# Prediction                #
#############################
imageBatch, labelBatch = testDataset.as_numpy_iterator().next()
predictedBatch         = model.predict(imageBatch)
predictedId            = np.argmax(predictedBatch, axis = -1)

plt.figure(figsize = (10, 10))

for i in range(9):
  ax = plt.subplot(3, 3, i + 1)

  plt.imshow(imageBatch[i].astype("uint8"))
  plt.title(classNames[predictedId[i]])
  plt.axis("off")

# plt.tight_layout()
# plt.show()

# Predict an image
def classify(img_path):  
  imageRaw = load_img(img_path, target_size = (224, 224, 3))
  image    = img_to_array(imageRaw)

  predictionImage = np.array(image)

  predictionImage = np.expand_dims(image, 0)

  predictions = model.predict(predictionImage)
  
  top_indices = np.argsort(predictions)[0, ::-1][:5]
  top_indice  = np.argmax(predictions[0])
  percent     = 100 * np.max(predictions[0])

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

# Create a DataFrame with one Label of each category
def onLabelDataset():
  df_unique = trainDataset.copy().drop_duplicates(subset = ["Label"]).reset_index()

  # Display some pictures of the dataset
  fig, axes = plt.subplots(nrows = 6, ncols = 6, figsize = (12, 12), subplot_kw = {'xticks': [], 'yticks': []})

  for i, ax in enumerate(axes.flat):
      ax.imshow(plt.imread(df_unique.Filepath[i]))
      ax.set_title(df_unique.Label[i], fontsize = 12, color = 'white')

  plt.tight_layout(pad=0.5)
  plt.show()

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