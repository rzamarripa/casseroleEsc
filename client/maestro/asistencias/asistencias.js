angular
.module("casserole")
.controller("MaestroAsistenciasCtrl", MaestroAsistenciasCtrl);
 function MaestroAsistenciasCtrl($scope, $meteor, $reactive , $state, $stateParams, toastr){

 	let rc = $reactive(this).attach($scope);
 	
 	this.hoy = new Date();
	this.asistencia = {};
	this.asistencia.alumnos = this.getReactively("alumnos");
	this.alumnos_id = [];
	this.seccion_id = "";
	this.sePuede = false;
	this.existe = false;
	
	console.log($stateParams)
	
	this.subscribe('secciones', () => {		
		return [{	_id : this.getReactively("seccion_id") }]
	});
	
	this.subscribe('asistencias', ()  => {
		return [{ grupo_id : $stateParams.grupo_id }]
	})
	
	this.subscribe('horarios', () => {		
		return [{
			_id : $stateParams.horario_id
		}]
	});
	
	this.subscribe('grupos', () => {		
		return [{
			_id : $stateParams.grupo_id
		}]
	});
	
	this.subscribe('maestros', () => {		
		return [{
			_id : Meteor.user().profile.maestro_id
		}]
	});
	
	this.subscribe('materias', () => {		
		return [{
			_id : $stateParams.materia_id
		}]
	});

	this.subscribe('inscripciones', () => {		
		return [{
			grupo_id : $stateParams.grupo_id, estatus : 1
		}]
	});

	this.subscribe('alumnos', () => {		
		return [{
			_id : { $in : this.getCollectionReactively('alumnos_id')}
		}]
	});

	this.subscribe('maestrosMateriasGrupos', () => {
		return [{
			grupo_id: $stateParams.grupo_id
		}]
	});

	this.helpers({		
		grupo : () => {
			return Grupos.findOne($stateParams.grupo_id);
		},
		maestro : () => {
			return Maestros.findOne($stateParams.maestro_id);
		},
		materia : () => {
			return Materias.findOne($stateParams.materia_id);
		},
		horario : () => {
			return Horarios.findOne($stateParams.horario_id);
		},
		seccion : () => {
			return Secciones.findOne();
		},
		alumnosGrupo : () => {
			var grupo = Grupos.findOne($stateParams.grupo_id);
			rc.alumnos_id = _.pluck(Inscripciones.find().fetch(), "alumno_id");
			rc.seccion_id = this.getReactively("grupo.seccion_id");
			return Meteor.users.find({roles : ["alumno"]}).fetch();
		},
		alumnos : () => {
			if(this.alumnosGrupo){
				var alumnos = [];
				_.each(this.getReactively("alumnosGrupo"), function(al){
					alumnos.push({alumno_id : al._id, 
												matricula : al.profile.matricula, 
												nombreCompleto : al.profile.nombreCompleto, 
												matricula : al.profile.matricula, 
												estatus : true });
				});
				
				return alumnos;
			}
		},
		mmg : () => {
			return MaestrosMateriasGrupos.findOne({grupo_id : $stateParams.grupo_id})
		},
		asistencias : () => {
			return Asistencias.find().fetch();
		},
		listaAsistencia : () => {
			var resultado = {};
			var esTarde = true;
			var hayClase = false;
			if(this.getReactively("horario") && this.getReactively("asistencias")){
				console.log("se cargaron");
				_.each(rc.asistencias, function(asistencia){
					if(moment(asistencia.fechaAsistencia).isSame(new Date(), "day")){
						console.log("mismo día", asistencia.fechaAsistencia);
						
						rc.existe = true;
						console.log("ms si existe", ms);
						if(Meteor.user().roles[0] == "maestro"){
							if(ms <= 900000 && ms >= 0){
								var ms = moment(new Date(),"YYYY/MM/DD HH:mm:ss").diff(moment(asistencia.fechaInicio,"YYYY/MM/DD HH:mm:ss"));
								console.log("se puede tomar asistencia");								
								rc.sePuede = true;
								resultado = asistencia;
							}else{
								console.log('Ya no es tiempo para actualizar la asistencia');
							}
						}else{
							console.log("se puede tomar asistencia");								
							rc.sePuede = true;
							resultado = asistencia;
						}
					}
				})
				console.log(rc.existe);
				if(!rc.existe){
					console.log("no existe asistencia")
					_.each(rc.horario.clases, function(clase){
						if(moment(clase.start).isSame(new Date(), "day")){
							console.log("hay Clase hoy");
							hayClase = true;
								
							console.log("ms",ms);
							if(Meteor.user().roles[0] == "maestro"){
								var ms = moment(new Date(),"YYYY/MM/DD HH:mm:ss").diff(moment(clase.start,"YYYY/MM/DD HH:mm:ss"));
								if(ms <= 900000 && ms >= 0){
									console.log("se puede");
									rc.sePuede = true;
									resultado.fechaInicio = clase.start;
									resultado.alumnos = Meteor.users.find({roles : ["alumno"]},{ fields : { 
																																						"profile.nombreCompleto" : 1,
																																						"profile.matricula" : 1,
																																						"profile.fotografia" : 1,
																																						_id : 1
																																				}}).fetch();
								}
							}else{
								rc.sePuede = true;
								resultado.fechaInicio = clase.start;
								resultado.alumnos = Meteor.users.find({roles : ["alumno"]},{ fields : { 
																																					"profile.nombreCompleto" : 1,
																																					"profile.matricula" : 1,
																																					"profile.fotografia" : 1,
																																					_id : 1
																																			}}).fetch();
							}
							
						}
					})
				}
			}
			
			console.log(resultado);
			return resultado;
		}
  });
  
  this.horario = Horarios.findOne($stateParams.horario_id);
  
  this.guardar = function(asistencia){
	  asistencia.fechaAsistencia = new Date();
	  asistencia.materia_id = rc.materia._id;
	  asistencia.maestro_id = rc.maestro._id;
	  asistencia.grupo_id = rc.grupo._id;
	  asistencia.maestroMateriaGrupo_id = rc.mmg._id;
	  Asistencias.insert(asistencia);
	  toastr.success('Ha tomado asistencia correctamente.');
  }
  
  this.actualizar = function(asistencia){
	  var tempId = asistencia._id;
	  delete asistencia._id;
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