angular
.module("casserole")
.controller("ResumenAcademicoCtrl", ResumenAcademicoCtrl);
function ResumenAcademicoCtrl($scope, $meteor, $reactive,  $state, $stateParams, toastr) {
	
	let rc = $reactive(this).attach($scope);
	
	this.maestros_id = [];
  
	this.subscribe('gruposResumen',()=>{
		return [{ where : {seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : ""},
							fields : { fields : { inscripcion : 0, colegiatura : 0, conceptosComision : 0 }}}]
	});
	
	this.subscribe('maestros',()=>{
		return [{ _id : { $in : this.getCollectionReactively("maestros_id") }, estatus : true, campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }]
	});
	
  this.helpers({
	  grupos : () => {
		  return Grupos.find();
	  }
  });
  
  this.getMaestro = function(maestro_id){
		var maestro = Maestros.findOne(maestro_id);
		if(maestro)
			return maestro.nombre + " " + maestro.apPaterno;
	}
  
	// me quedé modificando esto
};