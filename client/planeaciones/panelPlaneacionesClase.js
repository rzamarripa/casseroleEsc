angular.module("casserole").controller
("PanelPlaneacionesClaseCtrl",PanelPlaneacionesClaseCtrl);
function PanelPlaneacionesClaseCtrl($scope, $reactive, $meteor, $state, $stateParams, toastr) {
	let rc =$reactive(this).attach($scope);

	this.planeacion = {};
	this.planeacion.fechaCreacion = new Date();
	this.action = true;
	this.nuevo = true;
	this.maestrosReactivos = [];
	
	console.log($stateParams);
	
	this.subscribe('planeaciones',()=>{
		return [{campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""}]
	});
	
	this.subscribe("maestros", () => {
		return [{estatus:true, campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""}];
	});
	
	this.subscribe("grupos", () => {
		return [{estatus:true, seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : ""}];
	});
	
	this.subscribe("materias", () => {
		return [{estatus:true, seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : ""}];
	});
	
	this.subscribe('maestrosMateriasGrupos', () => {		
		return [{maestro_id : { $in : this.getCollectionReactively("maestrosReactivos") }}]
	});
	
	this.helpers({
		resumen : () => {
			var mmgs = MaestrosMateriasGrupos.find().fetch();
			console.log(mmgs)
			if(mmgs != undefined){
				_.each(mmgs, function(mmg){
					mmg.alumnos = [];
					mmg.maestro = Maestros.findOne(mmg.maestro_id);
		      mmg.materia = Materias.findOne(mmg.materia_id);
		      mmg.grupo = Grupos.findOne(mmg.grupo_id);
		      mmg.planeacionesBorrador = Planeaciones.find({estatus : 1, maestro_id : mmg.maestro_id, grupo_id : mmg.grupo_id, materia_id : mmg.materia_id}).count();
		      mmg.planeacionesLiberadas = Planeaciones.find({estatus : 2, maestro_id : mmg.maestro_id, grupo_id : mmg.grupo_id, materia_id : mmg.materia_id}).count();
		      mmg.planeacionesRevisadas = Planeaciones.find({estatus : 3, maestro_id : mmg.maestro_id, grupo_id : mmg.grupo_id, materia_id : mmg.materia_id}).count();
		      mmg.planeacionesPublicadas = Planeaciones.find({estatus : 4, maestro_id : mmg.maestro_id, grupo_id : mmg.grupo_id, materia_id : mmg.materia_id}).count();
				});
			}
			return mmgs;
		},
		planeaciones : () => {
			return Planeaciones.find();
		},
		maestros : () => {
			rc.maestrosReactivos = _.pluck(Maestros.find().fetch(), "_id");
			console.log(rc.maestrosReactivos);
		  return Maestros.find();
	  },
	  materias : () => {
		  return Materias.find();
	  },
	  grupos : () => {
		  return Grupos.find();
	  },
	  planeacionesBorrador : () => {
		  return Planeaciones.find({estatus : 1});
	  },
	  planeacionesEnviadas : () => {
		  return Planeaciones.find({estatus : 2});
	  },
	  planeacionesRevisadas : () => {
		  return Planeaciones.find({estatus : 3});
	  },
	  planeacionesPublicadas : () => {
		  return Planeaciones.find({estatus : 4});
	  },
	  planeacionesPapelera : () => {
		  return Planeaciones.find({estatus : 5});
	  }
  });
	
	this.actualizar = function(asistencia){		
		//Falta implementar el actualizar
		$state.go("root.verAsistencias", {id:$stateParams.id, materia_id: $stateParams.materia_id});
	}
	
	this.getMateria = function(materia_id){
		var materia = Materias.findOne(materia_id);
		if(materia){
			return materia.nombre;
		}
	}
	
	this.getMaestro = function(maestro_id){
		var maestro = Maestros.findOne(maestro_id);
		if(maestro){
			return maestro.nombre + " " + maestro.apPaterno;
		}
	}
	
	this.getGrupo = function(grupo_id){
		var grupo = Grupos.findOne(grupo_id);
		if(grupo){			
			return grupo.nombre;
		}
	}
	
	this.editar = function(planeacion){
		rc.action = false;
		rc.nuevo = false;
		rc.planeacion = planeacion;
		$('.collapse').collapse('show');
	}
	
	this.cambiarEstatus = function(planeacion, estatus){
		Planeaciones.update({_id:planeacion._id},{$set : {estatus : estatus}});
		if(estatus == 1){
			toastr.error('Planeación devuelta como borrador.');
		}else if(estatus == 2){
			toastr.warning('Planeación enviada a revisión.');
		}else if(estatus == 3){
			toastr.success('Planeación revisada, lista para publicar.');
		}else if(estatus == 4){
			toastr.info('Planeación publicada.');
		}
	}
	
	this.duplicar = function(planeacion){
		delete planeacion._id;
		rc.planeacion = planeacion;
		rc.planeacion.estatus = 1;
		$('.collapse').collapse('show');
	}
	
	this.ver = function(planeacion){
		
	}
};