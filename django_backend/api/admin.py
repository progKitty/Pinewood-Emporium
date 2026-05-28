from django.contrib import admin
from .models import Profile, Category, Product, Review, Order, OrderItem

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'full_name', 'phone')
    search_fields = ('user__username', 'full_name', 'phone')

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'sort_order')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name',)
    ordering = ('sort_order',)

class ReviewInline(admin.TabularInline):
    model = Review
    extra = 1

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('title', 'price_cents', 'compare_at_cents', 'stock', 'active', 'category')
    list_filter = ('active', 'category')
    prepopulated_fields = {'slug': ('title',)}
    search_fields = ('title', 'slug')
    inlines = [ReviewInline]

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('product', 'user', 'rating', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('product__title', 'user__username')

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'status', 'total', 'shipping_name', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('id', 'shipping_name', 'shipping_phone', 'user__username')
    inlines = [OrderItemInline]

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('order', 'product_name', 'quantity', 'price')
