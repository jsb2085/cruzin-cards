from django.shortcuts import render
from rest_framework import generics
from .models import Card
from .serializers import CardImageSerializer, CardSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.files.base import ContentFile
import cv2
from .models import CardImage
from .ai_card.card_to_text import combine_images, extract_text_from_image  # Ensure these are imported correctly
from .ai_card.text_to_card import create_card

class CardListCreateView(generics.ListCreateAPIView):
    queryset = Card.objects.all()
    serializer_class = CardSerializer

class CardRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Card.objects.all()
    serializer_class = CardSerializer

class CardImageUploadView(APIView):
    def post(self, request, format=None):
        serializer = CardImageSerializer(data=request.data)

        if serializer.is_valid():
            card_image = serializer.save()

            # Combine the images
            combined_img = combine_images(card_image.card_front_image.path, card_image.card_back_image.path)

            # Save the combined image
            _, buffer = cv2.imencode('.jpg', combined_img)
            combined_image_content = ContentFile(buffer.tobytes(), name=f'combined_{card_image.id}.jpg')
            card_image.combined_image.save(combined_image_content.name, combined_image_content)

            # Extract text using Google Cloud Vision
            extracted_text = extract_text_from_image(card_image.combined_image.path)
            card_image.extracted_text = extracted_text
            card_image.save()

            if ['Pokemon', 'pokemon'] in extracted_text:
                # TODO add pokemon functionality
                pass

            if ['Magic the Gathering',] in extracted_text:
                # TODO add magic functionality
                pass


            card_data = create_card(extracted_text)

            card = Card.objects.create(
                name=card_data.name,
                set=card_data.set,
                number=card_data.number,
                card_company=card_data.card_company,
                numeration=card_data.numeration,
                autograph=card_data.autograph,
                card_image = card_image
            )

            card.save()

            return Response(CardSerializer(card).data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

