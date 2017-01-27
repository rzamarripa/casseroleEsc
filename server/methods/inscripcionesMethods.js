Meteor.methods({
  getInscripciones: function (options) {
    if(options.where.nombreCompleto.length > 3){
			let selector = {
		  	"profile.nombreCompleto": { '$regex' : '.*' + options.where.nombreCompleto || '' + '.*', '$options' : 'i' },
		  	"profile.seccion_id": options.where.seccion_id,
		  	roles : ["alumno"]
			}
			
			var alumnos 				= Meteor.users.find(selector, options.options).fetch();
			console.log(alumnos.length)
			var alumnos_ids = _.pluck(alumnos, "_id");
			
			console.log("alumnos ", alumnos_ids)
			var inscripciones = Inscripciones.find({alumno_id : { $in : alumnos_ids}}).fetch();
			console.log(inscripciones.length);
	    inscripciones.forEach(function (inscripcion) {
	      inscripcion.alumno 			= Meteor.users.findOne({_id : inscripcion.alumno_id});
	      inscripcion.grupo 			= Grupos.findOne({_id : inscripcion.grupo_id});
	      inscripcion.seccion 		= Secciones.findOne({_id : inscripcion.seccion_id});
	      inscripcion.ciclo 			= Ciclos.findOne({_id : inscripcion.ciclo_id});
	      inscripcion.planEstudio = PlanesEstudios.findOne({_id : inscripcion.planEstudios_id});
	    });
			
	    return inscripciones;   
	  }
  },
  cantidadAlumnos : function(campus_id) {
	  var cantidad = Meteor.users.find({roles : ["alumno"], "profile.campus_id" : campus_id}).count();
	  return cantidad;
  },
  generaPlanPagos : function(inscripcion) {
	 
	  var mfecha = moment(new Date());
	  var cuentaActiva = Cuentas.findOne({estatus:true, seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : ""});
	  _.each(inscripcion.planPagos.fechas, function(pago){
		  var nuevoPago = {};
		  if(pago.estatus == 1){
			  nuevoPago = {
				  alumno_id         : inscripcion.alumno_id,
					inscripcion_id    : inscripcion._id,
					vendedor_id       : inscripcion.vendedor_id,
					seccion_id        : inscripcion.seccion_id,
					campus_id         : inscripcion.campus_id,
					fechaInscripcion  : inscripcion.fechaInscripcion,
					semana            : pago.semana,
					fecha             : pago.fecha,
					dia               : pago.dia,
					tipoPlan          : pago.tipoPlan,
					numeroPago        : pago.numeroPago,
					importeRecargo    : pago.importeRecargo,
					importeDescuento  : pago.importeDescuento,
					importeRegular    : pago.importeRegular,
					diasRecargo       : pago.diasRecargo,
					diasDescuento     : pago.diasDescuento,
					importe           : pago.importeRegular,
					pago              : pago.pago,
					fechaPago         : new Date(mfecha.toDate().getTime()),
					mesPago			  		: mfecha.get('month') + 1,
				  anioPago		  		: mfecha.get('year'),
					semanaPago        : mfecha.isoWeek(),
					diaPago           : mfecha.weekday(),
					faltante          : pago.importeRegular-pago.pago,
					estatus           : 1,
					tiempoPago        : 0,
					modificada        : false,
					mes               : pago.mes,
					anio              : pago.anio,
					pago_id           : inscripcion.pago_id,
					modulo						: "colegiatura",
					cuenta_id					: cuentaActiva._id,
					descripcion				: "Colegiatura",
					usuarioInserto_id : Meteor.userId()
				}
				
		  }else{
		  	var fechaActual = moment();
				var fechaCobro = moment(pago.fecha);
				var diasRecargo = fechaActual.diff(fechaCobro, 'days')
				var diasDescuento = fechaCobro.diff(fechaActual, 'days')
				var tiempoPago =0;
				var pesos = pago.importeRegular;

				if(diasRecargo >= pago.diasRecargo){
					pesos = pago.importeRegular+pago.importeRecargo;
					tiempoPago =1;
				}
				

		    nuevoPago = {
		  		alumno_id         : inscripcion.alumno_id,
					inscripcion_id    : inscripcion._id,
					vendedor_id       : inscripcion.vendedor_id,
					seccion_id        : inscripcion.seccion_id,
					campus_id         : inscripcion.campus_id,
					fechaInscripcion  : inscripcion.fechaInscripcion,
					semana            : pago.semana,
					fecha             : pago.fecha,
					dia               : pago.dia,
					tipoPlan          : pago.tipoPlan,
					numeroPago        : pago.numeroPago,
					importeRecargo    : pago.importeRecargo,
					importeDescuento  : pago.importeDescuento,
					importeRegular    : pago.importeRegular,
					diasRecargo       : pago.diasRecargo,
					diasDescuento     : pago.diasDescuento,
					importe           : pesos,
					faltante          : pago.faltante,
					pago              : 0,
					mesPago					  : undefined,
				  anioPago				  : undefined,
					fechaPago         : undefined,
					semanaPago        : undefined,
					diaPago           : undefined,
					estatus           : pago.estatus,
					tiempoPago        : tiempoPago,
					modificada        : false,
					mes               : pago.mes,
					anio              : pago.anio,
					pago_id           : undefined,
					modulo						: "colegiatura",
					cuenta_id					: cuentaActiva._id,
					descripcion				: "Colegiatura"			
				}
	  	}
		  
			PlanPagos.insert(nuevoPago);
		})
	  inscripcion.planPagos.fechas = undefined;

	  for(var idd in inscripcion.pagos){
	  	if(inscripcion.pagos[idd].estatus != 0)
	  		inscripcion.pagos[idd].pago_id = inscripcion.pago_id;
	  }
	  Inscripciones.update({_id:inscripcion._id},{$set:{pagos:inscripcion.pagos,planPagos:inscripcion.planPagos}});
  },
  reactivarPlanPagos : function(inscripcion) {
		//PlanPagos.update({inscripcion_id : inscripcion, estatus : 2}, {$set : { estatus : 0}}, {multi : true});
	},
  cancelarPlanPagos : function(inscripcion) {
	  var inscripcion = Inscripciones.findOne(inscripcion);
		//PlanPagos.update({inscripcion_id : inscripcion, estatus : 0}, {$set : { estatus : 2}}, {multi : true});
		var grupos = Grupos.find(
		   { "alumnos.alumno_id": inscripcion.alumno_id }
		).fetch();
		console.log("alumno_id", inscripcion.alumno_id)
		console.log("grupos", grupos);
		_.each(grupos, function(grupo, indexGrupo){
			_.each(grupo.alumnos, function(alumno, indexAlumno){
				if(alumno.alumno_id == inscripcion.alumno_id){
					console.log("Aquí estoy ", alumno);
					grupo.alumnos.splice(indexAlumno, 1);
					var idTemp = grupo._id;
					Grupos.update({_id : idTemp}, { $set : grupo});
				}
			})
			
		});
		
		console.log(grupos);
	},
	inscribirAlumno : function (inscripcion) {
		
		//VARIABLES REUTILIZABLES
		var diaActual 	= moment(new Date()).weekday();
		var semanaPago 	= moment(new Date()).isoWeek();
		var mesPago 		= moment(new Date()).get('month') + 1;
		var anioPago 		= moment(new Date()).get('year');
		
		//OBTENER LOS OBJETOS CON LOS QUE SE LLENARÁ LA INSCRIPCIÓN
		var grupo 						= Grupos.findOne(inscripcion.grupo_id);
		var planEstudio 			= PlanesEstudios.findOne(grupo.planEstudios_id)
		var campus	 					= Campus.findOne(Meteor.user().profile.campus_id);
		console.log("campus", campus._id);
		var cantidadAlumnos 	= Meteor.users.find({roles : ["alumno"], "profile.campus_id" : campus._id}).count();
		console.log(cantidadAlumnos);
		var vendedor 					= Meteor.users.findOne({_id : inscripcion.vendedor_id});
		var cuentaInscripcion = Cuentas.findOne({inscripcion: true});
		
		//PREPARAR AL ALUMNO
		var prospecto = Prospectos.findOne({_id : inscripcion.prospecto_id});
		delete prospecto._id;
		delete prospecto.estatus;
		var alumno 		= prospecto;
		var nombre 		= alumno.profile.nombre 	 != undefined ? alumno.profile.nombre + " " : "";
		var apPaterno = alumno.profile.apPaterno != undefined ? alumno.profile.apPaterno + " " : "";
		var apMaterno = alumno.profile.apMaterno != undefined ? alumno.profile.apMaterno : "";
		alumno.profile.nombreCompleto = nombre + apPaterno + apMaterno;
		alumno.profile.fechaCreacion 	= new Date();
		alumno.profile.campus_id 			= Meteor.user().profile.campus_id;
		alumno.profile.seccion_id 		= Meteor.user().profile.seccion_id;
		alumno.profile.usuarioInserto = Meteor.userId();
		alumno.profile.estatus 				= true;
		
		
		//PREPARAR LA INSCRIPCIÓN
		inscripcion.planEstudios_id = grupo.planEstudios_id;		
		inscripcion.campus_id 			= Meteor.user().profile.campus_id;
		inscripcion.seccion_id 			= Meteor.user().profile.seccion_id;
		inscripcion.estatus 				= 1;
		inscripcion.semana 					= moment(new Date()).isoWeek();
		
		var matriculaAnterior = 0;
	  var anio = '' + new Date().getFullYear();
	  anio = anio.substring(2,4);
	  
	  //Si existen Alumnos generamos la matrícula siguiente
		if(cantidadAlumnos > 0){
			console.log("entre aqui")
	  	var matriculaOriginal 		= anio + campus.clave + "0000";
	  	var matriculaOriginalN 		= parseInt(matriculaOriginal);
	  	var matriculaNueva 				= matriculaOriginalN + cantidadAlumnos + 1;
	  	matriculaNueva 						= 'e'+ matriculaNueva
			alumno.username 					= matriculaNueva;
		  alumno.profile.matricula 	= matriculaNueva;
		  alumno.password 					= matriculaNueva;
		  
	  }else{
		  //Si no existen Alumnos generamos la primer matrícula
		  console.log("entre aca")
		  alumno.username 					= "e" + anio + campus.clave + "0001";
		  alumno.profile.matricula 	= "e" + anio + campus.clave + "0001";
		  alumno.password 					= alumno.profile.matricula;
	  }

	  //CREAR EL USUARIO ALUMNO
	  alumno.profile.friends = [];	 		
		var usuario_id = Accounts.createUser({
			username: alumno.username,
			password: alumno.password,			
			profile: alumno.profile
		});
		
		//ASIGNAR ROL DE ALUMNO
		Roles.addUsersToRoles(usuario_id, "alumno");
		
	  inscripcion.alumno_id = usuario_id;
	  Prospectos.update(inscripcion.prospecto_id, { $set : { "profile.estatus" : 3 }})
		Curriculas.insert({estatus : true, alumno_id : inscripcion.alumno_id, planEstudios_id : inscripcion.planEstudios_id, grados : planEstudio.grados });
		
		//SE INSERTA LA INSCRIPCIÓN UNA VEZ QUE SABEMOS EL ID DEL ALUMNO
		inscripcion._id = Inscripciones.insert(inscripcion);
		if(!grupo.alumnos)
			grupo.alumnos=[];
			
		//AGREGAR ALUMNO AL GRUPO
		grupo.alumnos.push({alumno_id : inscripcion.alumno_id, inscripcion_id : inscripcion._id});
		grupo.inscritos = parseInt(grupo.inscritos) + 1;
		delete grupo._id;
		Grupos.update({_id: inscripcion.grupo_id},{$set:grupo});
		
		//REGISTRAR EL PAGO REALIZADO
		inscripcion.pago_id = Pagos.insert({
			fechaPago 	: new Date(),
			alumno_id 	: inscripcion.alumno_id,
			grupo_id		: inscripcion.grupo_id,
			seccion_id  : Meteor.user().profile.seccion_id,
			campus_id 	: Meteor.user().profile.campus_id,
			estatus 		: 1,
			usuarioInserto_id 	: Meteor.userId(),
			importe 		: inscripcion.importePagado - inscripcion.cambio,
			cuenta_id   : cuentaInscripcion._id,
			diaPago     : diaActual,
			mesPago     : mesPago,
			semanaPago  : semanaPago,
			anioPago    : anioPago,
			inscripcion_id : inscripcion._id,
			modulo 			: "inscripcion",
			descripcion : "inscripcion"
		});
		
		//GENERAR PLAN DE PAGOS
	  Meteor.call("generaPlanPagos", inscripcion);
	  
	  //GENERAR COMISIÓN	  
	  var tipoPlanPagos = inscripcion.planPagos.colegiatura.tipoColegiatura;
		Comisiones.insert({
			alumno_id : inscripcion.alumno_id,
			cantidad 	: 1,
			inscripcion_id 	: inscripcion._id,
			importePagado 	: inscripcion.importePagado,
			grupo_id		: inscripcion.grupo_id,
			seccion_id  : Meteor.user().profile.seccion_id,
			campus_id 	: Meteor.user().profile.campus_id,
			fechaPago 	: new Date(),
			diaPago     : diaActual,
			mesPago     : mesPago,
			semanaPago  : semanaPago,
			anioPago    : anioPago,
			vendedor_id : inscripcion.vendedor_id,
			importeColegiatura : inscripcion.planPagos.colegiatura[tipoPlanPagos].importeRegular,
			gerente_id 	: vendedor.profile.gerenteVenta_id,
			estatus			: 1,
			cuenta_id 	: cuentaInscripcion._id
		});
		
		//RETORNAMOS EL ID DEL ALUMNO PARA SU REDIRECCIONAMIENTO A LA VISTA PERFIL
		return inscripcion.alumno_id;
	}
	
});