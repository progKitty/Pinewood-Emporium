from rest_framework import serializers
from .models import VendorProfile, Ledger

class VendorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = VendorProfile
        fields = '__all__'
        read_only_fields = ('user', 'is_approved')

class LedgerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ledger
        fields = '__all__'
        read_only_fields = ('vendor', 'order_item', 'amount', 'admin_fee', 'vendor_earning')
