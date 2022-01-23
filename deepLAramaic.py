
"""
Created on June 10 2021

@author: Andrei Aioanei
"""
import os
import sys

import numpy             as np
import pandas            as pd
import matplotlib.pyplot as plt
import tensorflow        as tf
import tensorflow_hub    as hub

# Download source code.
if "efficientnetv2" not in os.getcwd():
  os.chdir('automl/efficientnetv2')
  sys.path.append('.')

from tensorflow.keras.models                            import Model, Sequential
from tensorflow.keras.layers                            import Dense, Dropout, Flatten, GlobalAveragePooling2D, GlobalMaxPooling2D, Concatenate, BatchNormalization
from tensorflow.keras.preprocessing                     import image_dataset_from_directory
from tensorflow.keras.preprocessing.image               import load_img, img_to_array

#from tensorflow.keras.applications.efficientnet_v2     import EfficientNetV2L
from tensorflow.keras.applications                      import MobileNetV3Large
from tensorflow.keras.applications.vgg19                import VGG19
from tensorflow.keras.applications.resnet               import ResNet152
from tensorflow.keras.applications.resnet_v2            import ResNet50V2, ResNet152V2
from tensorflow.keras.applications.efficientnet         import EfficientNetB7
from tensorflow.keras.applications.xception             import Xception
from tensorflow.keras.applications.nasnet               import NASNetMobile
from tensorflow.keras.applications.densenet             import DenseNet201
from tensorflow.keras.applications.inception_resnet_v2  import InceptionResNetV2

from tensorflow.keras.layers.experimental.preprocessing import RandomFlip, RandomRotation, Rescaling, Resizing, Rescaling, RandomZoom, RandomTranslation
from tensorflow.keras.optimizers                        import Adam
from tensorflow.keras.callbacks                         import ModelCheckpoint, EarlyStopping, TensorBoard, ReduceLROnPlateau, LearningRateScheduler
from tensorflow.keras.losses                            import SparseCategoricalCrossentropy, MSE
from tensorflow.keras.utils                             import plot_model

from keras_efficientnet_v2                              import EfficientNetV2L, EfficientNetV1L2

import effnetv2_model

#PATH          = "datasets/panamuwa"
PATH          = "datasets/synthetic_data"
BATCH_SIZE    = 32
IMG_SIZE      = (224, 224)
WIDTH         = 224
HEIGHT        = 224
IMG_SHAPE     = IMG_SIZE + (3,)
EPOCHS        = 30
LEARNING_RATE = 0.003
BETA_1        = 0.9
BETA_2        = 0.999
NR_CLASSES    = 5
NR_NEURONS    = 4 * 1024
WEIGHTS       = 'imagenet'
POOLING       = 'avg'
AUTOTUNE      = tf.data.AUTOTUNE
MODEL_NAME    = 'models/Figurine21'

TRAIN_DIR      = os.path.join(PATH, 'train')
VALIDATION_DIR = os.path.join(PATH, 'valid')
TEST_DIR       = os.path.join(PATH, 'test')

ANNOTATION_PATH = "datasets/annotation_data"

train_annotations_path = os.path.join(ANNOTATION_PATH, 'train_annotations.csv')
valid_annotations_path = os.path.join(ANNOTATION_PATH, 'valid_annotations.csv')

print(tf.__version__)

tf.config.list_physical_devices()

with tf.device('/cpu:0'):
  dataAugmentation = Sequential([
    Resizing(224, 224)
    # RandomRotation(0.2),
    # RandomZoom(height_factor=  0.2, width_factor = 0.2),
    # RandomTranslation(height_factor = 0.2, width_factor = 0.2)
  ])

############
# Datasets #
############

trainDataset = image_dataset_from_directory(
  TRAIN_DIR,
  #validation_split = 0.1,
  #subset           = "training",
  seed             = 42,
  image_size       = IMG_SIZE,
  batch_size       = BATCH_SIZE,
  shuffle          = True
)

validationDataset = image_dataset_from_directory(
  VALIDATION_DIR,
  #validation_split = 0.1,
  #subset           = "validation",
  seed             = 42,
  shuffle          = True,
  image_size       = IMG_SIZE,
  batch_size       = BATCH_SIZE
)

testDataset = image_dataset_from_directory(
  TEST_DIR,
  shuffle    = True,
  batch_size = BATCH_SIZE,
  image_size = IMG_SIZE
)

augmentTrainDataset      = trainDataset.map(lambda x, y: (dataAugmentation(x, training = True), y))
augmentValidationDataset = validationDataset.map(lambda x, y: (dataAugmentation(x, training = True), y))

