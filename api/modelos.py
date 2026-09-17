"""Dos tablas: quién eres y en qué vas.

El progreso se guarda como un solo documento JSON y no desmenuzado en tablas.
Es a propósito: la aplicación ya sabe juntar dos versiones de ese documento sin
perder nada (ver fusionarProgreso en web/js/almacen.js), está probado, y
funciona igual sin conexión. Partirlo en tablas obligaría a reescribir esa
lógica en el servidor y a mantener las dos versiones en sintonía.

El servidor, entonces, es deliberadamente tonto: guarda un texto por persona y
lo devuelve. Toda la inteligencia sigue en el teléfono.
"""

from datetime import datetime, timezone

from werkzeug.security import check_password_hash, generate_password_hash

from api.extensiones import db


def _ahora():
    return datetime.now(timezone.utc)


class Usuario(db.Model):
    __tablename__ = "usuarios"

    id = db.Column(db.Integer, primary_key=True)
    # Se guarda siempre en minúsculas: si no, "Caroline@" y "caroline@" serían
    # dos cuentas distintas y nadie entendería por qué no encuentra su avance.
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    hash_clave = db.Column(db.String(255), nullable=False)
    creado = db.Column(db.DateTime(timezone=True), default=_ahora, nullable=False)
    ultima_entrada = db.Column(db.DateTime(timezone=True))

    # Intentos fallidos seguidos, para frenar a quien pruebe contraseñas.
    intentos_fallidos = db.Column(db.Integer, default=0, nullable=False)
    bloqueado_hasta = db.Column(db.DateTime(timezone=True))

    progreso = db.relationship(
        "Progreso", back_populates="usuario", uselist=False, cascade="all, delete-orphan"
    )

    @staticmethod
    def normalizar_email(email):
        return (email or "").strip().lower()

    def poner_clave(self, clave):
        self.hash_clave = generate_password_hash(clave)

    def clave_correcta(self, clave):
        return check_password_hash(self.hash_clave, clave or "")

    def esta_bloqueado(self):
        if not self.bloqueado_hasta:
            return False
        tope = self.bloqueado_hasta
        if tope.tzinfo is None:
            tope = tope.replace(tzinfo=timezone.utc)
        return tope > _ahora()


class UsoTutor(db.Model):
    """Cuántos mensajes le ha mandado alguien al tutor hoy.

    Va en su propia tabla y no como dos columnas más en 'usuarios' por una
    razón práctica: el esquema se crea con db.create_all(), que sabe crear
    tablas nuevas pero NO sabe agregar columnas a una que ya existe. Añadirlas
    a 'usuarios' funcionaría en un computador limpio y fallaría en silencio
    contra la base que ya está en producción.

    Existe porque el tutor es lo único que cuesta dinero: sin un tope, una
    sesión robada o un bucle en el cliente se come el crédito en una tarde.
    """

    __tablename__ = "uso_tutor"

    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(
        db.Integer, db.ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False, index=True
    )
    dia = db.Column(db.String(10), nullable=False)  # AAAA-MM-DD
    mensajes = db.Column(db.Integer, default=0, nullable=False)

    __table_args__ = (db.UniqueConstraint("usuario_id", "dia", name="uq_uso_tutor_dia"),)


class Progreso(db.Model):
    __tablename__ = "progresos"

    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(
        db.Integer, db.ForeignKey("usuarios.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    # Texto y no JSON de la base: el documento se guarda y se devuelve tal cual,
    # sin que el servidor necesite entenderlo ni validar su forma interna.
    datos = db.Column(db.Text, nullable=False, default="{}")
    guardado_en = db.Column(db.DateTime(timezone=True), default=_ahora, onupdate=_ahora)

    usuario = db.relationship("Usuario", back_populates="progreso")
