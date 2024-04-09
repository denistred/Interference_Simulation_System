from typing import Optional, Union

import plotly.express as px
import selph_light_lib as sll
from LightPipes import *
from django.apps import apps
from django.template.response import TemplateResponse
from django.views.generic import TemplateView

from misc.mixins.graph import GraphMixin
from misc.mixins.history import HistoryTableMixin
from misc.mixins.presets import PresetsTableMixin
from .forms import GraphForm
from .models import RequestM, PresetM


# /michelson
class IndexPage(TemplateView):
    template_name = 'pages/pendulum.html'

    def get(self, request, *args, **kwargs) -> TemplateResponse:
        context = {
            'form': GraphForm()
        }

        if request.user.is_authenticated:
            context['presets_table'] = PresetsTable.as_view()(request).rendered_content
            context['history_table'] = HistoryTable.as_view()(request).rendered_content

        return self.render_to_response(context)


# /michelson/graph
class Graph(GraphMixin):
    form = GraphForm

    @staticmethod
    def get_graph(form_dict: dict) -> Optional[dict[str, Union[str, tuple[str, ...]]]]:
        R = 3 * sll.mm
        z3 = 3 * sll.cm
        z4 = 5 * sll.cm
        wave_length = form_dict['wave_length'] * sll.nm
        z1 = form_dict['z1'] * cm
        z2 = form_dict['z2'] * cm
        Rbs = form_dict['Rbs']
        tx = form_dict['tx'] * sll.mrad
        ty = form_dict['ty'] * sll.mrad

        return {
            "graph": fig.to_html(config=config, include_plotlyjs=False, full_html=False)
        }


# /michelson/history
class HistoryTable(HistoryTableMixin):
    column_names = apps.get_app_config('pendulum').column_names
    model = RequestM
    form = GraphForm


# /michelson/preset
class PresetsTable(PresetsTableMixin):
    column_names = apps.get_app_config('pendulum').column_names
    model = PresetM
    form = GraphForm
