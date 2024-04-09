from django import forms

from misc.interface.widgets import RangeInput


class GraphForm(forms.Form):
    z1 = forms.FloatField(label='Длина маятника', min_value=0, step_size=0.001, initial=8)
    z2 = forms.FloatField(label='Разность длин', min_value=0, step_size=0.001, initial=7)
    Rbs = forms.FloatField(label='Амплитуда', min_value=0, step_size=0.000001, initial=0.5)
    tx = forms.FloatField(label='Кол-во', min_value=0, step_size=0.001, initial=1)
    ty = forms.FloatField(label='Размер', min_value=0, step_size=0.001, initial=0)
