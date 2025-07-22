"""
WSGI config for loginapi project.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'loginapi.settings')

application = get_wsgi_application()