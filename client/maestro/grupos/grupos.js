angular
.module("casserole")
.controller("MaestroGruposCtrl", MaestroGruposCtrl);
 function MaestroGruposCtrl($scope, $meteor, $reactive , $state, $stateParams){

 	let rc = $reactive(this).attach($scope);
	this.grupos_id = [];
	this.maestros_id = [];
	this.materias_id = [];
	this.alumnos_id = [];
	moment.locale('es');
		
	this.subscribe('secciones', () => {		
		return [{	_id : this.seccion_id }]
	});
	this.hoy = new Date();
	
	this.subscribe('grupos', () => {		
		return [{
			_id : {$in:this.getCollectionReactively('grupos_id')}, estatus : true
		}]
	});
	this.subscribe('maestros', () => {
		return [{
			_id : Meteor.user().profile.maestro_id
		}]
	});
	this.subscribe('materias', () => {		
		return [{
			_id : {$in:this.getCollectionReactively('materias_id')}
		}]
	});

	this.subscribe('inscripciones', () => {		
		return [{
			grupo_id : {$in:this.getCollectionReactively('grupos_id')}
		}]
	});

	this.subscribe('alumnos', () => {		
		return [{
			_id : {$in:this.getCollectionReactively('alumnos_id')}
		}]
	});

	this.subscribe('maestrosMateriasGrupos', () => {		
		return [{
			maestro_id: Meteor.user().profile.maestro_id, estatus : true
		}]
	});

	this.helpers({		
		grupo : () => {			
			return Grupos.findOne($stateParams.id);
		},
		mmgs : ()=>{
			var mmgs = MaestrosMateriasGrupos.find().fetch();
			if(mmgs != undefined){
				this.grupos_id = _.pluck(mmgs, 'grupo_id');
				this.materias_id = _.pluck(mmgs, 'materia_id');
				this.maestros_id = _.pluck(mmgs, 'maestro_id');
				_.each(mmgs, function(mmg){
					mmg.alumnos = [];
					mmg.maestro = Maestros.findOne(mmg.maestro_id);
		      mmg.materia = Materias.findOne(mmg.materia_id);
		      mmg.grupo = Grupos.findOne(mmg.grupo_id);
	       	var inscripciones = Inscripciones.find({grupo_id:mmg.grupo_id}).fetch();
	       	alumnos_id = _.pluck(inscripciones, 'alumno_id');
	       	if(rc.alumnos_id != undefined)
	       		rc.alumnos_id = _.union(rc.alumnos_id, alumnos_id);
	       	else
	       		rc.alumnos_id = alumnos_id;
			     	_.each(inscripciones,function(inscripcion){
			        var alumno = Meteor.users.findOne({_id:inscripcion.alumno_id});
			        mmg.alumnos.push(alumno);
			      });
				});
				return mmgs
			}

		}
  });
  
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
  
  this.abrirCalificaciones = function(seccion_id){
	  var seccion = Secciones.findOne(seccion_id);
	  console.log(seccion_id);
	  if(seccion){
		  console.log(seccion.abrirCalificaciones)
		  return seccion.abrirCalificacaciones;
	  }
		  
  }
};