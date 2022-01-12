
from generateSyntheticDataSet import *
from degrade                  import degrade_img
from augment                  import augment_letter, augment_bkg


def test_background_augumentation():
    bgColors, fgColors = prepareColors(TEXTURE_LETTERS, TEXTURE_INSCRIPTIONS)

    background = getackground(BACKGROUNDS_PATH)

    show_image(background)

    aug_background = augment_bkg(background)

    show_image(aug_background)

    synthetic_background = createBackground(bgColors, IMG_WIDTH, IMG_HEIGHT)

    show_image(synthetic_background)

    aug_synthetic_background = augment_bkg(synthetic_background)

    show_image(aug_synthetic_background)

def test_foreground_augumentation():
    letterPath = LETTERS_PATH + 'Bet.png'

    foreground = getLetterForeground(letterPath)

    show_image(foreground)

    newForeground = foregroundAugmentation(foreground)

    show_image(newForeground)

    aug_foreground = augment_letter(foreground)

    show_image(aug_foreground)

### Test Pipeline ####
def testPipeline():
    bgColors, fgColors = prepareColors(TEXTURE_LETTERS, TEXTURE_INSCRIPTIONS)

    background = getRandomBackground(BACKGROUNDS_PATH)

    show_image(background)

    aug_background = augment_bkg(background)

    show_image(aug_background)

    syntheticBackground = createBackground(bgColors, IMG_WIDTH, IMG_HEIGHT)

    show_image(syntheticBackground)

    letterPath = LETTERS_PATH + 'Bet.png'

    foreground = getLetterForeground(letterPath)

    show_image(foreground)

    newForeground = foregroundAugmentation(foreground)

    show_image(newForeground)

    mask_new = getForegroundMask(newForeground)

    show_image(mask_new)

    composite, hard_mask, bbox = createLayeredImage1(newForeground, mask_new, background)

    show_image(composite)

    x = bbox[1]
    y = bbox[0]
    width = bbox[3] - bbox[1]
    height = bbox[2] - bbox[0]

    rectangle = Rectangle((x,y), width, height, linewidth = 1, edgecolor = 'r', facecolor = 'none')

    plt.imshow(composite)
    plt.gca().add_patch(rectangle)
    plt.axis('off')
    plt.show()


def testCreateNaturalImageForTraining():
    letterPath = LETTERS_PATH + 'Ayin.png'
    letterName = 'Ayin'
    i = 0
    letterTrainPath = DATASET_PATH + 'train/' + letterName

    composite, imageName, bbox = create_natural_image_for_testing(letterPath, letterName, i, letterTrainPath)

    show_image(composite)


def testCreateNaturalImageForTrainingForAll():

    lettersFileNames = [f for f in os.listdir(LETTERS_PATH) if f.endswith('.png')]

    for f in lettersFileNames:
        pathname, extension = os.path.splitext(f)
        letterName          = pathname.split('/')[-1]

        letterPath       = LETTERS_PATH + f
        letterTrainPath  = DATASET_PATH + 'train/' + letterName

        print(pathname)
        print(letterName)
        print(letterPath)
        print(letterTrainPath)

        composite, imageName, bbox = create_natural_image_for_testing(letterPath, letterName, 0, letterTrainPath)

        show_image(composite)

        x = bbox[1]
        y = bbox[0]
        width = bbox[3] - bbox[1]
        height = bbox[2] - bbox[0]

        rectangle = Rectangle((x,y), width, height, linewidth = 1, edgecolor = 'r', facecolor = 'none')

        plt.imshow(composite)
        plt.gca().add_patch(rectangle)
        plt.axis('off')
        plt.show()


def testCreateSyntheticImageForTraining():
    bgColors, fgColors = prepareColors(TEXTURE_LETTERS, TEXTURE_INSCRIPTIONS)

    letterName = 'Mem'
    letterPath = LETTERS_PATH + 'Mem.png'

    image, imageName = create_synthetic_image_for_training(
        letterPath, 
        letterName, 
        0, 
        bgColors, 
        fgColors, 
        DATASET_PATH + 'train/' + letterName)

    show_image(image)

def test_generate_training_dataset():
    generate_training_dataset(2)

def test_generate_validation_dataset():
    generate_validation_dataset(2)

def main():
    
    setup_folder_structure()

    for f in range(10):
      test_background_augumentation()

    # for f in range(10):
    #     test_foreground_augumentation()

    #testPipeline()

    #testCreateNaturalImageForTraining()

    #testCreateNaturalImageForTrainingForAll()

    #testCreateNaturalImageForTraining()

    # for f in range(10):
    #     testCreateSyntheticImageForTraining()

    #test_generate_training_dataset()

    #test_generate_validation_dataset()

if __name__ == "__main__":
  main()