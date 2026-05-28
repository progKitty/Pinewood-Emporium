from rest_framework import serializers
from .models import Category, Product, Order, OrderItem
from users.serializers import UserSerializer

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    vendor_details = UserSerializer(source='vendor', read_only=True)
    
    class Meta:
        model = Product
        fields = '__all__'
        read_only_fields = ('vendor',)

class OrderItemSerializer(serializers.ModelSerializer):
    product_details = ProductSerializer(source='product', read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ('id', 'product', 'product_details', 'quantity', 'price')
        read_only_fields = ('price',)

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    customer_details = UserSerializer(source='customer', read_only=True)
    
    class Meta:
        model = Order
        fields = ('id', 'customer', 'customer_details', 'status', 'total_amount', 'shipping_address', 'created_at', 'updated_at', 'items')
        read_only_fields = ('customer', 'total_amount', 'status')
