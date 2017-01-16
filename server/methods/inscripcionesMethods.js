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
	  console.log("campus", campus_id);
	  var cantidad = Meteor.users.find({roles : ["alumno"], "profile.campus_id" : campus_id}).count();
	  console.log("cantidadAlumnos", cantidad)
	  return cantidad;
  },
  generaPlanPagos : function(inscripcion) {
	  console.log("inscripcion", inscripcion);
	  _.each(inscripcion.planPagos.fechas, function(pago){
		  var nuevoPago = {};
		  if(pago.pagada == 1){
			  nuevoPago = {
				  alumno_id : inscripcion.alumno_id,
					inscripcion_id : inscripcion._id,
					vendedor_id : inscripcion.vendedor_id,
					seccion_id : inscripcion.seccion_id,
					campus_id : inscripcion.campus_id,
					fechaInscripcion : inscripcion.fechaInscripcion,
					semana : pago.semana,
					tipoPlan : pago.tipoPlan,
					numeroPago : pago.numeroPago,
					mes : pago.mes,
					anio : pago.anio,
					fecha : pago.fecha,
					estatus : true,
					pagada : 1,
					fechaPago : new Date()
				}
		  }else{
			  nuevoPago = {
				  alumno_id : inscripcion.alumno_id,
					inscripcion_id : inscripcion._id,
					vendedor_id : inscripcion.vendedor_id,
					seccion_id : inscripcion.seccion_id,
					campus_id : inscripcion.campus_id,
					fechaInscripcion : inscripcion.fechaInscripcion,
					semana : pago.semana,
					tipoPlan : pago.tipoPlan,
					numeroPago : pago.numeroPago,
					mes : pago.mes,
					anio : pago.anio,
					fecha : pago.fecha,
					estatus : true,
					pagada : 0
				}
		  }
		  
			PlanPagos.insert(nuevoPago);
		})
	  inscripcion.planPagos.fechas=undefined;

	  Inscripciones.update({_id:inscripcion._id},{$set:{planPagos:inscripcion.planPagos}});
  },
  reactivarPlanPagos : function(inscripcion) {
		PlanPagos.update({inscripcion_id : inscripcion, estatus : 2}, {$set : { estatus : 0}}, {multi : true});
	},
  cancelarPlanPagos : function(inscripcion) {
		PlanPagos.update({inscripcion_id : inscripcion, estatus : 0}, {$set : { estatus : 2}}, {multi : true});
	}
	
});