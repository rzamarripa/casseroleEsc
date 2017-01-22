angular.module("casserole")
.controller("ActividadesCtrl", ActividadesCtrl);  
 function ActividadesCtrl($scope, $meteor, $reactive, $state, $stateParams, toastr){
 	let rc = $reactive(this).attach($scope);
  this.action = true;
	this.nuevo = true; 
  this.prospectosLlamadas_id = [];
  this.prospectosReuniones_id = [];
  this.prospectosTareas_id = [];
  this.prospectos_ids = [];
  this.llamadas = [];
  this.reuniones = [];
  this.tareas = [];
  
	this.subscribe('llamadas', function(){
		return [{
			vendedor_id : Meteor.userId(),
			estatus : false
		}]
	});
	this.subscribe('reuniones', function(){
		return [{
			vendedor_id : Meteor.userId(),
			estatus : false
		}]
	});
	this.subscribe('tareas', function(){
		return [{
			vendedor_id : Meteor.userId(),
			estatus : false
		}]
	});
	this.subscribe('prospecto', () => {
		return [{
			_id : {$in:this.getCollectionReactively('prospectos_ids')}
		}]
	});

	this.helpers({
	  llamadas : () => {
		  var llamadas = Llamadas.find({
				vendedor_id : Meteor.userId(),
				estatus : false
			}).fetch();
		  llamadas = _.sortBy(llamadas, function(llamada){ return llamada.fecha; });
		  if(this.llamadas != undefined){
			  _.each(llamadas, function(llamada){
				  rc.prospectos_ids.push(llamada.prospecto_id);
				  llamada.prospecto = Prospectos.findOne(llamada.prospecto_id);
			  })
		  }
		  return llamadas;
	  },
	  reuniones : () => {
		  var reuniones = Reuniones.find({
				vendedor_id : Meteor.userId(),
				estatus : false
			}).fetch();
		  reuniones = _.sortBy(reuniones, function(reunion){ return reunion.fecha; });
		  if(reuniones != undefined){
			  rc.prospectosReuniones_id = [];
			  rc.prospectosReuniones_id = _.pluck(reuniones, 'prospecto_id');
			  _.each(reuniones, function(reunion){
				  rc.prospectos_ids.push(reunion.prospecto_id);
				  reunion.prospecto = Prospectos.findOne(reunion.prospecto_id);
			  })
		  }
		  return reuniones;
	  },
	  tareas : () => {
		  var tareas = Tareas.find({
				vendedor_id : Meteor.userId(),
				estatus : false
			}).fetch();
		  tareas = _.sortBy(tareas, function(tarea){ return tarea.fecha; });
		  if(tareas != undefined){
			  rc.prospectosTareas_id = [];
			  rc.prospectosTareas_id = _.pluck(tareas, 'prospecto_id');
			  _.each(tareas, function(tarea){
				  rc.prospectos_ids.push(tarea.prospecto_id);
				  tarea.prospecto = Prospectos.findOne(tarea.prospecto_id);
			  })
		  }
		  return tareas;
	  }
  });

  this.cambiarEstatus = function(tipo, objeto){
	  if(tipo == "llamada"){
		  Llamadas.update(objeto._id, {$set:{estatus:objeto.estatus, resultado: objeto.resultado}});
	  }else if(tipo == "reunion"){
		  Reuniones.update(objeto._id, {$set:{estatus:objeto.estatus, resultado: objeto.resultado}});
	  }else if(tipo == "tarea"){
		  Tareas.update(objeto._id, {$set:{estatus:objeto.estatus, resultado: objeto.resultado}});
	  }
	  delete objeto.$$hashKey;
	  toastr.success(tipo + ' Guardada.');
	}
};
