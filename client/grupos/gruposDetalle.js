angular
.module("casserole")
.controller("GruposDetalleCtrl", GruposDetalleCtrl);
 function GruposDetalleCtrl($scope, $meteor, $reactive , $state, $stateParams){
	 
 	$reactive(this).attach($scope);

 	this.grupo = {};
  this.action = true;

	this.subscribe('inscripciones', () => {
	  return [{
		  grupo_id : $stateParams.id
	  }];
  });
  
  this.subscribe('alumnos', () => {
	  return [{estatus:true}]
  });
  
  this.subscribe('grupos');
	
	this.helpers({
	  inscripciones : () => {
			return Inscripciones.find();
	  },
	  alumnos : () => {
			return Alumnos.find();
	  },
	  grupo : () => {
			return Grupos.findOne();
	  },
  });
  
  this.actualizar = function(grupo)
	{
		delete grupo._id;		
		Grupos.update({_id:$stateParams.id}, {$set : grupo});
		toastr.success('Grupo modificado.');
		$state.go("root.grupos");
	};
  	
	this.getAlumno = function(alumno_id){
		alumno = _.find(this.alumnos,function(x){return x._id==alumno_id;});
		if(alumno)
			return [alumno.matricula, alumno.nombre + " " + alumno.apPaterno + " " + alumno.apMaterno];
	}
	
};