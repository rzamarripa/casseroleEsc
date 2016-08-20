angular.module("casserole").controller
("PlaneacionClaseCtrl",PlaneacionClaseCtrl);
function PlaneacionClaseCtrl($scope, $reactive, $meteor, $state, $stateParams, toastr) {
	let rc =$reactive(this).attach($scope);

	this.planeacion = {};
	this.planeacion.fechaCreacion = new Date();
	this.action = true;
	this.nuevo = true;
	console.log($stateParams);
	this.subscribe('planeaciones',()=>{
		return [{maestro_id : $stateParams.maestro_id, materia_id : $stateParams.materia_id, grupo_id : $stateParams.grupo_id, campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""}]
	});
	
	this.subscribe("maestros", () => {
		return [{estatus:true, _id : $stateParams.maestro_id}];
	});
	
	this.subscribe("materias", () => {
		return [{estatus:true, _id : $stateParams.materia_id}];
	});
	
	this.subscribe("grupos", () => {
		return [{estatus:true, _id : $stateParams.grupo_id}];
	})
	
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
	  planeacionesBorrador : () => {
		  return Planeaciones.find({estatus : 1}).fetch();
	  },
	  planeacionesEnviadas : () => {
		  return Planeaciones.find({estatus : 2}).fetch();
	  },
	  planeacionesRevisadas : () => {
		  return Planeaciones.find({estatus : 3}).fetch();
	  },
	  planeacionesPublicadas : () => {
		  return Planeaciones.find({estatus : 4}).fetch();
	  },
	  planeacionesPapelera : () => {
		  return Planeaciones.find({estatus : 5}).fetch();
	  }
  });
  
  this.nuevaPlaneacion = function(){
	  this.nuevo = !this.nuevo;
	  rc.planeacion = {};
		rc.planeacion.fechaCreacion = new Date();
  } 

  this.guardar = function(planeacion){
	  planeacion.estatus = 1;
	  planeacion.grupo_id = $stateParams.grupo_id;
	  planeacion.maestro_id = $stateParams.maestro_id;
	  planeacion.materia_id = $stateParams.materia_id;
	  planeacion.campus_id = Meteor.user().profile.campus_id;
		planeacion.seccion_id = Meteor.user().profile.seccion_id;
	  Planeaciones.insert(planeacion);
	  planeacion = {};
	  toastr.success('Guardado correctamente como borrador.');
		$('.collapse').collapse('hide');	  
		rc.nuevo = true;
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
	
	this.getMateria = function(materia_id){
		if(rc.materia)
		return rc.materia.nombre;
	}
	
	this.getGrupo = function(grupo_id){
		if(rc.grupo)
		return rc.grupo.nombre;
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