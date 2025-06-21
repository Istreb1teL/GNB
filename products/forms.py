
from django import forms
from .models import Project, Attachment, Profile, Protocol

class ProjectForm(forms.ModelForm):
    class Meta:
        model = Project
        fields = ['address', 'description', 'file']
        widgets = {
            'description': forms.Textarea(attrs={'rows': 3}),
        }
        labels = {
            'title': 'Название проекта',
            'description': 'Описание',
            'file': 'Файл проекта'
        }


class AttachmentForm(forms.ModelForm):
    class Meta:
        model = Attachment
        fields = ['address', 'description', 'file']
        widgets = {
            'description': forms.Textarea(attrs={'rows': 3}),
            'project': forms.Select(attrs={'class': 'form-control'})
        }
        labels = {
            'title': 'Название привязки',
            'description': 'Описание',
            'file': 'Файл привязки',
            'project': 'Связанный проект'
        }

class ProfileForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = ['address', 'description', 'image']

class ProtocolForm(forms.ModelForm):
    class Meta:
        model = Protocol
        fields = '__all__'

class ProtocolForm(forms.Form):
    address = forms.CharField(label='Адрес строительства', max_length=255)
    drill_system = forms.CharField(label='Буровая система', max_length=255)
    location_system = forms.CharField(label='Система локации', max_length=255)
    drilling_supervisor = forms.CharField(label='Руководитель буровых работ', max_length=255)
    construction_supervisor = forms.CharField(label='Руководитель строительства', max_length=255)
    total_length = forms.FloatField(label='Длина прокладки (м)')
    rod_length = forms.FloatField(label='Длина штанги (м)')
    expansions = forms.CharField(label='Расширения (мм)', help_text='Через запятую: 110, 200, 350')
    ground_levels = forms.CharField(label='Уровни поверхности', help_text='В метрах через запятую')
    pipe_depths = forms.CharField(label='Глубины трубы', help_text='В метрах через запятую')