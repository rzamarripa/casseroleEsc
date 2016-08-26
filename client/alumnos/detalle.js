angular
	.module('casserole')
	.controller('AlumnosDetalleCtrl', AlumnosDetalleCtrl);
 
function AlumnosDetalleCtrl($scope, $meteor, $reactive, $state, toastr, $stateParams) {
	
	rc = $reactive(this).attach($scope);
	
	
		
	this.masInfo = true;
	this.totalPagar = 0.00;
	this.alumno = {};
	this.fechaActual = new Date();
	this.diaActual = moment(new Date()).weekday();
	this.semanaPago = moment(new Date()).isoWeek();
	this.hayParaPagar = true;
	
	this.subscribe("ocupaciones",()=>{
		return [{estatus:true, campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }]
	});

	this.subscribe('inscripciones', () => {
		return [{
			alumno_id : $stateParams.id,
			campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""
		}];
	});
	
	this.subscribe('alumno', () => {
		return [{
			id : $stateParams.id,
			campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""
		}];
	});

	this.subscribe("cuentas",()=>{
		return [{activo:true, seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : ""}]
	});

	this.subscribe("grupos",() => {
			return [{campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }];
		});
	
	this.subscribe('pagosAlumno', () => {
		return [{
			alumno_id : $stateParams.id
		}];
	});
		
	this.helpers({
		alumno : () => {
			return Meteor.users.findOne({_id : $stateParams.id});
		},
		ocupaciones : () => {
			return Ocupaciones.find();
		},
		misPagos : () => {
			return Pagos.find();
		},
		inscripciones : () =>{
			return Inscripciones.find();
		},
		cuenta : () =>{
			return Cuentas.findOne();
		}

	 /* misSemanas : () => {
			var inscripcion = moment("2013-01-03");
			var hoy = moment();
			var cantSemanas = hoy.diff(inscripcion, 'week');
			semanas = [];
			for(var j=0; j<= cantSemanas; j++){
				var elAnio = inscripcion.year();
				semanas.push({semana: j, numero : moment(inscripcion).week(), pagada : 0, anio : elAnio });
				inscripcion.add(1, 'weeks');
			}
			
			_.each(this.getReactively('misPagos'), function(pago){
				_.each(semanas, function(semana){
					if(semana.numero == pago.semana && semana.anio == pago.anio){
						semana.pagada = 1;
						semana.importe = pago.importe;
					}
				});
			});
			
			return semanas;
		}*/
	});

	this.grupo = function (grupoId){
		var _grupo = Grupos.findOne(grupoId);
		return _grupo;
	}

	
	this.actualizar = function(alumno,form)
	{
		if(form.$invalid){
			toastr.error('Error al actualizar los datos.');
			return;
		}
		var nombre = alumno.profile.nombre != undefined ? alumno.profile.nombre + " " : "";
		var apPaterno = alumno.profile.apPaterno != undefined ? alumno.profile.apPaterno + " " : "";
		var apMaterno = alumno.profile.apMaterno != undefined ? alumno.profile.apMaterno : "";
		alumno.profile.nombreCompleto = nombre + apPaterno + apMaterno;
		delete alumno.profile.repeatPassword;
		Meteor.call('updateGerenteVenta', rc.alumno, "alumno");
		toastr.success('Actualizado correctamente.');
		$('.collapse').collapse('hide');
		this.nuevo = true;
		form.$setPristine();
		form.$setUntouched();
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
		console.log(this.masInfo);
	}
	this.estaInscrito = function(alumno_id){
		inscrito = Inscripciones.findOne({alumno_id: alumno_id});
		if(inscrito != undefined)
			return true
		else
			return false
	}

	
	this.calcularImporteU= function(plan,i){
		if(plan.fechas[i].pagada==1)
			return plan.fechas[i].pago;
		if(plan.fechas[i].pagada==6 || (plan.fechas[i].pagada==2 && plan.fechas[i].faltante>0))
			return plan.fechas[i].faltante;
		var fechaActual = new Date();
		var fechaCobro = new Date(plan.fechas[i].fecha);
		var diasRecargo = Math.floor((fechaActual-fechaCobro) / (1000 * 60 * 60 * 24)); 
		var diasDescuento = Math.floor((fechaCobro-fechaActual) / (1000 * 60 * 60 * 24)); 
		var concepto = plan.colegiatura[plan.fechas[i].tipoPlan];
		var importe = concepto.importeRegular;
		
		if(diasDescuento>concepto.diasDescuento){
			importe-=concepto.importeDescuento;
		}
		if(diasRecargo>concepto.diasRecargo){
			importe+=concepto.importeRecargo;
		}
		//console.log(importe);
		return importe
	}	

	this.tieneFoto = function(sexo, foto){
		if(foto === undefined){
			if(sexo === "masculino")
				return "img/badmenprofile.jpeg";
			else if(sexo === "femenino"){
				return "img/badgirlprofile.jpeg";
			}else{
				return "img/badprofile.jpeg";
			}
				
		}else{
			return foto;
		}
	}	
	
	

	this.seleccionarSemana = function(cobro,plan){
		//console.log(cobro);
		//var semSel = cobro.anio + cobro.numero;	
		rc.hayParaPagar = true;
		rc.totalPagar=0;
		for (var i = 0; i < cobro.numeroPago; i++) {
				if(plan.fechas[i].pagada!=1 && plan.fechas[i].pagada!=5 ){
					rc.hayParaPagar = false;
					if(plan.fechas[i].pagada==6 || plan.fechas[i].faltante>0){
						rc.totalPagar+=plan.fechas[i].faltante;
					}
					else{
						rc.totalPagar+= this.calcularImporteU(plan,i);
					}
					plan.fechas[i].pagada = 2;
					//plan.fechas[i].pago = this.calcularImporteU(plan,i)
				}
		};
		//console.log(rc.totalPagar);
		for (var i = cobro.numeroPago; i < plan.fechas.length; i++) {
			if(plan.fechas[i].pagada!=1 && plan.fechas[i].pagada!=5 && plan.fechas[i].faltante)
				plan.fechas[i].pagada=6;		
			if(plan.fechas[i].pagada!=1 && plan.fechas[i].pagada!=5 && plan.fechas[i].pagada!=6){
				plan.fechas[i].pagada=0;
			}
		}	
	}

	
	this.imprimir = function(semanaSeleccionada){
		var semanasImprimir = [];
		_.each(rc.misSemanas, function(semana){
			if(semana.pagada == 3){
				semanasImprimir.push(semana);
			}
		});
		//console.log(semanasImprimir);
		$state.go("anon.pagosImprimir",{semanas : semanasImprimir, id : $stateParams.id},{newTab : true});
		
	}

	
	this.obtenerEstatus = function(cobro,plan){	
		var i = cobro.numeroPago-1;
		var fechaActual = new Date();
		var fechaCobro = new Date(plan.fechas[i].fecha);
		var diasRecargo = Math.floor((fechaActual-fechaCobro) / (1000 * 60 * 60 * 24)); 
		var diasDescuento = Math.floor((fechaCobro-fechaActual) / (1000 * 60 * 60 * 24));
		var concepto = plan.colegiatura[plan.fechas[i].tipoPlan]; 
		if(cobro.pagada==1){
			return "bg-color-green txt-color-white";
	 }
	 else if(cobro.pagada==2){
	 		return "bg-color-blue txt-color-white";
	 }
	 else if(cobro.pagada==5){
	 		return "bg-color-blueDark txt-color-white";
	 }
	 else if(cobro.pagada==6){
	 		return "bg-color-greenLight txt-color-white";
	 }
	 else if(diasRecargo>concepto.diasRecargo){
				return "bg-color-orange txt-color-white";
		}
		return "";
	}
	this.pagarLiquidacion=function(plan,i,semanasPagadas){
		var cobro=plan.fechas[i];
		semanasPagadas.push({
									fechaPago 	: new Date(),
									alumno_id 	: $stateParams.id,
									campus_id 	:Meteor.user().profile.campus_id,
									numero 		: cobro.numeroPago,
									semana 		: cobro.semana,
									anio 		: cobro.anio,
									estatus 	: 1,
									concepto 	: 'Colegiatura #'+cobro.numeroPago+': Liquidacion',
									tipo 		: "Liquidacion",
									usuario_id 	: Meteor.userId(),
									importe 	: cobro.pago,
									cuenta_id : this.cuenta._id,
									weekday : this.diaActual,
									semanaPago: this.semanaPago
		});
	}
	this.pagarCobro = function(plan,i,semanasPagadas){
		var cobro=plan.fechas[i];
		var conceptos = plan.colegiatura[cobro.tipoPlan].conceptos;
		for(var j  in conceptos){
			var concepto = conceptos[j];
			if(concepto.estatus){
				semanasPagadas.push({
									fechaPago 	: new Date(),
									alumno_id 	: $stateParams.id,
									campus_id 	:Meteor.user().profile.campus_id,
									numero 		: cobro.numeroPago,
									semana 		: cobro.semana,
									anio 		: cobro.anio,
									estatus 	: 1,
									concepto 	: 'Colegiatura #'+cobro.numeroPago+': '+concepto.nombre,
									tipo 		: "Cobro",
									usuario_id 	: Meteor.userId(),
									importe 	: concepto.importe,
									cuenta_id : this.cuenta._id,
									weekday : this.diaActual,
									semanaPago: this.semanaPago
				});
			}
		}
		this.pagarRecargo(plan,i,semanasPagadas);
		this.pagarDescuento(plan,i,semanasPagadas);
	}
	this.pagarRecargo = function(plan,i,semanasPagadas){
		console.log(plan,i,plan.fechas[i]);
		var cobro=plan.fechas[i];
		var fechaActual = new Date();
		var fechaCobro = new Date(plan.fechas[i].fecha);
		var diasRecargo = Math.floor((fechaActual-fechaCobro) / (1000 * 60 * 60 * 24)); 
		var diasDescuento = Math.floor((fechaCobro-fechaActual) / (1000 * 60 * 60 * 24));
		var concepto = plan.colegiatura[plan.fechas[i].tipoPlan]; 
		if(diasRecargo>concepto.diasRecargo){	
			semanasPagadas.push({
										fechaPago 	: new Date(),
										alumno_id 	: $stateParams.id,
										campus_id 	:Meteor.user().profile.campus_id,
										numero 		: cobro.numeroPago,
										semana 		: cobro.semana,
										anio 		: cobro.anio,
										estatus 	: 1,
										concepto 	: 'Colegiatura #'+cobro.numeroPago+ ': Recargo',
										tipo 		: "Recargo",
										usuario_id 	: Meteor.userId(),
										importe 	: concepto.importeRecargo,
										cuenta_id : this.cuenta._id,
										weekday : this.diaActual,
										semanaPago: this.semanaPago
			});
		}
	}
	this.pagarDescuento = function(plan,i,semanasPagadas){
		var cobro=plan.fechas[i];
		var fechaActual = new Date();
		var fechaCobro = new Date(plan.fechas[i].fecha);
		var diasRecargo = Math.floor((fechaActual-fechaCobro) / (1000 * 60 * 60 * 24)); 
		var diasDescuento = Math.floor((fechaCobro-fechaActual) / (1000 * 60 * 60 * 24));
		var concepto = plan.colegiatura[plan.fechas[i].tipoPlan]; 
		if(diasDescuento>concepto.diasDescuento){	
			semanasPagadas.push({
										fechaPago 	: new Date(),
										alumno_id 	: $stateParams.id,
										campus_id 	:Meteor.user().profile.campus_id,
										numero 		: cobro.numeroPago,
										semana 		: cobro.semana,
										anio 		: cobro.anio,
										estatus 	: 1,
										concepto 	: 'Colegiatura #'+cobro.numeroPago+ ': Descuento',
										tipo 		: "Descuento",
										usuario_id 	: Meteor.userId(),
										importe 	: concepto.importeDescuento*-1,
										cuenta_id : this.cuenta._id,
										weekday : this.diaActual,
										semanaPago: this.semanaPago
			});
		}
	}
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
			console.log(semanasPagadas);
			for(var i in semanasPagadas){
				var semana = semanasPagadas[i];
				Pagos.insert(semana);
			}
			$state.go("anon.pagosImprimir",{semanas : semanasPagadas, id : $stateParams.id});  			
		}
	}
	this.condonarPago=function(plan,i,semanasCondonadas){
		var cobro=plan.fechas[i];
		semanasCondonadas.push({
									fechaPago 	: new Date(),
									alumno_id 	: $stateParams.id,
									campus_id 	:Meteor.user().profile.campus_id,
									numero 		: cobro.numeroPago,
									semana 		: cobro.semana,
									anio 		: cobro.anio,
									estatus 	: 1,
									concepto 	: 'Colegiatura #'+cobro.numeroPago+': Condonacion',
									tipo 		: "Condonacion",
									usuario_id 	: Meteor.userId(),
									condonado : cobro.condonado,
									importe 	: 0,
									cuenta_id : this.cuenta._id,
									weekday : this.diaActual,
									semanaPago: this.semanaPago
		});
	}
	this.condonar = function(){
		if (confirm("Está seguro de desea condonar el cobro por $" + parseFloat(rc.totalPagar))) {
			var semanasCondonadas = [];
			for (var i = 0; i < rc.inscripciones.length; i++) {
				var inscripcion=rc.inscripciones[i];
				for (var j=0;j<inscripcion.planPagos.fechas.length;j++) {
					var pago = inscripcion.planPagos.fechas[j];
					if(pago.pagada==2){
						if(pago.faltante){
							pago.condonado = pago.faltante;

						}
						else{
							pago.condonado = this.calcularImporteU(inscripcion.planPagos,j);
							pago.pago = 0;
						}
						pago.pagada = 5;
						
						pago.faltante = 0;
						this.condonarPago(inscripcion.planPagos,j,semanasCondonadas);
					}
				}
				var inscripcion_id = inscripcion._id
				delete inscripcion._id;
				Inscripciones.update({_id:inscripcion_id},{$set:inscripcion});
			}
			console.log(semanasCondonadas);
			for(var i in semanasCondonadas){
				var semana = semanasCondonadas[i];
				Pagos.insert(semana);
			}
			$state.go("anon.pagosImprimir",{semanas : semanasCondonadas, id : $stateParams.id}); 
		}
	}
	
	this.getOcupacion = function(ocupacion_id){
		var ocupacion = Ocupaciones.findOne(ocupacion_id);
		if(ocupacion)
			return ocupacion.nombre;
	}
	
}