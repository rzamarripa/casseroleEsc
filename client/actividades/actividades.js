angular.module("casserole")
.controller("ActividadesCtrl", ActividadesCtrl);  
 function ActividadesCtrl($scope, $meteor, $reactive, $state, $stateParams, toastr){
 	$reactive(this).attach($scope);
  this.action = true;
  


  
  this.prospectos_id = [];
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
			_id : {$in:this.getCollectionReactively('prospectos_id')}
		}]
	});

	this.helpers({
	  llamadas : () => {
		  //TODO me quedé haciendo las llamadas
		  var llamadas = Llamadas.find().fetch();
		  llamadas = _.sortBy(llamadas, function(llamada){ return llamada.fecha; });
		  if(llamadas != undefined){
			  this.prospectos_id = _.pluck(llamadas, 'prospecto_id');
			  _.each(llamadas, function(llamada){
				  llamada.prospecto = Prospectos.findOne(llamada.prospecto_id);
			  })
		  }
		  return llamadas;
	  },
	  reuniones : () => {
		  var reuniones = Reuniones.find().fetch();
		  reuniones = _.sortBy(reuniones, function(reunion){ return reunion.fecha; });
		  if(reuniones != undefined){
			  this.prospectos_id = _.pluck(reuniones, 'prospecto_id');
			  _.each(reuniones, function(reunion){
				  reunion.prospecto = Prospectos.findOne(reunion.prospecto_id);
			  })
		  }
		  return reuniones;
	  },
	  tareas : () => {
		  var tareas = Tareas.find().fetch();
		  tareas = _.sortBy(tareas, function(tarea){ return tarea.fecha; });
		  if(tareas != undefined){
			  this.prospectos_id = _.pluck(tareas, 'prospecto_id');
			  _.each(tareas, function(tarea){
				  tarea.prospecto = Prospectos.findOne(tarea.prospecto_id);
			  })
		  }
		  return tareas;
	  },
	  prospectos : () => {
		  return Prospectos.find();
	  }
  });
  
  this.getProspecto = function(prospecto_id){
	  var prospecto = Prospectos.find(prospecto_id);
	  if(prospecto)
	  	return prospecto.nombre;
  }
  
  this.cambiarEstatus = function(tipo, objeto){
	  console.log(tipo);
	  console.log(objeto.estatus);
	  if(tipo == "llamada"){
		  Llamadas.update(objeto._id, {$set:{estatus:objeto.estatus, resultado: objeto.resultado}});
	  }else if(tipo == "reunion"){
		  Reuniones.update(objeto._id, {$set:{estatus:objeto.estatus, resultado: objeto.resultado}});
	  }else if(tipo == "tarea"){
		  Tareas.update(objeto._id, {$set:{estatus:objeto.estatus, resultado: objeto.resultado}});
	  }
	  delete objeto.$$hashKey;
	  console.log(objeto);
	  toastr.success(tipo + ' Guardada.');
	  
	
	}
  	  
  this.nuevo = true;	  
			
};
