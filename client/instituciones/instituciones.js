angular.module("casserole").controller("InstitucionesCtrl", ['$scope', '$meteor', '$state','$stateParams', 'toastr',function($scope, $meteor, $state, $stateParams, toastr)
{
	$scope.instituciones = $meteor.collection(Instituciones).subscribe("instituciones");
  	$scope.action = true;  
  	$scope.nuevo = true;
  $scope.nuevaInstitucion = function()
  {
    $scope.action = true;
    $scope.nuevo = !$scope.nuevo;
    $scope.institucion = {};
  };
  
  $scope.guardar = function(institucion)
	{
		$scope.instituciones.save(institucion);
		toastr.success('Intitucion guardada.');
		$('.collapse').collapse('hide');
		$scope.nuevo = true;
	};
	
	$scope.editar = function(id)
	{
    $scope.institucion = $meteor.object(Instituciones, id, false);
    $scope.action = false;
    $('.collapse').collapse('show');
    $scope.nuevo = false;
	};
	
	$scope.actualizar = function(institucion)
	{
		$scope.institucion.save();
		$('.collapse').collapse('hide');
		$scope.nuevo = true;
	};
		
	$scope.cambiarEstatus = function(id)
	{
		var institucion = $meteor.object(Instituciones, id, false);
		if(institucion.estatus == true)
			institucion.estatus = false;
		else
			institucion.estatus = true;
		
		institucion.save();
	};
}]);