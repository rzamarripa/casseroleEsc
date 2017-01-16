Meteor.methods({
  deudores: function (seccion_id) {
		var pagosPendientes = PlanPagos.find({estatus : true, seccion_id : seccion_id, fecha : { $lt : new Date() }, estatus : 0 }).fetch();
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
				  var ultimoPago = PlanPagos.findOne({estatus : 1, alumno_id : pago.alumno_id}, { sort : {fechaPago : -1}});
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
	  var semanaActual = moment().isoWeek();
	  var anioActual = moment().get("year");
	  //Recorrer grupos
		_.each(grupos, function(grupo){
			//Recorrer a los alumnos de cada grupo
			_.each(grupo.alumnos, function(alumno){
				var inscripcion = Inscripciones.findOne(alumno.inscripcion_id);
				//Validar que el alumno está activo en su inscripción
				if(inscripcion.estatus == 1){
					//Obtener los pagos atrasados				
					var ultimoPago = PlanPagos.findOne({estatus : 1, alumno_id : alumno}, { sort : {fechaPago : -1}});
					//validar que hay pagado la semana actual
					if(ultimoPago.semana >= semanaActual && ultimoPago.anio == anioActual ){
						//Busco la siguiente semana, pero sólo 1
						var pago = PlanPagos.findOne({estatus : 0, alumno_id : alumno, semana : ultimoPago.semana + 1});
						
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
						  arreglo[grupo._id].alumnos[alumno].abono = inscripcion.abono;
						  arreglo[grupo._id].alumnos[alumno].alumno = Meteor.users.findOne(pago.alumno_id, { fields : { profile : 1}});
						  arreglo[grupo._id].alumnos[alumno].pagos = [];
						  
						  if(parseInt(diasDiferencia) <= parseInt(inscripcion.planPagos.colegiatura[tipoColegiatura].diasDescuento)){
							  arreglo[grupo._id].alumnos[alumno].modificador = inscripcion.planPagos.colegiatura[tipoColegiatura].importeDescuento * -1;
						  }else if(( diasDiferencia * -1) > parseInt(inscripcion.planPagos.colegiatura[tipoColegiatura].diasRecargo)){
							  arreglo[grupo._id].alumnos[alumno].modificador = inscripcion.planPagos.colegiatura[tipoColegiatura].importeRecargo * -1;
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
							  arreglo[grupo._id].alumnos[alumno].abono = inscripcion.abono;
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
								  arreglo[grupo._id].alumnos[alumno].modificador -= inscripcion.planPagos.colegiatura[tipoColegiatura].importeDescuento * -1;
							  }else if(( diasDiferencia * -1) > parseInt(inscripcion.planPagos.colegiatura[tipoColegiatura].diasRecargo)){
								  arreglo[grupo._id].alumnos[alumno].modificador += inscripcion.planPagos.colegiatura[tipoColegiatura].importeRecargo * -1;
							  }
							  arreglo[grupo._id].alumnos[alumno].pagos.push(pago);
						  }
					  }
						
					}else{
						//Busco las semanas trasadas, pero todas
						var pagos = PlanPagos.find({estatus : true, seccion_id : seccion_id, fecha : { $lt : new Date() }, estatus : 0, alumno_id : alumno }).fetch();
						_.each(pagos, function(pago){
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
							  arreglo[grupo._id].alumnos[alumno].abono = inscripcion.abono;
							  arreglo[grupo._id].alumnos[alumno].alumno = Meteor.users.findOne(pago.alumno_id, { fields : { profile : 1}});
							  arreglo[grupo._id].alumnos[alumno].pagos = [];
							  
							  if(parseInt(diasDiferencia) <= parseInt(inscripcion.planPagos.colegiatura[tipoColegiatura].diasDescuento)){
								  arreglo[grupo._id].alumnos[alumno].modificador = inscripcion.planPagos.colegiatura[tipoColegiatura].importeDescuento * -1;
							  }else if(( diasDiferencia * -1) > parseInt(inscripcion.planPagos.colegiatura[tipoColegiatura].diasRecargo)){
								  arreglo[grupo._id].alumnos[alumno].modificador = inscripcion.planPagos.colegiatura[tipoColegiatura].importeRecargo * -1;
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
								  arreglo[grupo._id].alumnos[alumno].abono = inscripcion.abono;
								  arreglo[grupo._id].alumnos[alumno].alumno = Meteor.users.findOne(pago.alumno_id, { fields : { profile : 1}});
								  arreglo[grupo._id].alumnos[alumno].pagos = [];
								  
								  // Si en ese pago tiene descuento se aplica el descuento, pero si tiene retraso se aplica el recargo
								  if(parseInt(diasDiferencia) <= parseInt(inscripcion.planPagos.colegiatura[tipoColegiatura].diasDescuento)){
									  arreglo[grupo._id].alumnos[alumno].modificador -= inscripcion.planPagos.colegiatura[tipoColegiatura].importeDescuento * -1;
								  }else if(( diasDiferencia * -1) > parseInt(inscripcion.planPagos.colegiatura[tipoColegiatura].diasRecargo)){
									  arreglo[grupo._id].alumnos[alumno].modificador += inscripcion.planPagos.colegiatura[tipoColegiatura].importeRecargo * -1;
								  }
								  
								  arreglo[grupo._id].alumnos[alumno].pagos.push(pago);
								  arreglo[grupo._id].alumnos[alumno].fechaUltimoPago = ultimoPago.fechaPago;
								  arreglo[grupo._id].alumnos[alumno].colegiaturaUltimoPago = ultimoPago.semanaPago;						
									arreglo[grupo._id].alumnos[alumno].importeColegiatura = inscripcion.planPagos.colegiatura[tipoColegiatura].importeRegular;
							  }else{
								  if(parseInt(diasDiferencia) <= parseInt(inscripcion.planPagos.colegiatura[tipoColegiatura].diasDescuento)){
									  arreglo[grupo._id].alumnos[alumno].modificador -= inscripcion.planPagos.colegiatura[tipoColegiatura].importeDescuento * -1;
								  }else if(( diasDiferencia * -1) > parseInt(inscripcion.planPagos.colegiatura[tipoColegiatura].diasRecargo)){
									  arreglo[grupo._id].alumnos[alumno].modificador += inscripcion.planPagos.colegiatura[tipoColegiatura].importeRecargo * -1;
								  }
								  arreglo[grupo._id].alumnos[alumno].pagos.push(pago);
							  }
						  }
						})
					}
				}
				
				//Recorrer los pagados de cada alumno de cada grupo
				
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


/*

{
	_id : "a90324alsdjfsdfj",
	alumnos : [
		{
			alumno_id : "2340298klajsdfal",
			inscripcion_id : "2034lkasjdfañlsjf"
		},
		{
			alumno_id : "asdlkfjaf20234",
			inscripcion_id : "heiwpm3042nfjd"
		}
	],
	anio : 2016
}
*/