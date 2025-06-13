from django.db import models

class Project(models.Model):
    address = models.CharField(max_length=255)
    file = models.FileField(upload_to='projects/')
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.address} — {self.description}"

class Attachment(models.Model):  # Привязки
    address = models.CharField(max_length=255)
    file = models.FileField(upload_to='attachments/')
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.address} — {self.description}"

class Profile(models.Model):  # Профили (графики)
    address = models.CharField(max_length=255)
    image = models.ImageField(upload_to='profiles/')
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class Protocol(models.Model):
    address = models.CharField(max_length=255)
    description = models.TextField(blank=True)  # например: "водопровод", "газ"
    drilling_system = models.CharField(max_length=255, null=True, blank=True)
    location_system = models.CharField(max_length=255, null=True, blank=True)
    rod_length = models.FloatField(null=True)
    total_length = models.FloatField(null=True)
    expansion_sequence = models.CharField(max_length=255, null=True, blank=True)  # например: "110, 200, 350"
    drilling_supervisor = models.CharField(max_length=255, null= True, blank=True)
    site_supervisor = models.CharField(max_length=255, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.address} ({self.description}) — {self.created_at}"