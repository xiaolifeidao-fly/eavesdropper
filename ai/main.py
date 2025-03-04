from api.register import register
from api.register.register import app
from lib.settings.configuration import config
from lib.utils import log

register.run()
port = config.getint("SERVER", "port")
debug = True
try:
    debug = config.getboolean("SERVER", "debug")
except:
    pass

log.info("start api")
if debug:
    app.run(port=port)
log.info("start api success ")
