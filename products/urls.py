from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'), #главная страница
    path('profil/', views.profil_page, name='profil'), #страница профиля
    path('protocol/', views.protocol, name='protocol'),
    path('generate_profile/', views.generate_profile, name='generate_profile'), #генерация профиля
    path('generate_profile_image/', views.generate_profile_image, name='generate_profile_image'),
    path('save_profile/', views.save_profile, name='save_profile'),
    path('test_matplotlib/', views.test_matplotlib, name='test_matplotlib'),
    path('upload_project/', views.upload_project, name='upload_project'),
    path('upload_attachment/', views.upload_attachment, name='upload_attachment'),
    path('generate_protocol', views.generate_protocol, name='generate_protocol'),
    path('export_protocol_excel/', views.export_protocol_excel, name='export_protocol_excel'),
    path('search/',views.search_view, name='search'),
    path('log_action/', views.log_action, name='log_action'),
]