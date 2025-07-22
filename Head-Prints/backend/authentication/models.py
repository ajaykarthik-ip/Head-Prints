from django.db import models


class UserProfile(models.Model):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    password = models.CharField(max_length=128)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.email