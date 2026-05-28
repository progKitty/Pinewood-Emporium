import uuid
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import Profile, Category, Product, Review
import random

class Command(BaseCommand):
    help = 'Seed the database with initial data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding data...')
        
        # Create Superuser
        if not User.objects.filter(username='admin@admin.com').exists():
            su = User.objects.create_superuser('admin@admin.com', 'admin@admin.com', 'admin')
            Profile.objects.create(user=su, full_name='Admin User')
            self.stdout.write('Superuser created (admin@admin.com / admin)')
        else:
            su = User.objects.get(username='admin@admin.com')

        # Create Categories
        cats = [
            {'name': 'Leather Goods', 'slug': 'leather-goods'},
            {'name': 'Timepieces', 'slug': 'timepieces'},
            {'name': 'Home', 'slug': 'home'},
            {'name': 'Outdoor', 'slug': 'outdoor'},
        ]
        
        category_objects = {}
        for c in cats:
            cat, created = Category.objects.get_or_create(slug=c['slug'], defaults={'name': c['name']})
            category_objects[c['slug']] = cat

        # Create Products
        products = [
            {
                'title': 'Handcrafted Leather Wallet',
                'slug': 'leather-wallet-01',
                'description': 'A beautiful, handcrafted leather wallet made from full-grain leather. It ages perfectly over time.',
                'price_cents': 4500,
                'compare_at_cents': 6000,
                'stock': 15,
                'category': category_objects['leather-goods'],
                'images': ["https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=800"],
            },
            {
                'title': 'Minimalist Field Watch',
                'slug': 'minimal-field-watch',
                'description': 'Rugged yet elegant. A field watch perfect for everyday carry.',
                'price_cents': 12000,
                'compare_at_cents': None,
                'stock': 8,
                'category': category_objects['timepieces'],
                'images': ["https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&q=80&w=800"],
            },
            {
                'title': 'Cast Iron Skillet',
                'slug': 'cast-iron-skillet-10',
                'description': 'A durable cast iron skillet that will last generations.',
                'price_cents': 3500,
                'compare_at_cents': 4500,
                'stock': 20,
                'category': category_objects['home'],
                'images': ["https://images.unsplash.com/photo-1585923146467-3453b75c8088?auto=format&fit=crop&q=80&w=800"],
            },
            {
                'title': 'Canvas Backpack',
                'slug': 'canvas-outdoor-backpack',
                'description': 'A waxed canvas backpack for the trail and the city.',
                'price_cents': 8500,
                'compare_at_cents': 11000,
                'stock': 5,
                'category': category_objects['outdoor'],
                'images': ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800"],
            }
        ]

        for p_data in products:
            p, created = Product.objects.get_or_create(
                slug=p_data['slug'], 
                defaults={
                    'title': p_data['title'],
                    'description': p_data['description'],
                    'price_cents': p_data['price_cents'],
                    'compare_at_cents': p_data['compare_at_cents'],
                    'stock': p_data['stock'],
                    'category': p_data['category'],
                    'images': p_data['images'],
                }
            )
            
            # Create a sample review if created
            if created:
                Review.objects.create(
                    product=p,
                    user=su,
                    rating=random.randint(4, 5),
                    comment="Absolutely incredible product! Highly recommended."
                )

        self.stdout.write(self.style.SUCCESS('Successfully seeded the database.'))
