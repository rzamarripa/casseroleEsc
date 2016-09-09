angular
.module("casserole")
.controller("GruposDetalleCtrl", GruposDetalleCtrl);
 function GruposDetalleCtrl($scope, $meteor, $reactive , $state, $stateParams){
	 
 	let rc = $reactive(this).attach($scope);

 	this.grupo = {};
  this.action = true;
  this.alumnos_id = [];
  this.asignacion = {};
  
  console.log($stateParams)
  console.log(this.getCollectionReactively("alumnos_id"))
  
  this.subscribe('alumnos', () => {		
		return [{
			_id : { $in : this.getCollectionReactively('alumnos_id')}
		}]
	});
  
  this.subscribe('grupos', () => {
	  return [{_id : $stateParams.grupo_id }]
  });
	
	this.helpers({
	  grupo : () => {
			return Grupos.findOne();
	  },
	  alumnos : () => {
		  if(this.getReactively("grupo")){
			  rc.alumnos_id = rc.grupo.alumnos;
		  }

			return Meteor.users.find({roles : ["alumno"]});
	  },
	  asignacion : () => {
		  var asignacionActiva = {};
		  if(this.getReactively("grupo")){
			  var grupo = Grupos.findOne({},{ fields : { asignaciones : 1 }});			  
			  _.each(grupo.asignaciones, function(asignacion){
				  if(asignacion.estatus == true){
					  console.log(asignacion);
					  asignacionActiva = asignacion;
				  }				  	
			  })
		  }
		  return asignacionActiva;
	  }
  });
  
  this.actualizar = function(grupo)
	{
		delete grupo._id;		
		Grupos.update({_id:$stateParams.id}, {$set : grupo});
		toastr.success('Grupo modificado.');
		$state.go("root.grupos");
	};	
};