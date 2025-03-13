from rest_framework import serializers
from .models import Card, CardImage, CardShop

class CardImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CardImage
        fields = ['id', 'card_front_image', 'card_back_image', 'combined_image', 'extracted_text']


class CardSerializer(serializers.ModelSerializer):
    card_image = CardImageSerializer()

    class Meta:
        model = Card
        fields = '__all__'

    def create(self, validated_data):
        card_image_data = validated_data.pop('card_image')
        card_image = CardImage.objects.create(**card_image_data)
        return Card.objects.create(card_image=card_image, **validated_data)

    def update(self, instance, validated_data):
        card_image_data = validated_data.pop('card_image', None)

        if card_image_data:
            card_image = instance.card_image
            card_image.card_front_image = card_image_data.get('card_front_image', card_image.card_front_image)
            card_image.card_back_image = card_image_data.get('card_back_image', card_image.card_back_image)
            card_image.save()

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance

class CardShopSerializer(serializers.ModelSerializer):
    owner = serializers.StringRelatedField(read_only=True)  # Display owner's username

    class Meta:
        model = CardShop
        fields = [
            'id',
            'owner',
            'name',
            'description',
            'address',
            'city',
            'state',
            'postal_code',
            'country',
            'phone',
            'website',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['owner'] = user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

