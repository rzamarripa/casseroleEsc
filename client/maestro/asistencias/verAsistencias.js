angular.module("casserole")
.controller("MaestroVerAsistenciasCtrl",MaestroVerAsistenciasCtrl);  
function MaestroVerAsistenciasCtrl($scope, $meteor, $reactive, $state, $stateParams, toastr, $compile) {
	
	let rc=$reactive(this).attach($scope);
	var alumnos_id = [];
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
		return [{ grupo_id : $stateParams.grupo_id }]
	});

	this.helpers({
	  grupo : () => {
		  var grupo = Grupos.findOne();
		  if(grupo)
				rc.alumnos_id = grupo.alumnos;
		  return Grupos.findOne();
	  },
	  materia : () => {
		  return Materias.findOne();
	  },
	  alumnos : () => {
		  return Meteor.users.find({roles : ["alumno"]});
	  },
	  asistencias : () => {
	  	return Asistencias.find({},{ sort : {fechaAsistencia : 1}});
	  },
	  existenAsistencias : () => {
		  return Asistencias.find().count();
	  },
	  alumnosAsistidos : () => {
		  var transmutar = {};
		  var arregloCoincidencias = [];
		  if(this.getReactively("existenAsistencias")>0){
			  _.each(this.getReactively("asistencias"), function(asistencia){
				  _.each(asistencia.alumnos, function(alumno){											  
							if("undefined" == typeof transmutar[alumno.profile.nombreCompleto]){
								transmutar[alumno.profile.nombreCompleto]={};
								transmutar[alumno.profile.nombreCompleto].nombre = alumno.profile.nombreCompleto; 
								transmutar[alumno.profile.nombreCompleto].matricula = alumno.profile.matricula; 
								transmutar[alumno.profile.nombreCompleto].fotografia = alumno.profile.fotografia; 
								transmutar[alumno.profile.nombreCompleto].dias = [];
							}
							transmutar[alumno.profile.nombreCompleto].dias.push(alumno.estatus);
						})
			  })
		  }else{
			  toastr.success('No hay asistencias que mostrar.');
		  }
		  
		  
		  console.log("transmutar", transmutar)
			return _.toArray(transmutar);

	  }
  });
  
  
};