classNames = trainDataset.class_names
train_num  = tf.data.experimental.cardinality(trainDataset)
test_num   = tf.data.experimental.cardinality(validationDataset)
valid_num  = tf.data.experimental.cardinality(testDataset)

print('Number of classes:            %d' % len(classNames))
print('Number of train batches:      %d' % train_num)
print('Number of validation batches: %d' % test_num)
print('Number of test batches:       %d' % valid_num)

###############
# Annotations #
###############

def open_annotaions(annotations_path):
  data = []
  targets = []
  labels  = []
  rows    = open(annotations_path).read().strip().split("\n")

  for row in rows:
    row = row.split(",")

    (filename, letter_class, startX, startY, endX, endY) = row

    image     = load_img(filename, target_size = IMG_SIZE)
    image_arr = img_to_array(image)

    data.append(image_arr)

    startX = round(int(startX) / WIDTH, 2)
    startY = round(int(startY) / HEIGHT, 2)
    endX = round(int(endX) / WIDTH, 2)
    endY = round(int(endY) / HEIGHT, 2)

    targets.append((startX, startY, endX, endY))

    labels.append(letter_class)

  return targets, labels

#train_data, train_targets, train_labels = open_annotaions(train_annotations_path)
#valid_data, valid_targets, valid_labels = open_annotaions(valid_annotations_path)

# print(len(train_data))
# print(len(train_targets))
# print(len(train_labels))

# print(len(valid_data))
# print(len(valid_targets))
# print(len(valid_labels))

############################
# Optimisers
############################

ADAM_OPT = Adam(
  learning_rate = LEARNING_RATE, 
  beta_1        = BETA_1, 
  beta_2        = BETA_2, 
  epsilon       = 1e-08
)

############################
# Pre-trained Models
############################

vgg19Model = VGG19(
  input_shape = IMG_SHAPE,
  include_top = False,
  weights     = "imagenet",
)

resNet50v2Model = ResNet50V2(
  input_shape = IMG_SHAPE,
  include_top = False,
  weights     = "imagenet",
)

resNet152Model = ResNet152(
  input_shape = IMG_SHAPE,
  include_top = False,
  weights     = "imagenet",
)

resNet152v2Model = ResNet152V2(
  input_shape = IMG_SHAPE,
  include_top = False,
  weights     = "imagenet",
)

# mobileNetV2Model = MobileNetV2(
#   input_shape = IMG_SHAPE,
#   include_top = False,
#   weights     = "imagenet",
# )

mobileNetV3Model = MobileNetV3Large(
  input_shape = IMG_SHAPE,
  include_top = False,
  weights     = "imagenet",
)

efficientNetB7 = EfficientNetB7(
  input_shape = IMG_SHAPE,
  include_top = False,
  weights     = "imagenet",
)

# efficientNetV2L = EfficientNetV2L(
#   input_shape = IMG_SHAPE,
#   num_classes = 0, 
#   pretrained  = "imagenet21k",
#   dropout     = 0.2
# )

efficientNetV2L = effnetv2_model.get_model('efficientnetv2-l', include_top = False, weights = 'imagenet21k-ft1k')

efficientNetV1L2 = EfficientNetV1L2(
  input_shape = IMG_SHAPE,
  num_classes = 0, 
  pretrained  = "imagenet",
  dropout = 0.2
)

xception = Xception(
  input_shape = IMG_SHAPE,
  include_top = False,
  weights     = "imagenet",
)

inception_resnet_v2 = InceptionResNetV2(
    input_shape  = IMG_SHAPE,
    include_top  = False,
    weights      ='imagenet',
    input_tensor = None,
)

denseNet201 = DenseNet201(
  input_shape = IMG_SHAPE,
  include_top = False,
  weights     = "imagenet",
)

nASNetLarge = NASNetMobile(
  input_shape = IMG_SHAPE,
  include_top = False,
  weights     = "imagenet",
)

############################
# Callbacks Settings
############################

earlyStop = EarlyStopping(
  monitor   = 'val_accuracy',
  mode      = 'max',
  min_delta = 0.001,
  patience  = 10
)

checkpointer = ModelCheckpoint(
  filepath          = 'models/model_{val_accuracy:.3f}.h5',
  save_best_only    = True,
  save_weights_only = False,
  mode              = 'max', 
  monitor           = 'val_accuracy',
  verbose           = 1
)

reduceLR = ReduceLROnPlateau( 
  monitor  = 'val_loss',
  factor   = 0.1,
  patience = 3,
  min_lr   = 0.00001
)

