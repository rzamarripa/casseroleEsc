angular
  .module('casserole')
  .controller('CuentasCtrl', CuentasCtrl);
 
function CuentasCtrl($scope, $meteor, $reactive, $state, toastr) {
	$reactive(this).attach($scope);
  this.action = true;
	this.subscribe('cuentas',()=>{
		return [{estatus:true, seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : "",  }]
 	});
  
  this.helpers({
	  cuentas : () => {
		  return Cuentas.find();
	  }
  });
  	  
  this.nuevo = true;	  
  this.nuevaCuenta = function()
  {
    this.action = true;
    this.nuevo = !this.nuevo;
    this.cuenta = {};
  };
	
  this.guardar = function(cuenta,form)
	{
		if(form.$invalid){
      toastr.error('Error al guardar los datos de la cuenta.');
      return;
    }
    if(this.cuentas.length == 0){
    	cuenta.activo = true;
    	cuenta.inscripcion = true;
    }else{
    	cuenta.activo = false;
    	cuenta.inscripcion = false;
    }
		cuenta.estatus = true;
		cuenta.campus_id = Meteor.user().profile.campus_id;
		cuenta.seccion_id = Meteor.user().profile.seccion_id;
		Cuentas.insert(cuenta);
		toastr.success('Cuenta guardada.');
		this.cuenta = {};
		$('.collapse').collapse('hide');
		this.nuevo = true;
		form.$setPristine();
    form.$setUntouched();
	};
	
	this.editar = function(id)
	{
	    this.cuenta = Cuentas.findOne({_id:id});
	    this.action = false;
	    $('.collapse').collapse('show');
	    this.nuevo = false;
	};
	
	this.actualizar = function(cuenta,form)
	{
    if(form.$invalid){
      toastr.error('Error al actualizar los datos de la cuenta.');
      return;
    }
		var idTemp = cuenta._id;
		delete cuenta._id;		
		Cuentas.update({_id:idTemp},{$set:cuenta});
		$('.collapse').collapse('hide');
		this.nuevo = true;
		form.$setPristine();
    form.$setUntouched();
	};
		
	this.cambiarEstatus = function(id)
	{
		var cuenta = Cuentas.findOne({_id:id});
		if(cuenta.activo == true )
			return alert("No puedes eliminar una cuenta activa");
		if(cuenta.inscripcion == true)
			return alert("No puedes eliminar con inscripcion activa");
		if(cuenta.estatus == true)
			cuenta.estatus = false;
		else
			cuenta.estatus = true;
		
		Cuentas.update({_id:id}, {$set : {estatus : cuenta.estatus}});
	};
	
	this.activarCuenta = function(cuenta_id){
		cuentaActiva = Cuentas.findOne({activo:true});
		Cuentas.update(cuentaActiva._id, {$set:{activo:false}});
		Cuentas.update(cuenta_id, {$set:{activo:true}});
	}

	this.cuentaInscripcion = function(cuenta_id){
		cuentaActiva = Cuentas.findOne({inscripcion:true});
		Cuentas.update(cuentaActiva._id, {$set:{inscripcion:false}});
		Cuentas.update(cuenta_id, {$set:{inscripcion:true}});
	}
};