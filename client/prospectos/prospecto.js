angular.module("casserole")
.controller("ProspectoCtrl", ProspectoCtrl);  
 function ProspectoCtrl($scope, $meteor, $reactive, $state, $stateParams, toastr){
 	rc = $reactive(this).attach($scope);
  
  this.subscribe('prospecto', () => {
    return [{
	    _id : $stateParams.id
    }];
  });
  
  this.subscribe('secciones', function(){
	  return [{
		  estatus:true, campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""
	  }]
  });
  
  this.subscribe('ocupaciones', () => {
    return [{
			estatus : true
    }];
  });
  
  this.subscribe('etapasVenta', function(){
	  return [{
		  estatus:true, campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""
	  }]
  });
  
  this.subscribe('llamadas', () => {
    return [{
	    prospecto_id : $stateParams.id
    }];
  });
  
  this.subscribe('reuniones', () => {
    return [{
	    prospecto_id : $stateParams.id
    }];
  });
  
  this.subscribe('tareas', () => {
    return [{
	    prospecto_id : $stateParams.id
    }];
  });
  
  this.subscribe("mediosPublicidad",()=>{
		return [{estatus:true }]
	});


  
  this.helpers({
	  prospecto : () => {
		  return Prospectos.findOne({});
	  },
	  llamadas : () => {
		  return Llamadas.find();
	  },
	  reuniones : () => {
		  return Reuniones.find();
	  },
	  tareas : () => {
		  return Tareas.find();
	  },
	  etapasVenta : () => {
		  return EtapasVenta.find({},{sort : {orden : 1}});
	  },
	  secciones : () => {
		  return Secciones.find();
	  },
	  mediosPublicidad : () => {
		  return MediosPublicidad.find();
	  },
	  ocupaciones : () => {
		  return Ocupaciones.find();
	  }
	});
  
  this.nuevaLlamada = true;
  this.llamada = {};
  this.reunion = {};
  this.Tarea = {};
  this.fechaActual = new Date();
  this.actionLlamada = true;
  this.actionReunion = true;
  this.actionTarea = true;
  this.otroMedioSeleccionado = false;
  
  this.tipoComidas = [
    'Comida Mexicana',
    'Comida Mediterranea',
    'Comida Oriental',
    'Comida Internacional', 
    'Comida Vegetariana',
    'Repostería',
    'Enología y Coctelería'
  ]; 
    
  // Prospecto
	
	this.editar = function(id)
	{
    this.prospecto = Prospectos.findOne({_id:id});
    this.action = false;
    $('.collapse').coll
    this.nuevo = false;
	};
	
	this.actualizar = function(prospecto)
	{
		var idTemp = prospecto._id;
		delete prospecto._id;
		var porInscribir = EtapasVenta.findOne({orden : 3});
		if(prospecto.profile.etapaVenta_id == porInscribir._id){
			prospecto.profile.estatus = 2;
		}else{
			prospecto.profile.estatus = 1;
		}
		prospecto.profile.fechaUltimoContacto = new Date();
		Prospectos.update({_id:idTemp},{$set:prospecto});
		$('.collapse').collapse('hide');
		this.nuevo = true;
	};

	this.cambiarEstatus = function(id)
	{
		var prospecto = prospectos.findOne({_id:id});
		if(prospecto.estatus == true)
			prospecto.estatus = false;
		else
			prospecto.estatus = true;
			
		Prospectos.update($stateParams.id, { $set : {estatus : prospecto.estatus, "profile.fechaUltimoContacto":new Date() } } )
  };  
  
  this.tomarFoto = function () {
		$meteor.getPicture().then(function(data){			
			rc.prospecto.fotografia = data;
		})
	};
	
	this.cambiarEtapaVenta = function(etapaVenta){
	};
  
  // Llamadas
  
  this.guardarLlamada = function(llamada){
	  llamada.prospecto_id = $stateParams.id;
	  llamada.fechaCreacion = new Date();
	  llamada.vendedor_id = Meteor.userId();
	  llamada.estatus = false;
	  Llamadas.insert(llamada);
	  Prospectos.update($stateParams.id, { $set : {"profile.fechaUltimoContacto":new Date() } } )
	  this.validarPrimeraActividad(llamada.prospecto_id);
	  this.llamada = {};
	  $('.collapseLlamada').collapse('hide');
  };
  
  this.editarLlamada = function(llamada)
	{
    this.llamada = llamada
    this.actionLlamada = false;
		$('.collapseLlamada').collapse('show');
	};
	
	this.actualizarLlamada = function(llamada)
	{
		var idTemp = llamada._id;
		delete llamada._id;	
		delete llamada.$$hashKey;	
		Llamadas.update({_id:idTemp},{$set:llamada});
		Prospectos.update($stateParams.id, { $set : {"profile.fechaUltimoContacto":new Date() } } )
		$('.collapseLlamada').collapse('hide');
		this.actionLlamada = true;
	};
  
  // Reuniones
  
  this.guardarReunion = function(reunion){
	  reunion.prospecto_id = $stateParams.id;
	  reunion.fechaCreacion = new Date();
	  reunion.vendedor_id = Meteor.userId();
	  reunion.estatus = false;
	  Reuniones.insert(reunion);
	  Prospectos.update($stateParams.id, { $set : {"profile.fechaUltimoContacto":new Date() } } )
	  this.validarPrimeraActividad(reunion.prospecto_id);
	  this.reunion = {};
	  $('.collapseReunion').collapse('hide');
  };
  
  this.editarReunion = function(reunion)
	{
    this.reunion = reunion;
    this.actionReunion = false;
		$('.collapseReunion').collapse('show');
	};
	
	this.actualizarReunion = function(reunion)
	{
		var idTemp = reunion._id;
		delete reunion._id;		
		delete reunion.$$hashKey;	
		Reuniones.update({_id:idTemp},{$set:reunion});
		Prospectos.update($stateParams.id, { $set : {"profile.fechaUltimoContacto":new Date() } } )
		$('.collapseReunion').collapse('hide');
		this.actionReunion = true;
	};
  
  // Tareas
  
  this.guardarTarea = function(tarea){
	  tarea.prospecto_id = $stateParams.id;
	  tarea.fechaCreacion = new Date();
	  tarea.vendedor_id = Meteor.userId();
	  tarea.estatus = false;
	  Tareas.insert(tarea);
	  this.validarPrimeraActividad(tarea.prospecto_id);
	  Prospectos.update($stateParams.id, { $set : {"profile.fechaUltimoContacto":new Date() } } )
	  this.tarea = {};
	  $('.collapseTarea').collapse('hide');
  };
  
  this.editarTarea = function(tarea)
	{
    this.tarea = tarea
    this.actionTarea = false;
		$('.collapseTarea').collapse('show');
    this.actionTarea = false;
	};
	
	this.actualizarTarea = function(tarea)
	{
		var idTemp = tarea._id;
		delete tarea._id;		
		delete tarea.$$hashKey;	
		Tareas.update({_id:idTemp},{$set:tarea});
		Prospectos.update($stateParams.id, { $set : {"profile.fechaUltimoContacto":new Date() } } )
		$('.collapseTarea').collapse('hide');
		this.actionTarea = true;
	};
	
	this.getEtapaVenta = function(etapaVenta_id){
	  var etapaVenta = EtapasVenta.findOne(etapaVenta_id);
	  if(etapaVenta)
	  	return etapaVenta.nombre;
  };
  
  this.seleccionarSeccion = function(seccion){
	  this.prospecto.estudioInteres = seccion.nombreseccion; 
	  this.prospecto.seccion_id = seccion._id
  };
		
	this.eliminarLlamada = function(llamada){
		var res = confirm("Está seguro que quiere eliminar la llamada, no se podrá recuperar");
		if(res){
			Llamadas.remove({_id : llamada._id});
			toastr.success("Se eliminó correctamente");
		}			
	}
	
	this.eliminarReunion = function(reunion){
		var res = confirm("Está seguro que quiere eliminar la reunión, no se podrá recuperar");
		if(res){
			Reuniones.remove({_id : reunion._id});
			toastr.success("Se eliminó correctamente");
		}			
	}
	
	this.eliminarTarea = function(tarea){
		var res = confirm("Está seguro que quiere eliminar la tarea, no se podrá recuperar");
		if(res){
			Tareas.remove({_id : tarea._id});
			toastr.success("Se eliminó correctamente");
		}			
	}
	
	this.validarPrimeraActividad = function(prospecto_id){
		var etapaVenta = EtapasVenta.findOne(rc.prospecto.profile.etapaVenta_id);
		console.log(etapaVenta);
		if(etapaVenta.orden == 1){
			if(rc.llamadas.length > 0 || rc.reuniones.length > 0 || rc.tareas.length > 0){
				var seguimiento = EtapasVenta.findOne({orden : 2});
				console.log(seguimiento);
				Prospectos.update(prospecto_id, { $set : {"profile.etapaVenta_id" : seguimiento._id}});
				toastr.success("El prospecto ahora está en Seguimiento");
			}
		}
	}
	
	this.seleccionarMedio = function(medio_id){
		var medio = MediosPublicidad.findOne(medio_id);
		if(medio.nombre == "Otro"){
			rc.otroMedioSeleccionado = true;
		}else{
			rc.otroMedioSeleccionado = false;
			rc.prospecto.profile.otroMedio = undefined;
		}
	}
};
