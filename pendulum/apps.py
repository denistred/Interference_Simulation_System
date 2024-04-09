from django.apps import AppConfig


class MichelsonConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'pendulum'
    column_names = (
        "Длина маятника",
        "Разность длин",
        "Амплитуда",
        "Кол-во",
        "Размер",
        "Наклон зеркала по Y",
    )
