"""Las extensiones viven acá para que los modelos no importen la aplicación.

Sin esto, modelos.py importaría __init__.py y __init__.py importaría
modelos.py: el clásico import circular de Flask.
"""

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