learningRate = LearningRateScheduler(
  lambda epoch: 1e-3 * 10 ** (epoch / 30)
)

tensorboard = TensorBoard(
  log_dir                = "./logs",
  write_graph            = True,
  write_images           = False,
  #write_steps_per_second = False,
  update_freq            = "epoch",
  profile_batch          = 2,
  embeddings_freq        = 0,
  embeddings_metadata    = None
)

plt.figure(figsize = (12, 12))

for images, labels in trainDataset.take(1):
  for i in range(9):
    ax = plt.subplot(3, 3, i + 1)

    plt.imshow(images[i].numpy().astype("uint8"))
    plt.title(classNames[labels[i]])
    plt.axis("off")

# for better data performance using buffered prefetching 
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

#########################################
# Create a model from a pre trained one #
#########################################

def get_model(load_weights = True):
  if load_weights:
    net = effnetv2_model.get_model('efficientnetv2-l', include_top = False, weights = 'imagenet21k-ft1k')
  else:
    net = effnetv2_model.get_model('efficientnetv2-l', include_top = False, weights = False)
  
  net.__setattr__('build', net.call)

  return net

def create_from_trained_model(preTrainedModel):
  # Freeze the pretrained weights
  preTrainedModel.trainable = False

  print("Number_of_layers in the base model: ", len(preTrainedModel.layers))

 # We unfreeze the top 20 layers while leaving BatchNorm layers frozen
  for layer in preTrainedModel.layers[-10:]:
    if not isinstance(layer, BatchNormalization):
      layer.trainable = True

  base_layers = preTrainedModel.output

  # create the classifier branch
  
  avg                    = GlobalAveragePooling2D()(base_layers)
  mx                     = GlobalMaxPooling2D()(base_layers)
  classifier_layers      = Concatenate()([avg, mx])
  classifier_layers      = BatchNormalization()(classifier_layers)
  classifier_layers      = Dropout(0.25)(classifier_layers)
  classifier_layers      = Dense(NR_NEURONS, activation="relu")(classifier_layers)
  classifier_layers      = BatchNormalization()(classifier_layers)
  classifier_layers      = Dropout(0.25)(classifier_layers)
  classifier_predictions = Dense(NR_CLASSES, name='cl_head', activation ='softmax')(classifier_layers)

  # MobileNet
  # classifier_layers      = GlobalAveragePooling2D()(base_layers)
  # classifier_layers      = BatchNormalization()(classifier_layers)
  # classifier_layers      = Dropout(0.25)(classifier_layers)
  # classifier_predictions = Dense(NR_CLASSES, name='cl_head', activation ='softmax')(classifier_layers)

  #create the localiser branch
  locator_layers = Dense(128, activation='relu',    name='bb_1')(base_layers)
  locator_layers = Dense(64,  activation='relu',    name='bb_2')(locator_layers)
  locator_layers = Dense(32,  activation='relu',    name='bb_3')(locator_layers)
  locator_layers = Dense(4,   activation='sigmoid', name='bb_head')(locator_layers)

  model = Model(
    inputs  = preTrainedModel.input,
    outputs = [
      classifier_predictions,
      #locator_layers
    ]
  )

  return model

# mobileNetV3Model
# resNet152Model
# vgg19Model
# efficientNetB7

# efficientNetV1L2
# efficientNetV2L

# resNet152v2Model
# resNet50v2Model

# mobileNetV2Model

# inception_resnet_v2
# denseNet201
# nASNetLarge

model = create_from_trained_model(efficientNetV2L)

###########
# Compile #
###########

losses = {
  "cl_head": SparseCategoricalCrossentropy(from_logits = True),
  #"bb_head": MSE
}

model.compile(
  optimizer = ADAM_OPT,
  loss      = losses,
  metrics   = ['accuracy']
)

#############################
# Summary                   #
#############################
model.summary()

#############################
# Train                     #
#############################

# trainTargets = {
#     "cl_head": train_labels,
#     "bb_head": train_targets
# }

# validationTargets = {
#     "cl_head": valid_labels,
#     "bb_head": valid_targets
# }
# history = model.fit(
#   train_data, trainTargets,
#   validation_data  = (valid_data, validationTargets),
#   epochs           = EPOCHS,
#   callbacks        = [earlyStop, reduceLR, checkpointer, tensorboard],
# )

history = model.fit(
  augmentTrainDataset,
  validation_data  = (augmentTrainDataset),
  epochs           = EPOCHS,
  callbacks        = [earlyStop, reduceLR, checkpointer, tensorboard],
)

model.save(MODEL_NAME)

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