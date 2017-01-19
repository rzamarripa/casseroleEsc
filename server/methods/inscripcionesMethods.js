Meteor.methods({
  getInscripciones: function (query) {
    query = query || {};
    
    var inscripciones = Inscripciones.find(query).fetch();

    var alumnos 	= Alumnos.find().fetch();
    var grupos 		= Grupos.find().fetch();
    var secciones = Secciones.find().fetch();
    var ciclos	 	= Ciclos.find().fetch();
    var planesEstudios = PlanesEstudios.find().fetch();

    inscripciones.forEach(function (inscripcion) {
      inscripcion.alumno = findInCollection(alumnos, inscripcion.alumno_id);
      inscripcion.grupo = findInCollection(grupos, inscripcion.grupo_id);
      inscripcion.seccion = findInCollection(secciones, inscripcion.seccion_id);
      inscripcion.ciclo = findInCollection(ciclos, inscripcion.ciclo_id);
      inscripcion.planEstudio = findInCollection(planesEstudios, inscripcion.planEstudio_id);
    });
    
    return inscripciones;

    function findInCollection(lista, valor) {
      return _.find(lista, function (x) {
        return x._id == valor;
      });
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
		PlanPagos.update({inscripcion_id : inscripcion, estatus : 2}, {$set : { estatus : 0}}, {multi : true});
	},
  cancelarPlanPagos : function(inscripcion) {
		PlanPagos.update({inscripcion_id : inscripcion, estatus : 0}, {$set : { estatus : 2}}, {multi : true});
	}
	
});