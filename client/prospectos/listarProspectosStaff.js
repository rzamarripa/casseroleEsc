angular.module("casserole")
.controller("ProspectosFacebookStaffCtrl", ProspectosFacebookStaffCtrl);  
 function ProspectosFacebookStaffCtrl($scope, $meteor, $reactive, $state, $stateParams, toastr){
 	$reactive(this).attach($scope); 	
 	
  this.action = true;
  
  this.prospecto = {};
  
  this.prospecto.tipoComidasSeleccionadas = [];
  
  this.tipoComidas = [
    'Comida Mexicana',
    'Comida Mediterranea',
    'Comida Oriental',
    'Comida Internacional', 
    'Comida Vegetariana',
    'Repostería',
    'Enología y Coctelería'
  ];  
  
  this.buscar = {};
  this.buscar.nombre = '';

	this.subscribe('prospectosFacebookStaff', () => {
    return [{
	    options : { limit: 10 },
	    where : { nombre : this.getReactively('buscar.nombre'), estatus : 2, empleado_id : Meteor.user().profile.empleado_id }
    }] ;
  });
  
  this.subscribe("etapaVenta", () =>{
	  return [{orden : "1", estatus : true}]
  });
  
  this.subscribe('prospectoFacebook', () => {
    return [{
	    id : $stateParams.id
    }];
  });
  
  this.helpers({
	  prospectosFacebook : () => {
		  return ProspectosFacebook.find();
	  },
	  empleados : () => {
		  return Empleados.find();
	  },
	  etapaVenta : () => {
		  return EtapasVenta.findOne({orden : "1", estatus : true});
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
    $('.collapse').coll
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
};

