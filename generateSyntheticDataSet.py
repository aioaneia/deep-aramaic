
import os
import random
import numpy             as np
import skimage.io        as io
import skimage.transform as transform
import matplotlib.pyplot as plt

from pascal              import PascalVOC, PascalObject, BndBox, size_block
from PIL                 import Image, ImageColor, ImageFilter, ImageDraw
from matplotlib.patches  import Rectangle

LETTERS_PATH     = "./images/letters/"
BACKGROUNDS_PATH = "./textures/basalt/"
DATASET_PATH     = './datasets/synthetic/'

TEXTURE_LETTERS      = ['#3d3d3d', '#474545', '#464645', '#5f5d5c', '#535250']
TEXTURE_INSCRIPTIONS = ['#a09993', '#b2aca9', '#525151', '#544e47', '#504842', '#5e5551', '#6e6e69', '#6e6c68', '#726d6b', '#7f766f',  '#73716d', '#8a8881', '#998e84']

IMG_SIZE   = (224, 224)
IMG_WIDTH  = 250
IMG_HEIGHT = 250

def showImage(img):
    plt.axis('off')
    plt.imshow(img)
    plt.show()

###################
# Color functions #
###################

def prepareColors(lettersTexture, inscriptionsTexture):
    bgColors = []
    fgColors = []

    for t in lettersTexture:
        bgColors.append(ImageColor.getrgb(t))
        fgColors.append(ImageColor.getrgb(t))
 
    for t in inscriptionsTexture:
        bgColors.append(ImageColor.getrgb(t))
    
    return bgColors, fgColors

def plotRandomColorBlobs(draw, colors, count, mins, maxs):
    for i in range(count):
        x = random.randint(0, IMG_WIDTH)
        
        y = random.randint(0, IMG_HEIGHT)
        
        w = random.randint(mins, maxs)
        
        l = random.randint(mins, maxs)
        
        c = colors[random.randint(0, len(colors) - 1)]

        draw.ellipse((x, y, x + w, y + l), fill = c, outline = None)


########################
# Background functions #
########################

# Random select of an inscription texture for background texture
def getRandomBackground(path):
    background = io.imread(path + np.random.choice(os.listdir(path))) / 255.0
    
    return background

# Random selection of a background texture
def createBackground(colors, width, height):
    image = Image.new(
        'RGBA', 
        (width, height), 
        ImageColor.getrgb('#93948b')
    )

    drawBackground = ImageDraw.Draw(image)
    
    plotRandomColorBlobs(drawBackground, colors, 2700, 2, 7)
    
    image = image.filter(ImageFilter.MedianFilter(size = 3))
    
    return image


########################
# Foreground functions #
########################

def getLetterForeground(letterPath):
    I = io.imread(letterPath) / 255.0

    foreground = I.copy()
    #foreground[foreground >= 0.9] = 0

    return foreground

def createForeground(colors, width, height):
    image   = Image.new(
        'RGBA', 
        (width, height), 
        (0, 0, 0, 0)
    )
    
    drawForeground = ImageDraw.Draw(image)
    
    plotRandomColorBlobs(drawForeground, colors, 40, 10, 25)
    
    image = image.filter(ImageFilter.MedianFilter(size = 9))
    
    return image

def plotRandomLetters(color_range, count, width, height, mins, maxs):
    image = Image.new(
        'RGBA', 
        (width, height), 
        (0, 0, 0, 0)
    )

    drawLetter = ImageDraw.Draw(image)

    letterInfo = []
    
    for i in range(count):
        x = random.randint(0, width - 10)
        y = random.randint(0, height - 10)
        w = random.randint(mins, maxs)
        c = (random.randint(color_range[0][0], color_range[0][1]),
             random.randint(color_range[1][0], color_range[1][1]),
             random.randint(color_range[2][0], color_range[2][1]))
        
        letterInfo.append([x, y, w, w, c])

        drawLetter.ellipse((x, y, x + w, y + w), fill = c, outline = None)
    
    return image, letterInfo

# Apply augmentations on the foreground
def foregroundAugmentation(foreground):
    # Random rotation, zoom, translation
    angle = np.random.randint(-10, 10) * (np.pi / 180.0) # Convert to radians
    
    zoom  = np.random.random() * 0.4 + 0.8 # Zoom in range [0.8,1.2)
    
    t_x   = np.random.randint(0, int(foreground.shape[1] / 3))
    t_y   = np.random.randint(0, int(foreground.shape[0] / 3))

    tform = transform.AffineTransform(
        scale       = (zoom, zoom),
        rotation    = angle,
        translation = (t_x, t_y)
    )

    foreground = transform.warp(foreground, tform.inverse)

    # Random horizontal flip with 0.5 probability
    if(np.random.randint(0, 100) >= 50):
        foreground = foreground[:, ::-1]
        
    return foreground


