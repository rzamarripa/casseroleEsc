angular
.module("casserole")
.controller("RecepcionistasCtrl", RecepcionistasCtrl);
function RecepcionistasCtrl($scope, $meteor, $reactive,  $state, $stateParams, toastr) {
	
	let rc = $reactive(this).attach($scope);
  this.action = true;
  this.nuevo = true;
  
	this.validaContrasena = false;
	this.cambiarPassword = true;
	
	this.subscribe('secciones',()=>{
		return [{campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }]
	});
	
	this.subscribe('recepcionistas', ()=>{
		return [{"profile.seccion_id" : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : "", roles : { $in : ["recepcionista"]}}]
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
		if(form.$invalid){
      toastr.error('Error al guardar los datos.');
      return;
	  }

		recepcionista.profile.estatus = true;
		recepcionista.profile.campus_id = Meteor.user().profile.campus_id;
		recepcionista.profile.seccion_id = Meteor.user().profile.seccion_id;
		recepcionista.profile.usuarioInserto = Meteor.userId();
		recepcionista.profile.nombreCompleto = recepcionista.profile.nombre  + " " + recepcionista.profile.apPaterno + " " + (recepcionista.profile.apMaterno ? recepcionista.profile.apMaterno : "");
		
		Meteor.call('generarUsuario', "r", recepcionista, 'recepcionista', function(error, result){
			if(error){
				toastr.error('Error al guardar los datos.');
				console.log(error);
			}else{
				toastr.success('Guardado correctamente.');
				rc.nuevo = true;
				rc.recepcionista = {};
				$('.collapse').collapse('hide');
			}
		});
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
		if(form.$invalid){
      toastr.error('Error al actualizar los datos.');
      return;
		}
		recepcionista.profile.nombreCompleto = recepcionista.profile.nombre  + " " + recepcionista.profile.apPaterno + " " + (recepcionista.profile.apMaterno ? recepcionista.profile.apMaterno : "");
		Meteor.call('modificarUsuario', recepcionista, "recepcionista");
		toastr.success('Actualizado correctamente.');
		$('.collapse').collapse('hide');
		this.nuevo = true;
		this.validaUsuario = false;
		this.validaContrasena = false;
	};
		
	this.tomarFoto = function(){
		$meteor.getPicture({width:200, height: 200, quality: 50}).then(function(data){
			rc.recepcionista.profile.fotografia = data;
		});
	};	
	
	this.validarContrasena = function(contrasena, confirmarContrasena){
		if(contrasena && confirmarContrasena){
			if(contrasena === confirmarContrasena && contrasena.length > 0 && confirmarContrasena.length > 0){
				rc.validaContrasena = true;
			}else{
				rc.validaContrasena = false;
			}
		}
	}
	
	this.cambiarContrasena = function(){
		this.cambiarPassword = !this.cambiarPassword;
		if(this.recepcionista.cambiarContrasena == false){
			rc.recepcionista.password = undefined;
			rc.recepcionista.confirmarContrasena = undefined;
		}else{
			rc.recepcionista.password = "";
			rc.recepcionista.confirmarContrasena = "";
		}
	}
	
	this.cambiarEstatus = function(id)
	{
		var recepcionista = Meteor.users.findOne({_id:id});
		if(recepcionista.profile.estatus == true)
			recepcionista.profile.estatus = false;
		else
			recepcionista.profile.estatus = true;
		Meteor.call('modificarUsuario', recepcionista, "recepcionista");
  };
	
};