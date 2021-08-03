# -*- coding: utf-8 -*-
"""
Created on Sun Mar 10 19:49:33 2019

@author: SCYLLA
"""

import os
import numpy as np
import tensorflow as tf
import matplotlib.pyplot as plt

from tensorflow.keras                                   import regularizers
from tensorflow.keras.models                            import Sequential, Model
from tensorflow.keras.layers                            import Input, Flatten, Dense, Dropout, BatchNormalization
from tensorflow.keras.layers                            import Conv2D, MaxPooling2D, AveragePooling2D, ZeroPadding2D
from tensorflow.keras.layers.experimental.preprocessing import RandomFlip, RandomRotation, Rescaling
from tensorflow.keras.preprocessing                     import image_dataset_from_directory, image
from tensorflow.keras.layers                            import Concatenate
from tensorflow.keras.preprocessing.image               import ImageDataGenerator
from tensorflow.keras.callbacks                         import ModelCheckpoint, EarlyStopping, TensorBoard, ReduceLROnPlateau
from tensorflow.keras.optimizers                        import Adam, SGD
from tensorflow.keras.losses                            import SparseCategoricalCrossentropy

# define parameters
CLASS_NUM   = 23
BATCH_SIZE  = 16
EPOCH_STEPS = int(4323/BATCH_SIZE)
IMG_SIZE      = (224, 224)
IMAGE_SHAPE = (224, 224, 3)
NR_CLASSES    = 23
NR_NEURONS    = 6 * 1024

MODEL_NAME  = 'googlenet_flower.h5'
PATH          = "datasets/panamuwa"
TRAIN_DIR      = os.path.join(PATH, 'train')
VALIDATION_DIR = os.path.join(PATH, 'valid')
TEST_DIR       = os.path.join(PATH, 'test')

dataAugmentation = Sequential([
  RandomFlip('horizontal'),
  RandomRotation(0.1),
])

# prepare data
trainDataset = image_dataset_from_directory(
  TRAIN_DIR,
  validation_split = 0.2,
  subset           = "training",
  seed             = 42,
  image_size       = IMG_SIZE,
  batch_size       = BATCH_SIZE,
  shuffle          = True
)

augmentedTrainDataset = trainDataset.map(lambda x, y: (dataAugmentation(x, training = True), y))

validationDataset = image_dataset_from_directory(
  VALIDATION_DIR,
  validation_split = 0.2,
  subset           = "validation",
  seed             = 42,
  shuffle          = True,
  image_size       = IMG_SIZE,
  batch_size       = BATCH_SIZE
)

augmentedValidationDataset = validationDataset.map(lambda x, y: (dataAugmentation(x, training = True), y))

testDataset = image_dataset_from_directory(
  TEST_DIR,
  shuffle    = True, 
  batch_size = BATCH_SIZE, 
  image_size = IMG_SIZE
)

checkpointer = ModelCheckpoint(
  filepath          = 'models/model_GoogLeNet_{main_accuracy:.3f}.h5',
  save_best_only    = True,
  save_weights_only = False,
  monitor           = 'main_accuracy'
)

reduceLR = ReduceLROnPlateau( 
  monitor  = 'main_accuracy',
  factor   = 0.1,
  patience = 2,
)

tensorboard = TensorBoard(
  log_dir                = "./logs",
  write_graph            = True,
  write_images           = False,
  write_steps_per_second = False,
  update_freq            = "epoch",
  profile_batch          = 2,
  embeddings_freq        = 0,
  embeddings_metadata    = None
)

# create model
def inception(x, filters):
    # 1x1
    path1 = Conv2D(filters=filters[0], kernel_size=(1,1), strides=1, padding='same', activation='relu')(x)

    # 1x1->3x3
    path2 = Conv2D(filters=filters[1][0], kernel_size=(1,1), strides=1, padding='same', activation='relu')(x)
    path2 = Conv2D(filters=filters[1][1], kernel_size=(3,3), strides=1, padding='same', activation='relu')(path2)
    
    # 1x1->5x5
    path3 = Conv2D(filters=filters[2][0], kernel_size=(1,1), strides=1, padding='same', activation='relu')(x)
    path3 = Conv2D(filters=filters[2][1], kernel_size=(5,5), strides=1, padding='same', activation='relu')(path3)

    # 3x3->1x1
    path4 = MaxPooling2D(pool_size=(3,3), strides=1, padding='same')(x)
    path4 = Conv2D(filters=filters[3], kernel_size=(1,1), strides=1, padding='same', activation='relu')(path4)

    return Concatenate(axis=-1)([path1,path2,path3,path4])


