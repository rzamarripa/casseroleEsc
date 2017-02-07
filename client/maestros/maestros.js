angular
.module("casserole")
.controller("MaestrosCtrl", MaestrosCtrl);
function MaestrosCtrl($scope, $meteor, $reactive,  $state, $stateParams, toastr, SaveService){
	let rc = $reactive(this).attach($scope);
	
	this.action = true;
	this.maestro = {}; 
  this.validaContrasena = false;
  this.nuevo = true;
	
	this.subscribe('maestros',()=>{
		return [{campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }]
	});
	
	this.subscribe('campus', ()=>{
		return [{estatus:true, _id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""}]
	});

	this.helpers({
	  maestros : () => {
		  return Maestros.find({campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" });
	  },
	  cantidad : () => {
		  return Maestros.find({campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""}).count();
	  },
	  campus : () => {
		  return Campus.findOne(Meteor.user().profile.campus_id);
	  },
	  nombreUsuario : () => {
		  if(this.getReactively("maestro") && Meteor.user() && this.action == true){
			  anio = '' + new Date().getFullYear();
			  anio = anio.substring(2,4);
			  if(this.getReactively("cantidad") > 0 && this.getReactively("campus") != undefined){
				  var ultimo = Maestros.findOne({}, {sort: {fechaCreacion:-1}});
				  if(ultimo){
					  identificador = ultimo.nombreUsuario.substring(1, ultimo.nombreUsuario.length);
					  usuarioAnterior = parseInt(identificador) + 1;
					  usuarioAnterior = 'm' + usuarioAnterior;
					  rc.maestro.nombreUsuario = usuarioAnterior;
				  }
			  }else{
				  rc.maestro.nombreUsuario = "m" + anio + rc.getReactively("campus.clave") + "001";
			  }
		  }
	  }
  });
  
  this.nuevoMaestro = function()
  {
    this.action = true;
    this.nuevo = !this.nuevo;
    this.maestro = {
    	contrasena: '123',
    	confirmarContrasena: '123',
    	titulo: 'lic',
    	nombre: 'Cosme Miguel',
    	apellidoPaterno: 'López',
    	apellidoMaterno: 'Camacho',
    	correo: 'cosme.miguel.24@gmail.com',
    	sexo:'Masculino'
    };
  };

	this.guardar = function(maestro,form)
	{
		if(form.$invalid){
      toastr.error('Error al guardar los datos.');
      return;
	  }
		maestro.estatus = true;
		maestro.campus_id = Meteor.user().profile.campus_id;
		maestro.usuarioInserto = Meteor.userId();
		maestro.fechaCreacion = new Date();
		maestro.campus_id = Meteor.user().profile.campus_id;
		// Service
		SaveService.saveUser('maestros', maestro, 'maestro', function(err, message){
			if(err){
				toastr.error(err);
				return
			}
			maestro = {};
			$('.collapse').collapse('hide');
			rc.nuevo = true;
			toastr.success(message);
		});
	};

	this.editar = function(id)
	{
	  this.maestro = Maestros.findOne({_id:id});
	  this.action = false;
	  $('.collapse').collapse('show');
	  this.nuevo = false;
	};
	
	this.actualizar = function(maestro,form)
	{
		if(form.$invalid){
      toastr.error('Error al guardar los datos.');
      return;
	  }
		var idTemp = maestro._id;
		delete maestro._id;		
		maestro.usuarioActualizo = Meteor.userId();
		var id = Maestros.update({_id:idTemp},{$set:maestro});
		maestro.maestro_id = idTemp;
		Meteor.call('updateUsuario', maestro, idTemp, 'maestro');
		toastr.success('Actualizado correctamente.');
		$('.collapse').collapse('hide');
		this.nuevo = true;
		form.$setPristine();
    form.$setUntouched();
	};
		
	this.cambiarEstatus = function(id)
	{
		var maestro = Maestros.findOne({_id:id});
		if(maestro.estatus == true){
			maestro.estatus = false;
		}else{
			maestro.estatus = true;
		}
		Meteor.call('updateUsuario', maestro, maestro._id, 'maestro');
		Maestros.update({_id:id}, {$set : {estatus : maestro.estatus}});
	};

	this.tomarFoto = function(){
		$meteor.getPicture().then(function(data){
			rc.maestro.fotografia = data;
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
	
};



