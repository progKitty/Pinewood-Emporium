from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AuthRegisterView, AuthLoginView, AuthMeView,
    CategoryViewSet, ProductViewSet, ReviewListCreateView, OrderViewSet
)

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'products', ProductViewSet)
router.register(r'orders', OrderViewSet, basename='order')

urlpatterns = [
    path('auth/register/', AuthRegisterView.as_view(), name='auth_register'),
    path('auth/login/', AuthLoginView.as_view(), name='auth_login'),
    path('auth/me/', AuthMeView.as_view(), name='auth_me'),
    
    path('products/<slug:slug>/reviews/', ReviewListCreateView.as_view(), name='product-reviews'),
    
    path('', include(router.urls)),
]
