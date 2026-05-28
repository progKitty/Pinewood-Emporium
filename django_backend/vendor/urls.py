from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VendorProfileViewSet, LedgerViewSet

router = DefaultRouter()
router.register(r'profiles', VendorProfileViewSet, basename='vendorprofile')
router.register(r'ledger', LedgerViewSet, basename='ledger')

urlpatterns = [
    path('', include(router.urls)),
]
