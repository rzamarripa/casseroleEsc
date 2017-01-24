Meteor.methods({
  deudores: function (seccion_id) {
		var pagosPendientes = PlanPagos.find({estatus : 0, modulo : "colegiatura", seccion_id : seccion_id, fecha : { $lt : new Date() } }).fetch();
	  var arreglo = {};
	  if(pagosPendientes != undefined){
		  var totalDeuda = 0.00;
		  var totalRecargos = 0.00;
		  var total = 0.00;
		  var hoy = moment();
		  _.each(pagosPendientes, function(pago){
			  var fechaPago = moment(pago.fecha).add(-1, "days");
			  var diasDiferencia = fechaPago.diff(hoy, "days");
			  var inscripcion = Inscripciones.findOne(pago.inscripcion_id);
				var tipoColegiatura = pago.tipoPlan;
			  if(undefined == arreglo[pago.alumno_id]){
				  arreglo[pago.alumno_id] = {};
				  arreglo[pago.alumno_id].pagos = [];
				  arreglo[pago.alumno_id].alumno_id = pago.alumno_id;
				  if(( diasDiferencia * -1) > pago.diasRecargo ){
					  arreglo[pago.alumno_id].modificador = pago.importeRecargo;
					  arreglo[pago.alumno_id].total = pago.importe + pago.importeRecargo;
					  totalRecargos += pago.importeRecargo;
					  total += pago.importe + pago.importeRecargo;
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
				  arreglo[pago.alumno_id].colegiaturaUltimoPago = ultimoPago.semana;
				  arreglo[pago.alumno_id].deuda = pago.importe;
				  totalDeuda += pago.importe;				  
			  }else{
				  if(( diasDiferencia * -1) > pago.diasRecargo){
					  arreglo[pago.alumno_id].modificador += pago.importeRecargo;
					  arreglo[pago.alumno_id].total += pago.importe + pago.importeRecargo;
					  totalRecargos += pago.importeRecargo;
					  total += pago.importe + pago.importeRecargo;
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
					var ultimoPago = PlanPagos.findOne({estatus : 1, alumno_id : alumno.alumno_id, modulo : "colegiatura"}, { sort : {fechaPago : -1}});
					//validar que haya pagado la semana actual
					if(ultimoPago.semana >= semanaActual && ultimoPago.anio == anioActual ){
						//Busco la siguiente semana, pero sólo 1
						var pago = PlanPagos.findOne({estatus : 0, alumno_id : alumno.alumno_id, semana : ultimoPago.semana + 1});
						var tipoColegiatura = pago.tipoPlan;
						var fechaPago = moment(pago.fecha);
					  var diasDiferencia = fechaPago.diff(hoy, "days");
						if(undefined == arreglo[grupo._id]){
									
						  arreglo[grupo._id] = {};
						  arreglo[grupo._id].alumnos = {};
						  arreglo[grupo._id].grupo = grupo;
						  arreglo[grupo._id].grupo.turno = Turnos.findOne(grupo.turno_id);
						  arreglo[grupo._id].alumnos[alumno.alumno_id] = {};
						  arreglo[grupo._id].alumnos[alumno.alumno_id].alumno_id = pago.alumno_id;
						  arreglo[grupo._id].alumnos[alumno.alumno_id].abono = inscripcion.abono;
						  arreglo[grupo._id].alumnos[alumno.alumno_id].alumno = Meteor.users.findOne(pago.alumno_id, { fields : { profile : 1}});
						  arreglo[grupo._id].alumnos[alumno.alumno_id].pagos = [];
						  
						  if(parseInt(diasDiferencia) <= parseInt(pago.diasDescuento)){
							  arreglo[grupo._id].alumnos[alumno.alumno_id].modificador = pago.importeDescuento;
						  }else if(( diasDiferencia * -1) > parseInt(pago.diasRecargo)){
							  arreglo[grupo._id].alumnos[alumno.alumno_id].modificador = pago.importeRecargo;
						  }
						  
							arreglo[grupo._id].alumnos[alumno.alumno_id].pagos.push(pago);
							arreglo[grupo._id].alumnos[alumno.alumno_id].total = pago.importe;
						  arreglo[grupo._id].alumnos[alumno.alumno_id].fechaUltimoPago = ultimoPago.fechaPago;
						  arreglo[grupo._id].alumnos[alumno.alumno_id].colegiaturaUltimoPago = ultimoPago.semana;						
							arreglo[grupo._id].alumnos[alumno.alumno_id].importeColegiatura = pago.importeRegular;
					  }else{
						  if(arreglo[grupo._id].alumnos[alumno.alumno_id] == undefined){
	
							  arreglo[grupo._id].alumnos[alumno.alumno_id] = {};
							  arreglo[grupo._id].alumnos[alumno.alumno_id].alumno_id = pago.alumno_id;
							  arreglo[grupo._id].alumnos[alumno.alumno_id].abono = inscripcion.abono;
							  arreglo[grupo._id].alumnos[alumno.alumno_id].alumno = Meteor.users.findOne(pago.alumno_id, { fields : { profile : 1}});
							  arreglo[grupo._id].alumnos[alumno.alumno_id].pagos = [];
							  
							  // Si en ese pago tiene descuento se aplica el descuento, pero si tiene retraso se aplica el recargo
							  if(parseInt(pago.diasDescuento) <= parseInt(diasDiferencia)){
								  arreglo[grupo._id].alumnos[alumno.alumno_id].modificador -= pago.importeDescuento;
							  }else if(( diasDiferencia * -1) > parseInt(pago.diasRecargo)){
								  arreglo[grupo._id].alumnos[alumno.alumno_id].modificador += pago.importeRecargo;
							  }
							  
							  arreglo[grupo._id].alumnos[alumno.alumno_id].pagos.push(pago);
							  arreglo[grupo._id].alumnos[alumno.alumno_id].fechaUltimoPago = ultimoPago.fechaPago;
							  arreglo[grupo._id].alumnos[alumno.alumno_id].colegiaturaUltimoPago = ultimoPago.semana;						
								arreglo[grupo._id].alumnos[alumno.alumno_id].importeColegiatura = pago.importeRegular;
						  }else{
							  if(parseInt(pago.diasDescuento) <= parseInt(diasDiferencia)){
								  arreglo[grupo._id].alumnos[alumno.alumno_id].modificador -= pago.importeDescuento;
							  }else if(( diasDiferencia * -1) > parseInt(pago.diasRecargo)){
								  arreglo[grupo._id].alumnos[alumno.alumno_id].modificador += pago.importeRecargo;
							  }
							  arreglo[grupo._id].alumnos[alumno.alumno_id].pagos.push(pago);
						  }
					  }
						
					}else{
						//Busco las semanas trasadas, pero todas
						var pagos = PlanPagos.find({modulo : "colegiatura", seccion_id : seccion_id, fecha : { $lt : new Date() }, estatus : 0, alumno_id : alumno.alumno_id }).fetch();
						_.each(pagos, function(pago){
							var tipoColegiatura = pago.tipoPlan;
							var fechaPago = moment(pago.fecha).add(-1, "days");
						  var diasDiferencia = fechaPago.diff(hoy, "days");
							
							if(undefined == arreglo[grupo._id]){
									
							  arreglo[grupo._id] = {};
							  arreglo[grupo._id].alumnos = {};
							  arreglo[grupo._id].grupo = grupo;
							  arreglo[grupo._id].grupo.turno = Turnos.findOne(grupo.turno_id);
							  arreglo[grupo._id].alumnos[alumno.alumno_id] = {};
							  arreglo[grupo._id].alumnos[alumno.alumno_id].alumno_id = pago.alumno_id;
							  arreglo[grupo._id].alumnos[alumno.alumno_id].abono = inscripcion.abono;
							  arreglo[grupo._id].alumnos[alumno.alumno_id].alumno = Meteor.users.findOne(pago.alumno_id, { fields : { profile : 1}});
							  arreglo[grupo._id].alumnos[alumno.alumno_id].pagos = [];
							  
							  if(parseInt(pago.diasDescuento) <= parseInt(diasDiferencia)){
								  arreglo[grupo._id].alumnos[alumno.alumno_id].modificador = pago.importeDescuento;
							  }else if(( diasDiferencia * -1) > parseInt(pago.diasRecargo)){
								  arreglo[grupo._id].alumnos[alumno.alumno_id].modificador = pago.importeRecargo;
								  pago.className = "text-danger";
							  }
							  
								arreglo[grupo._id].alumnos[alumno.alumno_id].pagos.push(pago);
								arreglo[grupo._id].alumnos[alumno.alumno_id].total = pago.importeRegular;
							  arreglo[grupo._id].alumnos[alumno.alumno_id].fechaUltimoPago = ultimoPago.fechaPago;
							  arreglo[grupo._id].alumnos[alumno.alumno_id].colegiaturaUltimoPago = ultimoPago.semana;						
								arreglo[grupo._id].alumnos[alumno.alumno_id].importeColegiatura = pago.importeRegular;
						  }else{
							  if(arreglo[grupo._id].alumnos[alumno.alumno_id] == undefined){
		
								  arreglo[grupo._id].alumnos[alumno.alumno_id] = {};
								  arreglo[grupo._id].alumnos[alumno.alumno_id].alumno_id = pago.alumno_id;
								  arreglo[grupo._id].alumnos[alumno.alumno_id].abono = inscripcion.abono;
								  arreglo[grupo._id].alumnos[alumno.alumno_id].alumno = Meteor.users.findOne(pago.alumno_id, { fields : { profile : 1}});
								  arreglo[grupo._id].alumnos[alumno.alumno_id].modificador = 0.00;
								  arreglo[grupo._id].alumnos[alumno.alumno_id].pagos = [];
								  
								  // Si en ese pago tiene descuento se aplica el descuento, pero si tiene retraso se aplica el recargo
								  if(parseInt(pago.diasDescuento) <= parseInt(diasDiferencia)){
									  arreglo[grupo._id].alumnos[alumno.alumno_id].modificador -= pago.importeDescuento;
								  }else if(( diasDiferencia * -1) > parseInt(pago.diasRecargo)){
									  arreglo[grupo._id].alumnos[alumno.alumno_id].modificador += pago.importeRecargo;
									  pago.className = "text-danger";
								  }
								  
								  arreglo[grupo._id].alumnos[alumno.alumno_id].pagos.push(pago);
								  arreglo[grupo._id].alumnos[alumno.alumno_id].fechaUltimoPago = ultimoPago.fechaPago;
								  arreglo[grupo._id].alumnos[alumno.alumno_id].colegiaturaUltimoPago = ultimoPago.semana;						
									arreglo[grupo._id].alumnos[alumno.alumno_id].importeColegiatura = pago.importeRegular;
							  }else{
								  if(parseInt(pago.diasDescuento) <= parseInt(diasDiferencia)){
									  arreglo[grupo._id].alumnos[alumno.alumno_id].modificador -= pago.importeDescuento;
								  }else if(( diasDiferencia * -1) > parseInt(pago.diasRecargo)){
									  arreglo[grupo._id].alumnos[alumno.alumno_id].modificador += pago.importeRecargo;
									  pago.className = "text-danger";
								  }
								  arreglo[grupo._id].alumnos[alumno.alumno_id].pagos.push(pago);
							  }
						  }
						})
					}
				}
			})
		})
		
		arreglo = _.toArray(arreglo);
		_.each(arreglo,function(obj){
			obj.alumnos = _.toArray(obj.alumnos);
		});
		
		return arreglo;
	}
})

