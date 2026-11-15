from email.message import EmailMessage
from smtplib import SMTP
from ssl import create_default_context
from app.core.config.settings import settings


def enviar_aviso_smtp(destino: str, asunto: str, contenido: str) -> None:
    mensaje = EmailMessage()
    mensaje["To"] = destino
    mensaje["From"] = settings.AVISO_SMTP_REMITENTE
    mensaje["Subject"] = asunto
    mensaje.set_content(contenido)

    with SMTP(settings.AVISO_SMTP_HOST, settings.AVISO_SMTP_PORT, timeout=10) as cliente:
        if settings.AVISO_SMTP_STARTTLS:
            cliente.starttls(context=create_default_context())
        if settings.AVISO_SMTP_USUARIO:
            cliente.login(settings.AVISO_SMTP_USUARIO, settings.AVISO_SMTP_PASSWORD)
        cliente.send_message(mensaje)
