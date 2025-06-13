import openpyxl
from openpyxl.styles import Font
from django.http import HttpResponse
from io import BytesIO
import os
import io
import urllib, base64
import math
import matplotlib.pyplot as plt
from django.shortcuts import render, redirect
from django.core.files.base import ContentFile
from django.http import HttpResponse
from .models import Project, Attachment, Profile, Protocol
from .forms import ProjectForm, AttachmentForm, ProfileForm, ProtocolForm
from openpyxl import Workbook

def index(request):
    projects = Project.objects.all()
    attachments = Attachment.objects.all()
    profiles = Profile.objects.all()
    protocols = Protocol.objects.all()
    return render(request, 'index.html', {
        'projects': projects,
        'attachments': attachments,
        'profiles': profiles,
        'protocols': protocols,
    })
# Функции-помощники для безопасного разбора списков
def parse_float_list(post_data, field_name):
    return [
        float(x) for x in post_data.get(field_name, '').split(',')
        if x.strip() != ''
    ]

def parse_str_list(post_data, field_name):
    return [
        x.strip() for x in post_data.get(field_name, '').split(',')
        if x.strip() != ''
    ]
def profil(request):
    if request.method == 'POST':
        # Получение данных с формы profil.html
        # Пример:
        try:

            ground_levels = parse_float_list(request.POST, 'ground_levels')
            pipe_levels = parse_float_list(request.POST, 'pipe_levels')
            pit_x = parse_float_list(request.POST, 'pit_x')
            pit_y = parse_float_list(request.POST, 'pit_y')
            pit_d = parse_float_list(request.POST, 'pit_d')
            comm_x = parse_float_list(request.POST, 'comm_x')
            comm_y = parse_float_list(request.POST, 'comm_y')
            comm_d = parse_float_list(request.POST, 'comm_d')
            comm_type = parse_str_list(request.POST, 'comm_type')

            fig, ax = plt.subplots()
            ax.plot(ground_levels, label='Уровень грунта')
            ax.plot(pipe_levels, label='Уровень трубы')

            # Приямки
            for x, y, d in zip(pit_x, pit_y, pit_d):
                pit = plt.Circle((x, y), d, color='red', alpha=0.5)
                ax.add_patch(pit)

            # Коммуникации
            for x, y, d, t in zip(comm_x, comm_y, comm_d, comm_type):
                comm = plt.Circle((x, y), d, alpha=0.5, label=t)
                ax.add_patch(comm)

            ax.legend(loc='best')
            ax.set_title('Профиль ГНБ')
            ax.set_xlabel('Длина, м')
            ax.set_ylabel('Глубина, м')
            ax.grid(True)

            buf = io.BytesIO()
            plt.savefig(buf, format='png')
            buf.seek(0)
            image = base64.b64encode(buf.read()).decode('utf-8')
            buf.close()

            return render(request, 'profil.html', {'graph': image})

        except Exception as e:
            return render(request, 'profil.html', {'error': str(e)})

    return render(request, 'profil.html')


def save_profile(request):
    if request.method == 'POST':
        image_data = request.session.get('profile_image')
        address = request.POST.get('address')
        description = request.POST.get('description')
        if image_data:
            profile = Profile(address=address, description=description)
            profile.image.save(f"profile_{address}.png", ContentFile(image_data))
            profile.save()
    return redirect('index')

def generate_protocol(request):
    if request.method == 'POST':
        address = request.POST.get('address')
        length = float(request.POST.get('length'))
        rod_length = float(request.POST.get('rod_length'))
        head_level = float(request.POST.get('head_level'))
        depth = float(request.POST.get('depth'))
        system = request.POST.get('system')
        location = request.POST.get('location')
        supervisor = request.POST.get('supervisor')
        engineer = request.POST.get('engineer')
        expansion = request.POST.get('expansion')

        wb = Workbook()
        ws = wb.active
        ws.title = "Протокол бурения"

        ws.append(['ПРОТОКОЛ БУРЕНИЯ'])
        ws.append(['Адрес', address])
        ws.append(['Буровая система', system])
        ws.append(['Длина прокола (м)', length])
        ws.append(['Расширения (мм)', expansion])
        ws.append(['Система локации', location])
        ws.append(['Руководитель бурения', supervisor])
        ws.append([])

        ws.append(['№ штанги', 'Длина пилотной скважины, м', 'Угол, %', 'Глубина, м'])

        num_rods = math.ceil(length / rod_length)
        for i in range(1, num_rods + 1):
            rod_len = min(i * rod_length, length)
            hypotenuse = rod_len
            cos_angle = rod_length / hypotenuse
            angle_percent = round((1 - cos_angle) * 100, 2)
            depth_head = round(head_level - (depth / length * rod_len), 2)
            ws.append([i, rod_len, angle_percent, depth_head])

        buffer = io.BytesIO()
        wb.save(buffer)
        buffer.seek(0)
        protocol = Protocol(address=address, description=f"Протокол по адресу {address}")
        protocol.file.save(f"protocol_{address}.xlsx", ContentFile(buffer.getvalue()))
        protocol.save()
    return redirect('index')

