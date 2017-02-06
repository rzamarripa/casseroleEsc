angular
.module("casserole")
.controller("GerentesVentaCtrl", GerentesVentaCtrl);
function GerentesVentaCtrl($scope, $meteor, $reactive,  $state, $stateParams, toastr) {
	
  let rc = $reactive(this).attach($scope);
  this.action = true;
  this.nuevo = true;
  this.comision = {};
  this.gerenteVenta = {};
  this.gerenteVenta.profile = {};
  this.gerenteVenta.profile.planComision = [];
  window.rc = rc;
  
  this.subscribe('gerentesVenta', ()=>{
		return [{"profile.campus_id" : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "", roles : { $in : ["gerenteVenta"]}}]
	});	
 
  this.helpers({
	  gerentesVenta : () => {
		  var usuarios = Meteor.users.find().fetch();
		  var gerentes = [];
		  _.each(usuarios, function(usuario){
			  if(usuario.roles[0] == "gerenteVenta" && usuario.profile.campus_id ==( Meteor.user() != undefined ? Meteor.user().profile.campus_id : "")){
				  gerentes.push(usuario);
			  }
		  });
		  return gerentes;
	  }
  });  
  
  this.nuevoGerenteVenta = function()
  {
			this.action = true;
	    this.nuevo = !this.nuevo;
	    this.gerenteVenta = {}; 
	    this.gerenteVenta.profile = {};
  };
 
	this.guardar = function(gerenteVenta,form)
	{		
		if(form.$invalid){
      toastr.error('Error al guardar los datos.');
      return;
		}		
		
		gerenteVenta.profile.estatus = true;
		gerenteVenta.profile.campus_id = Meteor.user().profile.campus_id;
		gerenteVenta.profile.usuarioInserto = Meteor.userId();
		
		Meteor.call('generarUsuario', "g", gerenteVenta, 'gerenteVenta', function(error, result){
			if(error){
				toastr.error('Error al guardar los datos.');
				console.log(error);
			}else{
				toastr.success('Guardado correctamente.');
				rc.nuevo = true;
				rc.gerenteVenta = {};
				$('.collapse').collapse('hide');
				form.$setPristine();
				form.$setUntouched();	
			}
		});
	};
	
	this.editar = function(id)
	{
    this.gerenteVenta = Meteor.users.findOne({_id:id});
    this.action = false;
    $('.collapse').collapse('show');
    this.nuevo = false;
    this.usernameSeleccionado = this.gerenteVenta.username;
    this.validaUsuario = true;
	};
	
	this.actualizar = function(gerenteVenta,form)
	{
		if(form.$invalid){
	        toastr.error('Error al actualizar los datos.');
	        return;
	  }
		Meteor.call('modificarUsuario', gerenteVenta, 'gerenteVenta');
		$('.collapse').collapse('hide');
		this.nuevo = true;
		form.$setPristine();
    form.$setUntouched();
	};
		
	this.tomarFoto = function(){
		$meteor.getPicture({width:200, height: 200, quality: 50}).then(function(data){
			rc.gerenteVenta.profile.fotografia = data;
		});
	};
	
	this.cambiarEstatus = function(id)
	{
		var gerenteVenta = Meteor.users.findOne({_id:id});
		if(gerenteVenta.profile.estatus == true)
			gerenteVenta.profile.estatus = false;
		else
			gerenteVenta.profile.estatus = true;		
		Meteor.call('modificarUsuario', gerenteVenta, 'gerenteVenta');
	};
	
	this.agregarComision = function(comision, form){
		if(form.$invalid){
      toastr.error('Error al guardar los datos.');
      return;
		}	
		
		if(this.gerenteVenta.profile.planComision == undefined)
			this.gerenteVenta.profile.planComision = [];
		
		this.gerenteVenta.profile.planComision.push(angular.copy(comision));
		this.comision = {};
	}
	
	this.confirmarComision = function(comision){
		delete comision.editando;
	}
	
	this.editarComision = function(comision){
		comision.editando = true;
	}
	
	this.quitarComision = function(indice){
		this.gerenteVenta.profile.planComision.splice(indice, 1);
	}
};
