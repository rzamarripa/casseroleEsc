angular
.module("casserole")
.controller("GerentesVentaCtrl", GerentesVentaCtrl);
function GerentesVentaCtrl($scope, $meteor, $reactive,  $state, $stateParams, toastr) {
	
  let rc = $reactive(this).attach($scope);
  this.action = true;
  this.nuevo = true;  
  this.validaUsuario = false;
  this.validaContrasena = false;
  
	this.subscribe('validaUsuarios',()=>{
		return [{campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }]
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
		if(form.$invalid || !rc.validaUsuario || !rc.validaContrasena){
      toastr.error('Error al guardar los datos.');
      return;
		}
		gerenteVenta.profile.estatus = true;
		gerenteVenta.profile.campus_id = Meteor.user().profile.campus_id;
		gerenteVenta.usuarioInserto = Meteor.userId();
		Meteor.call('createGerenteVenta', gerenteVenta, 'gerenteVenta');
		toastr.success('Guardado correctamente.');
		this.nuevo = true;
		this.gerenteVenta = {};
		$('.collapse').collapse('hide');
		this.nuevo = true;		
		form.$setPristine();
		form.$setUntouched();
	};
	
	this.editar = function(id)
	{
    this.gerenteVenta = Meteor.users.findOne({_id:id});
    this.action = false;
    $('.collapse').collapse('show');
    this.nuevo = false;
	};
	
	this.actualizar = function(gerenteVenta,form)
	{
			if(form.$invalid || !rc.validaUsuario || !rc.validaContrasena){
		        toastr.error('Error al actualizar los datos.');
		        return;
		  }
			Meteor.call('updateGerenteVenta', gerenteVenta, 'gerenteVenta');
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
	    form.$setUntouched();
	};
	
	/*
	this.cambiarEstatus = function(id)
	{
			var gerenteVenta = gerentes.findOne({_id:id});
			if(gerenteVenta.estatus == true)
				gerenteVenta.estatus = false;
			else
				gerenteVenta.estatus = true;
			
			gerentes.update({_id:id}, {$set : {estatus : gerenteVenta.estatus}});
	};
	*/
	
		
	this.tomarFoto = function(){
		$meteor.getPicture({width:200, height: 200, quality: 50}).then(function(data){
			rc.gerenteVenta.profile.fotografia = data;
		});
	};
	
	this.validarUsuario = function(username){
		var existeUsuario = Meteor.users.find({username : username}).count();
		if(existeUsuario){
			rc.validaUsuario = false;
		}else{
			rc.validaUsuario = true;
		}
	}
	
	this.validarContrasena = function(contrasena, confirmarContrasena){
		if(contrasena && confirmarContrasena){
			if(contrasena === confirmarContrasena && contrasena.length > 0 && confirmarContrasena.length > 0){
				rc.validaContrasena = true;
			}else{
				rc.validaContrasena = false;
			}
		}
	}
};
