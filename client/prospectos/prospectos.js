angular.module("casserole")
.controller("ProspectosCtrl", ProspectosCtrl);  
 function ProspectosCtrl($scope, $meteor, $reactive, $state, $stateParams, toastr){
 	let rc = $reactive(this).attach($scope); 	
 	
  this.action = true;
  
  this.prospecto = {};
  
  this.buscar = {};
  this.buscar.nombre = '';
  this.buscar.etapaVenta_id = '';
  
  console.log("state", $stateParams);
  
  if($stateParams.vendedor_id){
	  console.log("entré aquí");
	  rc.buscar.etapaVenta_id = $stateParams.etapaVenta_id;
	  this.subscribe('prospectos', () => {
	    return [{
		    options : { limit: 10 },
		    where : { nombre : this.getReactively('buscar.nombre'), etapaVenta_id : this.getReactively("buscar.etapaVenta_id"), vendedor_id:$stateParams.vendedor_id }
	    }] ;
	  });
	  
  }else{
	  console.log("entré allá");
	  this.subscribe('prospectos', () => {
	    return [{
		    options : { limit: 10 },
		    where : { nombre : this.getReactively('buscar.nombre'), etapaVenta_id : this.getReactively("buscar.etapaVenta_id"), vendedor_id:Meteor.userId() }
	    }] ;
	  });
  }
  
  this.subscribe("empleados");
  
  this.subscribe('secciones', function(){
	  return [{
		  estatus:true, campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""
	  }]
  });
  
  this.subscribe("etapaVenta", () =>{
	  return  [{estatus:true, campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }]
  });
  
  this.helpers({
	  prospectos : () => {
		  return Prospectos.find();
	  },
	  etapaVenta : () => {
		  return EtapasVenta.findOne();
	  },
	  etapasVenta : () => {
		  return EtapasVenta.find();
	  },
	  secciones : () => {
		  return Secciones.find();
	  }
  });
  
  this.guardar = function(prospecto)
	{
		this.prospecto.estatus = 1;
		this.prospecto.fecha = new Date();
		this.prospecto.etapaVenta_id = this.etapaVenta._id;
		this.prospecto.vendedor_id = Meteor.userId();
		this.prospecto.campus_id = Meteor.user().profile.campus_id;
		var prospecto_id = Prospectos.insert(this.prospecto);
		toastr.success('prospecto guardado.');
		this.prospecto = {}; 
		$('.collapse').collapse('hide');
		$state.go('root.prospecto',{id : prospecto_id});
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
		console.log(prospecto);
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
  
  this.filtrarEtapaVenta = function(etapaVenta_id){
	  this.buscar.etapaVenta_id = etapaVenta_id;
  }
};

