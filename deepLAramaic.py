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

from tensorflow.keras.models                            import Model
from tensorflow.keras.layers                            import Dense, Dropout, Flatten, GlobalAveragePooling2D, GlobalMaxPooling2D, Concatenate, BatchNormalization
from tensorflow.keras.layers.experimental.preprocessing import RandomFlip, RandomRotation, Rescaling, Resizing, Rescaling, RandomZoom, RandomTranslation
from tensorflow.keras.preprocessing                     import image_dataset_from_directory
from tensorflow.keras.preprocessing.image               import load_img, img_to_array, ImageDataGenerator

#from tensorflow.keras.applications.efficientnet_v2     import EfficientNetV2L
from tensorflow.keras.applications.vgg19        import VGG19
from tensorflow.keras.applications.resnet       import ResNet152
from tensorflow.keras.applications.resnet_v2    import ResNet152V2, ResNet50V2
from tensorflow.keras.applications.efficientnet import EfficientNetB0

from tensorflow.keras.optimizers import Adam, SGD
from tensorflow.keras.callbacks  import ModelCheckpoint, EarlyStopping, TensorBoard, ReduceLROnPlateau, LearningRateScheduler
from tensorflow.keras.losses     import SparseCategoricalCrossentropy, CategoricalCrossentropy, MSE
from tensorflow.keras.utils      import plot_model

print("TF version:  ", tf.__version__)
print("Hub version: ", hub.__version__)
print("GPU:         ", "available" if tf.config.list_physical_devices('GPU') else "NOT AVAILABLE")

MODEL_NAME    = "Model"
PATH          = "datasets/synthetic_data"
BATCH_SIZE    = 32
IMG_SIZE      = (224, 224)
WIDTH         = 224
HEIGHT        = 224
IMG_SHAPE     = IMG_SIZE + (3,)
EPOCHS        = 35
LEARNING_RATE = 0.003
BETA_1        = 0.9
BETA_2        = 0.999
NR_CLASSES    = 22
NR_NEURONS    = 3 * 1024
WEIGHTS       = 'imagenet'
POOLING       = 'avg'
AUTOTUNE      = tf.data.AUTOTUNE

TRAIN_DIR      = os.path.join(PATH, 'train')
VALIDATION_DIR = os.path.join(PATH, 'valid')
TEST_DIR       = os.path.join(PATH, 'test')

ANNOTATION_PATH = "datasets/annotation_data"

train_annotations_path = os.path.join(ANNOTATION_PATH, 'train_annotations.csv')
valid_annotations_path = os.path.join(ANNOTATION_PATH, 'valid_annotations.csv')

############
# Datasets #
############

train_datagen = ImageDataGenerator(
    featurewise_center            = True,
    featurewise_std_normalization = True,
    rescale                       = 1/255.0,
    shear_range                   = 0.2,
    zoom_range                    = 0.3,
    #rotation_range     = 20,
    # width_shift_range  = 0.2,
    # height_shift_range = 0.2,
    #horizontal_flip    = True,
    #fill_mode          = 'nearest'
)

valid_datagen = ImageDataGenerator(
    rescale = 1/255.0
)

trainDataset = train_datagen.flow_from_directory(
  directory   = TRAIN_DIR,
  target_size = IMG_SIZE,
  batch_size  = BATCH_SIZE,
  color_mode  = "rgb",
  class_mode  ='categorical',
  shuffle     = True,
  seed        = 42
)

validDataset = valid_datagen.flow_from_directory(
  directory   = VALIDATION_DIR,
  target_size = IMG_SIZE,
  batch_size  = BATCH_SIZE,
  color_mode  = "rgb",
  class_mode  ='categorical',
  shuffle     = True,
  seed        = 42,
)

testDataset = valid_datagen.flow_from_directory(
  directory   = TEST_DIR,
  target_size = IMG_SIZE,
  batch_size  = BATCH_SIZE,
  color_mode  = "rgb",
  class_mode  = None,
  shuffle     = False,
  seed        = 42,
)

labels = trainDataset.class_indices
classNames   = []
classIndices = []

for k, v in labels.items():
  classNames.append(k)
  classIndices.append(v)
  print(k,v)

print('Number of classes: ', len(labels))
print('Indices:           ', labels)

###############
# Annotations #
###############

def open_annotaions(annotations_path):
  data    = []
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


############################
# Optimisers
############################

ADAM_OPT = Adam(
  learning_rate = LEARNING_RATE, 
  beta_1        = BETA_1, 
  beta_2        = BETA_2, 
  epsilon       = 1e-08
)

SGD_OPT = SGD(
  learning_rate = LEARNING_RATE, 
  momentum      = 0.9
)

############################
# Pre-trained Models
############################

resNet152v2Model = ResNet152V2(
  input_shape = IMG_SHAPE,
  include_top = False,
  weights     = "imagenet",
)

