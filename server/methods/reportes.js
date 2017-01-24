Meteor.methods({
  prospectosPorEtapaVenta: function (fechaInicial, fechaFinal) {
	  //{fecha : { $lt : new Date(fechaFin), $gte : new Date(fechaInicio)}}
    
    var etapasVenta = EtapasVenta.find().fetch();
    var medios = MediosPublicidad.find().fetch();
    var arreglo = {};
    _.each(etapasVenta, function(etapaVenta){
	    if(arreglo[etapaVenta.nombre] == undefined){
				arreglo[etapaVenta.nombre] = {};
				arreglo[etapaVenta.nombre].etapaVenta = etapaVenta.nombre;
				arreglo[etapaVenta.nombre].medios = {};
		    _.each(medios, function(medio){
			    arreglo[etapaVenta.nombre].medios[medio.nombre] = {};
					arreglo[etapaVenta.nombre].medios[medio.nombre].nombre = medio.nombre;
					arreglo[etapaVenta.nombre].medios[medio.nombre].cantidad = Prospectos.find({"profile.fecha" : {$gte : new Date(fechaInicial), $lte: new Date(fechaFinal)}, "profile.medio_id" : medio._id, "profile.etapaVenta_id" : etapaVenta._id}).count();
					// console.log(Prospectos.find({"profile.fecha" : {$gte : new Date(fechaInicial), $lt: new Date(fechaFinal)}, "profile.medio_id" : medio._id, "profile.etapaVenta_id" : etapaVenta._id}).fetch())
				});
			}
    });
    
    _.each(arreglo, function(arr){
	    arr.medios = _.toArray(arr.medios);
    });
    var arregloFinal = {};
    arregloFinal.etapasVenta = [];
    arregloFinal.medios = {};
    _.each(arreglo, function(etapa){
	    arregloFinal.etapasVenta.push(etapa.etapaVenta);
	    _.each(etapa.medios, function(medio){
		    if(arregloFinal.medios[medio.nombre] == undefined){
			    arregloFinal.medios[medio.nombre] = {};
			    arregloFinal.medios[medio.nombre].name = medio.nombre;
			    arregloFinal.medios[medio.nombre].data = [];
			    arregloFinal.medios[medio.nombre].data.push(medio.cantidad);
		    }else{
			    arregloFinal.medios[medio.nombre].data.push(medio.cantidad);
		    }
	    })
    })

		arregloFinal.medios = _.toArray(arregloFinal.medios);

    return _.toArray(arregloFinal);
  },
	prospectosSoloEtapaVenta: function (fechaInicial, fechaFinal) {    
    var etapasVenta = EtapasVenta.find().fetch();
    var arreglo = {};
    _.each(etapasVenta, function(etapaVenta){
	    if(arreglo[etapaVenta.nombre] == undefined){
				arreglo[etapaVenta.nombre] = {};
				arreglo[etapaVenta.nombre].etapaVenta = etapaVenta.nombre;
				arreglo[etapaVenta.nombre].cantidad = Prospectos.find({"profile.fecha" : {$gte : new Date(fechaInicial), $lte: new Date(fechaFinal)}, "profile.etapaVenta_id" : etapaVenta._id}).count();
			}
    });
    
    var arregloFinal = {};
    arregloFinal.etapasVenta = [];
		arregl = _.toArray(arreglo);
    return _.toArray(arreglo);
  },
  historialOtrosCobros : function (fechaInicial, fechaFinal, seccion_id) {
	  fechaInicial = moment(fechaInicial).add(-1, "days");
	  var otrosPagos = PlanPagos.find({seccion_id : seccion_id, fecha : {$gte : new Date(fechaInicial), $lt: new Date(fechaFinal)}}).fetch();
	  _.each(otrosPagos, function(pago){
		  pago.concepto = ConceptosPago.findOne({_id : pago.concepto_id});
	  })
	  return otrosPagos;
  }

});