angular.module('casserole').factory('alumnoService', ['$meteor', function ($meteor) {
  return {
    get: get
  };

  function get(id, reactive) {
    reactive = !!reactive;
    return $meteor.object(Alumnos, id, reactive).subscribe("alumnos");
  }
}]);

