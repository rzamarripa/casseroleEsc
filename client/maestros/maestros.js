angular
.module("casserole")
.controller("MaestrosCtrl", MaestrosCtrl);
function MaestrosCtrl($scope, $meteor, $reactive,  $state, $stateParams, toastr){
	let rc = $reactive(this).attach($scope);
	
	this.action = true;
	this.maestro = {}; 
  this.validaContrasena = false;
	
	this.subscribe('maestros',()=>{
		return [{campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }]
	});

	this.helpers({
	  maestros : () => {
		  return Maestros.find({campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" });
	  },
	  cantidad : () => {
		  return Maestros.find({campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""}).count();
	  },
	  nombreUsuario : () => {
		  if(this.getReactively("maestro") && Meteor.user()){
			  anio = '' + new Date().getFullYear();
			  anio = anio.substring(2,4);
			  if(this.getReactively("cantidad") > 0){
				  var ultimo = Maestros.findOne({}, {sort: {fechaCreacion:-1}});
				  if(ultimo){
					  identificador = ultimo.nombreUsuario.substring(1, ultimo.nombreUsuario.length);
					  usuarioAnterior = parseInt(identificador) + 1;
					  usuarioAnterior = 'm' + usuarioAnterior;
					  rc.maestro.nombreUsuario = usuarioAnterior;
				  }
			  }else{
				  rc.maestro.nombreUsuario = "m" + anio + Meteor.user().profile.campus_clave + "001";
			  }
		  }
	  }
  });

  this.nuevo = true;
  	  
  this.nuevoMaestro = function()
  {
    this.action = true;
    this.nuevo = !this.nuevo;
    this.maestro = {};
  };

	this.guardar = function(maestro,form)
	{
		if(form.$invalid || !rc.validaContrasena){
      toastr.error('Error al guardar los datos.');
      return;
		}
	
		maestro.estatus = true;
		maestro.campus_id = Meteor.user().profile.campus_id;
		maestro.usuarioInserto = Meteor.userId();
		maestro.fechaCreacion = new Date();
		maestro.campus_id = Meteor.user().profile.campus_id;
		var id = Maestros.insert(maestro);	
		maestro.maestro_id = id;
		Meteor.call('createUsuario', rc.maestro, 'maestro');
		toastr.success("Maestro Creado \n Usuario Creado");
		maestro = {};
		$('.collapse').collapse('hide');
		this.nuevo = true;
		form.$setPristine();
    form.$setUntouched();	
	};

	this.editar = function(id)
	{
			//console.log(id);
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
			Maestros.update({_id:idTemp},{$set:maestro});
			console.log(idTemp);
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
			if(maestro.estatus == true)
				maestro.estatus = false;
			else
				maestro.estatus = true;
			
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
	
};



