from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile, Category, Product, Review, Order, OrderItem

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['full_name', 'phone', 'avatar']

class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'profile']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    avatar = serializers.CharField(source='user.profile.avatar', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'product', 'user', 'user_name', 'avatar', 'rating', 'comment', 'created_at']
        read_only_fields = ['user', 'product']

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    rating_avg = serializers.SerializerMethodField()
    rating_count = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'title', 'slug', 'description', 'price_cents', 'compare_at_cents', 
            'stock', 'active', 'category', 'category_name', 'images', 
            'created_at', 'updated_at', 'reviews', 'rating_avg', 'rating_count'
        ]
        
    def get_rating_avg(self, obj):
        reviews = obj.reviews.all()
        if not reviews:
            return 0
        return sum([r.rating for r in reviews]) / len(reviews)
        
    def get_rating_count(self, obj):
        return obj.reviews.count()

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'price']
        read_only_fields = ['id']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = [
            'id', 'user', 'status', 'total', 'shipping_name', 'shipping_address', 
            'shipping_city', 'shipping_phone', 'payment_method', 'notes', 
            'created_at', 'updated_at', 'items'
        ]
        read_only_fields = ['id', 'user', 'status', 'created_at', 'updated_at']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        order = Order.objects.create(**validated_data)
        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)
        return order
