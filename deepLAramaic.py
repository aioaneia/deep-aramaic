# -*- coding: utf-8 -*-
"""
Created on June 10 2021

@author: Andrei Aioanei
"""

import numpy             as np
import pandas            as pd
import matplotlib.pyplot as plt
import tensorflow        as tf
import os

from hyperas.distributions import uniform

# from keras.utils import custom_object_scope
# from tensorflow.keras_resnet.layers import BatchNormalization
# from keras_retinanet.layers import UpsampleLike, Anchors, RegressBoxes, ClipBoxes, FilterDetections
# from keras_retinanet.initializers import PriorProbability
# from keras_retinanet import models
# from keras_retinanet.models.retinanet import retinanet_bbox

from tensorflow.keras.models                            import Model, Sequential
from tensorflow.keras.layers                            import Dense, Dropout, Flatten, Conv2D, MaxPool2D
from tensorflow.keras.preprocessing                     import image_dataset_from_directory
from tensorflow.keras.preprocessing.image               import load_img, img_to_array
from tensorflow.keras.applications                      import VGG19, ResNet152, EfficientNetB7
from tensorflow.keras.applications.inception_resnet_v2  import InceptionResNetV2
from tensorflow.keras.layers.experimental.preprocessing import RandomFlip, RandomRotation, Rescaling, Resizing, Rescaling, RandomZoom, RandomTranslation
from tensorflow.keras.optimizers                        import Adam
from tensorflow.keras.callbacks                         import ModelCheckpoint, EarlyStopping, TensorBoard, ReduceLROnPlateau, LearningRateScheduler
from tensorflow.keras.losses                            import SparseCategoricalCrossentropy, MSE
from tensorflow.keras.utils                             import plot_model

from efficientnet.keras                                 import EfficientNetL2

#PATH          = "datasets/panamuwa"
PATH          = "datasets/synthetic_data"
BATCH_SIZE    = 32
IMG_SIZE      = (256, 256)
WIDTH         = 256
HEIGHT        = 256
IMG_SHAPE     = IMG_SIZE + (3,)
EPOCHS        = 30
LEARNING_RATE = 0.007
BETA_1        = 0.9
BETA_2        = 0.999
NR_CLASSES    = 22
NR_NEURONS    = 2 * 1024
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

with tf.device('/cpu:0'):
  dataAugmentation = Sequential([
    Resizing(256, 256),
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

augmentTrainDataset        = trainDataset.map(lambda x, y: (dataAugmentation(x, training = True), y))
augmentValidationDataset   = validationDataset.map(lambda x, y: (dataAugmentation(x, training = True), y))

classNames = trainDataset.class_names
train_num  = tf.data.experimental.cardinality(trainDataset)
test_num   = tf.data.experimental.cardinality(validationDataset)
valid_num  = tf.data.experimental.cardinality(testDataset)

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

resNet50Model = ResNet152(
  input_shape = IMG_SHAPE,
  include_top = False,
  weights     = "imagenet",
)

efficientNetB7 = EfficientNetB7(
  input_shape = IMG_SHAPE,
  include_top = False,
  weights     = "imagenet",
)

efficientNetL2 = EfficientNetL2(
  input_shape = IMG_SHAPE,
  weights     = "./models/model_EfficientNetL2_notop.h5", 
  include_top = False,
  drop_connect_rate = 0
)

inception_resnet_v2 = InceptionResNetV2(
    input_shape  = IMG_SHAPE,
    include_top  = False,
    weights      ='imagenet',
    input_tensor = None,
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
# Create an architecture model #
#########################################

# def get_RetinaNet_model():
#     custom_objects = {
#         'BatchNormalization': BatchNormalization,
#         'UpsampleLike': UpsampleLike,
#         'Anchors': Anchors,
#         'RegressBoxes': RegressBoxes,
#         'PriorProbability': PriorProbability,
#         'ClipBoxes': ClipBoxes,
#         'FilterDetections': FilterDetections,
#     }

#     with custom_object_scope(custom_objects):
#         backbone = models.backbone('resnet50')
#         model = backbone.retinanet(500)
#         prediction_model = retinanet_bbox(model=model)
#         # prediction_model.load_weights("...your weights here...")

#     return prediction_model, custom_objects

#########################################
# Create a model from a pre trained one #
#########################################

def create_from_trained_model(preTrainedModel):
  for layer in preTrainedModel.layers:
    layer.trainable = False

  base_layers = Flatten()(preTrainedModel.layers[-1].output)

  #create the classifier branch
  classifier_layers      = Dropout(0.30)(base_layers)
  classifier_layers      = Rescaling(1.0 / 255)(classifier_layers)
  classifier_layers      = Dense(NR_NEURONS, activation = 'relu', kernel_initializer = 'he_normal')(classifier_layers)
  classifier_layers      = Dropout(0.40)(classifier_layers)
  classifier_layers      = Dense(NR_NEURONS / 2, activation = 'relu', kernel_initializer = 'he_normal')(classifier_layers)
  classifier_layers      = Dropout(0.40)(classifier_layers)
  classifier_predictions = Dense(NR_CLASSES, name='cl_head', activation ='softmax', kernel_initializer = 'glorot_normal')(classifier_layers)

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

# efficientNetL2, efficientNetB7, resNet50Model, vgg19Model
model = create_from_trained_model(efficientNetB7)

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