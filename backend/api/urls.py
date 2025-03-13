from django.urls import path
from .views import CardListCreateView, CardRetrieveUpdateDestroyView, CardImageUploadView, ManualCardCreateView

urlpatterns = [
    path('cards/', CardListCreateView.as_view(), name='item-list-create'),
    path('cards/<int:pk>/', CardRetrieveUpdateDestroyView.as_view(), name='item-detail'),
    path('upload/', CardImageUploadView.as_view(), name='card-image-upload'),
    path('upload/manual/', ManualCardCreateView.as_view(), name='manual-card-create'),
]
