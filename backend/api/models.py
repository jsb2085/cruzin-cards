from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class CardImage(models.Model):
    card_front_image = models.ImageField(upload_to='images/')
    card_back_image = models.ImageField(upload_to='images/')
    combined_image = models.ImageField(upload_to='combined_images/', null=True, blank=True)
    extracted_text = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"CardImage {self.id}"
    
class Card(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.TextField()
    number = models.TextField()
    set = models.TextField()
    card_company = models.TextField()
    numeration = models.TextField()
    autograph = models.BooleanField()
    card_image = models.OneToOneField(CardImage, on_delete=models.CASCADE)
    #user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
