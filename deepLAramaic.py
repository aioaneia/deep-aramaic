import numpy             as np
import pandas            as pd
import matplotlib.pyplot as plt
import tensorflow        as tf
import os

from tensorflow.keras                                   import Input
from tensorflow.keras.models                            import Model, Sequential
from tensorflow.keras.layers                            import MaxPooling2D, Dense, Dropout, Flatten, GlobalAveragePooling2D, Reshape
from tensorflow.keras.preprocessing                     import image_dataset_from_directory, image
from tensorflow.keras.preprocessing.image               import load_img, img_to_array
from tensorflow.keras.applications                      import VGG19, ResNet50
from tensorflow.keras.models                            import load_model
from tensorflow.keras.layers.experimental.preprocessing import RandomFlip, RandomRotation, Rescaling
from tensorflow.keras.optimizers                        import Adam, SGD
from tensorflow.keras.callbacks                         import ModelCheckpoint, EarlyStopping, TensorBoard
from tensorflow.keras.losses                            import SparseCategoricalCrossentropy, CategoricalCrossentropy
from tensorflow.data.experimental                       import cardinality

from keras_adabound import AdaBound

PATH          = "datasets/panamuwa"
BATCH_SIZE    = 32
IMG_SIZE      = (224, 224)
IMG_SHAPE     = IMG_SIZE + (3,)
EPOCHS        = 35
LEARNING_RATE = 0.001
BETA_1        = 0.9
BETA_2        = 0.999
NR_CLASSES    = 23
NR_NEURONS    = 6 * 1024
WEIGHTS       = 'imagenet'
POOLING       = 'avg'
AUTOTUNE      = tf.data.AUTOTUNE

TRAIN_DIR      = os.path.join(PATH, 'train')
VALIDATION_DIR = os.path.join(PATH, 'valid')
TEST_DIR       = os.path.join(PATH, 'test')

dataAugmentation = Sequential([
  RandomFlip('horizontal'),
  RandomRotation(0.1),
])

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

classNames = trainDataset.class_names
train_num  = cardinality(trainDataset)
test_num   = cardinality(validationDataset)
valid_num  = cardinality(testDataset)


print('Number of train batches:      %d' % train_num)
print('Number of validation batches: %d' % test_num)
print('Number of test batches:       %d' % valid_num)


AdamOpt = Adam(
  learning_rate = LEARNING_RATE, 
  beta_1        = BETA_1, 
  beta_2        = BETA_2, 
  epsilon       = 1e-08
)

AdaOpt = AdaBound(
  learning_rate = 0.001, 
  final_lr      = 0.1
)

vgg19Model = VGG19(
  input_shape = IMG_SHAPE,
  include_top = False,
  weights     = "imagenet",
)

resNet50Model = ResNet50(
  input_shape = IMG_SHAPE,
  include_top = False,
  weights     = "imagenet",
)

# efficientNetB7Model = efn.EfficientNetB7(
#   input_shape = IMG_SHAPE,
#   include_top = False,
#   weights     = "imagenet",
# )

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

#############################
# Create a VGG model        #
#############################
def create_Sequential_VGG19_model():
  model = Sequential()

  # for layer in vgg19Model.layers[:-4]:
  #   layer.trainable = False

  for layer in vgg19Model.layers:
    layer.trainable = False

  model.add(vgg19Model)

  model.add(Flatten())

  model.add(Dense(NR_NEURONS,       activation = 'relu',  kernel_initializer = 'he_normal'))
  model.add(Dropout(0.30))

  model.add(Dense(NR_NEURONS,       activation = 'relu',  kernel_initializer = 'he_normal'))
  model.add(Dropout(0.30))

  model.add(Dense(NR_CLASSES, activation='softmax', kernel_initializer = 'glorot_normal'))

  return model

#############################
# Create a VGG model        #
#############################
def create_VGG19_model():
  for layer in vgg19Model.layers:
    layer.trainable = False

  x = Flatten()(vgg19Model.layers[-1].output)
  
  x = Rescaling(1.0 / 255)(x)

  x = Dense(NR_NEURONS, activation = 'relu', kernel_initializer = 'he_normal')(x)
  x = Dropout(0.30)(x)

  x = Dense(NR_NEURONS, activation = 'relu', kernel_initializer = 'he_normal')(x)
  x = Dropout(0.30)(x)

  predictions = Dense(NR_CLASSES, activation='softmax', kernel_initializer = 'glorot_normal')(x)

  model = Model(inputs = vgg19Model.input, outputs = predictions)

  return model

#############################
# Create a ResNet model     #
#############################
def create_ResNet50_model():
  for layer in resNet50Model.layers:
    layer.trainable = False

  x = Flatten()(resNet50Model.layers[-1].output)
  
  x = Rescaling(1.0 / 255)(x)

  x = Dense(NR_NEURONS, activation = 'relu', kernel_initializer = 'he_normal')(x)
  x = Dropout(0.30)(x)

  x = Dense(NR_NEURONS, activation = 'relu', kernel_initializer = 'he_normal')(x)
  x = Dropout(0.30)(x)

  predictions = Dense(NR_CLASSES, activation='softmax', kernel_initializer = 'glorot_normal')(x)

  model = Model(inputs = resNet50Model.input, outputs = predictions)

  return model

model = create_ResNet50_model()

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

earlyStop = EarlyStopping(
  monitor  = 'val_accuracy', 
  patience = 10
)

checkpointer = ModelCheckpoint(
  filepath          = 'models/model_{val_accuracy:.3f}.h5',
  save_best_only    = True,
  save_weights_only = False,
  monitor           = 'val_accuracy'
)

tensorboard = TensorBoard(
  log_dir                = "./logs",
  histogram_freq         = 0,
  write_graph            = True,
  write_images           = False,
  write_steps_per_second = False,
  update_freq            = "epoch",
  profile_batch          = 2,
  embeddings_freq        = 0,
  embeddings_metadata    = None
)

history = model.fit(
  augmentedTrainDataset,
  epochs           = EPOCHS,
  validation_data  = augmentedValidationDataset,
  callbacks        = [earlyStop, checkpointer, tensorboard]
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