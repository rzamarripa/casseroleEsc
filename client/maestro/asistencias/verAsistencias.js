angular.module("casserole")
.controller("MaestroVerAsistenciasCtrl",MaestroVerAsistenciasCtrl);  
function MaestroVerAsistenciasCtrl($scope, $meteor, $reactive, $state, $stateParams, toastr, $compile) {
	
	let rc=$reactive(this).attach($scope);
	var alumnos_id = [];
	this.materia_id = "";
	this.grupo_id = "";
	this.fechaActual = new Date();
	window.rc = rc;
	
	this.subscribe('grupos',()=>{
		return [{_id : $stateParams.grupo_id, estatus:true}]
	});
	
	this.subscribe('materias',()=>{
		return [{_id : $stateParams.materia_id, estatus:true}]
	});
	
	this.subscribe('alumnos', () => {		
		return [{_id : { $in : this.getCollectionReactively('alumnos_id')}}]
	});
	
	this.subscribe('asistencias', ()  => {
		return [{ grupo_id : $stateParams.grupo_id, materia_id : $stateParams.materia_id, maestro_id : $stateParams.maestro_id}]
	});

	this.helpers({
	  grupo : () => {
		  var grupo = Grupos.findOne({_id : $stateParams.grupo_id});
		  if(grupo){
			  rc.alumnos_id = _.pluck(grupo.alumnos, "alumno_id");
			  rc.grupo_id = grupo._id;
			  
			  _.each(grupo.asignaciones, function(asignacion){
				  if(asignacion.estatus == true){
					  rc.materia_id = asignacion.materia_id;
				  }
			  })
			  
		  }
				
		  return grupo;
	  },
	  asignacion : () => {
		  var asignacion1 = {};
		  if(this.getReactively("grupo")){
			  _.each(rc.getReactively("grupo.asignaciones"), function(asignacion){
				  if(asignacion.estatus == true){
					  asignacion1 = asignacion;
				  }
			  })
			  return asignacion1;
		  }
	  },
	  materia : () => {
		  return Materias.findOne();
	  },
	  alumnos : () => {
		  var alumnos = Meteor.users.find({roles : ["alumno"]}).fetch();
		  return alumnos;
	  },
	  asistencias : () => {
	  	var asistencias = Asistencias.find({},{ sort : {fechaAsistencia : 1}}).fetch();
	  	if(this.getReactively("grupo") || this.getReactively("alumnos_id") != undefined){
		  	_.each(rc.getReactively("alumnos"),function(alumno){
			  	_.each(asistencias, function(alumnoAsistencia){
				  	if(alumnoAsistencia.alumno_id == alumno._id){
					  	alumnoAsistencia.profile = {};
					  	alumnoAsistencia.profile.nombreCompleto = alumno.profile.nombreCompleto;
					  	alumnoAsistencia.profile.matricula = alumno.profile.matricula;
					  	alumnoAsistencia.profile.fotografia = alumno.profile.fotografia;
				  	}
			  	})
		  	})
	  	}
	  	return asistencias;
	  },
	  diasUnicos : () => {
		  var arreglo = {};
		  _.each(this.getReactively("asistencias"), function(asistencia){
			  if(arreglo[asistencia.fechaAsistencia] == undefined){
				  arreglo[asistencia.fechaAsistencia] = {};
				  arreglo[asistencia.fechaAsistencia].fecha = asistencia.fechaAsistencia;
			  }
		  });
		  return _.toArray(arreglo);
	  },
	  existenAsistencias : () => {
		  return Asistencias.find().count();
	  },
	  alumnosAsistidos : () => {
		  var transmutar = {};
		  var arregloCoincidencias = [];
		  if(this.getReactively("existenAsistencias")>0){
			  _.each(rc.getReactively("asistencias"), function(alumno){
					if(alumno.profile != undefined && "undefined" == typeof transmutar[alumno.profile.nombreCompleto]){
						transmutar[alumno.profile.nombreCompleto]={};
						transmutar[alumno.profile.nombreCompleto]._id = alumno.alumno_id;
						transmutar[alumno.profile.nombreCompleto].nombre = alumno.profile.nombreCompleto; 
						transmutar[alumno.profile.nombreCompleto].matricula = alumno.profile.matricula; 
						transmutar[alumno.profile.nombreCompleto].fotografia = alumno.profile.fotografia; 
						transmutar[alumno.profile.nombreCompleto].dias = [];
						transmutar[alumno.profile.nombreCompleto].dias.push(alumno.estatus);
					}else if(alumno.profile != undefined){
						transmutar[alumno.profile.nombreCompleto].dias.push(alumno.estatus);
					}
			  })
		  }
			transmutar = _.toArray(transmutar);
			return transmutar;
	  }
  });
  
  
  this.compare = function(a,b) {
	  if (a.nombre < b.nombre)
	    return -1;
	  if (a.nombre > b.nombre)
	    return 1;
	  return 0;
	}
	
	/*
		11 - 21
		12 - 22
		
		
		
		
	*/
  
  
};
