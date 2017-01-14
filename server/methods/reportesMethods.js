Meteor.methods({
  deudores: function (seccion_id) {
		var pagosPendientes = PlanPagos.find({estatus : true, seccion_id : seccion_id, fecha : { $lt : new Date() }, pagada : 0 }).fetch();
	  var arreglo = {};
	  if(pagosPendientes != undefined){
		  var totalDeuda = 0.00;
		  var totalRecargos = 0.00;
		  var total = 0.00;
		  var hoy = moment();
		  _.each(pagosPendientes, function(pago){
			  var fechaPago = moment(pago.fecha);
			  var diasDiferencia = fechaPago.diff(hoy, "days");
			  console.log(pago.alumno_id, diasDiferencia);
			  var inscripcion = Inscripciones.findOne(pago.inscripcion_id);
				var tipoColegiatura = inscripcion.planPagos.colegiatura.tipoColegiatura;
			  if(undefined == arreglo[pago.alumno_id]){
				  arreglo[pago.alumno_id] = {};
				  arreglo[pago.alumno_id].pagos = [];
				  arreglo[pago.alumno_id].alumno_id = pago.alumno_id;
				  if(( diasDiferencia * -1) > inscripcion.planPagos.colegiatura[tipoColegiatura].diasRecargo ){
					  arreglo[pago.alumno_id].modificador = pago.recargo;
					  arreglo[pago.alumno_id].total = pago.importe + pago.recargo;
					  totalRecargos += pago.recargo;
					  total += pago.importe + pago.recargo;
					  pago.className = "text-danger";
				  }else{
					  arreglo[pago.alumno_id].modificador = 0.00;
					  arreglo[pago.alumno_id].total = pago.importe;					  
					  total += pago.importe;
				  }
				  arreglo[pago.alumno_id].pagos.push(pago);
				  arreglo[pago.alumno_id].alumno = Meteor.users.findOne(pago.alumno_id, { fields : { profile : 1}});
				  var ultimoPago = PlanPagos.findOne({pagada : 1, alumno_id : pago.alumno_id}, { sort : {fechaPago : -1}});
				  arreglo[pago.alumno_id].fechaUltimoPago = ultimoPago.fechaPago;
				  arreglo[pago.alumno_id].colegiaturaUltimoPago = ultimoPago.semanaPago;
				  arreglo[pago.alumno_id].deuda = pago.importe;
				  totalDeuda += pago.importe;				  
			  }else{
				  if(( diasDiferencia * -1) > inscripcion.planPagos.colegiatura[tipoColegiatura].diasRecargo){
					  arreglo[pago.alumno_id].modificador += pago.recargo;
					  arreglo[pago.alumno_id].total += pago.importe + pago.recargo;
					  totalRecargos += pago.recargo;
					  total += pago.importe + pago.recargo;
					  pago.className = "text-danger";
				  }else{
					  arreglo[pago.alumno_id].total += pago.importe;
					  total += pago.importe;
				  }
				  arreglo[pago.alumno_id].deuda += pago.importe;
				  arreglo[pago.alumno_id].pagos.push(pago);
				  totalDeuda += pago.importe;
			  }
		  });
		  
		  arreglo = _.toArray(arreglo);
		  arreglo.push({deuda : totalDeuda, recargos : totalRecargos, total : total});
		  arreglo = _.sortBy(arreglo, "total");
		  arreglo = arreglo.reverse();
	  }
	  return arreglo;
	},
	cobranza: function (seccion_id) {
		var grupos = Grupos.find({estatus : true, seccion_id : seccion_id}).fetch();
		var arreglo = {};
		var totalDeuda = 0.00;
	  var totalRecargos = 0.00;
	  var total = 0.00;
	  var hoy = moment();
		_.each(grupos, function(grupo){
			
			_.each(grupo.alumnos, function(alumno){
				var pagos = PlanPagos.find({estatus : true, seccion_id : seccion_id, fecha : { $lt : new Date() }, pagada : 0, alumno_id : alumno }).fetch();
				
				var ultimoPago = PlanPagos.findOne({pagada : 1, alumno_id : alumno}, { sort : {fechaPago : -1}});
				_.each(pagos, function(pago){
					var inscripcion = Inscripciones.findOne(pago.inscripcion_id);
					var tipoColegiatura = inscripcion.planPagos.colegiatura.tipoColegiatura;
					var fechaPago = moment(pago.fecha);
				  var diasDiferencia = fechaPago.diff(hoy, "days");
					
					if(undefined == arreglo[grupo._id]){
							
					  arreglo[grupo._id] = {};
					  arreglo[grupo._id].alumnos = {};
					  arreglo[grupo._id].grupo = grupo;
					  arreglo[grupo._id].grupo.turno = Turnos.findOne(grupo.turno_id);
					  arreglo[grupo._id].alumnos[alumno] = {};
					  arreglo[grupo._id].alumnos[alumno].alumno_id = pago.alumno_id;
					  arreglo[grupo._id].alumnos[alumno].alumno = Meteor.users.findOne(pago.alumno_id, { fields : { profile : 1}});
					  arreglo[grupo._id].alumnos[alumno].pagos = [];
					  
					  if(parseInt(diasDiferencia) <= parseInt(inscripcion.planPagos.colegiatura[tipoColegiatura].diasDescuento)){
						  arreglo[grupo._id].alumnos[alumno].modificador = inscripcion.planPagos.colegiatura[tipoColegiatura].importeDescuento;
					  }else if(( diasDiferencia * -1) > parseInt(inscripcion.planPagos.colegiatura[tipoColegiatura].diasRecargo)){
						  arreglo[grupo._id].alumnos[alumno].modificador = inscripcion.planPagos.colegiatura[tipoColegiatura].importeRecargo;
					  }
					  
						arreglo[grupo._id].alumnos[alumno].pagos.push(pago);
						arreglo[grupo._id].alumnos[alumno].total = pago.importe;
					  arreglo[grupo._id].alumnos[alumno].fechaUltimoPago = ultimoPago.fechaPago;
					  arreglo[grupo._id].alumnos[alumno].colegiaturaUltimoPago = ultimoPago.semanaPago;						
						arreglo[grupo._id].alumnos[alumno].importeColegiatura = inscripcion.planPagos.colegiatura[tipoColegiatura].importeRegular;
				  }else{
					  if(arreglo[grupo._id].alumnos[alumno] == undefined){

						  arreglo[grupo._id].alumnos[alumno] = {};
						  arreglo[grupo._id].alumnos[alumno].alumno_id = pago.alumno_id;
						  arreglo[grupo._id].alumnos[alumno].alumno = Meteor.users.findOne(pago.alumno_id, { fields : { profile : 1}});
						  arreglo[grupo._id].alumnos[alumno].pagos = [];
						  
						  // Si en ese pago tiene descuento se aplica el descuento, pero si tiene retraso se aplica el recargo
						  if(parseInt(diasDiferencia) <= parseInt(inscripcion.planPagos.colegiatura[tipoColegiatura].diasDescuento)){
							  arreglo[grupo._id].alumnos[alumno].modificador -= inscripcion.planPagos.colegiatura[tipoColegiatura].importeDescuento;
						  }else if(( diasDiferencia * -1) > parseInt(inscripcion.planPagos.colegiatura[tipoColegiatura].diasRecargo)){
							  arreglo[grupo._id].alumnos[alumno].modificador += inscripcion.planPagos.colegiatura[tipoColegiatura].importeRecargo;
						  }
						  
						  arreglo[grupo._id].alumnos[alumno].pagos.push(pago);
						  arreglo[grupo._id].alumnos[alumno].fechaUltimoPago = ultimoPago.fechaPago;
						  arreglo[grupo._id].alumnos[alumno].colegiaturaUltimoPago = ultimoPago.semanaPago;						
							arreglo[grupo._id].alumnos[alumno].importeColegiatura = inscripcion.planPagos.colegiatura[tipoColegiatura].importeRegular;
					  }else{
						  if(parseInt(diasDiferencia) <= parseInt(inscripcion.planPagos.colegiatura[tipoColegiatura].diasDescuento)){
							  arreglo[grupo._id].alumnos[alumno].modificador -= inscripcion.planPagos.colegiatura[tipoColegiatura].importeDescuento;
						  }else if(( diasDiferencia * -1) > parseInt(inscripcion.planPagos.colegiatura[tipoColegiatura].diasRecargo)){
							  arreglo[grupo._id].alumnos[alumno].modificador += inscripcion.planPagos.colegiatura[tipoColegiatura].importeRecargo;
						  }
						  arreglo[grupo._id].alumnos[alumno].pagos.push(pago);
					  }
				  }
				})
			})
		})
		
		arreglo = _.toArray(arreglo);
		_.each(arreglo,function(obj){
			obj.alumnos = _.toArray(obj.alumnos);
		});
	  //arreglo.push({deuda : totalDeuda, recargos : totalRecargos, total : total});
	  //arreglo = _.sortBy(arreglo, "total");
	  //arreglo = arreglo.reverse();
		return arreglo;
	}
})