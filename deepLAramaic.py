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

from tensorflow.keras.models                            import Model, Sequential
from tensorflow.keras.layers                            import Dense, Dropout, Flatten, Conv2D, MaxPool2D
from tensorflow.keras.preprocessing                     import image_dataset_from_directory
from tensorflow.keras.applications                      import VGG19, ResNet152, EfficientNetB7
from tensorflow.keras.layers.experimental.preprocessing import RandomFlip, RandomRotation, Rescaling, Resizing, Rescaling, RandomZoom, RandomTranslation
from tensorflow.keras.optimizers                        import Adam
from tensorflow.keras.callbacks                         import ModelCheckpoint, EarlyStopping, TensorBoard, ReduceLROnPlateau, LearningRateScheduler
from tensorflow.keras.losses                            import SparseCategoricalCrossentropy
from tensorflow.keras.utils                             import plot_model

from efficientnet.keras                                 import EfficientNetL2


#PATH          = "datasets/panamuwa"
PATH          = "datasets/synthetic"
BATCH_SIZE    = 32
IMG_SIZE      = (224, 224)
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


with tf.device('/cpu:0'):
  dataAugmentation = Sequential([
    Resizing(224, 224),
    RandomFlip('horizontal_and_vertical'),
    RandomRotation(0.2),
    RandomZoom(height_factor=  0.2, width_factor = 0.2),
    RandomTranslation(height_factor = 0.2, width_factor = 0.2)
  ])

# convert the image matrices to a 0–1 range,  
# resize all images to 224x224 with three color channels
# lower the batch size to 32 for memory concerns
trainDataset = image_dataset_from_directory(
  TRAIN_DIR,
  validation_split = 0.2,
  subset           = "training",
  seed             = 42,
  image_size       = IMG_SIZE,
  batch_size       = BATCH_SIZE,
  shuffle          = True
)

validationDataset = image_dataset_from_directory(
  VALIDATION_DIR,
  validation_split = 0.2,
  subset           = "validation",
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

# trainDataset               = trainDataset.prefetch(buffer_size = tf.data.experimental.AUTOTUNE)
# validationDataset          = validationDataset.prefetch(buffer_size = tf.data.experimental.AUTOTUNE)

augmentTrainDataset        = trainDataset.map(lambda x, y: (dataAugmentation(x, training = True), y))
augmentValidationDataset   = validationDataset.map(lambda x, y: (dataAugmentation(x, training = True), y))

classNames = trainDataset.class_names
train_num  = tf.data.experimental.cardinality(trainDataset)
test_num   = tf.data.experimental.cardinality(validationDataset)
valid_num  = tf.data.experimental.cardinality(testDataset)

print('Number of train batches:      %d' % train_num)
print('Number of validation batches: %d' % test_num)
print('Number of test batches:       %d' % valid_num)

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

def create_sequential_model():
  model_1 = tf.keras.Sequential([
    Conv2D(filters=32, kernel_size=(3, 3), input_shape=(224, 224, 3), activation='relu'),
    
    Conv2D(filters=32, kernel_size=(3, 3), activation='relu'),
    
    MaxPool2D(pool_size=(2, 2), padding='same'),
    
    Conv2D(filters=64, kernel_size=(3, 3), activation='relu'),
    
    Conv2D(filters=64, kernel_size=(3, 3), activation='relu'),
    
    MaxPool2D(pool_size=(2, 2), padding='same'),
    
    
    Flatten(),
    
    Dense(units=512, activation='relu'),
    Dropout(rate=0.3),
    Dense(units=128),
    Dense(NR_CLASSES=2, activation='softmax')
  ])

  return model

#########################################
# Create a model from a pre trained one #
#########################################

def create_from_trained_model(preTrainedModel):
  for layer in preTrainedModel.layers:
    layer.trainable = False

  layer = Flatten()(preTrainedModel.layers[-1].output)
  
  layer = Dropout(0.30)(layer)

  layer = Rescaling(1.0 / 255)(layer)

  layer = Dense(NR_NEURONS, activation = 'relu', kernel_initializer = 'he_normal')(layer)
  layer = Dropout(0.40)(layer)

  layer = Dense(NR_NEURONS, activation = 'relu', kernel_initializer = 'he_normal')(layer)
  layer = Dropout(0.40)(layer)

  predictions = Dense(NR_CLASSES, activation='softmax', kernel_initializer = 'glorot_normal')(layer)

  model = Model(inputs = preTrainedModel.input, outputs = predictions)

  return model

model = create_from_trained_model(efficientNetB7) # efficientNetL2, efficientNetB7

# plot_model(model, 'models/Figurine21.png')

#############################
# Compile                   #
#############################

model.compile(
  optimizer = ADAM_OPT,
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
  augmentTrainDataset,
  validation_data  = augmentValidationDataset,
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