
from generateSyntheticDataSet import *

### Test Pipeline ####
def testPipeline():

    # 1. Prepare Colors #
    bgColors, fgColors = prepareColors(TEXTURE_LETTERS, TEXTURE_INSCRIPTIONS)

    
    # 2. Test Texture Backgrounds
    background = getRandomBackground(BACKGROUNDS_PATH)

    showImage(background)

    # 2. Test Synthetic Backgrounds
    syntheticBackground = createBackground(bgColors, IMG_WIDTH, IMG_HEIGHT)

    showImage(syntheticBackground)


    # 3. Test Foregrounds

    letterPath = LETTERS_PATH + 'Ayin.png'

    foreground = getLetterForeground(letterPath)

    showImage(foreground)

    # 3. Test Synthetic Foreground
    newForeground = foregroundAugmentation(foreground)

    showImage(newForeground)


    mask_new = getForegroundMask(newForeground)

    showImage(mask_new)


    # 4. Compose image
    composed_image = createLayeredImage1(newForeground, mask_new, background)

    showImage(composed_image)

    nz = np.nonzero(mask_new)
    bbox = [np.min(nz[0]), np.min(nz[1]), np.max(nz[0]), np.max(nz[1])]

    x = bbox[1]
    y = bbox[0]
    width = bbox[3] - bbox[1]
    height = bbox[2] - bbox[0]

    plt.imshow(composed_image)
    plt.gca().add_patch(Rectangle(
        (x,y), width, height, linewidth = 1, edgecolor = 'r', facecolor = 'none'))
    plt.axis('off')
    plt.show()

    # For visualization
    # fig, axes = plt.subplots(nrows = 1, ncols = 4, figsize = (50, 30))

    # for i in range(4):
    #     foreground_new = foregroundAugmentation(foreground)
    #     mask_new       = getForegroundMask(foreground_new)
    #     background     = io.imread(BACKGROUNDS_PATH + os.listdir(BACKGROUNDS_PATH)[i]) / 255.0
    #     composed_image = compose(foreground_new, mask_new, background)

    #     axes[i].imshow(composed_image)
    #     axes[i].set_axis_off()

    # plt.show()

def testCreateNaturalImageForTraining():

    lettersFileNames = [f for f in os.listdir(LETTERS_PATH) if f.endswith('.png')]

    for f in lettersFileNames:
        
        print(f)

        pathname, extension = os.path.splitext(f)
        letterName          = pathname.split('/')[-1]

        letterPath       = LETTERS_PATH + f
        letterTrainPath  = DATASET_PATH + 'train/' + letterName

        print(pathname)
        print(letterName)
        print(letterPath)
        print(letterTrainPath)

        image, imageName, rectangle = createNaturalImageForTraining(letterPath, letterName, 0, letterTrainPath)

        print(imageName)

        showImage(image)

        plt.imshow(image)
        plt.gca().add_patch(rectangle)
        plt.axis('off')
        plt.show()

        io.imsave(imageName, image)


def testCreateSyntheticImageForTraining():

    bgColors, fgColors = prepareColors(TEXTURE_LETTERS, TEXTURE_INSCRIPTIONS)

    letterColorRange = [[180,230],[50,130],[0,5]]

    letterName = 'Ayin'

    image, imageName = createSyntheticImageForTraining(letterName, 0, bgColors, fgColors, letterColorRange, DATASET_PATH)

    showImage(image)

def testCreateTrainingDataset():
    createTrainingDataset(30)

#testPipeline()

testCreateNaturalImageForTraining()

#testCreateSyntheticImageForTraining()

# testCreateTrainingDataset()