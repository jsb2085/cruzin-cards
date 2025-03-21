from django.urls import path
from .views import RetrieveCardPrice, CardShopListCreateView, CardShopRetrieveUpdateDestroyView, CardListCreateView, CardRetrieveUpdateDestroyView, CardImageUploadView, NativeLoginView, RegisterView, ManualCardCreateView, UserDetailView
from rest_framework_simplejwt.views import TokenRefreshView



urlpatterns = [
    path('login/', NativeLoginView.as_view(), name='native-login'),
    path('register/', RegisterView.as_view(), name='register'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('cards/', CardListCreateView.as_view(), name='item-list-create'),
    path('cards/<int:pk>/', CardRetrieveUpdateDestroyView.as_view(), name='item-detail'),
    path('upload/', CardImageUploadView.as_view(), name='card-image-upload'),
    path('upload/manual/', ManualCardCreateView.as_view(), name='manual-card-create'),
    path("user/", UserDetailView.as_view(), name="user-detail"),
    path("cardshops/", CardShopListCreateView.as_view(), name="cardshop-list-create"),
    path("cardshops/<int:pk>/", CardShopRetrieveUpdateDestroyView.as_view(), name="cardshop-detail"),
    path("card_price/<int:pk>/", RetrieveCardPrice.as_view(), name="card-price")
]

