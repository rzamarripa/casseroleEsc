Meteor.methods({
  createUsuario: function (usuario, rol) {
	  profile = {
				email: usuario.correo,
				nombre: usuario.nombre,
				apellidos: usuario.apPaterno + " " + usuario.apMaterno,
				nombreCompleto : usuario.nombre  + " " + usuario.apPaterno + " " + (usuario.apMaterno ? usuario.apMaterno : ""),
				fotografia : usuario.fotografia,
				sexo : usuario.sexo,
				estatus:true,
				campus_id : usuario.campus_id,
				seccion_id : usuario.seccion_id
			}
		if(usuario.maestro_id != undefined)
			profile.maestro_id = usuario.maestro_id;
		
		var usuario_id = Accounts.createUser({
			username: usuario.nombreUsuario,
			password: usuario.contrasena,
			profile: profile
		});
		
		Roles.addUsersToRoles(usuario_id, rol);
		
	},
	userIsInRole: function(usuario, rol, grupo, vista){
		if (!Roles.userIsInRole(usuario, rol, grupo)) {
	    throw new Meteor.Error(403, "Usted no tiene permiso para entrar a " + vista);
	  }
	},
	updateUsuario: function (usuario, id, rol) {
	  var user = Meteor.users.findOne({"username" : usuario.nombreUsuario});
	  
	  profile = {
			email: usuario.correo,
			nombre: usuario.nombre,
			sexo : usuario.sexo,
			apellidos: usuario.apPaterno + " " + usuario.apMaterno,
			nombreCompleto : usuario.nombre  + " " + usuario.apPaterno + " " + usuario.apMaterno,
			fotografia : usuario.fotografia
		}
	  
	  if(usuario.maestro_id != undefined){
		  profile.maestro_id = id;
	  }
			
			
	  Meteor.users.update({username: user.username}, {$set:{
			username: usuario.nombreUsuario,
			roles: [rol],
			profile: profile
		}});
		Accounts.setPassword(user._id, usuario.contrasena, {logout: false});
	},
	createGerenteVenta: function (usuario, rol) {
	  console.log("Inscribir Alumno");
	  
	  usuario.profile.friends = [];
	  
		if(usuario.maestro_id != undefined)
			profile.maestro_id = usuario.maestro_id;
		
		var usuario_id = Accounts.createUser({
			username: usuario.username,
			password: usuario.password,			
			profile: usuario.profile
		});
		
		Roles.addUsersToRoles(usuario_id, rol);
		
		return usuario_id;
		
	},
	updateGerenteVenta: function (usuario, rol) {		
		console.log("usuario", usuario)
		var user = Meteor.users.findOne(usuario._id);
	  Meteor.users.update({_id: user._id}, {$set:{
			username: usuario.username,
			roles: [rol],
			profile: usuario.profile
		}});
		
		Accounts.setPassword(user._id, usuario.password, {logout: false});		
	},
	updateDirector: function (usuario, rol) {		
		console.log("usuario", usuario)
		var usuarioViejo = Meteor.users.findOne({"profile.seccion_id" : usuario.profile.seccion_id});
		var idTemp = usuarioViejo._id;
		console.log("usuario viejo", usuarioViejo);
	  Meteor.users.update({_id: idTemp}, {$set:{
			username: usuario.username,
			roles: [rol],
			profile: usuario.profile
		}});
		
		Accounts.setPassword(idTemp, usuario.password, {logout: false});		
	},
	cantidadVendedores : function(campus_id) {
	  var cantidad = Meteor.users.find({roles : ["vendedor"], "profile.campus_id" : campus_id}).count();
	  return cantidad;
  },
  generarUsuario : function (prefijo, usuario, rol){
	  
	  //Reviso cuantos usuario hay con el rol asignado de ese campus
	  var cantidadUsuarios = 0;
	  if(prefijo == "c"){
		  cantidadUsuarios = Meteor.users.find({"profile.campus_id": usuario.profile.campus_id, roles : { $in : ["coordinadorAcademico", "coordinadorFinanciero"]}}).count();
	  }else{
		  cantidadUsuarios = Meteor.users.find({"profile.campus_id": usuario.profile.campus_id, roles : [rol]}).count();
	  }
	  	  
	  var campus = Campus.findOne({_id : usuario.profile.campus_id});
		var usuarioAnterior = 0;
	  anio = '' + new Date().getFullYear();
	  anio = anio.substring(2,4);
	  
	  //Si existen Usuarios generamos el usuario siguiente
		if(cantidadUsuarios > 0){
	  	var usuarioOriginal = anio + campus.clave + "0000";
	  	var usuarioOriginalN = parseInt(usuarioOriginal);
	  	var usuarioNuevo = usuarioOriginalN + cantidadUsuarios + 1;
	  	usuarioNuevo = prefijo + usuarioNuevo;
			usuario.username = usuarioNuevo;
		  usuario.profile.usuario = usuarioNuevo;
		  usuario.password = "123qwe";
		  
	  }else{
		  
		  //Si no existen Usuarios generamos al primero
		  usuario.username = prefijo + anio + campus.clave + "0001";
		  usuario.profile.usuario = prefijo + anio + campus.clave + "0001";
		  usuario.password = "123qwe";
	  }

	  var usuario_id = Accounts.createUser({
			username: usuario.username,
			password: usuario.password,
			profile: usuario.profile
		});
		
		Roles.addUsersToRoles(usuario_id, rol);
	  
  },
  modificarUsuario: function (usuario, rol) {		
		var user = Meteor.users.findOne(usuario._id);
	  Meteor.users.update({_id: user._id}, {$set:{
			username: usuario.username,
			roles: [rol],
			profile: usuario.profile
		}});
		
		if(usuario.password != undefined){
			Accounts.setPassword(user._id, usuario.password, {logout: false});		
		}
	},
});