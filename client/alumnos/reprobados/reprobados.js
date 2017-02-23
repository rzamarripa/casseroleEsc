
angular
  .module('casserole')
  .controller('AlumnosReprobadosCtrl', AlumnosReprobadosCtrl);
 
function AlumnosReprobadosCtrl($scope, $meteor, $reactive, $state, toastr) {
	let rc = $reactive(this).attach($scope);
  this.alumnosReprobados = [];
  
  window.rc = rc;
	  
  this.getAlumnosReprobados = function(){
	  Meteor.apply("getAlumnosReprobados", [Meteor.user().profile.campus_id], function(error,result){
		  if(result){
			  console.log(result);
			  rc.alumnosReprobados = result;
		  }else{
			  toastr.error("No se encontraron alumnos reprobados");
		  }
		  
		  $scope.$apply();
	  })
  }
}