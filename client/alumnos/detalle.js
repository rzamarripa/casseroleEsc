angular
	.module('casserole')
	.controller('AlumnosDetalleCtrl', AlumnosDetalleCtrl);
 
function AlumnosDetalleCtrl($scope, $meteor, $reactive, $state, toastr, $stateParams) {
	
	rc = $reactive(this).attach($scope);
	
	this.masInfo = true;
	this.totalPagar = 0.00;
	this.ttotalpagar =0.00;
	this.alumno = {};
	this.fechaActual = new Date();
	this.diaActual = moment(new Date()).isoWeekday();
	this.semanaPago = moment(new Date()).isoWeek();
	this.anioActual = moment().get("year");
	this.hayParaPagar = true;
	this.tipoPlanes=["Semanal"];
	this.planEstudios_id = [];
	this.ocupacion_id = "";
	this.semanasSeleccionadas = [];
	this.otroPago = {}; 
	this.planPagosCollec = [];
	this.planPagos = [];
	this.cantPendientes = 0;
	this.cantCondonadas = 0;
	this.cantCanceladas = 0;
	this.cantAtrasadas 	= 0;
	this.cantPagadas 		= 0;
	this.cantSeleccionados = 0;
	//this.mostrarOcultarSep = false;
	this.seccion_id = "";
	this.cambiarPassword = true;
	window.rc = rc;
	this.i = 0;
	this.subscribe("ocupaciones",()=>{
		return [{_id : this.getReactively("ocupacion_id"), estatus : true, campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }]
	});
	
	this.subscribe("planPagos",()=>{
		return [{alumno_id : $stateParams.alumno_id, campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }]
	});
	
	this.subscribe("turnos",()=>{
		return [{estatus:true, campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }]
	});
	
	this.subscribe("curriculas",()=>{
		return [{estatus:true, alumno_id : $stateParams.alumno_id, planEstudios_id : { $in : this.getCollectionReactively("planEstudios_id")}}]
	});

	this.subscribe('inscripciones', () => {
		return [{
			alumno_id : $stateParams.alumno_id,
			campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""
		}];
	});
	
	this.subscribe('alumno', () => {
		return [{
			id : $stateParams.alumno_id,
			campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""
		}];
	});

	this.subscribe("cuentas",()=>{
		return [{activo:true, seccion_id : this.getReactively("seccion_id")}]
	});
	
	this.subscribe("secciones",()=>{
		return [{_id : this.getReactively("seccion_id")}]
	});

	this.subscribe("grupos",() => {
		return [{campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }];
	});
	
	this.subscribe('pagosAlumno', () => {
		return [{
			alumno_id : $stateParams.alumno_id
		}];
	});
	
	this.subscribe('conceptosPago',()=>{
		return [{seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : ""}]
	});
	
	this.subscribe("mediosPublicidad",()=>{
		return [{estatus:true }]
	});
	
	this.subscribe("pagoVacaciones",()=>{
		return [{estatus:true }]
	});
		
	this.helpers({
		alumno : () => {
			var al = Meteor.users.findOne({_id : $stateParams.alumno_id});
			if(al){
				this.ocupacion_id = al.profile.ocupacion_id;
				return al;
			}			
		},
		ocupaciones : () => {
			return Ocupaciones.find();
		},
		misPagos : () => {
			return Pagos.find();
		},
		planPagos : () => {
			var raw = PlanPagos.find({modulo : "colegiatura"}).fetch();
			var planes = [];
			
			if(raw != undefined){
				this.cantPagadas 		= PlanPagos.find({estatus : 1}).count();
				this.cantPendientes = PlanPagos.find({estatus : 0}).count();
				this.cantCondonadas = PlanPagos.find({estatus : 3}).count();
				this.cantAbonados = PlanPagos.find({estatus : 6}).count();
				this.cantCanceladas = PlanPagos.find({estatus : 2}).count();
				this.cantAtrasadas 	= PlanPagos.find({$and : [ {estatus : 0}, { $or : [{anio : {$lt : this.anioActual}}, 
																										 { $and : [{ semana : { $lt : this.semanaPago}}, { anio : this.anioActual}]}]}]}).count();
				for(var id in raw){
					pago = raw[id];
					if(!planes[pago.inscripcion_id])
						planes[pago.inscripcion_id]=[];
					planes[pago.inscripcion_id].push(pago);
				}				
			}
			return planes;
		},
		planPagosCollec : () => {
			return PlanPagos.find().fetch();
		},
		inscripciones : () =>{
			var inscripciones = Inscripciones.find({
				alumno_id : $stateParams.alumno_id
			}).fetch();
			
			if(inscripciones.length > 0){
				_.each(inscripciones, function(inscripcion){
					inscripcion.mostrarOcultarSep = inscripcion.mostrarOcultarSep || false;
					inscripcion.grupo = Grupos.findOne(inscripcion.grupo_id);
					inscripcion.curricula = Curriculas.findOne({planEstudios_id : inscripcion.planEstudios_id});
					inscripcion.seccion = Secciones.findOne({_id : inscripcion.seccion_id});
					if(inscripcion.grupo)
						inscripcion.grupo.turno = Turnos.findOne(inscripcion.grupo.turno_id);
				})
			}
			return inscripciones;
		},
		cuenta : () =>{
			return Cuentas.findOne();
		},
		curriculas : () => {
			if(this.getReactively("inscripciones")){
				_.each(rc.inscripciones, function(inscripcion){
					rc.planEstudios_id.push(inscripcion.planEstudios_id);
				})
				return Curriculas.find();
			}			
		},
		conceptosPago : () => {
		  return ConceptosPago.find({modulo:"otros"});
	  },
		mediosPublicidad : () => {
			return MediosPublicidad.find();
		}
	});

	this.grupo = function (grupoId){
		var _grupo = Grupos.findOne(grupoId);
		return _grupo;
	}
	
	this.actualizar = function(alumno,form){
		var alumnoTemp = Meteor.users.findOne({_id : alumno._id});

		if(form.$invalid){
			toastr.error('Error al actualizar los datos.');
			return;
		}
		var nombre = alumno.profile.nombre != undefined ? alumno.profile.nombre + " " : "";
		var apPaterno = alumno.profile.apPaterno != undefined ? alumno.profile.apPaterno + " " : "";
		var apMaterno = alumno.profile.apMaterno != undefined ? alumno.profile.apMaterno : "";
		alumno.profile.nombreCompleto = nombre + apPaterno + apMaterno;
		//delete alumno.profile.repeatPassword;
		//console.log("rc.alumno", rc.alumno);
		Meteor.call('modificarUsuario', rc.alumno, "alumno");
		toastr.success('Actualizado correctamente.');
		$('.collapse').collapse('hide');
		this.nuevo = true;
		$state.go('root.alumnos');
	};
	
	this.tomarFoto = function () {
		$meteor.getPicture().then(function(data){
			rc.alumno.profile.fotografia = data;
		});
	};
	
	this.totalPagado = function(){
		var temp = 0.00;
		_.each(this.misPagos, function(pago){	
			temp += parseFloat(pago.importe);		
		});
		return temp;
	}
	
	this.masInformacion = function(){
		this.masInfo = !this.masInfo;
	}
	
	this.estaInscrito = function(alumno_id){
		inscrito = Inscripciones.findOne({alumno_id: alumno_id});
		if(inscrito != undefined)
			return true
		else
			return false
	}

	this.inscripcionCompleta= function (inscripcion) {
		var ban = true;
		for(var id in inscripcion.pagos)
			ban = ban && (inscripcion.pagos[id].estatus==1 || inscripcion.pagos[id].estatus==3)
		return ban;
	}

	this.calcularImporteU= function(pago, configuracion){
		if(pago.estatus == 1)
			return pago.pago;
		if(pago.estatus == 6 || (pago.estatus == 2 && pago.faltante > 0))
			return pago.faltante;
			
/*
		if(pago.modificada = true || pago.tiempoPago == 1)
			return pago.importeRegular + ;
		
*/
		var fechaActual = moment();
		var fechaCobro = moment(pago.fecha);
		var diasRecargo = fechaActual.diff(fechaCobro, 'days')
		var diasDescuento = fechaCobro.diff(fechaActual, 'days')
		//Aquí modifiqué francisco
		var diasDiferencia = fechaCobro.diff(fechaActual, "days");
		//var concepto 			= configuracion.colegiatura[pago.tipoPlan];
		var importe 			= pago.importeRegular;
		if(diasDiferencia >= pago.diasDescuento){
			importe -= pago.importeDescuento;
		}
		if(diasDiferencia <= pago.diasRecargo * -1){
			importe += pago.importeRecargo;
			pago.tiempoPago=1;
		}
		pago.importe = importe;
		//pago.retrasada = true;

		return importe
	}	

	this.tieneFoto = function(sexo, foto){
		if(foto === undefined){
			if(sexo === "masculino")
				return "img/badmenprofile.png";
			else if(sexo === "femenino"){
				return "img/badgirlprofile.png";
			}else{
				return "img/badprofile.png";
			}
		}else{
			return foto;
		}
	}

	this.seleccionarConcepto = function (cobro,configuracion) {
		this.seccion_id = configuracion.seccion_id;
		rc.hayParaPagar = true;
		//rc.totalPagar = 0;
		if(!rc.conceptosSeleccionados)
			rc.conceptosSeleccionados = [];
		if(cobro.tmpestatus!= 5 && cobro.estatus!= 5 && cobro.estatus != 3 && cobro.estatus != 1){

			cobro.tmpestatus = 5;
			cobro.tmpPago = cobro.importe;
			rc.totalPagar += cobro.importe
			if(cobro.estatus==6)
				rc.totalPagar-=cobro.pago;
		
			rc.conceptosSeleccionados.push(cobro);
		}
		else{
			var index = rc.conceptosSeleccionados.indexOf(cobro);
			if(index>-1){
				rc.conceptosSeleccionados.splice(index, 1);
				cobro.tmpestatus=cobro.estatus;
				cobro.tmpPago = cobro.pago;
				rc.totalPagar -= cobro.importe
				if(cobro.estatus==6)
					rc.totalPagar+=cobro.pago;
			}	

		}
		if(rc.conceptosSeleccionados.length>0)
			rc.hayParaPagar = false;

		rc.pagaCon =rc.totalPagar-configuracion.abono;
		if(rc.pagaCon <0)
			rc.pagaCon =0;
		rc.ttotalpagar = rc.pagaCon

	}
	
	this.validarPagoVacaciones = function(cobro){
		var pagosVacaciones = PagoVacaciones.find().fetch();
		_.each(pagosVacaciones, function(pagoVacacion){
			if(pagoVacacion.semana == cobro.semana){
				return true;
			}else{
				return false;
			}
		})
		console.log(cobro, "pago vacaciones");
		return true;
	}

	this.seleccionarSemana = function(cobro, plan, configuracion){
		//TODO ESTOY MODIFICANDO ESTA SECCIÓN
/*
		var pagosVacaciones = PagoVacaciones.find().fetch();
		_.each(pagosVacaciones, function(pagoVacacion){
			if(pagoVacacion.semana == cobro.semana){
				console.log("adios")
				cobro.estatus = 5;
				rc.totalPagar += cobro.importeRegular;
				rc.pagaCon =rc.totalPagar-configuracion.abono;
				rc.seccion_id = configuracion.seccion_id;
				if(rc.pagaCon < 0)
					rc.pagaCon = 0;
				rc.ttotalpagar = rc.pagaCon
			}else{
				
			}
		})
*/
		console.log("hola")
				rc.hayParaPagar = true;
				rc.totalPagar = 0;
				rc.cantSeleccionados = 0;
				rc.semanasSeleccionadas = [];
				for (var i = 0; i < cobro.numeroPago; i++) {
					if(plan[i].estatus != 1 && plan[i].estatus != 3 && plan[i].estatus != 2){
						rc.hayParaPagar = false;
						rc.cantSeleccionados++;
						if(plan[i].estatus == 6 || plan[i].faltante > 0){
							rc.totalPagar += plan[i].faltante;
						}
						else{
							
							rc.totalPagar += rc.calcularImporteU(plan[i], configuracion);
						}
						rc.semanasSeleccionadas.push(plan[i]);
						plan[i].estatus = 5;
						//plan[i].pago = this.calcularImporteU(plan,i)
					}
				};
				for (var i = cobro.numeroPago; i < plan.length; i++) {
					if(plan[i].estatus != 1 && plan[i].estatus != 3 && plan[i].faltante && plan[i].estatus != 2)
						plan[i].estatus = 6;		
					if(plan[i].estatus != 1 && plan[i].estatus != 3 && plan[i].estatus != 6 && plan[i].estatus != 2){
						plan[i].estatus = 0;
					}
				}	
				rc.pagaCon =rc.totalPagar-configuracion.abono;
				rc.seccion_id = configuracion.seccion_id;
				if(rc.pagaCon < 0)
					rc.pagaCon = 0;
				rc.ttotalpagar = rc.pagaCon	
		
	}

	
	this.imprimir = function(semanaSeleccionada){
		var semanasImprimir = [];
		_.each(rc.misSemanas, function(semana){
			if(semana.estatus == 3){
				semanasImprimir.push(semana);
			}
		});
		var url = $state.href("anon.pagosImprimir",{semanas : semanasImprimir, id : $stateParams.alumno_id},{newTab : true});
		window.open(url,'_blank');
		
	}

	this.obtenerEstatus = function(cobro){

		if(cobro.estatus == 1){
			return "bg-color-green txt-color-white";
		}			
		if(cobro.estatus == 5 || cobro.tmpestatus==5){
			return "bg-color-blue txt-color-white";
		}else if(cobro.estatus == 0 && (cobro.semana >= this.semanaPago && cobro.anio >= this.anioActual)){
			
		}else if(cobro.estatus == 3){
			return "bg-color-blueDark txt-color-white";	
		}else if(cobro.estatus == 2){
			return "bg-color-red txt-color-white";
		}else if(cobro.estatus == 6){
			return "bg-color-greenLight txt-color-white";
		}else if(cobro.tiempoPago == 1 || cobro.anio < this.anioActual || (cobro.semana < this.semanaPago && cobro.anio == this.anioActual)){
			return "bg-color-orange txt-color-white";
		}
		
		
			
		
		return "";
		
	}
	
	/*
	this.pagarLiquidacion=function(cobro, semanasPagadas){
		semanasPagadas.push({
			fechaPago 	: new Date(),
			alumno_id 	: $stateParams.alumno_id,
			campus_id 	: Meteor.user().profile.campus_id,
			numero 			: cobro.numeroPago,
			semana 			: cobro.semana,
			anio 				: cobro.anio,
			estatus 		: 1,
			concepto 		: 'Colegiatura #' + cobro.numeroPago + ': Liquidación',
			tipo 				: "Liquidación",
			usuario_id 	: Meteor.userId(),
			importe 		: cobro.pago,
			cuenta_id 	: this.cuenta._id,
			weekday 		: this.diaActual,
			semanaPago	: this.semanaPago
		});
	}
	this.pagarCobro = function(cobro, semanasPagadas, configuracion){
		var conceptos = configuracion.colegiatura[cobro.tipoPlan].conceptos;
		for(var j  in conceptos){
			var concepto = conceptos[j];
			if(concepto.estatus){
				semanasPagadas.push({
									fechaPago 	: new Date(),
									alumno_id 	: $stateParams.alumno_id,
									campus_id 	: Meteor.user().profile.campus_id,
									numero 			: cobro.numeroPago,
									semana 			: cobro.semana,
									anio 				: cobro.anio,
									estatus 		: 1,
									concepto 		: 'Colegiatura #' + cobro.numeroPago + ': ' + concepto.nombre,
									tipo 				: "Colegiatura",
									usuario_id 	: Meteor.userId(),
									importe 		: concepto.importe,
									cuenta_id 	: this.cuenta._id,
									weekday 		: this.diaActual,
									semanaPago	: this.semanaPago
				});
			}
		}
		
		if(cobro.remanente){
			semanasPagadas.push({
									fechaPago 	: new Date(),
									alumno_id 	: $stateParams.alumno_id,
									campus_id 	: Meteor.user().profile.campus_id,
									numero 			: cobro.numeroPago,
									semana 			: cobro.semana,
									anio 				: cobro.anio,
									estatus 		: 1,
									concepto 		: 'Colegiatura #' + cobro.numeroPago + ': Ajuste por cambio de plan de pagos',
									tipo 				: "Colegiatura",
									usuario_id 	: Meteor.userId(),
									importe 		: concepto.importe,
									cuenta_id 	: this.cuenta._id,
									weekday 		: this.diaActual,
									semanaPago	: this.semanaPago
				});
		}
		this.pagarRecargo(cobro, semanasPagadas, configuracion);
		this.pagarDescuento(cobro, semanasPagadas, configuracion);
	}
	this.pagarRecargo = function(cobro, semanasPagadas, configuracion){
		var fechaActual = new Date();
		var fechaCobro = new Date(cobro.fecha);
		var diasRecargo = Math.floor((fechaActual - fechaCobro) / (1000 * 60 * 60 * 24)); 
		var diasDescuento = Math.floor((fechaCobro - fechaActual) / (1000 * 60 * 60 * 24));
		var concepto = configuracion.colegiatura[cobro.tipoPlan]; 
		if(diasRecargo >= concepto.diasRecargo){	
			semanasPagadas.push({
										fechaPago 	: new Date(),
										alumno_id 	: $stateParams.alumno_id,
										campus_id 	: Meteor.user().profile.campus_id,
										numero 			: cobro.numeroPago,
										semana 			: cobro.semana,
										anio 				: cobro.anio,
										estatus 		: 1,
										concepto 		: 'Colegiatura #' + cobro.numeroPago + ': Recargo',
										tipo 				: "Recargo",
										usuario_id 	: Meteor.userId(),
										importe 		: concepto.importeRecargo,
										cuenta_id 	: this.cuenta._id,
										weekday 		: this.diaActual,
										semanaPago	: this.semanaPago
			});
		}
	}
	this.pagarDescuento = function(cobro, semanasPagadas, configuracion){
		var fechaActual = new Date();
		var fechaCobro = new Date(cobro.fecha);
		var diasRecargo = Math.floor((fechaActual - fechaCobro) / (1000 * 60 * 60 * 24)); 
		var diasDescuento = Math.floor((fechaCobro - fechaActual) / (1000 * 60 * 60 * 24));
		var concepto = configuracion.colegiatura[cobro.tipoPlan]; 
		if(diasDescuento >= concepto.diasDescuento){	
			semanasPagadas.push({
										fechaPago 	: new Date(),
										alumno_id 	: $stateParams.alumno_id,
										campus_id 	: Meteor.user().profile.campus_id,
										numero 			: cobro.numeroPago,
										semana 			: cobro.semana,
										anio 				: cobro.anio,
										estatus 		: 1,
										concepto 		: 'Colegiatura #' + cobro.numeroPago + ': Descuento',
										tipo 				: "Descuento",
										usuario_id 	: Meteor.userId(),
										importe 		: concepto.importeDescuento * -1,
										cuenta_id 	: this.cuenta._id,
										weekday 		: this.diaActual,
										semanaPago	: this.semanaPago
			});
		}
	}*/
	this.pagar = function(planPago, configuracion){
		if (confirm("Está seguro de realizar el cobro por $" + parseFloat(rc.ttotalpagar))) {
			var semanasPagadas = [];
			var diaSemana = moment().isoWeekday();
			var semanaPago = moment(new Date()).isoWeek();
			var mesPago = moment(new Date()).get('month') + 1;
			var anioPago = moment(new Date()).get('year');
			var diaActual = moment(new Date()).get('date');
			//this.cambio = (this.pagaCon+configuracion.abono) -this.totalPagar ;
			this.ppago =this.totalPagar-configuracion.abono;
			if(this.ppago<=0){
				configuracion.abono-= this.totalPagar;
				this.ppago = this.totalPagar;
			}
			else
				configuracion.abono=0
			if(rc.abono < 0)
				rc.abono = 0
			
			//ASIGNAR FOLIO
			
			var seccion = Secciones.findOne(configuracion.seccion_id);
			var folioActual = seccion.folioActual || 1;
			folioActual++;
			
			pago_id = Pagos.insert({
				fechaPago 	: new Date(),
				alumno_id 	: configuracion.alumno_id,
				grupo_id		: configuracion.grupo_id,
				seccion_id  : configuracion.seccion_id,
				campus_id 	: configuracion.campus_id,
				estatus 		: 1,
				usuarioInserto_id 	: Meteor.userId(),
				pago 		: this.ppago,
				cuenta_id   : rc.cuenta._id,
				diaPago     : diaActual,
				mesPago     : mesPago,
				semanaPago  : semanaPago,
				descripcion : "Colegiatura",
				nombre			: "Colegiatura",
				modulo			: "colegiatura",
				anioPago    : anioPago,
				inscripcion_id : configuracion._id,
				diaSemana		: diaSemana,
				cuenta_id		: rc.cuenta._id,
				folioActual : folioActual
			});
			_.each(planPago, function(pago){
					if(pago.estatus == 5 && pago.faltante > 0){
						//rc.pagarLiquidacion(pago, semanasPagadas);
						pago.pago = pago.pago ? pago.pago : 0 + pago.faltante;
						pago.estatus 		= 1;
						pago.faltante 	= 0;
						pago.fechaPago 	= new Date();
						pago.semanaPago = moment().isoWeek();
						pago.cuenta_id  = rc.cuenta._id,
						pago.anioPago 	= moment().get('year');
						pago.pago_id 		= pago_id;
						pago.usuarioInserto_id = Meteor.userId();
						semanasPagadas.push(pago);
					}
					else if(pago.estatus == 5){
						//rc.pagarCobro(pago, semanasPagadas, configuracion);
						pago.pago = rc.calcularImporteU(pago, configuracion);
						pago.estatus = 1;
						pago.fechaPago = new Date();
						pago.semanaPago = moment().isoWeek();
						pago.anioPago = moment().get('year');
						pago.cuenta_id   = rc.cuenta._id,
						pago.pago_id = pago_id;
						pago.usuarioInserto_id = Meteor.userId();
						semanasPagadas.push(pago);
					}
					var idTemp = pago._id;
					delete pago._id
					PlanPagos.update({_id : idTemp}, {$set : pago});
				});
			Inscripciones.update({_id:configuracion._id},{$set:{abono:configuracion.abono}});
			Secciones.update({_id : seccion._id}, {$set : { folioActual : folioActual}});
			this.totalPagar = 0.00;
			this.ttotalpagar = 0.00;
			this.cantSeleccionados = 0;
			//$state.go("anon.pagosImprimir",{semanas : semanasPagadas, id : $stateParams.alumno_id});
			var url = $state.href("anon.pagosImprimirConceptos",{seccion_id : configuracion.seccion_id, folioActual : folioActual, alumno_id : configuracion.alumno_id},{newTab : true});
			window.open(url,'_blank');
			// var win = window.open($state.href('anon.pagosImprimir', {semanas : semanasPagadas, id : $stateParams.alumno_id}),'_blank');
			// win.focus();
		}
	}
	
/*
	this.pagar = function(){
		if (confirm("Está seguro de realizar el cobro por $" + parseFloat(rc.totalPagar))) {
			var semanasPagadas = [];
			for (var i = 0; i < rc.inscripciones.length; i++) {
				var inscripcion=rc.inscripciones[i];
				for (var j=0;j<inscripcion.planPagos.fechas.length;j++) {
					var pago = inscripcion.planPagos.fechas[j];
					if(pago.pagada==2 && pago.faltante){
						this.pagarLiquidacion(inscripcion.planPagos,j,semanasPagadas);
						pago.pago = pago.pago? pago.pago:0 + pago.faltante;
						pago.pagada = 1;
						pago.faltante = 0;
					}
					else if(pago.pagada==2){
						this.pagarCobro(inscripcion.planPagos,j,semanasPagadas);
						pago.pago=this.calcularImporteU(inscripcion.planPagos,j);
						pago.pagada = 1;
					}
				}
				var inscripcion_id = inscripcion._id
				delete inscripcion._id;
				Inscripciones.update({_id:inscripcion_id},{$set:inscripcion});
			}
			for(var i in semanasPagadas){
				var semana = semanasPagadas[i];
				Pagos.insert(semana);
			}
			//$state.go("anon.pagosImprimir",{semanas : semanasPagadas, id : $stateParams.alumno_id});
			var url = $state.href('anon.pagosImprimir', {semanas : semanasPagadas, id : $stateParams.alumno_id});
			window.open(url,'_blank');
		}
	}
*/
	
	
	this.condonar = function(planPagos, configuracion, motivo){
		//console.log(planPagos, configuracion, motivo);
		
		if(motivo == undefined){
      toastr.error('Por favor llene el motivo.');
      return;
	  }
	  
		$('#condonarModal').modal('hide');
		$('body').removeClass('modal-open');
		$('.modal-backdrop').remove();

		var semanasCondonadas = [];
		var diaSemana = moment().isoWeekday();
		var semanaPago = moment(new Date()).isoWeek();
		var mesPago = moment(new Date()).get('month') + 1;
		var anioPago = moment(new Date()).get('year');
		var diaActual = moment(new Date()).get('date');
		this.ppago = this.totalPagar-configuracion.abono;
		var seccion = Secciones.findOne(configuracion.seccion_id);
		var folioActual = seccion.folioActual || 1;
		folioActual++;
		if(this.ppago <= 0){
			configuracion.abono -= this.totalPagar;
			this.ppago = 0;
		}
		else
			configuracion.abono = 0;
	
		if(rc.abono<0)
			rc.abono=0
		var condonado = Pagos.insert({
			fechaPago 	: new Date(),
			alumno_id 	: configuracion.alumno_id,
			grupo_id		: configuracion.grupo_id,
			seccion_id  : configuracion.seccion_id,
			campus_id 	: configuracion.campus_id,
			estatus 		: 1,
			usuario_id 	: Meteor.userId(),
			importe 		: 0,
			pago        : 0,
			diaPago     : diaActual,
			mesPago     : mesPago,
			semanaPago  : semanaPago,
			modulo 			: "condonacion",
			descripcion : "Condonación",
			motivo 			: motivo,
			anioPago    : anioPago,
			inscripcion_id : configuracion._id,
			diaSemana		: diaSemana,
			cuenta_id		: rc.cuenta._id,
			folioActual : folioActual,
			usuarioInserto_id : Meteor.userId()
		});
	
		_.each(planPagos, function(pago) {
			if(pago.estatus == 5){
				if(pago.faltante){
					pago.condonado = pago.faltante;
				}
				else{
					pago.condonado = rc.calcularImporteU(pago, configuracion);
					pago.pago = 0;
				}
				pago.fechaPago = new Date();
				pago.semanaPago = moment().isoWeek();
				pago.anioPago = moment().get('year');
				pago.mesPago = moment().get('month')+1;
				pago.diaPago = moment().isoWeekday();
				pago.estatus = 3;		
				pago.importe = 0;
				pago.pago_id = condonado;
				pago.motivo = motivo;
				pago.faltante = 0;
				//rc.condonarPago(pago,semanasCondonadas);
				
				var idTemp = pago._id;
				delete pago._id;
				PlanPagos.update(idTemp, {$set : pago});
			}
		});
		Secciones.update({_id : seccion._id}, {$set : { folioActual : folioActual}});
		rc.motivoCondono = "";
		// c = condonar
		var url = $state.href("anon.pagosImprimir",{pago : condonado, alumno_id 	: configuracion.alumno_id, tipo : "c", folioActual : folioActual},{newTab : true}); 
		
		window.open(url,'_blank');
	}

	this.condonarConcepto = function(configuracion){
		if (confirm("Está seguro que desea condonar el cobro por $" + parseFloat(rc.totalPagar))) {
			
			//ASIGNAR FOLIO
			
			var seccion = Secciones.findOne(configuracion.seccion_id);
			var folioActual = seccion.folioActual || 1;
			folioActual++;
			
			var semanasCondonadas = [];
			var diaSemana = moment().isoWeekday();
			var diaActual = moment(new Date()).get('date');
			var semanaPago = moment(new Date()).isoWeek();
			var mesPago = moment(new Date()).get('month') + 1;
			var anioPago = moment(new Date()).get('year');
			
			_.each(configuracion.pagos, function(pago) {
				var conceptoPago = ConceptosPago.findOne(pago.concepto_id);
				pago.motivo = rc.motivoCondonoConcepto;
				if(pago.tmpestatus == 5){
					if(pago.faltante){
						pago.condonado = pago.importe-pago.pago;
					}
					else{
						pago.condonado = pago.importe;
						pago.pago = 0;
					}
					pago.estatus = 3;		
					var nuevoPago = Pagos.insert({
						importeRegular : pago.condonado,
						pago : pago.pago,
						estatus 		: 3,
						fechaPago 	: new Date(),
						concepto_id : pago.concepto_id,
						semanaPago 	: moment().isoWeek(),
						anioPago 		: moment().get('year'),
						mesPago 		: moment().get('month')+1,
						diaPago 		: moment().date(),
						diaSemana 	: moment().isoWeekday(),
						tiempoPago 	: 0,
						alumno_id 	: configuracion.alumno_id,
						inscripcion_id : configuracion._id,
						seccion_id 	: configuracion.seccion_id,
						campus_id 	: configuracion.campus_id,
						cuenta_id 	: conceptoPago.cuenta_id,
						usuarioInserto_id : Meteor.userId(),
						modulo : "inscripcion",
						descripcion : pago.descripcion,
						nombre : pago.nombre,
						folioActual : folioActual,
						motivo : rc.motivoCondonoConcepto
					});
					
					//delete pago._id;
					delete pago.tmpestatus;
					delete pago.tmpPago
					//PlanPagos.update(idTemp, {$set : pago});
				}
			});
			var idTemp = configuracion._id;
			Inscripciones.update({_id:configuracion._id},{$set:{pagos:configuracion.pagos}});
			Secciones.update({_id : seccion._id}, {$set : { folioActual : folioActual}});
			$('#condonarModalConceptosInscripcion').modal('hide');
			$('body').removeClass('modal-open');
			$('.modal-backdrop').remove();
			rc.motivoCondonoConcepto = "";
			var url = $state.href("anon.pagosImprimirConceptos",{seccion_id : configuracion.seccion_id, folioActual : folioActual, alumno_id 	: configuracion.alumno_id},{newTab : true}); 
			window.open(url,'_blank');
		}
	}

	this.pagarConcepto = function( configuracion){

		function sortProperties(obj, sortedBy, isNumericSort, reverse) {
      sortedBy = sortedBy || 1; // by default first key
      isNumericSort = isNumericSort || false; // by default text sort
      reverse = reverse || false; // by default no reverse

      var reversed = (reverse) ? -1 : 1;

      var sortable = [];
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          sortable.push([key, obj[key]]);
        }
      }
      if (isNumericSort)
        sortable.sort(function (a, b) {
          return reversed * (a[1][sortedBy] - b[1][sortedBy]);
        });
      else
        sortable.sort(function (a, b) {
          var x = a[1][sortedBy].toLowerCase(),
              y = b[1][sortedBy].toLowerCase();
          return x < y ? reversed * -1 : x > y ? reversed : 0;
        });
      return sortable; // array in format [ [ key1, val1 ], [ key2, val2 ], ... ]
    }

    function sortObjects(objects, sortedBy, isNumericSort, reverse) {
	    var newObject = {};
	    sortedBy = sortedBy || 1; // by default first key
          isNumericSort = isNumericSort || false; // by default text sort
          reverse = reverse || false; // by default no reverse
	    var sortedArray = sortProperties(objects, sortedBy, isNumericSort, reverse);
	    for (var i = 0; i < sortedArray.length; i++) {
	        var key = sortedArray[i][0];
	        var value = sortedArray[i][1];
	        newObject[key] = value;
	    }
	    return newObject;
		}
		
		if (confirm("Está seguro que desea realizar el cobro por $" + parseFloat(rc.ttotalpagar))) {
			var semanasCondonadas = [];
			var diaSemana = moment().isoWeekday();
			var semanaPago = moment(new Date()).isoWeek();
			var mesPago = moment(new Date()).get('month') + 1;
			var anioPago = moment(new Date()).get('year');
			this.ppago =this.totalPagar-configuracion.abono;
			if(this.ppago<=0){
				configuracion.abono-= this.totalPagar;
				this.ppago = 0;
			}
			else
				configuracion.abono=0
			if(rc.abono<0)
				rc.abono=0

			sortObjects(configuracion.planPagos.inscripcion.conceptos,"orden",false,false);
			//console.log(configuracion.planPagos.inscripcion.conceptos);
			var ccinscripcion=Object.keys(configuracion.planPagos.inscripcion.conceptos)[0];
			var pagosInsertados = [];
			
			var seccion = Secciones.findOne(configuracion.seccion_id)
			var folioActual = seccion.folioActual || 1;
			folioActual++;
			_.each(configuracion.pagos, function(pago,ipago) {
				var conceptoPago = ConceptosPago.findOne(pago.concepto_id);
				if(pago.tmpestatus == 5){
					if(pago.faltante){
						pago.pago = pago.importe-pago.pago;;
					}
					else{
						pago.pago = pago.importe;
					}
					//console.log(ipago,ccinscripcion)
					if(ipago==ccinscripcion){
						Meteor.call('generaComisionesVendedor', configuracion, configuracion.planPagos.inscripcion.conceptos[ccinscripcion],pago.pago);
					}
					pago.fechaPago = new Date();
					pago.semanaPago = moment().isoWeek();
					pago.anioPago = moment().get('year');
					pago.mesPago = moment().get('month')+1;
					pago.diaPago = moment().isoWeekday();
					pago.estatus = 1;		
					pago.importe = pago.tmpPago;
					

					pago.faltante = 0;
					//rc.condonarPago(pago,semanasCondonadas);
					
					
					//delete pago._id;
					
					
					var nuevoPago = Pagos.insert({
						importeRegular : pago.tmpPago,
						pago : pago.pago,
						estatus 		: 1,
						fechaPago 	: new Date(),
						concepto_id : pago.concepto_id,
						semanaPago 	: moment().isoWeek(),
						anioPago 		: moment().get('year'),
						mesPago 		: moment().get('month')+1,
						diaPago 		: moment().date(),
						diaSemana 	: moment().isoWeekday(),
						tiempoPago 	: 0,
						alumno_id 	: configuracion.alumno_id,
						inscripcion_id : configuracion._id,
						seccion_id 	: configuracion.seccion_id,
						campus_id 	: configuracion.campus_id,
						cuenta_id 	: conceptoPago.cuenta_id,
						usuarioInserto_id : Meteor.userId(),
						modulo : "inscripcion",
						descripcion : pago.descripcion,
						nombre : pago.nombre,
						folioActual : folioActual
					});
					
/*
					pago.pago = pago.tmpPago + pago.pago;
					pago.pago_id = nuevoPago;
*/
					//console.log("primer concepto", pago);
					PlanPagos.update({_id : pago.planPago_id}, {$set : pago});
					
					pagosInsertados.push(nuevoPago);
					delete pago.tmpestatus;
					delete pago.tmpPago;
					
					
				}
			});
			var idTemp = configuracion._id;
			Inscripciones.update({_id:configuracion._id},{$set:{pagos:configuracion.pagos,abono:configuracion.abono}});
			Secciones.update({_id : seccion._id}, { $set : { folioActual : folioActual}});
			this.totalPagar = 0.00;
			this.ttotalpagar = 0.00;
			this.cantSeleccionados = 0;
			//$state.go("anon.pagosImprimir",{pago : pagosInsertados, alumno_id 	: configuracion.alumno_id}); 
			var url = $state.href("anon.pagosImprimirConceptos",{seccion_id : configuracion.seccion_id, folioActual : folioActual, alumno_id 	: configuracion.alumno_id},{newTab : true}); 
			window.open(url,'_blank');
		}
	}
	this.planPagosSemana =function (inscripcion) {
		var fechaIncial=inscripcion.planPagos.colegiatura.fechaIncial;
		var dia = inscripcion.planPagos.colegiatura.Semanal.diaColegiatura;
		var totalPagos = inscripcion.planPagos.colegiatura.Semanal.totalPagos;
		var mfecha = moment(fechaIncial);
		mfecha=mfecha.day(dia);
		var inicio =  mfecha.toDate();
		var plan =[]

		for (var i = 0; i <totalPagos; i++) {
			plan.push({
				    alumno_id         : inscripcion.alumno_id,
					inscripcion_id    : inscripcion._id,
					vendedor_id       : inscripcion.vendedor_id,
					seccion_id        : inscripcion.seccion_id,
					campus_id         : inscripcion.campus_id,
					fechaInscripcion  : inscripcion.fechaInscripcion,
				   	semana 			    : mfecha.isoWeek(),
					fecha 			    : new Date(mfecha.toDate().getTime()),
					dia                 : mfecha.isoWeekday(),
					tipoPlan 		    : 'Semanal',
					numeroPago 	        : i + 1,
				
					importeRecargo      : inscripcion.planPagos.colegiatura.Semanal.importeRecargo,
					importeDescuento    : inscripcion.planPagos.colegiatura.Semanal.importeDescuento,
					importeRegular      : inscripcion.planPagos.colegiatura.Semanal.importeRegular,
					diasRecargo         : inscripcion.planPagos.colegiatura.Semanal.diasRecargo,
					diasDescuento       : inscripcion.planPagos.colegiatura.Semanal.diasDescuento,
					importe             : inscripcion.planPagos.colegiatura.Semanal.importeRegular,
					fechaPago           : undefined,
					semanaPago          : undefined,
					diaPago             : undefined,
					pago                : 0,
					estatus             : 0,
					tiempoPago          : 0,
					modificada          : false,
					mes					: mfecha.get('month') + 1,
					anio				: mfecha.get('year'),
					pago_id            : undefined


				
			});
			mfecha = mfecha.day(8);
		}
		return plan;
	}

	this.planPagosQuincenal=function(inscripcion) {
		var fechaIncial=inscripcion.planPagos.colegiatura.fechaIncial;
		var dia = inscripcion.planPagos.colegiatura.Quincenal.diaColegiatura;
		var totalPagos = inscripcion.planPagos.colegiatura.Quincenal.totalPagos;
		var mfecha = moment(fechaIncial);
		var par =0;
		mfecha=mfecha.date(dia[0]);
		var inicio =  mfecha.toDate();
		var plan =[]
		var dife=mfecha.diff(fechaIncial,'days');
		if(Math.abs(dife)>7){
			mfecha=mfecha.date(dia[1]);
			dife=mfecha.diff(fechaIncial,'days');
			if(Math.abs(dife)>7)
				mfecha.add(1,'month');
			else
				par=1;
		}
		for (var i = 0; i <totalPagos; i++) {

			plan.push({
				alumno_id         : inscripcion.alumno_id,
					inscripcion_id    : inscripcion._id,
					vendedor_id       : inscripcion.vendedor_id,
					seccion_id        : inscripcion.seccion_id,
					campus_id         : inscripcion.campus_id,
					fechaInscripcion  : inscripcion.fechaInscripcion,
				   	semana 			    : mfecha.isoWeek(),
					fecha 			    : new Date(mfecha.toDate().getTime()),
					dia                 : mfecha.isoWeekday(),
					tipoPlan 		    : 'Quincenal',
					numeroPago 	        : i + 1,
				
					importeRecargo      : inscripcion.planPagos.colegiatura.Semanal.importeRecargo,
					importeDescuento    : inscripcion.planPagos.colegiatura.Semanal.importeDescuento,
					importeRegular      : inscripcion.planPagos.colegiatura.Semanal.importeRegular,
					diasRecargo         : inscripcion.planPagos.colegiatura.Semanal.diasRecargo,
					diasDescuento       : inscripcion.planPagos.colegiatura.Semanal.diasDescuento,
					importe             : inscripcion.planPagos.colegiatura.Semanal.importeRegular,
					fechaPago           : undefined,
					semanaPago          : undefined,
					diaPago             : undefined,
					pago                : 0,
					estatus             : 0,
					tiempoPago          : 0,
					modificada          : false,
					mes					: mfecha.get('month') + 1,
					anio				: mfecha.get('year'),
					pago_id            : undefined
			});
			
			if(par==1){
				par = 0;
				mfecha.add(1,'month');
				mfecha.date(dia[par]);
			}else{
				par = 1;
				//mfecha.add(1,'month');
				mfecha.date(dia[par]);
			}
		}
		return plan;
	}

	this.planPagosMensual=function(inscripcion) {
		var fechaIncial=inscripcion.planPagos.colegiatura.fechaIncial;
		var dia = inscripcion.planPagos.colegiatura.Mensual.diaColegiatura;
		var totalPagos = inscripcion.planPagos.colegiatura.Mensual.totalPagos;
		var mfecha = moment(fechaIncial);
		mfecha=mfecha.date(dia);
		var inicio =  mfecha.toDate();
		var plan =[]
		var dife=mfecha.diff(fechaIncial,'days');
		if(Math.abs(dife)>15)
			mfecha.add(1,'month');
		for (var i = 0; i <totalPagos; i++) {
			plan.push({

				alumno_id         : inscripcion.alumno_id,
					inscripcion_id    : inscripcion._id,
					vendedor_id       : inscripcion.vendedor_id,
					seccion_id        : inscripcion.seccion_id,
					campus_id         : inscripcion.campus_id,
					fechaInscripcion  : inscripcion.fechaInscripcion,
				   	semana 			    : mfecha.isoWeek(),
					fecha 			    : new Date(mfecha.toDate().getTime()),
					dia                 : mfecha.isoWeekday(),
					tipoPlan 		    : 'Mensual',
					numeroPago 	        : i + 1,
				
					importeRecargo      : inscripcion.planPagos.colegiatura.Semanal.importeRecargo,
					importeDescuento    : inscripcion.planPagos.colegiatura.Semanal.importeDescuento,
					importeRegular      : inscripcion.planPagos.colegiatura.Semanal.importeRegular,
					diasRecargo         : inscripcion.planPagos.colegiatura.Semanal.diasRecargo,
					diasDescuento       : inscripcion.planPagos.colegiatura.Semanal.diasDescuento,
					importe             : inscripcion.planPagos.colegiatura.Semanal.importeRegular,
					fechaPago           : undefined,
					semanaPago          : undefined,
					diaPago             : undefined,
					pago                : 0,
					estatus             : 0,
					tiempoPago          : 0,
					modificada          : false,
					mes					: mfecha.get('month') + 1,
					anio				: mfecha.get('year'),
					pago_id            : undefined
			});
			
			mfecha.add(1,'month');
		}
		return plan;
	}

	this.cambioTipoColegiatura=function(selected, oldValue, curso){
		if (confirm("Está seguro que desea cambiar el Plan de Pagos")) {
			var fechas = rc.planPagos[curso._id];
			
			var fechaActual = new Date()
			var fechaUltima = {fecha:new Date()}
			
			switch(selected){
				case 'Mensual':
				case 'Quincenal':
				case 'Semanal':
			}


			while(fechas.length > 0 && fechas[fechas.length -1].fecha > fechaActual && (!fechas[fechas.length -1].estatus || fechas[fechas.length -1].estatus == 0)){
				
				fechaUltima = fechas.pop();
				PlanPagos.remove(fechaUltima._id)

			}

			var plan = [];
			var r =0;

			switch(selected){
				case 'Mensual':
					plan = this.planPagosMensual(curso);
					r = 30;
					break;
				case 'Quincenal':
					plan = this.planPagosQuincenal(curso);
					r = 15;
					break;
				case 'Semanal':
					plan = this.planPagosSemana(curso);
					r = 7;
					break;
			}

			var mfechaUltima = moment(fechaUltima.fecha);

			for(var i = 0; i < plan.length; i++){
				if(fechaUltima.fecha <= plan[i].fecha){
					plan[i].numeroPago = fechas[fechas.length -1].numeroPago + 1
					if(fechaUltima.numeroPago == plan[i].numeroPago){
						var x = mfechaUltima.diff(plan[i].fecha, 'days') * -1;
						var importe = curso.planPagos.colegiatura[selected].importeRegular;
						var remanente = (x / r) * importe;
						plan[i].remanente = remanente;
					}
					PlanPagos.insert(plan[i]);
					fechas.push(plan[i]);

				}
			}
		
			Inscripciones.update({_id:curso._id},{$set:{planPagos:curso.planPagos}});

			//_.each(inscripcion.planPagos.fechas, function(pago){
				
			//})
		}
		else{
			curso.planPagos.colegiatura.tipoColegiatura = oldValue;
		}
	}
	