def protocol(request):
    if request.method == 'POST':
        form = ProtocolForm(request.POST)
        if form.is_valid():
            data = form.cleaned_data

            # Список глубин
            ground_levels = list(map(float, data['ground_levels'].split(',')))
            pipe_depths = list(map(float, data['pipe_depths'].split(',')))
            expansions = [e.strip() for e in data['expansions'].split(',')]

            rod_length = data['rod_length']
            total_length = data['total_length']

            # Количество штанг (с округлением вверх)
            rod_count = math.ceil(total_length / rod_length)

            # Расчёт данных по каждой штанге
            protocol_data = []
            for i in range(rod_count):
                length = round((i + 1) * rod_length, 2)

                if i < len(ground_levels) and i < len(pipe_depths):
                    depth = round(ground_levels[i] - pipe_depths[i], 2)
                else:
                    depth = 0

                # гипотенуза = длина штанги (род)
                hypotenuse = math.sqrt(rod_length**2 + depth**2) if depth else rod_length
                angle_percent = round((depth / hypotenuse) * 100, 2) if hypotenuse else 0

                protocol_data.append({
                    'rod_number': i + 1,
                    'length': length,
                    'angle': angle_percent,
                    'depth': depth,
                })

            context = {
                'form': form,
                'address': data['address'],
                'drill_system': data['drill_system'],
                'location_system': data['location_system'],
                'drilling_supervisor': data['drilling_supervisor'],
                'construction_supervisor': data['construction_supervisor'],
                'total_length': total_length,
                'rod_length': rod_length,
                'expansions': expansions,
                'protocol_data': protocol_data,
                'submitted': True
            }
            return render(request, 'protocol.html', context)

    else:
        form = ProtocolForm()

    return render(request, 'protocol.html', {'form': form})

#КопироватьРедактировать
def export_protocol_excel(request):
    if request.method == 'POST':
        rod_length = float(request.POST.get('rod_length'))
        total_length = float(request.POST.get('total_length'))
        ground_levels = list(map(float, request.POST.get('ground_levels').split(',')))
        pipe_depths = list(map(float, request.POST.get('pipe_depths').split(',')))

        rod_count = math.ceil(total_length / rod_length)

        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Протокол"

        # Заголовки
        headers = ['№ штанги', 'Длина пилотной скважины (м)', 'Угол наклона (%)', 'Глубина головки (м)']
        ws.append(headers)
        for col in ws.iter_cols(min_row=1, max_row=1, min_col=1, max_col=4):
            for cell in col:
                cell.font = Font(bold=True)

        for i in range(rod_count):
            length = round((i + 1) * rod_length, 2)
            if i < len(ground_levels) and i < len(pipe_depths):
                depth = round(ground_levels[i] - pipe_depths[i], 2)
            else:
                depth = 0

            hypotenuse = math.sqrt(rod_length**2 + depth**2) if depth else rod_length
            angle_percent = round((depth / hypotenuse) * 100, 2) if hypotenuse else 0

            ws.append([i + 1, length, angle_percent, depth])

        # Сохраняем в поток
        output = BytesIO()
        wb.save(output)
        output.seek(0)

        response = HttpResponse(output.read(),
                                content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename=protocol.xlsx'
        return response

    return HttpResponse("Ошибка: только POST запрос", status=400)

def protocol_view(request):
    if request.method == 'POST':
        form = ProtocolForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('index')
    else:
        form = ProtocolForm()
    return render(request, 'protocol.html', {'form': form})

#добавим список протоколов на главной:

def index(request):
    protocols = Protocol.objects.all().order_by('-created_at')
    return render(request, 'index.html', {'protocols': protocols})
def save_profile_document(request):
    return HttpResponse(" Заглушка для save_profile_document - функция работает")