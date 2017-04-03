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
				  rc.prospectos = result[0];
				  rc.etapasVenta = result[1];
				  rc.vendedores = result[2];
				  NProgress.set(1);
			  }
		
		    $scope.$apply();
		  });
	  }else{
		  rc.prospectos = [];
	  }
  }
  
  this.cambiarEtapaVenta = function(prospecto_id, etapaVenta_id){
	  console.log(prospecto_id, etapaVenta_id);
	  Prospectos.update({_id : prospecto_id},{ $set : {"profile.etapaVenta_id" : etapaVenta_id}});
	  toastr.success("Ha cambiado la Etapa de Venta");
  }
  
  this.cambiarAsesorVenta = function(prospecto_id, vendedor_id){
	  console.log(prospecto_id, vendedor_id);
	  Prospectos.update({_id : prospecto_id},{ $set : {"profile.vendedor_id" : vendedor_id}});
	  toastr.success("Ha cambiado de Asesor");
  }
  
  this.eliminar = function(prospecto){
		Prospectos.remove({_id : prospecto._id});		
		this.buscarProspectosGerente();
	}
};