def auxiliary(x, name=None):
    layer = AveragePooling2D(pool_size=(5,5), strides=3, padding='valid')(x)

    layer = Conv2D(filters=256, kernel_size=(1,1), strides=1, padding='same', activation='relu')(layer)
    
    layer = Flatten()(layer)
    
    layer = Dense(units = NR_NEURONS / 2, activation='relu')(layer)
    
    layer = Dropout(0.4)(layer)
    
    layer = Dense(units = NR_CLASSES, activation='softmax', name=name)(layer)
    
    return layer


def googlenet():
    layer_in = Input(shape=IMAGE_SHAPE)
    
    # stage-1
    layer = Conv2D(filters=64, kernel_size=(7,7), strides=2, padding='same', activation='relu')(layer_in)
    layer = MaxPooling2D(pool_size=(3,3), strides=2, padding='same')(layer)
    layer = BatchNormalization()(layer)

    # stage-2
    layer = Conv2D(filters=64, kernel_size=(1,1), strides=1, padding='same', activation='relu')(layer)
    layer = Conv2D(filters=192, kernel_size=(3,3), strides=1, padding='same', activation='relu')(layer)
    layer = BatchNormalization()(layer)
    layer = MaxPooling2D(pool_size=(3,3), strides=2, padding='same')(layer)

    # stage-3
    layer = inception(layer, [ 64,  (96,128), (16,32), 32]) #3a
    layer = inception(layer, [128, (128,192), (32,96), 64]) #3b
    layer = MaxPooling2D(pool_size=(3,3), strides=2, padding='same')(layer)
    
    # stage-4
    layer = inception(layer, [192,  (96,208),  (16,48),  64]) #4a
    aux1  = auxiliary(layer, name='aux1')
    layer = inception(layer, [160, (112,224),  (24,64),  64]) #4b
    layer = inception(layer, [128, (128,256),  (24,64),  64]) #4c
    layer = inception(layer, [112, (144,288),  (32,64),  64]) #4d
    aux2  = auxiliary(layer, name='aux2')
    layer = inception(layer, [256, (160,320), (32,128), 128]) #4e
    layer = MaxPooling2D(pool_size=(3,3), strides=2, padding='same')(layer)
    
    # stage-5
    layer = inception(layer, [256, (160,320), (32,128), 128]) #5a
    layer = inception(layer, [384, (192,384), (48,128), 128]) #5b
    layer = AveragePooling2D(pool_size=(7,7), strides=1, padding='valid')(layer)
    
    # stage-6
    layer = Flatten()(layer)
    layer = Dropout(0.4)(layer)
    layer = Dense(units = 512, activation='linear')(layer)

    main = Dense(units = NR_CLASSES, activation = 'softmax', name='main')(layer)
    
    model = Model(inputs=layer_in, outputs=[main, aux1, aux2])
    
    return model


# train model
model = googlenet()

model.summary()

# tf.keras.utils.plot_model(model, 'GoogLeNet.png')

#optimizer = Adam(lr=2 * 1e-3, beta_1=0.9, beta_2=0.999, epsilon=1e-08)
#optimizer = SGD(lr=1 * 1e-1, momentum=0.9, nesterov=True)
#model.compile(loss='categorical_crossentropy', optimizer=optimizer, metrics=['accuracy'])
#model.compile(loss='categorical_crossentropy', optimizer='Adam', metrics=['accuracy'])

optimizer = ['Adam', 'SGD', 'Adam', 'SGD']
epochs = [20, 30, 20, 30]
history_all = {}

for i in range(len(optimizer)):
    print('Usnig optimizer: ' + optimizer[i] + ', Epoch: ' + str(epochs[i]))
    
    model.compile(
      loss         = SparseCategoricalCrossentropy(), 
      loss_weights = { 'main': 1.0, 'aux1': 0.3, 'aux2': 0.3 },
      optimizer    = optimizer[i], 
      metrics      = ['accuracy']
    )
    
    train_history = model.fit(
      augmentedTrainDataset,
      epochs          = epochs[i],
      #steps_per_epoch = EPOCH_STEPS,
      validation_data = augmentedValidationDataset,
      callbacks       = [checkpointer, tensorboard],
      shuffle         = True
    )
    
    # save history    
    if len(history_all) == 0:
        history_all = {key: [] for key in train_history.history}
    
    for key in history_all:
        history_all[key].extend(train_history.history[key])

model.save(MODEL_NAME)

# show train history
def show_train_history(history, xlabel, ylabel, train):
    for item in train:
        plt.plot(history[item])
    plt.title('Train History')
    plt.xlabel(xlabel)
    plt.ylabel(ylabel)
    plt.legend(train, loc='upper left')
    plt.show()

show_train_history(history_all, 'Epoch', 'Accuracy', ('main_acc', 'aux1_acc', 'aux2_acc'))
show_train_history(history_all, 'Epoch', 'Loss', ('main_loss', 'aux1_loss', 'aux2_loss'))
