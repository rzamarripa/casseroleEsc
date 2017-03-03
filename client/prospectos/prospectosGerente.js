angular.module("casserole")
.controller("ProspectosGerenteCtrl", ProspectosGerenteCtrl);  
 function ProspectosGerenteCtrl($scope, $meteor, $reactive, $state, $stateParams, toastr){
 	let rc = $reactive(this).attach($scope); 	
 	
  this.action = true;
  
  this.prospecto = {};
  this.prospecto.profile = {};
  this.buscar = {};
  this.buscar.nombre = '';
  this.buscar.etapaVenta_id = '';
  this.titulo = "";
  
  this.buscarProspectosGerente = function(){
	  if(this.buscar.nombre.length > 3 ){
		  Meteor.apply('buscarProspectosGerente', [{
			    options : { limit: 51 },
			    where : { 
						nombreCompleto : this.getReactively('buscar.nombre'), 
						campus_id :  Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""
					} 		   
		    }], function(error, result){
			  if(result){
				  console.log(result);
				  rc.prospectos = result;
				  NProgress.set(1);
			  }
		
		    $scope.$apply();
		  });
	  }else{
		  rc.prospectos = [];
	  }
  }
};