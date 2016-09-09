angular
.module("casserole")
.controller("MaestroAsistenciasCtrl", MaestroAsistenciasCtrl);
 function MaestroAsistenciasCtrl($scope, $meteor, $reactive , $state, $stateParams, toastr){

 	let rc = $reactive(this).attach($scope);
 	
 	window.rc = rc;
 	
 	
 	this.hoy = new Date();
	this.asistencia = {};
	this.sePuede = false;
	this.grupo = {};
	this.semana = moment().isoWeek();
	this.turno_id = "";
	this.fechaInicio = new Date();
	this.fechaInicio.setHours(0,0,0,0);
	this.fechaFin = new Date();
	this.fechaFin.setHours(24,0,0,0);
	this.alumnos_id = [];
	
	console.log(this.semana);
	
	this.subscribe('asistencias', ()  => {
		return [{ grupo_id : $stateParams.grupo_id, semana : this.semana }]
	});
	
	this.subscribe('grupos', () => {		
		return [{
			_id : $stateParams.grupo_id
		}]
	});
	
	this.subscribe('alumnos', () => {		
		return [{
			_id : { $in : this.getCollectionReactively("alumnos_id")}
		}]
	});
	
	this.subscribe('maestros', () => {		
		return [{
			_id : $stateParams.maestro_id
		}]
	});
	
	this.subscribe('materias', () => {		
		return [{
			_id : $stateParams.materia_id
		}]
	});
	
	this.subscribe('turnos', () => {		
		return [{
			_id : this.getReactively("turno_id")
		}]
	});

	this.helpers({		
		grupo : () => {
			return Grupos.findOne();
		},
		maestro : () => {
			return Maestros.findOne($stateParams.maestro_id);
		},
		materia : () => {
			return Materias.findOne($stateParams.materia_id);
		},
		alumnos : () => {
			if(this.getReactively("grupo")){
				rc.turno_id = rc.grupo.turno_id;
				rc.alumnos_id = rc.grupo.alumnos;
				var grupo = Grupos.findOne({},{ fields : { alumnos : 1 }});
				return grupo.alumnos;
			}
		},
		turno : () => {
			return Turnos.findOne();
		},
		existeAsistencia : () => {
			return Asistencias.findOne({ fechaAsistencia : { $gte : this.fechaInicio, $lt : this.fechaFin}});
		},
		cantidadAsistenciasRealizadas : () => {
			return Asistencias.find().count();
		},
		asistenciasPermitidas : () => {
			var asistenciasP = Turnos.findOne({},{fields : { asistencias : 1 }});
			if(asistenciasP){
				console.log(asistenciasP);
				return asistenciasP.asistencias;
			}			
		},
		listaAsistencia : () => {
			var resultado = {};
			
			if(this.getReactively("existeAsistencia") != undefined && this.getReactively("alumnos")){
				rc.sePuede = true;
				rc.existe = true;
				_.each(rc.existeAsistencia.alumnos, function(alumno){
					var al = Meteor.users.findOne(alumno._id);
					if(al)
						alumno.profile.fotografia = rc.tieneFoto(al.profile.sexo, al.profile.fotografia);
				});
				console.log("asistencia actualizar", rc.existeAsistencia);
				return rc.existeAsistencia;				
			}else{
				rc.existe = false;
				console.log("no existe");
				if(this.getReactively("cantidadAsistenciasRealizadas") < this.getReactively("asistenciasPermitidas")){
					console.log("Si se puede");
					resultado.alumnos = [];
					resultado.fechaCreacion = new Date();
					var alumnosGrupo = 
					_.each(rc.grupo.alumnos, function(alumno){
						resultado.alumnos = Meteor.users.find({roles : ["alumno"]},{ fields : { 
																																						"profile.nombreCompleto" : 1,
																																						"profile.matricula" : 1,
																																						"profile.fotografia" : 1,
																																						_id : 1
																																				}}).fetch();
					});
					rc.sePuede = true;
				}else{
					console.log("No se puede");
					rc.sePuede = false;
				}
			}
			
			console.log("nueva asistencia", resultado);
			return resultado;
		}
  });
  
  this.guardar = function(asistencia){
	  _.each(asistencia.alumnos, function(alumno){
		  delete alumno.profile.fotografia;
	  });
	  asistencia.fechaAsistencia = new Date();
	  asistencia.materia_id = rc.materia._id;
	  asistencia.maestro_id = rc.maestro._id;
	  asistencia.grupo_id = rc.grupo._id;
	  asistencia.semana = rc.semana;
	  Asistencias.insert(asistencia);
	  toastr.success('Ha tomado asistencia correctamente.');
  }
  
  this.actualizar = function(asistencia){
	  var tempId = asistencia._id;
	  delete asistencia._id;
	  _.each(asistencia.alumnos, function(alumno){
		  delete alumno.profile.fotografia;
	  });
	  asistencia.fechaActualizacionAsistencia = new Date();
	  Asistencias.update({_id : tempId}, { $set : asistencia });
	  toastr.success('Ha actualizado la asistencia correctamente.');
  }
  
  this.tieneFoto = function(sexo, foto){
	  if(foto === undefined){
		  if(sexo === "masculino")
			  return "img/badmenprofile.jpeg";
			else if(sexo === "femenino"){
				return "img/badgirlprofile.jpeg";
			}else{
				return "img/badprofile.jpeg";
			}
			  
	  }else{
		  return foto;
	  }
  }  
};