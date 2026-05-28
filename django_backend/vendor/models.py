from django.db import models
from django.conf import settings
from shop.models import OrderItem

class VendorProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, related_name='vendor_profile', on_delete=models.CASCADE)
    store_name = models.CharField(max_length=150)
    description = models.TextField(blank=True, null=True)
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.store_name

class Ledger(models.Model):
    order_item = models.OneToOneField(OrderItem, on_delete=models.CASCADE)
    vendor = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='ledger_entries', on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2) # The original price * quantity
    admin_fee = models.DecimalField(max_digits=10, decimal_places=2) # 5%
    vendor_earning = models.DecimalField(max_digits=10, decimal_places=2) # 95%
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Ledger for {self.order_item.product.title}"
