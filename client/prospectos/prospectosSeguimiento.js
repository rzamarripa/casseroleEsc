angular.module("casserole")
.controller("ProspectosSeguimientoCtrl", ProspectosSeguimientoCtrl);  
 function ProspectosSeguimientoCtrl($scope, $meteor, $reactive, $state, $stateParams, toastr){
 	$reactive(this).attach($scope);
 	
  this.action = true;
  
  this.buscar = {};
  this.buscar.nombre = '';

	this.subscribe('prospectosSeguimiento', () => {
    return [{
	    options : {},
	    where : { nombre : this.getReactively('buscar.nombre')}
    }] ;
  });
  
  this.subscribe("etapasVenta");
  
  this.subscribe("empleados");
    
  this.helpers({
	  prospectosFacebook : () => {
		  return ProspectosFacebook.find();
	  },
	  empleados : () => {
		  return Empleados.find();
	  },
	  etapasVenta : () => {
		  return EtapasVenta.findOne();
	  }
  });
  
  this.guardar = function(prospecto)
	{
		this.prospecto.estatus = 1;
		this.prospecto.fecha = new Date();
		this.prospecto.etapaVenta_id = this.etapaVenta._id;
		ProspectosFacebook.insert(this.prospecto);
		toastr.success('prospecto guardado.');
		this.prospecto = {}; 
		$('.collapse').collapse('hide');
		$state.go('anon.graciasFacebook');
	};
	
	this.asignar = function(prospecto, empleado_id) {
    ProspectosFacebook.update({ _id: prospecto._id }, { $set : { empleado_id : empleado_id, estatus : 2 } } );
	}
	
	this.editar = function(id)
	{
    this.prospecto = ProspectosFacebook.findOne({_id:id});
    this.action = false;
    $('.collapse').collapse("show");
    this.nuevo = false;
	};
	
	this.actualizar = function(prospecto)
	{
		var idTemp = prospecto._id;
		delete prospecto._id;		
		ProspectosFacebook.update({_id:idTemp},{$set:prospecto});
		$('.collapse').collapse('hide');
		this.nuevo = true;
	};
	
	this.eliminar = function(prospecto){
		ProspectosFacebook.remove({_id : prospecto._id});		
	}

	this.cambiarEstatus = function(id)
	{
		var prospecto = prospectos.findOne({_id:id});
		if(prospecto.estatus == true)
			prospecto.estatus = false;
		else
			prospecto.estatus = true;
		
		ProspectosFacebook.update({_id: id},{$set :  {estatus : prospecto.estatus}});
  };	
  
  this.etapaVenta = function(etapaVenta){
	  var etapa = EtapasVenta.findOne(etapaVenta);
	  if(etapa){
		  if(etapa.nombre != undefined){
			  return etapa.nombre;
		  }else{
			  return "cargando...";
		  }
	  }
	  
	  
  }	
  this.vendedor = function(prospecto){
	  var empleado = Empleados.findOne(prospecto);
	  if(empleado != undefined){
		  var nombre = empleado.nombre != undefined ? empleado.nombre + " " : "";
		  var apPaterno = empleado.apPaterno != undefined ? empleado.apPaterno : "";
		  return nombre + apPaterno;
	  }else{
		  return "Sin asignar";
	  }
	  
  }		
};