# Create a mask for this new foreground object
def getForegroundMask(foreground):
    mask_new             = foreground.copy()[:,:,0]
    mask_new[mask_new>0] = 1
    
    return mask_new

##########################
# Create layered image   #
##########################

def create_annotation(img, fruit_info, obj_name, img_name ,ann_name):
    pobjs = []

    for i in range(len(fruit_info)):
        pct    = 0
        circle = fruit_info[i]
        color  = circle[4]
        
        for i in range(circle[2]):
            if (circle[0] + i >= IMG_WIDTH):
                continue

            for j in range(circle[3]):
                if (circle[1] + j >= IMG_HEIGHT):
                    continue
                
                r = img.getpixel((circle[0] + i, circle[1] + j))
                
                if (r[0] == color[0]):
                    pct = pct + 1
        
        diffculty = pct / (circle[2] * circle[3])
        
        if (diffculty > 0.1):
            dif = True
            
            if (diffculty > 0.4):
                dif = False
            
            pobjs.append(PascalObject(
                obj_name, 
                "", 
                truncated = False, 
                difficult = dif, 
                bndbox = BndBox(
                    circle[0], 
                    circle[1],
                    circle[0] + circle[2],
                    circle[1] + circle[3]
                )
            ))

    pascal_ann = PascalVOC(
        img_name,
        size    = size_block(IMG_WIDTH, IMG_HEIGHT, 3),
        objects = pobjs
    )

    pascal_ann.save(ann_name)

##########################
# Create layered image   #
##########################

def createLayeredImage1(foreground, mask, background):
    background = transform.resize(background, foreground.shape[:2])

    background = background * (1 - mask.reshape(foreground.shape[0], foreground.shape[1], 1))

    image = background + foreground

    return image


def createNaturalImageForTraining(letterPath, letterName, i, letterTrainPath):
    ext       = '{}_{}'.format(letterName, i)
    imageName = '{}/texture_letter_{}.png'.format(letterTrainPath, ext)

    background = getRandomBackground(BACKGROUNDS_PATH)

    foreground = getLetterForeground(letterPath)

    newForeground = foregroundAugmentation(foreground)

    mask_new = getForegroundMask(newForeground)

    composed_image = createLayeredImage1(newForeground, mask_new, background)


    nz   = np.nonzero(mask_new)
    bbox = [np.min(nz[0]), np.min(nz[1]), np.max(nz[0]), np.max(nz[1])]

    x      = bbox[1]
    y      = bbox[0]
    width  = bbox[3] - bbox[1]
    height = bbox[2] - bbox[0]

    rectangle = Rectangle((x, y), width, height, linewidth = 1, edgecolor = 'r', facecolor = 'none')

    return composed_image, imageName, rectangle


def createSyntheticImageForTraining(letterName, i, bgColors, fgColors, letterColorRange, imagePath):
    
    ext       = '{}_{}'.format(letterName, i)
    imageName = '{}/synthetic_letter_{}.png'.format(imagePath, ext)
    #annName   = '{}/ann_{}.xml'.format(ann_path, ext)

    imageBackground = createBackground(bgColors, IMG_WIDTH, IMG_HEIGHT)

    imageForeground = createForeground(fgColors, IMG_WIDTH, IMG_HEIGHT)

    #lettersNr = random.randint(0, 20)
    
    #imageLetters, lettersInfo = plotRandomLetters(letterColorRange, lettersNr, IMG_WIDTH, IMG_HEIGHT, 10, 25)

    image = imageBackground.copy()
    
    #img.paste(imageLetters, (0, 0), imageLetters)
    
    image.paste(imageForeground, (0, 0), imageForeground)

    #create the anootation File
    #create_annotation(image, lettersInfo, 'oranges', imageName, ann_name)

    return image, imageName


###########################
# Create Training Dataset #
###########################

def createTrainingDataset(nrOfImages):
    
    bgColors, fgColors = prepareColors(TEXTURE_LETTERS, TEXTURE_INSCRIPTIONS)

    letterColorRange = [[180,230],[50,130],[0,5]]

    lettersFileNames = [f for f in os.listdir(LETTERS_PATH) if f.endswith('.png')]

    os.mkdir(DATASET_PATH + 'train')

    for f in lettersFileNames:

        pathname, extension = os.path.splitext(f)


        letterName = pathname.split('/')[-1]

        os.mkdir(DATASET_PATH + 'train/' + letterName)
        
        print(letterName)

        print('Generate images for letter: ' + letterName)

        for i in range(nrOfImages):
            syImage, syImageName = createSyntheticImageForTraining(
                letterName,
                i, 
                bgColors,
                fgColors,
                letterColorRange,
                DATASET_PATH + 'train/' + letterName
            )

            syImage.save(syImageName)

            txImage, txImageName, rectangle = createNaturalImageForTraining(
                LETTERS_PATH + f,
                letterName,
                i,
                DATASET_PATH + 'train/' + letterName
            )

            txImage.save(txImageName)
