Meteor.methods({
  prospectosPorEtapaVenta: function (fechaInicio, fechaFin) {
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
					arreglo[etapaVenta.nombre].medios[medio.nombre].cantidad = Prospectos.find({"profile.medio_id" : medio._id, "profile.etapaVenta_id" : etapaVenta._id}).count();
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
    //return _.toArray(arreglo);
    return _.toArray(arregloFinal);
  }
});