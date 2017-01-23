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
	}
	
});