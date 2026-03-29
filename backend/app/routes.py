from flask import Blueprint, jsonify
from . import db

bp = Blueprint('main', __name__)

@bp.route('/health')
def health():
    return jsonify({'status': 'OK'})