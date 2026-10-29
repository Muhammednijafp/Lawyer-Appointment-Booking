from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class User(AbstractUser):

    ROLE_CHOICES = (
        ('ADMIN', 'Admin'),
        ('LAWYER', 'Lawyer'),
        ('CLIENT', 'Client'),
    )

    LAWYER_TYPE = (
        ('Junior', 'Junior'),
        ('Senior', 'Senior'),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='CLIENT')
    lawyer_type = models.CharField(
        max_length=20, choices=LAWYER_TYPE,
        blank=True, null=True
    )
    phone = models.CharField(max_length=15, blank=True, null=True)
    profile_image = models.ImageField(upload_to='profiles/', blank=True, null=True)

    def __str__(self):
        return f"{self.username} - {self.role}"


class LawyerProfile(models.Model):

    COURT_LEVEL_CHOICES = (
        ('District', 'District Court'),
        ('High', 'High Court'),
        ('Supreme', 'Supreme Court'),
    )

    SPECIALIZATION_CHOICES = (
        ('Criminal', 'Criminal Law'),
        ('Civil', 'Civil Law'),
        ('Family', 'Family Law'),
        ('Property', 'Property Law'),
        ('Corporate', 'Corporate Law'),
        ('Labour', 'Labour Law'),
        ('Tax', 'Tax Law'),
        ('Constitutional', 'Constitutional Law'),
    )

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='lawyer_profile'
    )

    bar_council_number = models.CharField(max_length=50, blank=True, null=True)
    specialization = models.CharField(
        max_length=50,
        choices=SPECIALIZATION_CHOICES,
        blank=True, null=True
    )
    court_level = models.CharField(
        max_length=20,
        choices=COURT_LEVEL_CHOICES,
        blank=True, null=True
    )
    experience_years = models.PositiveIntegerField(default=0)
    consultation_fee = models.DecimalField(
        max_digits=10, decimal_places=2,
        default=0.00
    )
    bio = models.TextField(blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    total_cases = models.PositiveIntegerField(default=0)
    cases_won = models.PositiveIntegerField(default=0)
    average_rating = models.DecimalField(
        max_digits=3, decimal_places=1, default=0.0
    )
    total_reviews = models.PositiveIntegerField(default=0)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def update_rating(self):
        reviews = self.reviews.all()
        if reviews.exists():
            total = sum(r.rating for r in reviews)
            self.average_rating = round(total / reviews.count(), 1)
            self.total_reviews = reviews.count()
        else:
            self.average_rating = 0.0
            self.total_reviews = 0
        self.save()

    def __str__(self):
        return f"Profile of {self.user.username}"


class Review(models.Model):

    lawyer = models.ForeignKey(
        LawyerProfile,
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    client = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='given_reviews'
    )
    rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('lawyer', 'client')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.client.username} → {self.lawyer.user.username} ({self.rating}★)"