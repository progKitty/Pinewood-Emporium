from django.db.models.signals import post_save
from django.dispatch import receiver
from shop.models import OrderItem
from .models import Ledger
from decimal import Decimal

@receiver(post_save, sender=OrderItem)
def create_ledger_for_order_item(sender, instance, created, **kwargs):
    if created:
        # Check if the product has a vendor
        vendor = instance.product.vendor
        if vendor:
            # Calculate amounts
            total_amount = instance.price * instance.quantity
            admin_fee = total_amount * Decimal('0.05')
            vendor_earning = total_amount - admin_fee

            Ledger.objects.create(
                order_item=instance,
                vendor=vendor,
                amount=total_amount,
                admin_fee=admin_fee,
                vendor_earning=vendor_earning
            )