/*
	this.cambioTipoColegiatura=function(selected, oldValue, curso){
		if (confirm("Está seguro que desea cambiar el Plan de Pagos")) {
			var fechas = curso.planPagos.fechas;
			
			var fechaActual = new Date()
			var fechaUltima = {fecha:new Date()}
			switch(selected){
				case 'Mensual':
				case 'Quincenal':
				case 'Semanal':
			}

			while(fechas.length>0 && fechas[fechas.length-1].fecha>fechaActual && (!fechas[fechas.length-1].pagada || fechas[fechas.length-1].pagada==0)){
				
				fechaUltima = fechas.pop();
			}

			var plan = [];
			var r =0;

			switch(selected){
				case 'Mensual':
					plan= this.planPagosMensual(curso);
					r = 30;
					break;
				case 'Quincenal':
					plan= this.planPagosQuincenal(curso);
					r = 15;
					break;
				case 'Semanal':
					plan= this.planPagosSemana(curso);
					r = 7;
					break;
			}

			var mfechaUltima = moment(fechaUltima.fecha);

			for(var i = 0; i < plan.length; i++){
				if(fechaUltima.fecha <= plan[i].fecha){
					plan[i].numeroPago = fechas[fechas.length -1].numeroPago + 1
					if(fechaUltima.numeroPago == plan[i].numeroPago){
						var x = mfechaUltima.diff(plan[i].fecha, 'days') * -1;
						var importe = curso.planPagos.colegiatura[selected].importeRegular;
						var remanente = (x / r) * importe;
						plan[i].remanente = remanente;


					}
					
					fechas.push(plan[i]);
				}
			}
		
			Inscripciones.update({_id:curso._id},{$set:{planPagos:curso.planPagos}});
		}
		else{
			curso.planPagos.colegiatura.tipoColegiatura=oldValue;
		}
	}
*/

	this.getOcupacion = function(ocupacion_id){
		var ocupacion = Ocupaciones.findOne(ocupacion_id);
		if(ocupacion)
			return ocupacion.nombre;
	};
    
	this.guardarOtroPago = function(pago)
	{  
		var seccion = Secciones.findOne(rc.alumno.profile.seccion_id);
		var folioActual = seccion.folioActual;
		folioActual++;
		var semanasPagadas = [];
		var conceptoActual = ConceptosPago.findOne(pago.concepto_id);
		diaActual = moment(new Date()).isoWeekday();
		semanaPago = moment(new Date()).isoWeek();
		mesPago = moment(new Date()).get('month') + 1;
		anioPago = moment(new Date()).get('year');
		pago.estatus = 1;
		pago.usuarioInserto_id = Meteor.userId();
		pago.inscripcion_id = rc.inscripciones[0]._id;
		pago.campus_id = rc.alumno.profile.campus_id;
		pago.seccion_id = rc.alumno.profile.seccion_id;
		pago.dia = diaActual;
		pago.semana = semanaPago;
		pago.anio = anioPago;
		pago.alumno_id = $stateParams.alumno_id;
		pago.modulo = "Otro";
		pago.diaPago     = diaActual;
		pago.mesPago     = mesPago;
		pago.semanaPago  = semanaPago;
		pago.anioPago = anioPago;
		pago.fechaPago = new Date();
		pago.descripcion = conceptoActual.nombre;
		pago.cuenta_id = rc.cuenta._id;
		pago.cuenta = rc.cuenta.nombre;
		pago.folioActual = folioActual;
		pago.pago = conceptoActual.importe * pago.cantidad;
		Pagos.insert(pago);
		PlanPagos.insert(pago);
		toastr.success('Guardado correctamente.');
		this.otroPago = {}; 
		Secciones.update({_id : seccion._id}, {$set : { folioActual : folioActual}});
		var url = $state.href("anon.pagosImprimirConceptos",{seccion_id : seccion._id, folioActual : folioActual, alumno_id 	: pago.alumno_id},{newTab : true}); 
		window.open(url,'_blank');
	};
	
	this.regresar = function(){
		window.history.back();
	}
	
	this.getConceptoPago = function(conceptoPago_id){
		this.seccion_id = rc.inscripciones[0].seccion_id;
		var conceptoActual = ConceptosPago.findOne(conceptoPago_id);
		if(this.otroPago.cantidad == undefined){
			this.otroPago.cantidad = 1;
		}
		this.otroPago.importe = conceptoActual.importe;
		this.calcularImporteOtrosPagos();
	}
	
	this.calcularImporteOtrosPagos = function(){
		if(this.otroPago.cantidad == undefined){
			this.otroPago.cantidad = 1;
		}
		this.otroPago.total = this.otroPago.cantidad * this.otroPago.importe;
	}
	
	this.guardarComentario = function(alumno_id){
		semanaActual = moment(new Date()).isoWeek();
		diaActual = moment(new Date()).isoWeekday();
		this.comentario.fechaCreacion = new Date();
		this.comentario.estatus = true;
		this.comentario.usuarioInserto_id = Meteor.userId();
		this.comentario.alumno_id = alumno_id;
		this.comentario.semana = semanaActual;
		this.comentario.dia = diaActual;
		
		ComentariosAlumnos.insert(this.comentario);
		this.comentario = {};
		toastr.success('Guardado correctamente.');
	}
	
	this.abonar = function(inscripcion_id, abono){
		if(abono == undefined){
      toastr.error('Por favor especifique la cantidad a abonar.');
      return;
	  }
	  
		var inscripcion = Inscripciones.findOne(inscripcion_id);
		var abonoSumado = inscripcion.abono + abono;
		Inscripciones.update({_id : inscripcion_id}, {$set : { abono : abonoSumado}});
		$('#condonarModal').modal('hide');
		$('body').removeClass('modal-open');
		$('.modal-backdrop').remove();

		var semanasCondonadas = [];
		var diaSemana = moment().isoWeekday();
		var semanaPago = moment(new Date()).isoWeek();
		var mesPago = moment(new Date()).get('month') + 1;
		var anioPago = moment(new Date()).get('year');
		var diaActual = moment(new Date()).get('date');
		
		//REGISTRAR EL FOLIO DEL PAGO
		var seccion = Secciones.findOne(inscripcion.seccion_id)
		var folioActual = seccion.folioActual;
		folioActual++;

		var abonado = Pagos.insert({
			fechaPago 	: new Date(),
			alumno_id 	: inscripcion.alumno_id,
			grupo_id		: inscripcion.grupo_id,
			seccion_id  : inscripcion.seccion_id,
			campus_id 	: inscripcion.campus_id,
			estatus 		: 1,
			usuario_id 	: Meteor.userId(),
			importe 		: abono,
			pago        : abono,
			diaPago     : diaActual,
			mesPago     : mesPago,
			semanaPago  : semanaPago,
			modulo 			: "abono",
			descripcion : "Abono",
			anioPago    : anioPago,
			inscripcion_id : inscripcion_id,
			diaSemana		: diaSemana,
			cuenta_id		: rc.cuenta._id,
			folioActual : folioActual
		});
		rc.abono = undefined;
		Secciones.update({_id : seccion._id}, {$set : { folioActual : folioActual}});
		// a = abonar
		var url = $state.href("anon.pagosImprimirConceptos",{seccion_id : inscripcion.seccion_id, folioActual : folioActual, alumno_id 	: inscripcion.alumno_id},{newTab : true}); 
		window.open(url,'_blank');
		//toastr.success('Guardado correctamente.');
	}
	
	this.tienePermiso = function(roles){
		permiso = false;
		_.each(roles, function(role){
			if(role == Meteor.user().roles[0]){
				permiso = true;
			}
		});
		
		return permiso;
	}
	
	this.obtenerColorEstatus = function(estatus){
	  if(estatus == 1){ //Registrado
		  return "bg-color-blue txt-white";
	  }else if(estatus == 2){
		  return "bg-color-purple txt-white"
	  }else if(estatus == 3){
		  return "bg-color-yellow txt-white"
	  }else if(estatus == 4){
		  return "bg-color-blueLight txt-white"
	  }else if(estatus == 5){
		  return "bg-color-greenLight txt-white"
	  }else if(estatus == 6){
		  return "bg-color-red txt-white"
	  }else if(estatus == 7){
		  return "bg-color-blueDark txt-white"
	  }else if(estatus == 8){
		  return "label-primary txt-white"
	  }
  }
  
  this.obtenerNombreEstatus = function(estatus){
	  if(estatus == 1){ //Registrado
		  return "Registrado";
	  }else if(estatus == 2){
		  return "Inicio"
	  }else if(estatus == 3){
		  return "Pospuesto"
	  }else if(estatus == 4){
		  return "Fantasma"
	  }else if(estatus == 5){
		  return "Activo"
	  }else if(estatus == 6){
		  return "Baja"
	  }else if(estatus == 7){
		  return "Term.Pago"
	  }else if(estatus == 8){
		  return "Egresado"
	  }
  }
  
  this.cambiarEstatus = function(estatus, classLabel){
	  Meteor.apply("cambiarEstatusAlumno", [rc.alumno._id, estatus, this.obtenerColorEstatus(estatus), this.obtenerNombreEstatus(estatus), Meteor.user().profile.seccion_id], function(error, result){
		  if(result){
			  toastr.success("El alumno se ha cambiado al estatus " + result);
		  }else{
			  toastr.error("No se pudo cambiar el estatus");
		  }
	  })
  }
  
  this.guardarSep = function(inscripcion){
	  
	  Inscripciones.update({_id : inscripcion._id}, {$set : {sep : inscripcion.sep, fechaSep : inscripcion.fechaSep }});
	  inscripcion.mostrarOcultarSep = false;
	  toastr.success("Se actualizó correctamente"); 
  }
  
  this.cambiarSep = function(inscripcion, index){
	  console.log("cambiar", inscripcion, index);
	  if(inscripcion.sep == false){
		  inscripcion.mostrarOcultarSep = false;
		  Inscripciones.update({_id : inscripcion._id}, {$set : {sep : inscripcion.sep}, $unset : { fechaSep : ""}});
	  }else{
		  inscripcion.mostrarOcultarSep = true;
	  }
	  
  }
  
  this.validarContrasena = function(contrasena, confirmarContrasena){
		if(contrasena && confirmarContrasena){
			if(contrasena === confirmarContrasena && contrasena.length > 0 && confirmarContrasena.length > 0){
				rc.validaContrasena = true;
			}else{
				rc.validaContrasena = false;
			}
		}
	}
	
	this.cambiarContrasena = function(){
		this.cambiarPassword = !this.cambiarPassword;
		if(this.alumno.cambiarContrasena == false){
			rc.alumno.password = undefined;
			rc.alumno.confirmarContrasena = undefined;
		}else{
			rc.alumno.password = "";
			rc.alumno.confirmarContrasena = "";
		}
	}

}