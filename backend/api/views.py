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
from .card_types.magic import ai_name_year_magic, magic_name_and_year
from .card_types.pokemon import ai_name_set_number_pokemon, pokemon_name_and_set_number

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

            if "MAGIC" in extracted_text:
                magic_card = ai_name_year_magic(extracted_text)
                magic_info = magic_name_and_year(magic_card.name, magic_card.year)
                card = Card.objects.create(
                    name=magic_info[0]['name'],
                    set=magic_info[0]['set_name'],
                    number=magic_info[0]['collector_number'],
                    card_company="Magic the Gathering",
                    numeration="None",
                    autograph=False,
                    card_image=card_image
                )
            elif "Pokémon" in extracted_text:
                pokemon_card = ai_name_set_number_pokemon(extracted_text)
                pokemon_info = pokemon_name_and_set_number(pokemon_card.name, pokemon_card.set_number)
                card = Card.objects.create(
                    name=pokemon_card.name,
                    set=pokemon_card.set_number,
                    number="None",
                    card_company="Pokémon",
                    numeration="None",
                    autograph=False,
                    card_image=card_image
                )
            else: 
                card_data = create_card(extracted_text)

                card = Card.objects.create(
                    name=card_data.name,
                    set=card_data.set,
                    number=card_data.number,
                    card_company=card_data.card_company,
                    numeration=card_data.numeration,
                    autograph=card_data.autograph,
                    card_image=card_image
                )

            card.save()

            return Response(CardSerializer(card).data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