efficientNetB0 = EfficientNetB0(
  input_shape = IMG_SHAPE,
  include_top = False,
  weights     = "imagenet",
)


############################
# EarlyStopping Callback
############################

earlyStop = EarlyStopping(
  monitor   = 'val_accuracy',
  mode      = 'max',
  min_delta = 0.001,
  patience  = 10
)

############################
# ModelCheckpoint Callbacks
############################

checkpoint_filepath = 'models/model-' + MODEL_NAME + '-{val_accuracy:.3f}.h5'

checkpointer = ModelCheckpoint(
  filepath          = checkpoint_filepath,
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

callbacks_list = [earlyStop, reduceLR, checkpointer, tensorboard]

# for better data performance using buffered prefetching 
# trainDataset = trainDataset.prefetch(buffer_size = AUTOTUNE)
# validDataset = validDataset.prefetch(buffer_size = AUTOTUNE)
# testDataset  = testDataset.prefetch(buffer_size  = AUTOTUNE)

#########################################
# Create a model from a pre trained one #
#########################################

def create_from_trained_model(preTrainedModel):
  # Freeze the pretrained weights
  preTrainedModel.trainable = False

  #print("Number_of_layers in the base model: ", len(preTrainedModel.layers))

 # We unfreeze the top 10 layers while leaving BatchNorm layers frozen
  # for layer in preTrainedModel.layers[-10:]:
  #   if not isinstance(layer, BatchNormalization):
  #     layer.trainable = True

  base_layers = preTrainedModel.output

  # create the classifier branch
  avg                    = GlobalAveragePooling2D()(base_layers)
  mx                     = GlobalMaxPooling2D()(base_layers)
  classifier_layers      = Concatenate()([avg, mx])
  classifier_layers      = BatchNormalization()(classifier_layers)
  classifier_layers      = Dropout(0.5)(classifier_layers)
  classifier_layers      = Dense(NR_NEURONS, activation="relu")(classifier_layers)
  classifier_layers      = BatchNormalization()(classifier_layers)
  classifier_layers      = Dropout(0.5)(classifier_layers)
  classifier_predictions = Dense(NR_CLASSES, name='cl_head', activation ='softmax')(classifier_layers)

  #efficientnetv2_l
  # avg                    = GlobalAveragePooling2D()(base_layers)
  # classifier_layers      = BatchNormalization()(avg)
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

model_name = 'efficientnetv2-b2'
ckpt_type  = '21k-ft1k' # 21k, 1k
hub_type   = 'classification' # feature-vector
hub_url    = 'gs://cloud-tpu-checkpoints/efficientnet/v2/hub/' + model_name + '-' + ckpt_type +'/' + hub_type

# tf.keras.backend.clear_session()

efficientnet_v2 = hub.KerasLayer(hub_url, trainable = True)
efficientnet_v2 = hub.KerasLayer("https://tfhub.dev/google/imagenet/efficientnet_v2_imagenet21k_ft1k_b0/classification/2", trainable = True)
resnet_v2       = hub.KerasLayer("https://tfhub.dev/google/bit/m-r152x4/imagenet21k_classification/1", trainable = True)

# #transformer = hub.KerasLayer("https://tfhub.dev/sayakpaul/vit_b32_classification/1", trainable = True)

model = tf.keras.Sequential([
    tf.keras.layers.InputLayer(input_shape = [224, 224, 3]),
    efficientnet_v2,
    tf.keras.layers.Dropout(rate = 0.3),
    tf.keras.layers.Dense(22, activation='softmax'),
])

model.build((None,) + IMG_SIZE + (3,))

#############################
# Summary                   #
#############################

print(model.summary())

#############################
# Compile                   #
#############################

model.compile(
  optimizer = ADAM_OPT,
  loss      = CategoricalCrossentropy(from_logits = True),
  metrics   = ['accuracy']
)

class_weight = {
    0: 1.0,
    1: 1.0,
    2: 2.0,
    3: 1.0,
    4: 1.0,
    5: 2.0,
    6: 1.0
}

history = model.fit(
  trainDataset,
  validation_data  = (validDataset),
  epochs           = EPOCHS,
  callbacks        = [earlyStop, reduceLR, checkpointer, tensorboard],
)

saved_model_path = f"models/model_{MODEL_NAME}"

model.save(saved_model_path)

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
# imageBatch, labelBatch = testDataset.as_numpy_iterator().next()
# predictedBatch         = model.predict(imageBatch)
# predictedId            = np.argmax(predictedBatch, axis = -1)

# plt.figure(figsize = (10, 10))

# for i in range(9):
#   ax = plt.subplot(3, 3, i + 1)

#   plt.imshow(imageBatch[i].astype("uint8"))
#   plt.title(classindices[predictedId[i]])
#   plt.axis("off")

# plt.tight_layout()
# plt.show()
