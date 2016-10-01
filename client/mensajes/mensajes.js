angular
  .module('casserole')
  .controller('MensajesCtrl', MensajesCtrl);
 
function MensajesCtrl($scope, $meteor, $reactive, $state, toastr) {
	let rc = $reactive(this).attach($scope);
	this.action = true;
  this.nuevo = true;
	this.viendoMensaje = false;
	this.mensaje = {};
	
	window.rc = rc;
	
	$(document).ready(function() {
 	  $('#summernote').summernote({
	 	  	height:200
 	  }); 	  
 	  $(".select2").select2();
 	});
 	
	this.selTodos = false;	
	
	this.subscribe('usuariosMensajes');
	
	this.subscribe('mensajes',()=>{
		return [{para_id : Meteor.user() != undefined ? Meteor.userId() : "" }]
	});
  
  this.helpers({
		mensajes : () => {
		  return Mensajes.find({}, { sort: {fechaEnvio : -1}});
	  },
	  destinatarios : () => {
		  return Meteor.users.find({"profile.estatus" : true, "profile.campus_id" : Meteor.user().profile.campus_id})
	  },
	  mensajesNuevos : () => {
		  return Mensajes.find({estatus : 1});
	  }
  });

  this.nuevoMensaje = function()
  {
	  this.viendoMensaje = false;
    this.action = true;
    this.nuevo = !this.nuevo;
    this.mensaje = {};
  };
	
	this.seleccionarTodos = function(){
		_.each(rc.mensajes, function(mensaje){
			mensaje.checked = rc.selTodos;
		})
	}
	
	this.enviar = function(mensaje){
		_.each(mensaje.para, function(destinatario){
			var para = Meteor.users.findOne(destinatario, { fields : { "profile.nombreCompleto" : 1, _id : 0}});
			for(var i = 0; i<2000; i++){
				Mensajes.insert({
					asunto : mensaje.asunto + " " + i,
					para_id : destinatario,
					para : para.profile.nombreCompleto,
					de_id : Meteor.userId(),
					de : Meteor.user().profile.nombreCompleto,
					fechaEnvio : new Date(),
					cuerpo : $("#summernote").summernote("code"),
					estatus : 1,
					importante : 1,
				})
			}
				
		})
		mensaje = {};
		this.viendoMensaje = false;
		this.nuevo = true;
		$('.collapse').collapse('hide');
		toastr.success('Se enviaron los mensajes correctamente.');
	}
	
	this.verMensaje = function(mensaje){
		$('.collapse').collapse('hide');
		rc.viendoMensaje = true;
		rc.nuevo = true;
		rc.mensaje = mensaje;
		Mensajes.update(mensaje._id, { $set : { estatus : 2 }});
		mensaje.para = Meteor.users.findOne(mensaje.para_id);
	}
	
	this.tieneFoto = function(de_id){
		var usuario = Meteor.users.findOne(de_id);
		var foto = usuario.profile.fotografia;
		var sexo = usuario.profile.sexo;
	  if(foto === undefined){
		  if(sexo === "masculino")
			  return "img/badmenprofile.jpeg";
			else if(sexo === "femenino"){
				return "img/badgirlprofile.jpeg";
			}else{
				return "img/badprofile.jpeg";
			}
	  }else{
		  return foto;
	  }
  } 
  
  this.eliminarMensajes = function(){
	  
	  var mensajesEliminados = _.filter(rc.mensajes, function(mensaje){
		  return mensaje.checked;
	  });
	  if(mensajesEliminados.length > 0){
		  var r = confirm("Está seguro de eliminar " + mensajesEliminados.length + " mensajes!");
			if(r == true){
				_.each(mensajesEliminados, function(mensaje){
				  Mensajes.remove({_id:mensaje._id});
			  })
			  console.log(mensajesEliminados);
			  toastr.success('Se elminaron los mensajes correctamente.');
			}else{
				toastr.success('No se seleccionaron mensajes.');
			}
	  }
  }
  
  this.mensajesImportantes = function(){
	  
	  var mensajesImportantes = _.filter(rc.mensajes, function(mensaje){
		  return mensaje.checked;
	  });
	  if(mensajesImportantes.length > 0){
			_.each(mensajesImportantes, function(mensaje){
				if(mensaje.importante == undefined || mensaje.importante == 1)
				  Mensajes.update({_id:mensaje._id},{ $set : { importante : 2 }});
				else
					Mensajes.update({_id:mensaje._id},{ $set : { importante : 1 }});
		  });
		  console.log(mensajesImportantes);
		  toastr.success('Se modificaron los mensajes correctamente.');
		}else{
			toastr.success('No se seleccionaron mensajes.');
		}
			
  }
};