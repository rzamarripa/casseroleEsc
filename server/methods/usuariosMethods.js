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
		
		if(usuarioActual.roles == ["alumno"] && usuarioActual.profile.estatus != 6){
			return true;
		}else{
			return usuarioActual.profile.estatus;
		}
		
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
	},
	cambiarEstatusAlumno : function(alumno_id, estatus, classLabel, estatusNombre, seccion_id){
		
		var alumno = Meteor.users.findOne({ _id : alumno_id});
		var diaSemana = moment().isoWeekday();
		var dia = moment().date();
		var semana = moment().isoWeek();
		var mes = moment().month() + 1;
		var anio = moment().year();
		
		BitacoraEstatus.insert({alumno_id : alumno_id, estatusAnterior : parseInt(alumno.profile.estatus), estatusActual : parseInt(estatus), fechaCreacion : new Date(), diaSemana : diaSemana, dia : dia, semana : semana, mes : mes, anio : anio, seccion_id : seccion_id });
		Meteor.users.update({_id : alumno_id}, {$set : {"profile.semanaEstatus " : moment().isoWeek(), "profile.estatus" : estatus, "profile.estatusObj.classLabel" : classLabel, "profile.estatusObj.nombre" : estatusNombre, "profile.estatusObj.codigo" : estatus}});
		return obtenerEstatusNombre(estatus);
	},
	getAlumnosPorEstatus : function(fechaInicio, fechaFin, estatus, seccion_id){
		var estatusNombre = obtenerEstatusNombre(estatus);
		var bitacoras = BitacoraEstatus.find({fechaCreacion : { $gte : fechaInicio, $lt : fechaFin}, estatusActual : parseInt(estatus), seccion_id : seccion_id}).fetch();
		if(bitacoras.length > 0){
			_.each(bitacoras, function(bitacora){
				bitacora.alumno = Meteor.users.findOne({_id : bitacora.alumno_id}, { fields : {"profile.nombreCompleto" : 1, "profile.matricula" : 1, "profile.estatus" : 1, "profile.estatusObj" : 1}});
				bitacora.estatusNombre = estatusNombre;
			})
		}
		return bitacoras;
	},
	getCantAlumnosPorEstatus : function(fechaInicio, fechaFin, estatus, seccion_id){
		
		var bitacoras = BitacoraEstatus.find({fechaCreacion : { $gte : fechaInicio, $lt : fechaFin}, seccion_id : seccion_id}).fetch();
		
		fechaInicio = moment(fechaInicio);
		fechaFin = moment(fechaFin);
		
		var semanas = [];
		while (fechaFin > fechaInicio) {
		   semanas.push(fechaInicio.isoWeek());
		   fechaInicio = fechaInicio.day(8);
		}
		
		
		var elementos = [];
		for(i = 0; i < semanas.length; i++){
			elementos.push(0);
		}

		
		
		var cantBitacoras = {};
		if(bitacoras.length > 0){
			_.each(bitacoras, function(bitacora){
				if(cantBitacoras[bitacora.estatusActual] == undefined){
					cantBitacoras[bitacora.estatusActual] = {};
					cantBitacoras[bitacora.estatusActual].name = obtenerEstatusNombre(bitacora.estatusActual);
					cantBitacoras[bitacora.estatusActual].data = elementos.slice();
					cantBitacoras[bitacora.estatusActual].color = obtenerColorEstatus(bitacora.estatusActual);
					cantBitacoras[bitacora.estatusActual].data[bitacora.semana - semanas[0]] = 1;
				}else{
					cantBitacoras[bitacora.estatusActual].data[bitacora.semana - semanas[0]] += 1;
				}
			})
		}

		cantBitacoras = _.toArray(cantBitacoras);
		
		return [semanas, cantBitacoras, bitacoras];

	},
	buscarEnGrupo : function(nombreCompleto, seccion_id){
		if(nombreCompleto.length > 3){
			let selector = {
				"profile.nombreCompleto": { '$regex' : '.*' + nombreCompleto || '' + '.*', '$options' : 'i' },
				"profile.seccion_id": seccion_id,
				roles : ["alumno"]
			}
			
			var alumnos 				= Meteor.users.find(selector).fetch();
			var alumnos_ids = _.pluck(alumnos, "_id");
			
			_.each(alumnos, function(alumno){
				alumno.profile.inscripciones = Inscripciones.find({alumno_id : alumno._id, estatus : 1}).fetch();
			})
			return alumnos;
		} 
	}
});

function obtenerEstatusNombre(estatus){
	var estatusNombre = "";
	if(estatus == 1){ //Registrado
	  var estatusNombre = "Registrado";
  }else if(estatus == 2){
	  var estatusNombre = "Inicio";
  }else if(estatus == 3){
	  var estatusNombre = "Inicio Pospuesto";
  }else if(estatus == 4){
	  var estatusNombre = "Fantasma";
  }else if(estatus == 5){
	  var estatusNombre = "Activo";
  }else if(estatus == 6){
	  var estatusNombre = "Baja";
  }else if(estatus == 7){
	  var estatusNombre = "Terminación de Pago";
  }else if(estatus == 8){
	  var estatusNombre = "Egresado";
  }
  
  return estatusNombre;
}

function obtenerColorEstatus(estatus){
	if(estatus == 1){
	  return "#57889c";
  }else if(estatus == 2){
	  return "#6e587a";
  }else if(estatus == 3){
	  return "#b09b5b";
  }else if(estatus == 4){
	  return "#92a2a8";
  }else if(estatus == 5){
	  return "#71843f";
  }else if(estatus == 6){
	  return "#a90329";
  }else if(estatus == 7){
	  return "#4c4f53";
  }else if(estatus == 8){
	  return "blue";
  }
}