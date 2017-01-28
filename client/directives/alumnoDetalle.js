angular.module('casserole').directive('perfil', perfil);
	function perfil () {
  return {
    restrict: 'E',
    templateUrl: 'client/alumnos/_perfil.html'
  }
}
angular.module('casserole').directive('inscripciones', inscripciones);
	function inscripciones () {
  return {
    restrict: 'E',
    templateUrl: 'client/alumnos/_inscripciones.html'
  }
}
angular.module('casserole').directive('inscripcionplanpagos', inscripcionplanpagos);
	function inscripcionplanpagos () {
  return {
    restrict: 'E',
    templateUrl: 'client/alumnos/_inscripcionplanpagos.html'
  }
}
angular.module('casserole').directive('curricula', curricula);
	function curricula () {
  return {
    restrict: 'E',
    templateUrl: 'client/alumnos/_curricula.html'
  }
}
angular.module('casserole').directive('otrospagos', otrospagos);
	function otrospagos () {
  return {
    restrict: 'E',
    templateUrl: 'client/alumnos/_otrospagos.html'
  }
}
angular.module('casserole').directive('historialalumno', historialalumno);
	function historialalumno () {
  return {
    restrict: 'E',
    templateUrl: 'client/alumnos/_historialalumno.html'
  }
}
angular.module('casserole').directive('modalabonar', modalabonar);
	function modalabonar () {
  return {
    restrict: 'E',
    templateUrl: 'client/alumnos/_modalabonar.html'
  }
}