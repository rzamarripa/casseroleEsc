Meteor.methods({
  createUsuario: function (usuario, rol) {
  	usuario.contrasena = Math.random().toString(36).substring(2,7);
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
		Meteor.call('sendEmail',
			profile.email,
			'sistema@casserole.edu.mx',
			'Bienvenido a Casserole',
			'Usuario: '+ usuario.nombreUsuario + ' contraseña: '+ usuario.contrasena
		);
		return usuario_id;
	},
	sendEmail: function (to, from, subject, text) {
    this.unblock();
    Email.send({
      to: to,
      from: from,
      subject: subject,
      text: text
    });
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
			fotografia : usuario.fotografia,
			estatus : usuario.estatus
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
		var user = Meteor.users.findOne(usuario._id);
	  Meteor.users.update({_id: user._id}, {$set:{
			username: usuario.username,
			roles: [rol],
			profile: usuario.profile
		}});
		
		Accounts.setPassword(user._id, usuario.password, {logout: false});		
	},
	updateDirector: function (usuario, rol) {		
		var usuarioViejo = Meteor.users.findOne({"profile.seccion_id" : usuario.profile.seccion_id});
		var idTemp = usuarioViejo._id;
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
	usuarioActivo : function (usuario){
		var usuarioActual = Meteor.users.findOne({username : usuario});
		return usuarioActual.profile.estatus;
	},
	buscarAlumnos : function(options){
		if(options.where.nombreCompleto.length > 0){
			var semanaActual = moment().isoWeek();
			
			let selector = {
		  	"profile.nombreCompleto": { '$regex' : '.*' + options.where.nombreCompleto || '' + '.*', '$options' : 'i' },
		  	"profile.campus_id": options.where.campus_id,
		  	roles : ["alumno"]
			}
			
			var alumnos = Meteor.users.find(selector, options.options).fetch();	
			_.each(alumnos, function(alumno){
				alumno.profile.seccion = Secciones.findOne(alumno.profile.seccion_id);
				alumno.profile.inscripciones = Inscripciones.find({alumno_id : alumno._id}).fetch();
				alumno.profile.grupos = [];
				_.each(alumno.profile.inscripciones, function(inscripcion){
					var grupo = Grupos.findOne(inscripcion.grupo_id);
					grupo.turno = Turnos.findOne(grupo.turno_id);
					alumno.profile.grupos.push(grupo);
				});
				
				_.each(alumno.profile.grupos, function(grupo){
					grupo.inasistenciasSemana = Asistencias.find({alumno_id : alumno._id, grupo_id : grupo._id, estatus : 0}).count();
					if(grupo.inasistenciasSemana >= grupo.turno.inasistencias){
						grupo.classButton = "btn-danger";
					}else{						
						if(alumno.profile.estatus == 1){ //Registrado
						  grupo.classButton = "bg-color-blue txt-white";
					  }else if(alumno.profile.estatus == 2){
						  grupo.classButton = "bg-color-purple txt-white"
					  }else if(alumno.profile.estatus == 3){
						  grupo.classButton = "bg-color-yellow txt-white"
					  }else if(alumno.profile.estatus == 4){
						  grupo.classButton = "bg-color-blueLight txt-white"
					  }else if(alumno.profile.estatus == 5){
						  grupo.classButton = "bg-color-greenLight txt-white"
					  }else if(alumno.profile.estatus == 6){
						  grupo.classButton = "bg-color-red txt-white"
					  }else if(alumno.profile.estatus == 7){
						  grupo.classButton = "bg-color-blueDark txt-white"
					  }else if(alumno.profile.estatus == 8){
						  grupo.classButton = "label-primary txt-white"
					  }
					}
				});
			});
		}
		return alumnos;
	}
});