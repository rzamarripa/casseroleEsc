angular.module("casserole").controller
("RevisarPlaneacionClaseCtrl",RevisarPlaneacionClaseCtrl);
function RevisarPlaneacionClaseCtrl($scope, $reactive, $meteor, $state, $stateParams, toastr) {
	let rc =$reactive(this).attach($scope);

	this.planeacion = {};
	this.planeacion.fechaCreacion = new Date();
	this.action = true;
	this.nuevo = true;
	
	this.subscribe('planeaciones',()=>{
		return [{campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "", materia_id : $stateParams.materia_id, maestro_id : $stateParams.maestro_id, grupo_id : $stateParams.grupo_id }]
	});
	
	this.subscribe("maestros", () => {
		return [{estatus:true, campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "", _id : $stateParams.maestro_id}];
	});
	
	this.subscribe("grupos", () => {
		return [{estatus:true, seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : "", _id : $stateParams.grupo_id}];
	});
	
	this.subscribe("materias", () => {
		return [{estatus:true, seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : "", _id : $stateParams.materia_id}];
	});
	
	this.helpers({		
		planeaciones : () => {
			return Planeaciones.find();
		},
		maestro : () => {
		  return Maestros.findOne();
	  },
	  materia : () => {
		  return Materias.findOne();
	  },
	  grupo : () => {
		  return Grupos.findOne();
	  },
	  planeacionesEnviadas : () => {
		  return Planeaciones.find({estatus : 2}).fetch();
	  },
	  planeacionesRevisadas : () => {
		  return Planeaciones.find({estatus : 3}).fetch();
	  },
	  planeacionesPublicadas : () => {
		  return Planeaciones.find({estatus : 4}).fetch();
	  }
  });
  
  this.nuevaPlaneacion = function(){
	  rc.planeacion = {};
	  rc.nuevo = true;
	  rc.action = true;
  }
	
	this.actualizar = function(planeacion){
		console.log(planeacion);
		idTemp = planeacion._id;
		delete planeacion._id;
		delete planeacion.$$hashKey;
		console.log(planeacion);
		Planeaciones.update({_id:idTemp}, {$set : planeacion});
		planeacion = {};
	  toastr.success('Actualizado correctamente.');
		$('.collapse').collapse('hide');
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
		console.log(planeacion);
		rc.planeacion = planeacion;
		rc.nuevo = false;
		rc.action = false;
		$('.collapse').collapse('show');
	}

};