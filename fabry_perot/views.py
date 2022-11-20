import math
from typing import Union

import plotly.express as px
import sepl_light_lib as sll
from LightPipes import *
from django.http import HttpResponse
from django.shortcuts import render

from .forms import GraphForm
from .models import RequestFP, PresetFP


# /fabry_perot
def index_page(request) -> Union[HttpResponse, None]:
    context = {
        'presets': PresetFP.objects.filter(user=request.user.username)[::-1],
        'array_of_reqs': RequestFP.objects.filter(user=request.user.username)[::-1][:5],
        'form': GraphForm()
    }

    return render(request, 'pages/fabry-perot.html', context=context)


# /fabry_perot/update_graph
def update_graph(request) -> Union[HttpResponse, None]:
    graph = None
    form = GraphForm(request.POST)

    if form.is_valid():
        form_dict = dict(form.cleaned_data)
        form_dict['user'] = request.user
        graph = get_graph(form_dict)

    return HttpResponse(graph)


# /fabry_perot/update_history
def update_history(request) -> Union[HttpResponse, None]:
    form = GraphForm(request.POST)

    if form.is_valid():
        form_dict = dict(form.cleaned_data)
        form_dict['user'] = request.user
        RequestFP.objects.create(**form_dict)

    return render(request, 'components/history-table.html',
                  context={'array_of_reqs': RequestFP.objects.filter(user=request.user.username)[::-1][:5]})


# /fabry_perot/update_preset
def update_preset(request) -> Union[HttpResponse, None]:
    if request.POST['preset_operation'] == 'save_preset':
        form = GraphForm(request.POST)

        if form.is_valid():
            form_dict = dict(form.cleaned_data)
            form_dict['user'] = request.user

            presets = PresetFP.objects.filter(user=request.user.username)[::-1]
            if request.user.username and len(presets) < 5:
                PresetFP.objects.create(**form_dict)
    elif request.POST['preset_operation'] == 'delete_preset':
        PresetFP.objects.get(id=request.POST['delete_preset']).delete()

    return render(request, 'components/presets-table.html',
                  context={'presets': PresetFP.objects.filter(user=request.user.username)[::-1]})


def get_graph(form_dict: dict) -> str:
    wave_length = form_dict['wave_length'] * sll.nm
    glasses_distance = form_dict['glasses_distance'] * sll.mm
    focal_distance = form_dict['focal_distance'] * sll.mm
    stroke_difference = form_dict['stroke_difference'] * sll.nm
    reflectivity = form_dict['reflectivity']
    refractive_index = form_dict['refractive_index']
    picture_size = form_dict['picture_size'] * sll.mm
    incident_light_intensity = form_dict['incident_light_intensity'] * sll.W / (sll.cm * sll.cm)
    n = form_dict['N']

    f = Begin(picture_size, wave_length, n)
    intensity = Intensity(f)

    k = 2 * math.pi / wave_length
    second_k = 2 * math.pi / (wave_length + stroke_difference)
    fineness = 4.0 * reflectivity / (1.0 - reflectivity)

    step = picture_size / n / mm
    for i in range(1, n):
        x_ray = i * step
        for j in range(1, n):
            y_ray = j * step

            x = x_ray * mm - picture_size / 2
            y = y_ray * mm - picture_size / 2

            radius = math.sqrt(x * x + y * y)
            theta = radius / focal_distance

            delta = k * refractive_index * glasses_distance * math.cos(theta)
            light_intensity = 0.5 / (1 + fineness * math.pow(math.sin(delta), 2))
            delta = second_k * refractive_index * glasses_distance * math.cos(theta)
            light_intensity += 0.5 / (1 + fineness * math.pow(math.sin(delta), 2))

            intensity[i][j] = light_intensity

    # color_scale = [(0, 'purple'), (0.13, 'blue'), (0.23, 'aqua'), (0.35, 'lime'),
    #                (0.55, 'yellow'), (0.7, 'red'), (0.9, 'red'), (1, 'maroon')]
    config = {'scrollZoom': True, 'toImageButtonOptions': {'height': None, 'width': None}}
    fig = px.imshow(intensity,
                    color_continuous_scale=['#000000',
                                            sll.color.rgb_to_hex(sll.wave.wave_length_to_rgb(wave_length / sll.nm))])

    # print(px.colors.sequential.Inferno)
    graph = fig.to_html(full_html=False, config=config)

    return graph
