angular
.module("casserole")
.controller("CoordinadoresCtrl", CoordinadoresCtrl);
function CoordinadoresCtrl($scope, $meteor, $reactive,  $state, $stateParams, toastr) {
	
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
	  coordinadores : () => {
		  var usuarios = Meteor.users.find().fetch();
		  var coordinadores = [];
		  _.each(usuarios, function(usuario){
			  if(usuario.roles[0] == "coordinadorFinanciero" || usuario.roles[0] == 'coordinadorAcademico' && usuario.profile.campus_id == (Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" )){
				  usuario.profile.seccion = Secciones.findOne(usuario.profile.seccion_id);
				  coordinadores.push(usuario);
			  }
		  });
		  console.log(coordinadores);
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
		if(form.$invalid || !rc.validaUsuario || !rc.validaContrasena){
      toastr.error('Error al guardar los datos.');
      return;
	  }
		console.log(coordinador);
		coordinador.profile.estatus = true;
		coordinador.profile.campus_id = Meteor.user().profile.campus_id;
		coordinador.profile.seccion_id = Meteor.user().profile.seccion_id;
		coordinador.usuarioInserto = Meteor.userId();
		coordinador.profile.nombreCompleto = coordinador.profile.nombre  + " " + coordinador.profile.apPaterno + " " + (coordinador.profile.apMaterno ? coordinador.profile.apMaterno : "");
		Meteor.call('createGerenteVenta', coordinador, coordinador.profile.role);
	  toastr.success('Guardado correctamente.');
		this.nuevo = true;
		this.coordinador = {};
		$('.collapse').collapse('hide');
		this.nuevo = true;	
		form.$setPristine();
		form.$setUntouched();	
		this.validaUsuario = false;
		this.validaContrasena = false;
	};
	
	this.editar = function(id)
	{
    this.coordinador = Meteor.users.findOne({_id:id});
    this.action = false;
    $('.collapse').collapse('show');
    this.nuevo = false;
    this.usernameSeleccionado = this.coordinador.username;
    this.validaUsuario = true;
	};
	
	this.actualizar = function(coordinador,form)
	{
		if(form.$invalid || !rc.validaUsuario || !rc.validaContrasena){
      toastr.error('Error al actualizar los datos.');
      return;
		}
			
		Meteor.call('updateGerenteVenta', coordinador, coordinador.profile.role);
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
	
	this.validarUsuario = function(username){
		console.log(username);
		if(this.nuevo){
			var existeUsuario = Meteor.users.find({username : username}).count();
			if(existeUsuario){
				rc.validaUsuario = false;
			}else{
				rc.validaUsuario = true;
			}
		}else{
			console.log(rc.usernameSeleccionado);
			var existeUsuario = Meteor.users.find({username : username}).count();
			if(existeUsuario){
				var usuario = Meteor.users.findOne({username : username});
				console.log(usuario)
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