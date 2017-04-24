angular
.module("casserole")
.controller("MaestroAsistenciasCtrl", MaestroAsistenciasCtrl);
 function MaestroAsistenciasCtrl($scope, $meteor, $reactive , $state, $stateParams, toastr){

 	let rc = $reactive(this).attach($scope);
 	
 	this.hoy = new Date();
	this.asistencia = {};
	this.sePuede = false;
	this.grupo = {};
	this.semana = moment().isoWeek();
	this.turno_id = "";
	this.fechaInicio = new Date();
	this.fechaInicio.setHours(0,0,0,0);
	this.fechaFin = new Date();
	this.fechaFin.setHours(23,59,59,0);
	this.alumnos_id = [];
	this.unClick = false;
	//console.log($stateParams)
	window.rc = rc;
	if($stateParams.fechaAsistencia){
		//console.log("fechaAsistencia", new Date($stateParams.fechaAsistencia));
		this.fechaInicio = new Date($stateParams.fechaAsistencia);
		this.fechaInicio.setHours(0,0,0,0);
		this.fechaFin = new Date($stateParams.fechaAsistencia);
		this.fechaFin.setHours(23,59,59,0);
		this.hoy = new Date($stateParams.fechaAsistencia);
		//console.log(rc.fechaInicio, rc.fechaFin)
		this.subscribe('asistencias', ()  => {
			return [{ fechaAsistencia : { $gte : rc.fechaInicio, $lt : rc.fechaFin }, grupo_id : $stateParams.grupo_id, materia_id : $stateParams.materia_id, maestro_id : $stateParams.maestro_id }];
		});
	}else{
		this.subscribe('asistencias', ()  => {
			return [{ fechaAsistencia : { $gte : this.fechaInicio, $lt : this.fechaFin}, grupo_id : $stateParams.grupo_id, materia_id : $stateParams.materia_id, maestro_id : $stateParams.maestro_id}]
		});
	}
		
	this.subscribe('grupo', () => {		
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
			return Grupos.findOne($stateParams.grupo_id);
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
				

				return rc.alumnos_id;
			}
		},
		turno : () => {
			return Turnos.findOne();
		},
		existeAsistencia : () => {
			var asistencias = Asistencias.find({ }).fetch();		
			if(asistencias.length > 0){
				rc.alumnos_id = _.pluck(asistencias, "alumno_id");
			}else{
				if(rc.grupo)
					rc.alumnos_id = _.pluck(rc.grupo.alumnos, "alumno_id");
			}
			return asistencias;
		},
		cantidadAsistenciasRealizadas : () => {
			return Asistencias.find().count();
		},
		asistenciasPermitidas : () => {
			var asistenciasP = Turnos.findOne({},{fields : { asistencias : 1 }});
			if(asistenciasP){
				return asistenciasP.asistencias;
			}			
		},
		listaAsistencia : () => {
			var resultado = {};
			if(rc.existeAsistencia){
				if(this.getReactively("existeAsistencia").length > 0 && this.getReactively("alumnos_id")){
					rc.sePuede = true;
					rc.existe = true;
					if(rc.existeAsistencia.length > 0){
						if(rc.existeAsistencia.length < rc.alumnos_id.length){
							//console.log("nuevos alumnos");
							var alumnosAsistidos = _.pluck(rc.existeAsistencia, "alumno_id");
							//console.log("asistidos", alumnosAsistidos);
							var alumnosGrupo = rc.alumnos_id;
							//console.log("alumnos ex", alumnosGrupo);
							var alumnosNuevos = _.difference(alumnosGrupo, alumnosAsistidos);
							//console.log("alumnos Nuevos", alumnosNuevos);
							if(alumnosNuevos.length > 0){
								_.each(alumnosNuevos, function(alumno_id){
									rc.existeAsistencia.push({
										estatus : 1,
										fechaCreacion : new Date(),
										fechaAsistencia : new Date(),
										materia_id : $stateParams.materia_id,
										maestro_id : $stateParams.maestro_id,
										grupo_id : $stateParams.grupo_id,
										semana : moment().isoWeek(),
										alumno_id : alumno_id
									})
								})
							}
						}
						_.each(rc.existeAsistencia, function(asistencia){						
							var al = Meteor.users.findOne(asistencia.alumno_id,{ fields : { 
													"profile.nombreCompleto" : 1,
													"profile.matricula" : 1,
													"profile.fotografia" : 1,
													"profile.sexo" : 1,
													"profile.estatus" : 1,
													_id : 1
											}},{ sort : { "profile.nombreCompleto" : 1}});
							if(al){
								asistencia.profile = al.profile;
								if(al.profile.fotografia === undefined){
								  if(al.profile.sexo === "masculino")
									  al.profile.fotografia = "img/badmenprofile.png";
									else if(al.profile.sexo === "femenino"){
										al.profile.fotografia = "img/badgirlprofile.png";
									}else{
										al.profile.fotografia = "img/badprofile.png";
									}
							  }else{
								  alumno.profile.fotografia = al.profile.fotografia;
								}					
							}
								//alumno.profile.fotografia = rc.tieneFoto(al.profile.sexo, al.profile.fotografia);
						});
					}
					return rc.existeAsistencia;				
				}else{
					rc.existe = false;
					//console.log("entré aquí");
					//if(this.getReactively("cantidadAsistenciasRealizadas") < this.getReactively("asistenciasPermitidas")){
					alumnos = [];
					resultado.fechaCreacion = new Date();
					alumnos = Meteor.users.find({roles : ["alumno"]},{ fields : { 
																																					"profile.nombreCompleto" : 1,
																																					"profile.matricula" : 1,
																																					"profile.fotografia" : 1,
																																					"profile.sexo" : 1,
																																					"profile.estatus" : 1,
																																					_id : 1
																																			}},{ sort : { "profile.nombreCompleto" : 1}}).fetch();
					_.each(alumnos, function(alumno){
						alumno.estatus = 1;
						alumno.fechaCreacion = new Date();
					})
					rc.sePuede = true;
	/*
					}else{
						rc.sePuede = false;
					}
	*/
				}
			}
			
			//alumnos = _.toArray(alumnos);
			return rc.existeAsistencia;
		}
  });
  
  this.compare = function(a,b) {
	  if (a.profile.nombreCompleto < b.profile.nombreCompleto)
	    return -1;
	  if (a.profile.nombreCompleto > b.profile.nombreCompleto)
	    return 1;
	  return 0;
	}
  
  this.guardar = function(asistencias){
	  NProgress.set(0.5);
	  this.unClick = true;
	  _.each(asistencias, function(alumno){
		  alumno.fechaAsistencia = new Date();
		  alumno.fechaCreacion = new Date();
		  alumno.materia_id = rc.materia._id;
		  alumno.maestro_id = rc.maestro._id;
		  alumno.grupo_id = rc.grupo._id;
		  alumno.semana = rc.semana;
		  alumno.alumno_id = alumno._id;
	  });
	  
	  //console.log(asistencias);

	  Meteor.apply("tomarAsistencia", [asistencias], function(error, result){
		  if(result == "listo"){
			  toastr.success('Ha tomado asistencia correctamente.');
			  NProgress.set(1);
			}else{
				toastr.error("No se pudo tomar la asistencia, intente más tarde.")
			}
			$scope.$apply();
	  });	  
  }
  
  this.actualizar = function(asistencias){
	  _.each(asistencias, function(alumno){
		  delete alumno.profile.fotografia;
		  alumno.fechaActualizacionAsistencia = new Date();
	  });
	  //console.log(asistencias);

	  Meteor.apply("actualizarAsistencia", [asistencias], function(error, result){
		  if(result == "listo"){
			  toastr.success('Ha actualizado la asistencia correctamente.');
			  NProgress.set(1);
			}else{
				toastr.error("No se pudo actualizar la asistencia, intente más tarde.")
			}
			$scope.$apply();
	  });
  }
  
  this.tomarAsistencia = function(estatus, $index){
	  if(estatus == undefined || estatus == 0){
		  rc.listaAsistencia[$index].estatus = 1;
	  }else if(estatus == 1){
		  rc.listaAsistencia[$index].estatus = 2;
	  }else if(estatus == 2){
		  rc.listaAsistencia[$index].estatus = 0;
	  }
  }
  
  this.getColor = function(estatus, $index){
	  if(estatus == undefined || estatus == 0){
		  return 'busy';
		}else if(estatus == 1){
			return 'online';
		}else if(estatus == 2){
			return 'away';
		}
  }
  
  this.getColorFondo = function(estatus, $index){
	  if(estatus == undefined || estatus == 0){
		  return 'bg-color-red';
		}else if(estatus == 1){
			return 'bg-color-green';
		}else if(estatus == 2){
			return 'bg-color-yellow';
		}
  }
  
  this.tieneFoto = function(sexo, foto){
	  if(foto === undefined){
		  if(sexo === "masculino")
			  return "img/badmenprofile.png";
			else if(sexo === "femenino"){
				return "img/badgirlprofile.png";
			}else{
				return "img/badprofile.png";
			}			  
	  }else{
		  return foto;
	  }
  } 
};