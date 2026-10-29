from django.db import models
from django.conf import settings
 
 
class CaseCategory(models.Model):
    CATEGORY_CHOICES = (
        ('Criminal', 'Criminal Law'),
        ('Civil', 'Civil Law'),
        ('Family', 'Family Law'),
        ('Property', 'Property Law'),
    )
 
    name = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
 
    def __str__(self):
        return self.name
 
 
class Case(models.Model):
 
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Ongoing', 'Ongoing'),
        ('Closed', 'Closed'),
    )
 
    title = models.CharField(max_length=255)
    description = models.TextField()
 
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='client_cases'
    )
 
    lawyer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='lawyer_cases'
    )
 
    category = models.ForeignKey(
        CaseCategory,
        on_delete=models.SET_NULL,
        null=True
    )
 
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='Pending'
    )
 
    created_at = models.DateTimeField(auto_now_add=True)
 
    def __str__(self):
        return self.title
 
 
class CaseDocument(models.Model):
 
    case = models.ForeignKey(
        Case,
        on_delete=models.CASCADE,
        related_name='documents'
    )
 
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
 
    document = models.FileField(upload_to='case_documents/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
 
    def __str__(self):
        return f"Document for {self.case.title}"
 
 
class CaseActivityLog(models.Model):
 
    ACTION_TYPES = (
        ('Case Created', 'Case Created'),
        ('Status Updated', 'Status Updated'),
        ('Document Uploaded', 'Document Uploaded'),
        ('Invoice Generated', 'Invoice Generated'),
        ('Hearing Scheduled', 'Hearing Scheduled'),
    )
 
    case = models.ForeignKey(
        Case,
        on_delete=models.CASCADE,
        related_name='activities'
    )
 
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True
    )
 
    action_type = models.CharField(max_length=50, choices=ACTION_TYPES)
    description = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
 
    def __str__(self):
        return f"{self.action_type} - {self.case.title}"
 