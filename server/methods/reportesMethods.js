Meteor.methods({
	prospectosPorEtapaVenta: function (fechaInicial, fechaFinal) {
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
				arreglo[etapaVenta.nombre].cantidad = Prospectos.find({"profile.fecha" : {$gte : new Date(fechaInicial.setHours(24)), $lte: new Date(fechaFinal)}, "profile.etapaVenta_id" : etapaVenta._id}).count();
			}
    });
    
    var arregloFinal = {};
    arregloFinal.etapasVenta = [];
		arregl = _.toArray(arreglo);
    return _.toArray(arreglo);
  },
  historialCobranza : function (fechaInicial, fechaFinal, seccion_id, usuario_id, modulo) {
	  fechaInicial = moment(fechaInicial).add(-1, "days");
	  var query = {};
	  if(usuario_id == "todos" || usuario_id == undefined){
		  if(modulo == "todos"){
			  query = {seccion_id : seccion_id, fechaPago : {$gte : new Date(fechaInicial), $lt: new Date(fechaFinal.setHours(24))}}
		  }else{
			  query = {modulo : modulo, seccion_id : seccion_id, fechaPago : {$gte : new Date(fechaInicial), $lt: new Date(fechaFinal.setHours(24))}}
		  }
	  }else{
		  if(modulo == "todos"){
			  query = {usuarioInserto_id : usuario_id, seccion_id : seccion_id, fechaPago : {$gte : new Date(fechaInicial), $lt: new Date(fechaFinal.setHours(24))}}
		  }else{
			  query = {usuarioInserto_id : usuario_id, modulo : modulo, seccion_id : seccion_id, fechaPago : {$gte : new Date(fechaInicial), $lt: new Date(fechaFinal.setHours(24))}}
		  }
	  }	  
	  
		 var otrosPagos = PlanPagos.find(query).fetch(); 
	  
	  _.each(otrosPagos, function(pago){
		  pago.concepto = ConceptosPago.findOne({_id : pago.concepto_id});
		  pago.alumno = Meteor.users.findOne({_id : pago.alumno_id});
		  pago.cuenta = Cuentas.findOne({_id : pago.cuenta_id});
		  pago.usuarioInserto = Meteor.users.findOne({_id : pago.usuarioInserto_id});
	  })
	  return otrosPagos;
  },
  deudores: function (seccion_id) {
		var pagosPendientes = PlanPagos.find({estatus : 0, modulo : "colegiatura", seccion_id : seccion_id, fecha : { $lt : new Date() } }, {sort : {fecha : 1}}).fetch();
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
				  var ultimoPago = PlanPagos.findOne({$or : [{estatus : 1}, {estatus : 3}], alumno_id : pago.alumno_id}, { sort : {fechaPago : -1}});
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
				if(inscripcion != undefined && inscripcion.estatus == 1){
					//Obtener los pagos atrasados			
					var ultimoPago = PlanPagos.findOne({estatus : 1, alumno_id : alumno.alumno_id, modulo : "colegiatura"}, { sort : {fechaPago : -1}});
					//validar que haya pagado la semana actual
					if(ultimoPago.semana >= semanaActual && ultimoPago.anio == anioActual ){
						//Busco la siguiente semana, pero sólo 1
						if(ultimoPago.tipoPlan == "Semanal"){
							var pago = PlanPagos.findOne({estatus : 0, alumno_id : alumno.alumno_id, semana : ultimoPago.semana + 1, anio : ultimoPago.anio});
						}else if(ultimoPago.tipoPlan == "Quincenal"){
							var pago = PlanPagos.findOne({estatus : 0, alumno_id : alumno.alumno_id, semana : ultimoPago.semana + 2, anio : ultimoPago.anio});
						}else if(ultimoPago.tipoPlan == "Mensual"){
							var pago = PlanPagos.findOne({estatus : 0, alumno_id : alumno.alumno_id, semana : ultimoPago.semana + 4, anio : ultimoPago.anio});
						}
						
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
	},
	modificarSemanasPlanPagos : function(alumno_id, planPagos) {
		PlanPagos.remove({alumno_id : alumno_id});
		_.each(planPagos, function(pago){
			PlanPagos.insert(pago);
		});
		
		return "hecho";
	},
	reporteComisionesGerentes : function(semana, anio, seccion_id, campus_id){
		dias = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];
		//Busco las comisiones de los gerentes
	  var comisionesGerente = Comisiones.find({semanaPago : semana, anioPago : anio, seccion_id : seccion_id, beneficiario : "gerente"}).fetch();
	  var arreglo = {};
	  
	  //Agrupo las comisiones por cada gerente
	  _.each(comisionesGerente, function(comision){
		  if(arreglo[comision.gerente_id] == undefined){
			   arreglo[comision.gerente_id] = {};
			   arreglo[comision.gerente_id].gerente = Meteor.users.findOne(comision.gerente_id, {fields : {profile : 1}});
			   arreglo[comision.gerente_id].cantidad = 1;
			   arreglo[comision.gerente_id].semana = comision.semana;
			   arreglo[comision.gerente_id].beneficiario = comision.beneficiario;
			   arreglo[comision.gerente_id].dias = {};
			   _.each(dias, function(dia){
				   arreglo[comision.gerente_id].dias[dia] = 0;
			   })
			   arreglo[comision.gerente_id].dias[dias[comision.diaPago]] = 1;
			   
		  }else{
			   arreglo[comision.gerente_id].cantidad += 1;
			   if(arreglo[comision.gerente_id].dias[dias[comision.diaPago]] == undefined){
				   arreglo[comision.gerente_id].dias = {};
				   arreglo[comision.gerente_id].dias[dias[comision.diaPago]] = 0;
			   }else{
				   arreglo[comision.gerente_id].dias[dias[comision.diaPago]] += 1;
			   }
			   
		  }
	  });
	  arreglo = _.toArray(arreglo);

		//Aplico las reglas de comisión por cada gerente
	  _.each(arreglo, function(gerente){
		  var g = Meteor.users.findOne(gerente.gerente._id);
			_.each(g.profile.planComision, function(concepto){
				switch(concepto.signo){
					case "<=" :
						if(gerente.cantidad >= concepto.cantInicial && gerente.cantidad <= concepto.cantFinal){
							gerente.importe = gerente.cantidad * concepto.importe;
						}
						break;
					case ">=" :
						if(gerente.cantidad >= concepto.cantInicial && gerente.cantidad >= concepto.cantFinal){
							gerente.importe = gerente.cantidad * concepto.importe;
						}
						break;
				}
			});
	  });	  
	  
	  return arreglo;
	  
	},
	reporteComisionesVendedores : function(semana, anio, seccion_id, campus_id){
		dias = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];
	  var arreglo = {};
	  //Busco las comisiones de los vendedores
	  var comisionesVendedores = Comisiones.find({semanaPago : semana, anioPago : anio, seccion_id : seccion_id, beneficiario : "vendedor"}).fetch();
	  
	  //Agrupo las comisiones por cada vendedor
	  _.each(comisionesVendedores, function(comision){
		  if(arreglo[comision.vendedor_id] == undefined){
			   arreglo[comision.vendedor_id] = {};
			   arreglo[comision.vendedor_id].vendedor = Meteor.users.findOne(comision.vendedor_id, {fields : {profile : 1}});
			   arreglo[comision.vendedor_id].cantidad = 1;
			   arreglo[comision.vendedor_id].semana = comision.semana;
			   arreglo[comision.vendedor_id].beneficiario = comision.beneficiario;
			   arreglo[comision.vendedor_id].comision = comision.importeComision;
			   arreglo[comision.vendedor_id].dias = {};
			   _.each(dias, function(dia){
				   arreglo[comision.vendedor_id].dias[dia] = 0;
			   })
			   arreglo[comision.vendedor_id].dias[dias[comision.diaPago]] = 1;
		  }else{
			   arreglo[comision.vendedor_id].cantidad += 1;
			   arreglo[comision.vendedor_id].comision += comision.importeComision;
			   if(arreglo[comision.vendedor_id].dias[dias[comision.diaPago]] == undefined){
				   arreglo[comision.vendedor_id].dias = {};
				   arreglo[comision.vendedor_id].dias[dias[comision.diaPago]] = 0;
			   }else{
				   arreglo[comision.vendedor_id].dias[dias[comision.diaPago]] += 1;
			   }
			   
		  }
	  });
	  arreglo = _.toArray(arreglo);

		//Aplico las reglas de bonos por cada vendedor
		var conceptosComision = ConceptosComision.find({seccion_id : seccion_id, estatus : true}).fetch();
	  _.each(arreglo, function(vendedor){
			_.each(conceptosComision, function(concepto){
				switch(concepto.signo){
					case "<=" :
						if(vendedor.cantidad >= concepto.cantInicial && vendedor.cantidad <= concepto.cantFinal){
							vendedor.bono = concepto.importe;
						}
						break;
					case ">=" :
						if(vendedor.cantidad >= concepto.cantInicial && vendedor.cantidad >= concepto.cantFinal){
							vendedor.bono = concepto.importe;
						}
						break;
				}
			});
			vendedor.total = vendedor.bono + vendedor.comision;
	  });	  
	  
	  return arreglo;
	  
	},
	getPagosPorSemana : function(semanaPago, anioPago, campus_id){
		var pagos = PlanPagos.find( {campus_id : campus_id, semanaPago : semanaPago, estatus : 1, anioPago : anioPago}, {sort : {fecha : 1}}).fetch();
		var arreglo = {};
		_.each(pagos, function(pago){
			if(undefined == arreglo[pago.alumno_id]){
				arreglo[pago.alumno_id] = {};
				arreglo[pago.alumno_id].semanasPagadas = [];
				arreglo[pago.alumno_id].alumno = Meteor.users.findOne({_id : pago.alumno_id});
				arreglo[pago.alumno_id].usuario = Meteor.users.findOne({_id : pago.usuarioInserto_id});
				arreglo[pago.alumno_id].semanasPagadas.push(pago.semana);
				arreglo[pago.alumno_id].tipoPlan = pago.tipoPlan;
				arreglo[pago.alumno_id].fechaPago = pago.fechaPago;
			}else{
				arreglo[pago.alumno_id].semanasPagadas.push(pago.semana);
			}
		})
		
		return _.toArray(arreglo);
	},
	getAlumnosReprobados : function(campus_id){
		var reprobados = Reprobados.find({campus_id : campus_id, estatus : true}).fetch();
		console.log(reprobados);
		var alumnosReprobados = {};
		_.each(reprobados, function(alumno){
			if(alumnosReprobados[alumno.materia_id] == undefined){
				alumnosReprobados[alumno.materia_id] = {};
				alumnosReprobados[alumno.materia_id].materia = Materias.findOne({_id : alumno.materia_id}, { fields : { nombre : 1 }});
				alumnosReprobados[alumno.materia_id].alumnos = [];
				var obj = {};
				obj.alumno = Meteor.users.findOne({_id : alumno.alumno_id}, { fields : {"profile.nombreCompleto" : 1}});
				obj.maestro = Maestros.findOne({_id : alumno.maestro_id}, { fields : {nombre: 1 }});
				obj.grupo = Grupos.findOne({_id : alumno.grupo_id}, { fields : { nombre : 1 }});
				obj.fechaCreacion = alumno.fechaCreacion;
				obj.calificacion = alumno.calificacion;
				alumnosReprobados[alumno.materia_id].alumnos.push(obj);
			}else{
				var obj = {};
				obj.alumno = Meteor.users.findOne({_id : alumno.alumno_id}, { fields : {"profile.nombreCompleto" : 1}});
				obj.maestro = Maestros.findOne({_id : alumno.maestro_id}, { fields : {nombre: 1 }});
				obj.grupo = Grupos.findOne({_id : alumno.grupo_id}, { fields : { nombre : 1 }});
				obj.fechaCreacion = alumno.fechaCreacion;
				obj.calificacion = alumno.calificacion;
				alumnosReprobados[alumno.materia_id].alumnos.push(obj);
			}
		})
		
		return _.toArray(alumnosReprobados);
	}
})

