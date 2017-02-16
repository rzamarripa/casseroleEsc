Meteor.methods({
	getInscripciones: function (options) {
		if(options.where.nombreCompleto.length > 3){
			let selector = {
				"profile.nombreCompleto": { '$regex' : '.*' + options.where.nombreCompleto || '' + '.*', '$options' : 'i' },
				"profile.campus_id": options.where.campus_id,
				roles : ["alumno"]
			}
			
			var alumnos 				= Meteor.users.find(selector, options.options).fetch();
			var alumnos_ids = _.pluck(alumnos, "_id");
			
			var inscripciones = Inscripciones.find({alumno_id : { $in : alumnos_ids}}).fetch();
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
					fechaCreacion			: new Date(),
					mesPago			  		: mfecha.get('month') + 1,
					anioPago		  		: mfecha.get('year'),
					semanaPago        : mfecha.isoWeek(),
					diaPago           : mfecha.isoWeekday(),
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
					fechaCreacion			: new Date(),
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
		_.each(grupos, function(grupo, indexGrupo){
			_.each(grupo.alumnos, function(alumno, indexAlumno){
				if(alumno.alumno_id == inscripcion.alumno_id){
					grupo.alumnos.splice(indexAlumno, 1);
					var idTemp = grupo._id;
					Grupos.update({_id : idTemp}, { $set : grupo});
				}
			})
			
		});
	},
	generaComisionesVendedor : function (inscripcion, configInscripcion, pago){
		//OBTENER LOS OBJETOS CON LOS QUE SE LLENARÁ LA INSCRIPCIÓN
		var grupo 						= Grupos.findOne(inscripcion.grupo_id);
		var planEstudio 			= PlanesEstudios.findOne(grupo.planEstudios_id)
		var campus	 					= Campus.findOne(Meteor.user().profile.campus_id);
		var cantidadAlumnos 	= Meteor.users.find({roles : ["alumno"], "profile.campus_id" : campus._id}).count();
		var vendedor 					= Meteor.users.findOne({_id : inscripcion.vendedor_id});
		var configColegiatura = inscripcion.planPagos.colegiatura[inscripcion.planPagos.colegiatura.tipoColegiatura];
		var cuentaInscripcion = Cuentas.findOne({inscripcion: true});

		//VARIABLES REUTILIZABLES
		var diaActual 	= moment(new Date()).isoWeekday();
		var semanaPago 	= moment(new Date()).isoWeek();
		var mesPago 		= moment(new Date()).get('month') + 1;
		var anioPago 		= moment(new Date()).get('year');

		var tipoPlanPagos = inscripcion.planPagos.colegiatura.tipoColegiatura;
		Comisiones.insert({
			alumno_id : inscripcion.alumno_id,
			cantidad 	: 1,
			inscripcion_id 	: inscripcion._id,
			importePagado 	: pago,
			importeComision : pago,
			grupo_id		: inscripcion.grupo_id,
			seccion_id  : Meteor.user().profile.seccion_id,
			campus_id 	: Meteor.user().profile.campus_id,
			fechaPago 	: new Date(),
			diaPago     : diaActual,
			mesPago     : mesPago,
			semanaPago  : semanaPago,
			anioPago    : anioPago,
			vendedor_id : inscripcion.vendedor_id,
			importeInscripcion : configInscripcion.importe,
			importeColegiatura : inscripcion.planPagos.colegiatura[tipoPlanPagos].importeRegular,
			gerente_id 	: vendedor.profile.gerenteVenta_id,
			estatus			: 1,
			cuenta_id 	: cuentaInscripcion._id,
			beneficiario : "vendedor"
		});

	},
	inscribirAlumno : function (inscripcion) {
		function sortProperties(obj, sortedBy, isNumericSort, reverse) {
            sortedBy = sortedBy || 1; // by default first key
            isNumericSort = isNumericSort || false; // by default text sort
            reverse = reverse || false; // by default no reverse

            var reversed = (reverse) ? -1 : 1;

            var sortable = [];
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    sortable.push([key, obj[key]]);
                }
            }
            if (isNumericSort)
                sortable.sort(function (a, b) {
                    return reversed * (a[1][sortedBy] - b[1][sortedBy]);
                });
            else
                sortable.sort(function (a, b) {
                    var x = a[1][sortedBy].toLowerCase(),
                        y = b[1][sortedBy].toLowerCase();
                    return x < y ? reversed * -1 : x > y ? reversed : 0;
                });
            return sortable; // array in format [ [ key1, val1 ], [ key2, val2 ], ... ]
        }

        function sortObjects(objects, sortedBy, isNumericSort, reverse) {
		    var newObject = {};
		    sortedBy = sortedBy || 1; // by default first key
            isNumericSort = isNumericSort || false; // by default text sort
            reverse = reverse || false; // by default no reverse
		    var sortedArray = sortProperties(objects, sortedBy, isNumericSort, reverse);
		    for (var i = 0; i < sortedArray.length; i++) {
		        var key = sortedArray[i][0];
		        var value = sortedArray[i][1];
		        newObject[key] = value;
		    }
		    return newObject;
		}

		//VARIABLES REUTILIZABLES
		var diaActual 	= moment(new Date()).isoWeekday();
		var semanaPago 	= moment(new Date()).isoWeek();
		var mesPago 		= moment(new Date()).get('month') + 1;
		var anioPago 		= moment(new Date()).get('year');
		
		


		//OBTENER LOS OBJETOS CON LOS QUE SE LLENARÁ LA INSCRIPCIÓN
		var grupo 						= Grupos.findOne(inscripcion.grupo_id);
		var planEstudio 			= PlanesEstudios.findOne(grupo.planEstudios_id)
		var campus	 					= Campus.findOne(Meteor.user().profile.campus_id);
		var cantidadAlumnos 	= Meteor.users.find({roles : ["alumno"], "profile.campus_id" : campus._id}).count();
		var vendedor 					= Meteor.users.findOne({_id : inscripcion.vendedor_id});
		var configColegiatura = inscripcion.planPagos.colegiatura[inscripcion.planPagos.colegiatura.tipoColegiatura];
		var cuentaInscripcion = Cuentas.findOne({inscripcion: true});
		
		//PREPARAR PLAN DE PAGOS
		var remanente =  configColegiatura.importeRegular;
		inscripcion.planPagos.fechas[0].estatus = 1;
		inscripcion.planPagos.fechas[0].pago = configColegiatura.importeRegular;

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
		inscripcion.abono 			= 0;
		
		var matriculaAnterior = 0;
		var anio = '' + new Date().getFullYear();
		anio = anio.substring(2,4);
		
		//Si existen Alumnos generamos la matrícula siguiente
		if(cantidadAlumnos > 0){
			var matriculaOriginal 		= anio + campus.clave + "0000";
			var matriculaOriginalN 		= parseInt(matriculaOriginal);
			var matriculaNueva 				= matriculaOriginalN + cantidadAlumnos + 1;
	  		matriculaNueva 						= 'e'+ matriculaNueva
			alumno.username 					= matriculaNueva;
			alumno.profile.matricula 	= matriculaNueva;
			alumno.password 					= matriculaNueva;
		}else{
			//Si no existen Alumnos generamos la primer matrícula
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
		

		//CALCULAR PAGOS DE CONCEPTOS

		var conIns = inscripcion.planPagos.inscripcion;
		inscripcion.pagos={};
		remanente = (inscripcion.importePagado - inscripcion.cambio )- configColegiatura.importeRegular;
		var configInscripcion = undefined;
		var inscripcionConnceptoId= undefined;
		inscripcion.planPagos.inscripcion.conceptos = sortObjects(inscripcion.planPagos.inscripcion.conceptos,"orden",false,false);
		_.each(inscripcion.planPagos.inscripcion.conceptos,function(concepto,connceptoId){
			if(!configInscripcion){
				configInscripcion = concepto;
				inscripcionConnceptoId = connceptoId;
			}
			inscripcion.pagos[connceptoId]={
				_id:connceptoId,
				importeRegular:concepto.importe,
				importeDescuento:concepto.importe-conIns.importeDescuento,
				importeRecargo:concepto.importe+conIns.importeRecargo,
				importe:concepto.importe,
				estatus:0,
				nombre:concepto.nombre,
				pago:0,
				tiempoPago: 0,
				fecha: inscripcion.fechaInscripcion,
				fechaRegistro: new Date(),
				restante:0
			};
			if(remanente>=concepto.importe){
				inscripcion.pagos[connceptoId].pago=inscripcion.pagos[connceptoId].importeRegular;
				inscripcion.pagos[connceptoId].estatus=1;
				inscripcion.pagos[connceptoId].fechaPago = new Date();
				inscripcion.pagos[connceptoId].semanaPago = moment().isoWeek();
				inscripcion.pagos[connceptoId].anioPago = moment().get('year');
				inscripcion.pagos[connceptoId].mesPago = moment().get('month')+1;
				inscripcion.pagos[connceptoId].diaPago = moment().isoWeekday();
				inscripcion.pagos[connceptoId].tiempoPago = 0;
			}
			else if(remanente>0){
				if(connceptoId==inscripcionConnceptoId){
					inscripcion.pagos[connceptoId].pago=remanente;
					inscripcion.pagos[connceptoId].faltante=inscripcion.pagos[connceptoId].importeRegular-remanente;
					inscripcion.pagos[connceptoId].estatus=6;
					inscripcion.pagos[connceptoId].fechaPago = new Date();
					inscripcion.pagos[connceptoId].semanaPago = moment().isoWeek();
					inscripcion.pagos[connceptoId].anioPago = moment().get('year');
					inscripcion.pagos[connceptoId].mesPago = moment().get('month')+1;
					inscripcion.pagos[connceptoId].diaPago = moment().isoWeekday();
					inscripcion.pagos[connceptoId].tiempoPago = 0;
				}
				else
					inscripcion.abono+=remanente;
			}
			remanente-=concepto.importe;
		});

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
		remanente =  configColegiatura.importeRegular;
		Comisiones.insert({
			alumno_id : inscripcion.alumno_id,
			cantidad 	: 1,
			inscripcion_id 	: inscripcion._id,
			importePagado 	: inscripcion.importePagado,
			importeComision : remanente,
			grupo_id		: inscripcion.grupo_id,
			seccion_id  : Meteor.user().profile.seccion_id,
			campus_id 	: Meteor.user().profile.campus_id,
			fechaPago 	: new Date(),
			diaPago     : diaActual,
			mesPago     : mesPago,
			semanaPago  : semanaPago,
			anioPago    : anioPago,
			vendedor_id : inscripcion.vendedor_id,
			importeInscripcion : configInscripcion.importe,
			importeColegiatura : inscripcion.planPagos.colegiatura[tipoPlanPagos].importeRegular,
			gerente_id 	: vendedor.profile.gerenteVenta_id,
			estatus			: 1,
			cuenta_id 	: cuentaInscripcion._id,
			beneficiario : "gerente"
		});
		remanente = (inscripcion.importePagado - inscripcion.cambio )- configColegiatura.importeRegular;
		remanente = remanente>configInscripcion.importe? configInscripcion.importe:remanente;
		Comisiones.insert({
			alumno_id : inscripcion.alumno_id,
			cantidad 	: 1,
			inscripcion_id 	: inscripcion._id,
			importePagado 	: inscripcion.importePagado,
			importeComision : remanente,
			grupo_id		: inscripcion.grupo_id,
			seccion_id  : Meteor.user().profile.seccion_id,
			campus_id 	: Meteor.user().profile.campus_id,
			fechaPago 	: new Date(),
			diaPago     : diaActual,
			mesPago     : mesPago,
			semanaPago  : semanaPago,
			anioPago    : anioPago,
			vendedor_id : inscripcion.vendedor_id,
			importeInscripcion : configInscripcion.importe,
			importeColegiatura : inscripcion.planPagos.colegiatura[tipoPlanPagos].importeRegular,
			gerente_id 	: vendedor.profile.gerenteVenta_id,
			estatus			: 1,
			cuenta_id 	: cuentaInscripcion._id,
			beneficiario : "vendedor"
		});


		
		//RETORNAMOS EL ID DEL ALUMNO PARA SU REDIRECCIONAMIENTO A LA VISTA PERFIL
		return inscripcion.alumno_id;
	}
	
});