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
		  return Mensajes.find().fetch();
	  },
	  destinatarios : () => {
		  return Meteor.users.find({"profile.estatus" : true, "profile.campus_id" : Meteor.user().profile.campus_id})
	  }
  });

  this.nuevoMensaje = function()
  {
    this.action = true;
    this.nuevo = !this.nuevo;
    this.ciclo = {};
  };
	
	this.seleccionarTodos = function(){
		_.each(rc.maestros, function(maestro){
			maestro.checked = rc.selTodos;
		})
	}
	
	this.enviar = function(mensaje){
		_.each(mensaje.para, function(destinatario){
			var para = Meteor.users.findOne(destinatario, { fields : { "profile.nombreCompleto" : 1, _id : 0}});
			Mensajes.insert({
				asunto : mensaje.asunto,
				para_id : destinatario,
				para : para.profile.nombreCompleto,
				de_id : Meteor.userId(),
				de : Meteor.user().profile.nombreCompleto,
				fechaEnvio : moment(),
				cuerpo : $("#summernote").summernote("code"),
				estatus : 1
			})
		})
		mensaje = {};
		$('.collapse').collapse('hide');
		toastr.success('Se enviaron los ' + mensaje.para.length + ' mensajes correctamente.');
	}
	
	this.verMensaje = function(mensaje){
		rc.viendoMensaje = true;
		rc.mensaje = mensaje;
		Mensajes.update(mensaje._id, { estatus : 2 });
		mensaje.para = Meteor.users.findOne(mensaje.para_id);
		
		console.log(rc.viendoMensaje);
		console.log(mensaje);
		console.log(index);
	}
	
	this.tieneFoto = function(sexo, foto){
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
};