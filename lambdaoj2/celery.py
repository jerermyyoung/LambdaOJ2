import os
import dotenv
import celery
import raven
from raven.contrib.celery import register_signal, register_logger_signal
from django.conf import settings


dotenv.read_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)),
                                '.env'))
# set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lambdaoj2.settings')


class Celery(celery.Celery):

    def on_configure(self):
        if settings.SENTRY_DSN:
            client = raven.Client(settings.SENTRY_DSN)

            # register a custom filter to filter out duplicate logs
            register_logger_signal(client)

            # hook into the Celery error handler
            register_signal(client)


app = Celery('lambdaoj2')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
# - namespace='CELERY' means all celery-related configuration keys
#   should have a `CELERY_` prefix.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django app configs.
app.autodiscover_tasks()


@app.task(bind=True)
def debug_task(self):
    print('Request: {0!r}'.format(self.request))
