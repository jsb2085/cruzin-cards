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
    name = models.CharField(max_length=20)
    number = models.CharField(max_length=20)
    set = models.CharField(max_length=20)
    card_company = models.CharField(max_length=20)
    numeration = models.CharField(max_length=20,  null=True, blank=True)
    autograph = models.BooleanField()
    is_graded= models.BooleanField()
    grade_company = models.CharField(max_length=20,  null=True, blank=True)
    grade = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        null=True,
        blank=True
    )
    card_image = models.OneToOneField(CardImage, on_delete=models.CASCADE)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} {self.set} {self.number}"

class CardShop(models.Model):
    id = models.BigAutoField(primary_key=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='card_shop')
    name = models.CharField(max_length=100)
    description = models.TextField(null=True, blank=True)
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, null=True, blank=True)
    website = models.URLField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
