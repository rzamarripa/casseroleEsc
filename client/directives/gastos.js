angular.module('casserole').directive('cheques', cheques);
	function cheques () {
  return {
    restrict: 'E',
    templateUrl: 'client/gastos/_cheques.ng.html'
  }
}

angular.module('casserole').directive('relaciones', relaciones);
	function relaciones () {
  return {
    restrict: 'E',
    templateUrl: 'client/gastos/_relaciones.ng.html'
  }
}

angular.module('casserole').directive('admon', admon);
	function admon () {
  return {
    restrict: 'E',
    templateUrl: 'client/gastos/_admon.ng.html'
  }
}

angular.module('casserole').directive('depositos', depositos);
	function depositos () {
  return {
    restrict: 'E',
    templateUrl: 'client/gastos/_depositos.ng.html'
  }
}

angular.module('casserole').directive('conceptos', conceptos);
  function conceptos () {
  return {
    restrict: 'E',
    templateUrl: 'client/gastos/_conceptos.ng.html',
  }
}
