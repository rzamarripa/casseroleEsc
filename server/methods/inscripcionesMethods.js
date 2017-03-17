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
		var diaSemana 	= moment(new Date()).isoWeekday();
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
					diaPago     			: moment().date(),
					diaSemana					: diaSemana,
					faltante          : pago.importeRegular-pago.pago,
					estatus           : 1,
					tiempoPago        : 0,
					modificada        : false,
					mes               : pago.mes,
					anio              : pago.anio,
					modulo						: "colegiatura",
					cuenta_id					: cuentaActiva._id,
					descripcion				: "Colegiatura",
					usuarioInserto_id : Meteor.userId()
				}
				
				var pago_id = Pagos.insert(nuevoPago);
				nuevoPago.pago_id = pago_id;				
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
					diaSemana					: diaSemana,
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

/*
		for(var idd in inscripcion.pagos){
	  		if(inscripcion.pagos[idd].estatus != 0)
				//inscripcion.pagos[idd].pago_id = inscripcion.pago_id;
		}
*/
		Inscripciones.update({_id:inscripcion._id},{$set:{pagos:inscripcion.pagos,planPagos:inscripcion.planPagos}});
	},
	reactivarPlanPagos : function(inscripcion) {
		PlanPagos.update({inscripcion_id : inscripcion, estatus : 2}, {$set : { estatus : 0}}, {multi : true});
	},
	cancelarPlanPagos : function(inscripcion) {
		var inscripcion = Inscripciones.findOne(inscripcion);
		PlanPagos.update({inscripcion_id : inscripcion, estatus : 0}, {$set : { estatus : 2}}, {multi : true});
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
		var cuentaInscripcion = Cuentas.findOne({inscripcion: true, seccion_id : grupo.seccion_id});

		//VARIABLES REUTILIZABLES
		var diaSemana 	= moment(new Date()).isoWeekday();
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
			diaPago     : moment().date(),
			diaSemana		: diaSemana,
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
	        console.log(a,b, sortedBy);
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
		var diaSemana 	= moment(new Date()).isoWeekday();
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
		var cuentaInscripcion = Cuentas.findOne({seccion_id : grupo.seccion_id, inscripcion : true});
		var cuentaActiva = Cuentas.findOne({estatus:true, seccion_id : grupo.seccion_id});
		
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
		alumno.profile.campus_id 			= grupo.campus_id;
		alumno.profile.seccion_id 		= grupo.seccion_id;
		alumno.profile.usuarioInserto = Meteor.userId();
		alumno.profile.estatus 				= "1";
		
		//PREPARAR LA INSCRIPCIÓN
		inscripcion.planEstudios_id = grupo.planEstudios_id;		
		inscripcion.campus_id 			= grupo.campus_id;
		inscripcion.seccion_id 			= grupo.seccion_id;
		inscripcion.estatus 				= 1;
		inscripcion.semana 					= moment(new Date()).isoWeek();
		inscripcion.abono 			= 0;
		
		var matriculaAnterior = 0;
		var anio = '' + new Date().getFullYear();
		anio = anio.substring( 2, 4);
		
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
		//SE INSERTA LA INSCRIPCIÓN UNA VEZ QUE SABEMOS EL ID DEL ALUMNO
		inscripcion._id = Inscripciones.insert(inscripcion);
		
		_.each(inscripcion.planPagos.inscripcion.conceptos,function(concepto,connceptoId){

			if(!configInscripcion){
				configInscripcion = concepto;
				inscripcionConnceptoId = connceptoId;
			}
			var conceptoActual = ConceptosPago.findOne(connceptoId);
			//Se genera el pago del concepto
			inscripcion.pagos[connceptoId]={
				concepto_id:connceptoId,
				importeRegular:concepto.importe,
				importeDescuento:concepto.importe-conIns.importeDescuento,
				importeRecargo:concepto.importe+conIns.importeRecargo,
				importe:concepto.importe,
				estatus:0,
				nombre:concepto.nombre,
				descripcion : concepto.nombre,
				modulo : "inscripcion",
				pago:0,
				tiempoPago: 0,
				fecha: inscripcion.fechaInscripcion,
				fechaRegistro: new Date(),
				restante:0
			};
			
			if(remanente>=concepto.importe){
				//Si pagó completo el concepto pago
				inscripcion.pagos[connceptoId].pago = inscripcion.pagos[connceptoId].importeRegular;
				inscripcion.pagos[connceptoId].estatus=1;
				inscripcion.pagos[connceptoId].fechaPago = new Date();
				inscripcion.pagos[connceptoId].concepto_id = connceptoId;
				inscripcion.pagos[connceptoId].semanaPago = moment().isoWeek();
				inscripcion.pagos[connceptoId].anioPago = moment().get('year');
				inscripcion.pagos[connceptoId].mesPago = moment().get('month')+1;
				inscripcion.pagos[connceptoId].diaPago = moment().date();
				inscripcion.pagos[connceptoId].diaSemana = moment().isoWeekday();
				inscripcion.pagos[connceptoId].tiempoPago = 0;
				inscripcion.pagos[connceptoId].alumno_id = usuario_id;
				inscripcion.pagos[connceptoId].inscripcion_id = inscripcion._id;
				inscripcion.pagos[connceptoId].seccion_id = grupo.seccion_id;
				inscripcion.pagos[connceptoId].campus_id = grupo.campus_id;
				inscripcion.pagos[connceptoId].cuenta_id = conceptoActual.cuenta_id;
				inscripcion.pagos[connceptoId].usuarioInserto_id = concepto.usuarioInserto;
				//Se inserta el pago completo
				var pago_id = Pagos.insert(inscripcion.pagos[connceptoId]);
				
				//Se insertan los pagos generados en Plan Pagos
				var planPago_id = PlanPagos.insert({
					pago_id : pago_id,
					orden : concepto.orden,
	        nombre : concepto.nombre,
	        descripcion : concepto.nombre,
	        pago : inscripcion.pagos[connceptoId].importeRegular,
	        importe : concepto.importe,
	        modificada : false,
	        modulo : concepto.modulo,
	        fechaPago 	: new Date(),
					semanaPago 	: moment().isoWeek(),
					anioPago 		: moment().get('year'),
					mesPago 		: moment().get('month')+1,
					diaPago 		: moment().date(),
					diaSemana 	: moment().isoWeekday(),
	        estatus 		: inscripcion.pagos[connceptoId].estatus,
					cuenta_id 	: conceptoActual.cuenta_id,
					concepto_id : conceptoActual._id,
	        campus_id 	: concepto.campus_id,
	        seccion_id 	: concepto.seccion_id,
	        usuarioInserto_id : concepto.usuarioInserto,
	        recargo 		: inscripcion.planPagos.inscripcion.recargo,
	        importeRecargo 		: inscripcion.planPagos.inscripcion.importeRecargo,
	        diasRecargo : inscripcion.planPagos.inscripcion.diasRecargo,
	        descuento 	: inscripcion.planPagos.inscripcion.descuento,
	        importeDescuento 	: inscripcion.planPagos.inscripcion.importeDescuento,
	        diasDescuento 		: inscripcion.planPagos.inscripcion.diasDescuento,
	        inscripcion_id 		: inscripcion._id,
	        alumno_id 	: usuario_id
				})
				
				console.log("pago id", pago_id);
				//Se asigna el id del pago al pago de la inscripcion
				inscripcion.pagos[connceptoId].pago_id = pago_id;
				inscripcion.pagos[connceptoId].planPago_id = planPago_id;
			}
			else if(remanente>0){
				//Si quedó dinero entonces se hace un abono al concepto pago
				if(connceptoId==inscripcionConnceptoId){
					inscripcion.pagos[connceptoId].pago=remanente;
					inscripcion.pagos[connceptoId].faltante=inscripcion.pagos[connceptoId].importeRegular-remanente;
					inscripcion.pagos[connceptoId].estatus=6;
					inscripcion.pagos[connceptoId].fechaPago = new Date();
					inscripcion.pagos[connceptoId].concepto_id = connceptoId;
					inscripcion.pagos[connceptoId].cuenta_id = conceptoActual.cuenta_id;
					inscripcion.pagos[connceptoId].semanaPago = moment().isoWeek();
					inscripcion.pagos[connceptoId].anioPago = moment().get('year');
					inscripcion.pagos[connceptoId].mesPago = moment().get('month')+1;
					inscripcion.pagos[connceptoId].diaPago = moment().date();
					inscripcion.pagos[connceptoId].diaSemana = moment().isoWeekday();
					inscripcion.pagos[connceptoId].tiempoPago = 0;
					inscripcion.pagos[connceptoId].alumno_id = usuario_id;
					inscripcion.pagos[connceptoId].inscripcion_id = inscripcion._id;
					inscripcion.pagos[connceptoId].seccion_id = grupo.seccion_id;
					inscripcion.pagos[connceptoId].campus_id = grupo.campus_id;
					inscripcion.pagos[connceptoId].cuenta_id = cuentaActiva._id;
					inscripcion.pagos[connceptoId].usuarioInserto_id = concepto.usuarioInserto;
					//Se inserta el pago completo
					var pago_id = Pagos.insert(inscripcion.pagos[connceptoId]);
					
					//Se insertan los pagos generados en Plan Pagos
					var planPago_id = PlanPagos.insert({
						pago_id : pago_id,
						pago : remanente,
						faltante : inscripcion.pagos[connceptoId].faltante=inscripcion.pagos[connceptoId].importeRegular-remanente,
						orden : concepto.orden,
		        nombre : concepto.nombre,
		        descripcion : concepto.nombre,
		        modificada : false,
		        importe : concepto.importe,
		        modulo : concepto.modulo,
		        fechaPago 	: new Date(),
						semanaPago 	: moment().isoWeek(),
						anioPago 		: moment().get('year'),
						mesPago 		: moment().get('month')+1,
						diaPago 		: moment().date(),
						diaSemana 	: moment().isoWeekday(),
		        estatus : inscripcion.pagos[connceptoId].estatus,
						cuenta_id : conceptoActual.cuenta_id,
						concepto_id : conceptoActual._id,
		        campus_id : concepto.campus_id,
		        seccion_id : concepto.seccion_id,
		        usuarioInserto_id : concepto.usuarioInserto,
		        recargo : inscripcion.planPagos.inscripcion.recargo,
		        importeRecargo : inscripcion.planPagos.inscripcion.importeRecargo,
		        diasRecargo : inscripcion.planPagos.inscripcion.diasRecargo,
		        descuento : inscripcion.planPagos.inscripcion.descuento,
		        importeDescuento : inscripcion.planPagos.inscripcion.importeDescuento,
		        diasDescuento : inscripcion.planPagos.inscripcion.diasDescuento,
		        inscripcion_id : inscripcion._id,
		        alumno_id : usuario_id
					})
					
					console.log("pago id-", pago_id);
					//Se asigna el id del pago al pago de la inscripcion
					inscripcion.pagos[connceptoId].pago_id = pago_id;
					inscripcion.pagos[connceptoId].planPago_id = planPago_id;
					console.log(inscripcion.pagos[connceptoId])
					
				}
				else{
					inscripcion.abono+=remanente;
				}
			}else{
				
				//Se insertan los pagos generados en Plan Pagos
				var planPago_id = PlanPagos.insert({
					orden : concepto.orden,
	        nombre : concepto.nombre,
	        descripcion : concepto.nombre,
	        modificada : false,
	        importe : concepto.importe,
	        modulo : concepto.modulo,
	        estatus : 0,
	        campus_id : concepto.campus_id,
	        seccion_id : concepto.seccion_id,
	        usuarioInserto_id : concepto.usuarioInserto,
	        recargo : inscripcion.planPagos.inscripcion.recargo,
	        importeRecargo : inscripcion.planPagos.inscripcion.importeRecargo,
	        diasRecargo : inscripcion.planPagos.inscripcion.diasRecargo,
	        descuento : inscripcion.planPagos.inscripcion.descuento,
	        importeDescuento : inscripcion.planPagos.inscripcion.importeDescuento,
	        diasDescuento : inscripcion.planPagos.inscripcion.diasDescuento,
	        inscripcion_id : inscripcion._id,
	        alumno_id : usuario_id
				});
				
				inscripcion.pagos[connceptoId].planPago_id = planPago_id;
			}
			
			
			
			remanente-=concepto.importe;
		});
		
		
		
		//Se inserta el pago completo
		var inscripcionIdTemp = inscripcion._id;
		delete inscripcion._id;
		Inscripciones.update({_id : inscripcionIdTemp}, { $set : inscripcion});
		inscripcion._id = inscripcionIdTemp;
		
		if(!grupo.alumnos)
			grupo.alumnos=[];
			
		//AGREGAR ALUMNO AL GRUPO
		grupo.alumnos.push({alumno_id : inscripcion.alumno_id, inscripcion_id : inscripcion._id});
		grupo.inscritos = parseInt(grupo.inscritos) + 1;
		delete grupo._id;
		Grupos.update({_id: inscripcion.grupo_id},{$set:grupo});
		
		

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
			seccion_id  : grupo.seccion_id,
			campus_id 	: grupo.campus_id,
			fechaPago 	: new Date(),
			diaPago     : moment().date(),
			diaSemana		: diaSemana,
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
			seccion_id  : grupo.seccion_id,
			campus_id 	: grupo.campus_id,
			fechaPago 	: new Date(),
			diaPago     : moment().date(),
			diaSemana		: diaSemana,
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
	},
	cancelarPago : function(planPago){
		PlanPago.update({_id : planPago._id}, {$set : {estatus : 0, modificada : true, pago : 0, fechaPago : undefined, fecha : undefined, diaPago : undefined, mesPago : undefined, anioPago : undefined, semanaPago : undefined, diaSemana : undefined, cuenta_id : undefined}});
		
		Pagos.update({_id : planPago._id}, { $set : {estatus : 0, modificada : true, pago : 0, fechaPago : undefined, fecha : undefined, diaPago : undefined, mesPago : undefined, anioPago : undefined, semanaPago : undefined, diaSemana : undefined, cuenta_id : undefined}});
		
		return true;
	}
	
});