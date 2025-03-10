import cv2
import numpy as np
from google.cloud import vision
from django.core.files.base import ContentFile
from io import BytesIO

def combine_images(front_image_path, back_image_path):
    front_image = cv2.imread(front_image_path)
    back_image = cv2.imread(back_image_path)

    # Resize images to match the same height
    height = max(front_image.shape[0], back_image.shape[0])
    front_image = cv2.resize(front_image, (front_image.shape[1], height))
    back_image = cv2.resize(back_image, (back_image.shape[1], height))

    # Combine images horizontally
    combined_image = np.hstack((front_image, back_image))

    return combined_image

def extract_text_from_image(image_path):
    client = vision.ImageAnnotatorClient()

    with open(image_path, "rb") as image_file:
        content = image_file.read()

    image = vision.Image(content=content)
    response = client.text_detection(image=image)

    if response.error.message:
        raise Exception(f"{response.error.message}")

    texts = response.text_annotations
    return texts[0].description if texts else ""
