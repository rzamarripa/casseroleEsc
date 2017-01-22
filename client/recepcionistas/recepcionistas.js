angular
.module("casserole")
.controller("RecepcionistasCtrl", RecepcionistasCtrl);
function RecepcionistasCtrl($scope, $meteor, $reactive,  $state, $stateParams, toastr) {
	
	let rc = $reactive(this).attach($scope);
  this.action = true;
  this.nuevo = true;
  this.validaUsuario = false;
  this.validaContrasena = false;
  this.usernameSeleccionado = "";
  
	this.subscribe('validaUsuarios',()=>{
		return [{campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }]
	});
	
	this.subscribe('secciones',()=>{
		return [{campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }]
	});

  this.helpers({
	  recepcionistas : () => {
		  return Meteor.users.find({roles : ["recepcionista"]});
	  }
  });  
  
  this.nuevoRecepcionista = function()
  {
		this.action = true;
    this.nuevo = !this.nuevo;
    this.recepcionista = {}; 
    this.recepcionista.profile = {};
  };
 
	this.guardar = function(recepcionista,form)
	{		
		if(form.$invalid || !rc.validaUsuario || !rc.validaContrasena){
      toastr.error('Error al guardar los datos.');
      return;
	  }

		recepcionista.profile.estatus = true;
		recepcionista.profile.campus_id = Meteor.user().profile.campus_id;
		recepcionista.profile.seccion_id = Meteor.user().profile.seccion_id;
		recepcionista.usuarioInserto = Meteor.userId();
		recepcionista.profile.nombreCompleto = recepcionista.profile.nombre  + " " + recepcionista.profile.apPaterno + " " + (recepcionista.profile.apMaterno ? recepcionista.profile.apMaterno : "");
		
		Meteor.call('createGerenteVenta', recepcionista, "recepcionista");
	  toastr.success('Guardado correctamente.');
		this.nuevo = true;
		this.recepcionista = {};
		$('.collapse').collapse('hide');
		this.nuevo = true;	
		form.$setPristine();
		form.$setUntouched();	
		this.validaUsuario = false;
		this.validaContrasena = false;
	};
	
	this.editar = function(id)
	{
    this.recepcionista = Meteor.users.findOne({_id:id});
    this.action = false;
    $('.collapse').collapse('show');
    this.nuevo = false;
    this.usernameSeleccionado = this.recepcionista.username;
    this.validaUsuario = true;
	};
	
	this.actualizar = function(recepcionista,form)
	{
		if(form.$invalid || !rc.validaUsuario || !rc.validaContrasena){
      toastr.error('Error al actualizar los datos.');
      return;
		}
		recepcionista.profile.nombreCompleto = recepcionista.profile.nombre  + " " + recepcionista.profile.apPaterno + " " + (recepcionista.profile.apMaterno ? recepcionista.profile.apMaterno : "");
		Meteor.call('updateGerenteVenta', recepcionista, "recepcionista");
		toastr.success('Actualizado correctamente.');
		$('.collapse').collapse('hide');
		this.nuevo = true;
		form.$setPristine();
		form.$setUntouched();
		this.validaUsuario = false;
		this.validaContrasena = false;
	};
		
	this.tomarFoto = function(){
		$meteor.getPicture({width:200, height: 200, quality: 50}).then(function(data){
			rc.recepcionista.profile.fotografia = data;
		});
	};
	
	this.validarUsuario = function(username){
		if(this.nuevo){
			var existeUsuario = Meteor.users.find({username : username}).count();
			if(existeUsuario){
				rc.validaUsuario = false;
			}else{
				rc.validaUsuario = true;
			}
		}else{
			var existeUsuario = Meteor.users.find({username : username}).count();
			if(existeUsuario){
				var usuario = Meteor.users.findOne({username : username});
				if(rc.usernameSeleccionado == usuario.username){
					rc.validaUsuario = true;
				}else{
					rc.validaUsuario = false;
				}
			}else{
				rc.validaUsuario = true;
			}
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