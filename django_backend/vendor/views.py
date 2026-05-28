from rest_framework import viewsets, permissions
from .models import VendorProfile, Ledger
from .serializers import VendorProfileSerializer, LedgerSerializer

class VendorProfileViewSet(viewsets.ModelViewSet):
    serializer_class = VendorProfileSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        if self.request.user.is_admin():
            return VendorProfile.objects.all()
        return VendorProfile.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class LedgerViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = LedgerSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        if self.request.user.is_admin():
            return Ledger.objects.all()
        return Ledger.objects.filter(vendor=self.request.user)
