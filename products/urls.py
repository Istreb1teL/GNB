from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('profil/', views.profil, name='profil'),
    path('save_profile/', views.save_profile_document, name='save_profile'),
    path('protocol/', views.protocol, name='protocol'),
    path('export_protocol_excel/', views.export_protocol_excel, name='export_protocol_excel'),
    path('search/',views.search_view, name='search'),
]