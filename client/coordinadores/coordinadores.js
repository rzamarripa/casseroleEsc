angular
.module("casserole")
.controller("CoordinadoresCtrl", CoordinadoresCtrl);
function CoordinadoresCtrl($scope, $meteor, $reactive,  $state, $stateParams, toastr) {
	
	let rc = $reactive(this).attach($scope);
  this.action = true;
  this.nuevo = true;
  
  this.validaContrasena = false;
	this.cambiarPassword = true;
  	
	this.subscribe('secciones',()=>{
		return [{campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }]
	});
	
	this.subscribe('coordinadores', ()=>{
		return [{"profile.seccion_id" : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : "", roles : { $in : ["coordinadorAcademico", "coordinadorFinanciero"]}}]
	});	
	
  this.helpers({
	  coordinadores : () => {
		  var usuarios = Meteor.users.find().fetch();
		  var coordinadores = [];
		  _.each(usuarios, function(usuario){
			  if(usuario.roles[0] == "coordinadorFinanciero" || usuario.roles[0] == 'coordinadorAcademico' && usuario.profile.campus_id == (Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" )){
				  usuario.profile.seccion = Secciones.findOne(usuario.profile.seccion_id);
				  coordinadores.push(usuario);
			  }
		  });
		  return coordinadores;
	  },
	  coordinadoresFinancieros : () => {
		  var usuarios = Meteor.users.find().fetch();
		  var coordinadoresFinancieros = [];
		  _.each(usuarios, function(usuario){
			  if(usuario.roles[0] == "coordinadorFinanciero" && usuario.profile.campus_id == (Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" )){
				  coordinadoresFinancieros.push(usuario);
			  }
		  });
		  return coordinadoresFinancieros;
	  },
	  coordinadoresAcademicos : () => {
		  var usuarios = Meteor.users.find().fetch();
		  var coordinadoresAcademicos = [];
		  _.each(usuarios, function(usuario){
			  if(usuario.roles[0] == "coordinadorAcademico" && usuario.profile.campus_id == (Meteor.user() != undefined ? Meteor.user().profile.campus_id : "")){
				  coordinadoresAcademicos.push(usuario);
			  }
		  });
		  return coordinadoresAcademicos;
	  }
  });  
  
  this.nuevoCoordinador = function()
  {
		this.action = true;
    this.nuevo = !this.nuevo;
    this.coordinador = {}; 
    this.coordinador.profile = {};
  };
 
	this.guardar = function(coordinador,form)
	{		
		if(form.$invalid){
      toastr.error('Error al guardar los datos.');
      return;
	  }
		coordinador.profile.estatus = true;
		coordinador.profile.campus_id = Meteor.user().profile.campus_id;
		coordinador.profile.seccion_id = Meteor.user().profile.seccion_id;
		coordinador.profile.usuarioInserto = Meteor.userId();
		coordinador.profile.nombreCompleto = coordinador.profile.nombre  + " " + coordinador.profile.apPaterno + " " + (coordinador.profile.apMaterno ? coordinador.profile.apMaterno : "");
		Meteor.call('generarUsuario', "c", coordinador, coordinador.profile.role, function(error, result){
			if(error){
				toastr.error('Error al guardar los datos.');
				console.log(error);
			}else{
				toastr.success('Guardado correctamente.');
				rc.nuevo = true;
				rc.coordinador = {};
				$('.collapse').collapse('hide');
				form.$setPristine();
				form.$setUntouched();	
			}
		});
	};
	
	this.editar = function(id)
	{
    this.coordinador = Meteor.users.findOne({_id:id});
    this.action = false;
    $('.collapse').collapse('show');
    this.nuevo = false;
	};
	
	this.actualizar = function(coordinador,form)
	{
		if(form.$invalid){
      toastr.error('Error al actualizar los datos.');
      return;
		}
		coordinador.profile.nombreCompleto = coordinador.profile.nombre  + " " + coordinador.profile.apPaterno + " " + (coordinador.profile.apMaterno ? coordinador.profile.apMaterno : "");
		Meteor.call('modificarUsuario', coordinador, coordinador.profile.role);
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
			rc.coordinador.profile.fotografia = data;
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
		if(this.coodinador.cambiarContrasena == false){
			rc.coordinador.password = undefined;
			rc.coordinador.confirmarContrasena = undefined;
		}else{
			rc.coordinador.password = "";
			rc.coordinador.confirmarContrasena = "";
		}
	}
	
	this.cambiarEstatus = function(id)
	{
		var coordinador = Meteor.users.findOne({_id:id});
		if(coordinador.profile.estatus == true)
			coordinador.profile.estatus = false;
		else
			coordinador.profile.estatus = true;
		Meteor.call('modificarUsuario', coordinador, coordinador.roles[0]);
  };
};