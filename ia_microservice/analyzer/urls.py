"""
URLs for the analyzer app.
"""

from django.urls import path

from analyzer import views

app_name = 'analyzer'

urlpatterns = [
    path('health/', views.health_check, name='health-check'),
    path('analyze/', views.analyze, name='analyze'),
]
