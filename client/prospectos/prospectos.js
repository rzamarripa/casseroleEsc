angular.module("casserole")
.controller("ProspectosCtrl", ProspectosCtrl);  
 function ProspectosCtrl($scope, $meteor, $reactive, $state, $stateParams, toastr){
 	let rc = $reactive(this).attach($scope); 	
 	
  this.action = true;
  
  this.prospecto = {};
  this.prospecto.profile = {};
  this.buscar = {};
  this.buscar.nombre = '';
  this.buscar.etapaVenta_id = '';
  this.titulo = "";
  
  if($stateParams.vendedor_id){
	  
	  this.subscribe('prospectosPorVendedor', () => {
	    return [{
		    "profile.estatus" : 1,
		    "profile.etapaVenta_id" : this.getReactively("buscar.etapaVenta_id"),
		    "profile.vendedor_id" : $stateParams.vendedor_id
	    }];
	  });
	  
  }else{
	  this.subscribe('prospectosPorVendedor', () => {
	    return [{

		    "profile.etapaVenta_id" : this.getReactively("buscar.etapaVenta_id"),
		    "profile.vendedor_id" : Meteor.userId()
	    }];
	  });
  }
  
  this.subscribe("ocupaciones", () => {
	  return [{estatus : true}];
  });
  
  this.subscribe('secciones', function(){
	  return [{
		  estatus:true, campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""
	  }]
  });
  
  this.subscribe("etapaVenta", () =>{
	  return  [{estatus:true, campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }]
  });

  this.subscribe("mediosPublicidad",()=>{
		return [{estatus:true }]
	 });
  
  this.helpers({
	  prospectos : () => {
		  return Prospectos.find();
	  },
	  etapaVenta : () => {
		  return EtapasVenta.findOne({orden : 1});
	  },
	  etapasVenta : () => {
		  return EtapasVenta.find({}, {sort: {orden: 1}});
	  },
	  secciones : () => {
		  return Secciones.find();
	  },
	  ocupaciones : () => {
		  return Ocupaciones.find();
	  },
	   mediosPublicidad : () => {
		  return MediosPublicidad.find();
	  },
  });
  
  this.guardar = function(prospecto, form)
	{
		//Validación
		if(form.$invalid){
			this.validation = true;
      toastr.error('Por favor llene toda la información requerida.');
      return;
    }
    
    //Buscar si hay repetidos
    var repetidos = Prospectos.find({
	    "profile.nombre": prospecto.profile.nombre,
	    "profile.apPaterno": prospecto.profile.apPaterno
	  }).fetch();
	  
	  
	  //Hay repetidos
	  if(repetidos.length > 0){
		  
		  //Fecha de Nacimiento Elegida
	    var mes = prospecto.profile.fechaNac.getMonth() + 1;
	    var fechaNacimiento = mes + '-' + 
														prospecto.profile.fechaNac.getDate() + '-' +
														prospecto.profile.fechaNac.getFullYear();
			
			//Recorrer repetidos para comparar la fecha de nacimiento
		  _.each(repetidos, function(repetido){
			  
			  //Obtener el mes de nacimiento y obtener la fecha completa
			  var mesRepetido = repetido.profile.fechaNac.getMonth() + 1;
			  var repetidoFechaNac = mesRepetido + '-' +
			  											 repetido.profile.fechaNac.getDate() + '-' +
			  											 repetido.profile.fechaNac.getFullYear();
			  
			  //Es igual la fecha de nacimiento (ya mucha coincidencia)
			  if(fechaNacimiento == repetidoFechaNac){
				  //Ver si ya pasaron más de 3 días que correponden a 259200000 milisegundos
				  var ms = moment(new Date(),"YYYY/MM/DD").diff(moment(repetido.profile.fechaUltimoContacto,"YYYY/MM/DD"));
				  toastr.error(repetido.profile.nombre + " " + repetido.profile.apPaterno + ' ya está asignado.');
				  if(ms >= 259200000 && Meteor.userId() != repetido.profile.vendedor_id){
					  toastr.success(repetido.profile.nombre + " " + repetido.profile.apPaterno + ' es tuyo.');
					  //Proponer quitarle el prospecto al vendedor anterior
					  toastr.error('Este prospecto NO ha sido atendido en 3 días o más');				  
					  var r = confirm("Quieres darle seguimiento a este prospecto tu, esto hará que se te asigne?");
					  if(r == true){
						  Prospectos.update(repetido._id, {$set : { "profile.vendedor_id" : Meteor.userId()}});
						  toastr.success("Prospecto reasignado")
					  }else{
						  toastr.success("Por favor notifica al vendedor que le de seguimiento")
					  }
				  }else{
					  
				  }
			  }else{
				  //No se encontró un prospecto igual y se insertará.
				  prospecto.profile.estatus = 1;
				  var nombre = prospecto.profile.nombre != undefined ? prospecto.profile.nombre + " " : "";
					var apPaterno = prospecto.profile.apPaterno != undefined ? prospecto.profile.apPaterno + " " : "";
					var apMaterno = prospecto.profile.apMaterno != undefined ? prospecto.profile.apMaterno : "";
					prospecto.profile.nombreCompleto = nombre + apPaterno + apMaterno;
					prospecto.profile.fecha = new Date();
					prospecto.profile.etapaVenta_id = rc.etapaVenta._id;
					prospecto.profile.vendedor_id = Meteor.userId();
					prospecto.profile.campus_id = Meteor.user().profile.campus_id;
					prospecto.profile.fechaUltimoContacto = new Date();
					var prospecto_id = Prospectos.insert(prospecto);
					toastr.success('prospecto guardado.');
					$state.go('root.prospecto',{id : prospecto_id});
			  }			  
		  })
	  }else{
		  //No se encontró un prospecto igual y se insertará.
		  prospecto.profile.estatus = 1;
		  var nombre = prospecto.profile.nombre != undefined ? prospecto.profile.nombre + " " : "";
			var apPaterno = prospecto.profile.apPaterno != undefined ? prospecto.profile.apPaterno + " " : "";
			var apMaterno = prospecto.profile.apMaterno != undefined ? prospecto.profile.apMaterno : "";
			prospecto.profile.nombreCompleto = nombre + apPaterno + apMaterno;
			prospecto.profile.fecha = new Date();
			prospecto.profile.etapaVenta_id = rc.etapaVenta._id;
			prospecto.profile.vendedor_id = Meteor.userId();
			prospecto.profile.campus_id = Meteor.user().profile.campus_id;
			prospecto.profile.fechaUltimoContacto = new Date();
			var prospecto_id = Prospectos.insert(prospecto);
			toastr.success('prospecto guardado.');
			$state.go('root.prospecto',{id : prospecto_id});
	  }
    
		//this.prospecto = {}; 
		$('.collapse').collapse('hide');
	};
	
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
		Prospectos.update({_id:idTemp},{$set:prospecto});
		$('.collapse').collapse('hide');
		this.nuevo = true;
	};
	
	this.eliminar = function(prospecto){
		Prospectos.remove({_id : prospecto._id});		
	}

	this.cambiarEstatus = function(id)
	{
		var prospecto = prospectos.findOne({_id:id});
		if(prospecto.estatus == true)
			prospecto.estatus = false;
		else
			prospecto.estatus = true;
		
		Prospectos.update({_id: id},{$set :  {estatus : prospecto.estatus}});
  };		
  
  this.getEtapaVenta = function(etapaVenta_id){
	  var etapaVenta = EtapasVenta.findOne(etapaVenta_id);
	  if(etapaVenta)
	  	return etapaVenta.nombre;
  }
  
  this.filtrarEtapaVenta = function(etapaVenta_id, etapaNombre){
	  this.buscar.etapaVenta_id = etapaVenta_id;
	  this.titulo = etapaNombre;
  }
  
  this.tomarFoto = function () {
		$meteor.getPicture({width:200, height: 200, quality: 50}).then(function(data){			
			rc.prospecto.profile.fotografia = data;
		})
		
		$meteor.getPicture({width:60, height: 60, quality: 50}).then(function(data){			
			rc.prospecto.profile.thumbnail = data;
		})
	};
};