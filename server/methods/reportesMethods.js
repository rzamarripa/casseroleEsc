Meteor.methods({
  deudores: function (seccion_id) {
		var pagosPendientes = PlanPagos.find({estatus : true, seccion_id : seccion_id, fecha : { $lt : new Date() }, pagada : 0 }).fetch();
	  var arreglo = {};
	  if(pagosPendientes != undefined){
		  var totalDeuda = 0.00;
		  var totalRecargos = 0.00;
		  var total = 0.00;
		  _.each(pagosPendientes, function(pago){
			  if(undefined == arreglo[pago.alumno_id]){
				  arreglo[pago.alumno_id] = {};
				  arreglo[pago.alumno_id].pagos = [];
				  arreglo[pago.alumno_id].alumno_id = pago.alumno_id;
				  arreglo[pago.alumno_id].pagos.push(pago);
				  arreglo[pago.alumno_id].alumno = Meteor.users.findOne(pago.alumno_id, { fields : { profile : 1}});
				  var ultimoPago = PlanPagos.findOne({pagada : 1, alumno_id : pago.alumno_id}, { sort : {fechaPago : -1}});
				  arreglo[pago.alumno_id].fechaUltimoPago = ultimoPago.fechaPago;
				  arreglo[pago.alumno_id].colegiaturaUltimoPago = ultimoPago.semanaPago;
				  arreglo[pago.alumno_id].deuda = pago.importe;
				  arreglo[pago.alumno_id].recargos = pago.recargo;
				  arreglo[pago.alumno_id].total = pago.importe + pago.recargo;
				  totalDeuda += pago.importe;
				  totalRecargos += pago.recargo;
				  total += pago.importe + pago.recargo;
			  }else{
				  arreglo[pago.alumno_id].deuda += pago.importe;
				  arreglo[pago.alumno_id].recargos += pago.recargo;
				  arreglo[pago.alumno_id].total += pago.importe + pago.recargo;
				  arreglo[pago.alumno_id].pagos.push(pago);
				  totalDeuda += pago.importe;
				  totalRecargos += pago.recargo;
				  total += pago.importe + pago.recargo;
			  }
		  });
		  
		  arreglo = _.toArray(arreglo);
		  arreglo.push({deuda : totalDeuda, recargos : totalRecargos, total : total});
		  arreglo = _.sortBy(arreglo, "total");
		  arreglo = arreglo.reverse();
	  }
	  return arreglo;
	}
})