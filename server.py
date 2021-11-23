from typing import Optional

import flask
from flask.helpers import _endpoint_from_view_func  # type:ignore
import werkzeug
import werkzeug.exceptions

import logging

from .authentication.authenticationController import AuthenticationController

log = logging.getLogger(__name__.split(".")[-1])


class Server(flask.Flask):
    _instance = None  # type: Optional["Server"]

    def __init__(self, import_name, **kwargs):
        if Server._instance is not None:
            raise ValueError("Duplicate singleton creation")

        # If the constructor is called and there is no instance, set the instance to self.
        # This is done because we can't make constructor private
        Server._instance = self

        # Create the authentication container, this keeps track of sessions and authenticated users.
        self._authentication = AuthenticationController()

        # Call parent init after it's guaranteed it's the only one.
        super().__init__(import_name, **kwargs)

        # Override all default exceptions with JSON errors.
        # This is to prevent the server from returning HTML errors.
        for code in werkzeug.exceptions.default_exceptions:
            self.register_error_handler(code, self._createJSONError)
        self._version = ""
        self._exposed_objects = []

        # Disable the default werkzeug logger, this logs all http requests, which spams the logs
        logging.getLogger('werkzeug').disabled = True

        # [!! add the line below to add CORS support !!]
        self.after_request(self.allow_cors)

    def addExposedObject(self, exposed_object):
        self._exposed_objects.append(exposed_object)

    ## Get a reference to the authentication controller.
    #  @return AuthenticationController object that is used for authentication of the printer API.
    def getAuthenticationController(self):
        return self._authentication

    # add_url_rule: Function override from the flask server.
    # Done to add our authentication controller to each API call.
    # [CodeStyle: Overridden function from flask]
    def add_url_rule(self, rule, endpoint=None, view_func=None, provide_automatic_options=None, **options) -> None:
        log.debug("adding rule: %s" % rule)

        # Check if we need to add an authentication wrapper.
        authenticated_methods = options.pop("authenticated_methods", ["POST", "PUT", "DELETE"])
        if len(authenticated_methods) > 0:
            if endpoint is None:    # Create an endpoint name here if it was not set, else it is generated from our authentication function, which will generated duplicate endpoints.
                endpoint = _endpoint_from_view_func(view_func)
            view_func = self._authentication.wrapViewFunction(view_func, authenticated_methods)

        super().add_url_rule(rule, endpoint=endpoint, view_func=view_func,
                             provide_automatic_options=provide_automatic_options, **options)

    # Override to ensure that the objects are only registered when the server is actually started.
    def registerAll(self):
        for exposed_object in self._exposed_objects:
            exposed_object.register()
            for child in exposed_object.getAllChildren():
                child.register()

    # Return the singleton instance of the application object
    @classmethod
    def getInstance(cls):
        # Note: Explicit use of class name to prevent issues with inheritance.
        if Server._instance is None:
            Server._instance = cls()

        return Server._instance

    def _createJSONError(self, exception):
        response = flask.jsonify(message=str(exception))
        if isinstance(exception, werkzeug.exceptions.HTTPException):
            response.status_code = exception.code
        else:
            response.status_code = 500
        return response

    # [...at the bottom of the class add this method to provide open access via CORS]
    @staticmethod
    def allow_cors(response):
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response
