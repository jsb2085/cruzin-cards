from django.urls import path
from .views import CardListCreateView, CardRetrieveUpdateDestroyView, CardImageUploadView, NativeLoginView, RegisterView, ManualCardCreateView
from rest_framework_simplejwt.views import TokenRefreshView


urlpatterns = [
    path('login/', NativeLoginView.as_view(), name='native-login'),
    path('register/', RegisterView.as_view(), name='register'),
    path('refresh/token/', TokenRefreshView.as_view(), name='token-refresh'),
    path('cards/', CardListCreateView.as_view(), name='item-list-create'),
    path('cards/<int:pk>/', CardRetrieveUpdateDestroyView.as_view(), name='item-detail'),
    path('upload/', CardImageUploadView.as_view(), name='card-image-upload'),
    path('upload/manual/', ManualCardCreateView.as_view(), name='manual-card-create'),

]
