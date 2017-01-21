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
		  console.log("es diferetne")
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
	  console.log(usuario);
	  console.log(rol);
	  
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
});