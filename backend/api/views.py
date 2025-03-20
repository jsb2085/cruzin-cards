from django.shortcuts import render
from rest_framework import generics, status, permissions
from .models import Card, CardImage
from .serializers import CardImageSerializer, CardSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from django.core.files.base import ContentFile
import cv2
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework.exceptions import ValidationError
from .ai_card.card_to_text import combine_images, extract_text_from_image  # Ensure these are imported correctly
from .ai_card.text_to_card import create_card
from .card_types.magic import ai_name_year_magic, magic_name_and_year
from .card_types.pokemon import ai_name_set_number_pokemon, pokemon_name_and_set_number


class RegisterView(APIView):
    def post(self, request):
        email = request.data.get('email')
        username = request.data.get('username')
        password = request.data.get('password')

        # Validate fields
        if not email or not password or not username:
            return Response({'detail': 'All fields are required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Check if user already exists
        if User.objects.filter(username=username).exists():
            return Response({'detail': 'Username already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({'detail': 'Email already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        # Validate password
        try:
            validate_password(password)
        except ValidationError as e:
            return Response({'detail': e.messages}, status=status.HTTP_400_BAD_REQUEST)

        # Create user
        user = User.objects.create_user(username=username, email=email, password=password)
        user.save()

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)



class NativeLoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        # Authenticate user
        user = authenticate(request, username=username, password=password)

        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_200_OK)
        else:
            return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class CardListCreateView(generics.ListCreateAPIView):
    serializer_class = CardSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Card.objects.filter(owner=self.request.user)

class CardRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Card.objects.all()
    serializer_class = CardSerializer

class CardImageUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, format=None):
        print(request.data)
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

            print(extracted_text)

            if "MAGIC" in extracted_text:
                magic_card = ai_name_year_magic(extracted_text)
                magic_info = magic_name_and_year(magic_card.name, magic_card.year)
                if magic_info == None:
                    return Response({
                        'status': 'manual',
                        'extracted_name': magic_card.name,
                        'extracted_number': magic_card.year,
                        'card_company': 'Magic the Gathering',
                        'image_id': card_image.id
                    }, status=status.HTTP_200_OK)
                card = Card.objects.create(
                    owner=self.request.user,
                    name=magic_info[0]['name'],
                    set=magic_info[0]['set_name'],
                    number=magic_info[0]['collector_number'],
                    card_company="Magic the Gathering",
                    autograph=False,
                    card_image=card_image,
                    is_graded=False
                )
            elif "Pokémon" in extracted_text:
                pokemon_card = ai_name_set_number_pokemon(extracted_text)
                pokemon_info = pokemon_name_and_set_number(pokemon_card.name, pokemon_card.set_number)
                if pokemon_info == None:
                    return Response({
                        'status': 'manual',
                        'extracted_name': pokemon_card.name,
                        'extracted_number': pokemon_card.set_number,
                        'card_company': 'Pokémon',
                        'image_id': card_image.id
                    }, status=status.HTTP_200_OK)

                card = Card.objects.create(
                    owner=self.request.user,
                    name=pokemon_info['name'],
                    set=pokemon_info['set']['name'],
                    number=f'{pokemon_card.set_number}/{pokemon_info["set"]["printedTotal"]}',
                    card_company="Pokémon",
                    numeration="None",
                    autograph=False,
                    card_image=card_image,
                    is_graded=False
                )
            else:
                card_data = create_card(extracted_text)
                card = Card.objects.create(
                    owner=self.request.user,
                    name=card_data.name,
                    set=card_data.set,
                    number=card_data.number,
                    card_company=card_data.card_company,
                    numeration=card_data.numeration,
                    autograph=card_data.autograph,
                    card_image=card_image,
                    is_graded=card_data.is_graded,
                    grade=card_data.grade,
                    grade_company=card_data.grade_company
                )

            card.save()

            return Response(CardSerializer(card).data, status=status.HTTP_201_CREATED)
        else:
            print(serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ManualCardCreateView(APIView):
    def post(self, request, format=None):
        name = request.data.get('name')
        number = request.data.get('number')
        image_id = request.data.get('image_id')
        card_company = request.data.get('card_company')

        if not name or not number or not image_id:
            return Response({'error': 'Name, number, and image id are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            card_image = CardImage.objects.get(id=image_id)
        except CardImage.DoesNotExist:
            return Response({'error': 'Invalid image id.'}, status=status.HTTP_400_BAD_REQUEST)

        if card_company == "Magic the Gathering":
            magic_info = magic_name_and_year(name, number)
            if magic_info == None:
                return Response({
                    'status': 'manual',
                    'extracted_name': name,
                    'extracted_number': number,
                    'card_company': 'Magic the Gathering',
                    'image_id': image_id
                }, status=status.HTTP_200_OK)
            card = Card.objects.create(
                    owner=self.request.user,
                    name=magic_info[0]['name'],
                    set=magic_info[0]['set_name'],
                    number=magic_info[0]['collector_number'],
                    card_company="Magic the Gathering",
                    numeration="None",
                    autograph=False,
                    card_image=card_image,
                    is_graded=False,
                    grade_company="None"
                )

        elif card_company == "Pokémon":
            number = number.split('/')[0] # Remove the total number of cards in the set
            pokemon_info = pokemon_name_and_set_number(name, number)
            if pokemon_info == None:
                return Response({
                    'status': 'manual',
                    'extracted_name': name,
                    'extracted_number': number,
                    'card_company': 'Pokémon',
                    'image_id': image_id
                }, status=status.HTTP_200_OK)
            card = Card.objects.create(
                owner=self.request.user,
                name=pokemon_info['name'],
                set=pokemon_info['set']['name'],
                number=f'{number}/{pokemon_info["set"]["printedTotal"]}',
                card_company="Pokémon",
                numeration="None",
                autograph=False,
                card_image=card_image,
                is_graded=False,
                grade_company="None"
            )

        return Response(CardSerializer(card).data, status=status.HTTP_201_CREATED)