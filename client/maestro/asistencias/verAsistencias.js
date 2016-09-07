angular.module("casserole")
.controller("MaestroVerAsistenciasCtrl",MaestroVerAsistenciasCtrl);  
function MaestroVerAsistenciasCtrl($scope, $meteor, $reactive, $state, $stateParams, toastr, $compile) {
	
	let rc=$reactive(this).attach($scope);
	var alumnos_id = [];
	this.asistencia = {};
	this.horario_id = "";
 
	this.subscribe('grupos',()=>{
		return [{_id : $stateParams.grupo_id, estatus:true}]
	});
	
	this.subscribe('materias',()=>{
		return [{_id : $stateParams.materia_id, estatus:true}]
	});
	
	this.subscribe('horarios',()=>{
		return [{_id : this.getReactively("horario_id"), estatus:true}]
	});
	
	this.subscribe('alumnos', () => {		
		return [{_id : { $in : this.getCollectionReactively('alumnos_id')}}]
	});
	
	this.subscribe('asistencias',()=>{
		return [{grupo_id : $stateParams.grupo_id, materia_id : $stateParams.materia_id, maestro_id : $stateParams.maestro_id}]
	});

	this.helpers({
	  grupo : () => {
		  var grupo = Grupos.findOne();
		  if(grupo)
			  this.horario_id = grupo.horario_id;
		  return Grupos.findOne();
	  },
	  materia : () => {
		  return Materias.findOne();
	  },
	  alumnos : () => {
		  return Meteor.users.find();
	  },
	  asistencias : () => {
	  	return Asistencias.find();
	  },
	  horarios : () => {
		  return Horarios.find();
	  },
	  horario : () => {
		  return Horarios.findOne();
	  },
	  alumnosAsistidos : () => {
		  var transmutar = {};
		  var arregloCoincidencias = [];
		  if(this.horarios && this.asistencias){
			  var horariosOrdenados = Horarios.find({},{ sort : {fechaIncio : 1}}).fetch();
			  _.each(rc.getReactively("horarios"), function(horario){
					_.each(horario.clases, function(clase){
						var coincidencias = _.filter(rc.getReactively("asistencias"), function(asistencia){
							return moment(asistencia.fechaAsistencia).isSame(clase.start, "day");
						});
						if(coincidencias[0] == undefined ){
							arregloCoincidencias.push({});
						}else{
							arregloCoincidencias.push(coincidencias[0]);
						}
						
				  })
			  });
			  
			  _.each(arregloCoincidencias, function(coincidencia){
				  if(coincidencia.alumnos == undefined){
					  coincidencia.alumnos = [];
					  _.each(rc.alumnos, function(alumno){
						  if(alumno.roles == ["alumno"]){
							  coincidencia.alumnos.push({
									estatus : false,
									profile : alumno.profile
								});
						  }						  
					  })
					  
				  }
				  _.each(coincidencia.alumnos, function(alumno){											  
						if("undefined" == typeof transmutar[alumno.profile.nombreCompleto]){
							transmutar[alumno.profile.nombreCompleto]={};
							transmutar[alumno.profile.nombreCompleto].nombre = alumno.profile.nombreCompleto; 
							transmutar[alumno.profile.nombreCompleto].matricula = alumno.profile.matricula; 
							transmutar[alumno.profile.nombreCompleto].fotografia = alumno.profile.fotografia; 
							transmutar[alumno.profile.nombreCompleto].dias = [];
						}
						transmutar[alumno.profile.nombreCompleto].dias.push(alumno.estatus);
					})
			  });
		  }
			return _.toArray(transmutar);

	  }
  });
  
  
};
