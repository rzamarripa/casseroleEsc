angular
	.module('casserole')
	.controller('AlumnosDetalleCtrl', AlumnosDetalleCtrl);
 
function AlumnosDetalleCtrl($scope, $meteor, $reactive, $state, toastr, $stateParams) {
	
	rc = $reactive(this).attach($scope);
	
	window.rc = rc;
		
	this.masInfo = true;
	this.totalPagar = 0.00;
	this.alumno = {};
	this.fechaActual = new Date();
	this.diaActual = moment(new Date()).weekday();
	this.semanaPago = moment(new Date()).isoWeek();
	this.hayParaPagar = true;
	this.tipoPlanes=["Semanal","Quincenal","Mensual"];
	this.planEstudios_id = [];
	this.ocupacion_id = "";
	this.semanasSeleccionadas = [];
	
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

		return [{activo:true, seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : ""}]
	});

	this.subscribe("grupos",() => {

		return [{campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }];
	});
	
	this.subscribe('pagosAlumno', () => {

		return [{
			alumno_id : $stateParams.alumno_id
		}];
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
			 var raw = PlanPagos.find().fetch();
			 var planes = [];
			 for(var id in raw){
			 	pago = raw[id];
			 	if(!planes[pago.inscripcion_id])
			 		planes[pago.inscripcion_id]=[];
			 	planes[pago.inscripcion_id].push(pago);

			 }
			 return planes;
		},
		inscripciones : () =>{
			var inscripciones = Inscripciones.find({
				alumno_id : $stateParams.alumno_id,
				campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""
			}).fetch();
			
			if(inscripciones.length > 0){
				_.each(inscripciones, function(inscripcion){
					inscripcion.grupo = Grupos.findOne(inscripcion.grupo_id);
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
		}
	});

	this.grupo = function (grupoId){
		var _grupo = Grupos.findOne(grupoId);
		return _grupo;
	}
	
	this.actualizar = function(alumno,form){
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
	}
	
	this.estaInscrito = function(alumno_id){
		inscrito = Inscripciones.findOne({alumno_id: alumno_id});
		if(inscrito != undefined)
			return true
		else
			return false
	}

	this.calcularImporteU= function(pago, configuracion){
		if(pago.pagada == 1)
			return pago.pago;
		if(pago.pagada == 6 || (pago.pagada == 2 && pago.faltante > 0))
			return pago.faltante;
		
		var fechaActual = moment();
		var fechaCobro = moment(pago.fecha);
		var diasRecargo = fechaActual.diff(fechaCobro, 'days')
		var diasDescuento = fechaCobro.diff(fechaActual, 'days')
		var concepto 			= configuracion.colegiatura[pago.tipoPlan];
		var importe 			= concepto.importeRegular + (pago.remanente ? pago.remanente : 0);
		if(diasDescuento >= concepto.diasDescuento){
			importe -= concepto.importeDescuento;
		}
		if(diasRecargo >= concepto.diasRecargo){
			importe += concepto.importeRecargo;
		}
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

	this.seleccionarSemana = function(cobro, plan, configuracion){
		rc.hayParaPagar = true;
		rc.totalPagar = 0;
		rc.semanasSeleccionadas = [];
		for (var i = 0; i < cobro.numeroPago; i++) {
				if(plan[i].pagada != 1 && plan[i].pagada != 5 ){
					rc.hayParaPagar = false;
					if(plan[i].pagada == 6 || plan[i].faltante > 0){
						rc.totalPagar += plan[i].faltante;
					}
					else{
						rc.totalPagar += this.calcularImporteU(plan[i], configuracion);
					}
					rc.semanasSeleccionadas.push(plan[i]);
					plan[i].pagada = 2;
					//plan[i].pago = this.calcularImporteU(plan,i)
				}
		};
		for (var i = cobro.numeroPago; i < plan.length; i++) {
			if(plan[i].pagada != 1 && plan[i].pagada != 5 && plan[i].faltante)
				plan[i].pagada = 6;		
			if(plan[i].pagada != 1 && plan[i].pagada != 5 && plan[i].pagada != 6){
				plan[i].pagada = 0;
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
		var url = $state.href("anon.pagosImprimir",{semanas : semanasImprimir, id : $stateParams.alumno_id},{newTab : true});
		window.open(url,'_blank');
		
	}

	this.obtenerEstatus = function(cobro, plan, configuracion){
		var i = cobro.numeroPago - 1;
		var fechaActual = new Date();
		var fechaCobro = new Date(plan[i].fecha);
		var diasRecargo = Math.floor((fechaActual - fechaCobro) / (1000 * 60 * 60 * 24));
		var diasDescuento = Math.floor((fechaCobro - fechaActual) / (1000 * 60 * 60 * 24));
		//console.log(configuracion, plan[i],diasRecargo)
		var concepto = configuracion.colegiatura[plan[i].tipoPlan];
		
		if(cobro.pagada == 1){
			return "bg-color-green txt-color-white";
	 	}
	 	else if(cobro.pagada == 2){
		 	return "bg-color-blue txt-color-white";
	 	}
	 	else if(cobro.pagada == 5){
	 		return "bg-color-blueDark txt-color-white";
	 	}
	 	else if(cobro.pagada == 6){
	 		return "bg-color-greenLight txt-color-white";
	 	}
	 	else if(diasRecargo >= concepto.diasRecargo){
	 		return "bg-color-orange txt-color-white";
		}
		return "";
	}
	
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
	}
	this.pagar = function(planPago, configuracion){
		if (confirm("Está seguro de realizar el cobro por $" + parseFloat(rc.totalPagar))) {
			var semanasPagadas = [];
			_.each(planPago, function(pago){
					if(pago.pagada == 2 && pago.faltante > 0){
						rc.pagarLiquidacion(pago, semanasPagadas);
						pago.pago = pago.pago ? pago.pago : 0 + pago.faltante;
						pago.pagada = 1;
						pago.faltante = 0;
						pago.fechaPago = new Date();
						pago.semanaPago = moment().isoWeek();
					}
					else if(pago.pagada == 2){
						rc.pagarCobro(pago, semanasPagadas, configuracion);
						pago.pago = rc.calcularImporteU(pago, configuracion);
						pago.pagada = 1;
						pago.fechaPago = new Date();
						pago.semanaPago = moment().isoWeek();
					}
					var idTemp = pago._id;
					delete pago._id
					PlanPagos.update({_id : idTemp}, {$set : pago});
				});
			for(var i in semanasPagadas){
				var semana = semanasPagadas[i];
				Pagos.insert(semana);
			}
			//$state.go("anon.pagosImprimir",{semanas : semanasPagadas, id : $stateParams.alumno_id});
			var url = $state.href("anon.pagosImprimir",{semanas :JSON.stringify(semanasPagadas), id : $stateParams.alumno_id},{newTab : true});
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
			//console.log(semanasPagadas);
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
	
	this.condonarPago=function(cobro,semanasCondonadas){
		semanasCondonadas.push({
										fechaPago 	: new Date(),
										alumno_id 	: $stateParams.alumno_id,
										campus_id 	:Meteor.user().profile.campus_id,
										numero 		: cobro.numeroPago,
										semana 		: cobro.semana,
										anio 		: cobro.anio,
										estatus 	: 1,
										concepto 	: 'Colegiatura #' + cobro.numeroPago + ': Condonación',
										tipo 		: "Condonación",
										usuario_id 	: Meteor.userId(),
										condonado : cobro.condonado,
										importe 	: 0,
										cuenta_id : this.cuenta._id,
										weekday : this.diaActual,
										semanaPago: this.semanaPago
		});
	}
	this.condonar = function(planPagos, configuracion){
		if (confirm("Está seguro que desea condonar el cobro por $" + parseFloat(rc.totalPagar))) {
			var semanasCondonadas = [];
			_.each(planPagos, function(pago) {
				if(pago.pagada == 2){
					if(pago.faltante){
						pago.condonado = pago.faltante;
					}
					else{
						pago.condonado = rc.calcularImporteU(pago, configuracion);
						pago.pago = 0;
					}
					pago.pagada = 5;					
					pago.faltante = 0;
					rc.condonarPago(pago,semanasCondonadas);
					
					var idTemp = pago._id;
					delete pago._id;
					PlanPagos.update(idTemp, {$set : pago});
				}
			});
			
			for(var i in semanasCondonadas){
				var semana = semanasCondonadas[i];
				Pagos.insert(semana);
			}
			$state.go("anon.pagosImprimir",{semanas : semanasCondonadas, id : $stateParams.alumno_id}); 
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
				alumno_id : inscripcion.alumno_id,
				inscripcion_id : inscripcion._id,
				vendedor_id : inscripcion.vendedor_id,
				seccion_id : inscripcion.seccion_id,
				campus_id : inscripcion.campus_id,
				fechaInscripcion : inscripcion.fechaInscripcion,
				semana:mfecha.isoWeek(),
				fecha:angular.copy(mfecha.toDate()),
				tipoPlan:'Semanal',
				numeroPago:i+1,
				mes:mfecha.get('month')+1,
				anio:mfecha.get('year'),
				estatus : false,
				pagada : 0
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
				alumno_id : inscripcion.alumno_id,
				inscripcion_id : inscripcion._id,
				vendedor_id : inscripcion.vendedor_id,
				seccion_id : inscripcion.seccion_id,
				campus_id : inscripcion.campus_id,
				fechaInscripcion : inscripcion.fechaInscripcion,
				semana:mfecha.isoWeek(),
				fecha:angular.copy(mfecha.toDate()),
				tipoPlan:'Quincenal',
				numeroPago:i+1,
				mes:mfecha.get('month')+1,
				anio:mfecha.get('year'),
				estatus : false,
				pagada : 0
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
				alumno_id : inscripcion.alumno_id,
				inscripcion_id : inscripcion._id,
				vendedor_id : inscripcion.vendedor_id,
				seccion_id : inscripcion.seccion_id,
				campus_id : inscripcion.campus_id,
				fechaInscripcion : inscripcion.fechaInscripcion,
				semana:mfecha.isoWeek(),
				fecha:angular.copy(mfecha.toDate()),
				tipoPlan:'Mensual',
				numeroPago:i+1,
				mes:mfecha.get('month')+1,
				anio:mfecha.get('year'),
				estatus : false,
				pagada : 0
			});
			
			mfecha.add(1,'month');
		}
		return plan;
	}

	this.cambioTipoColegiatura=function(selected, oldValue, curso){
		if (confirm("Está seguro que desea cambiar el Plan de Pagos")) {
			var fechas = rc.planPagos[curso._id];
			//console.log(fechas)
			
			var fechaActual = new Date()
			var fechaUltima = {fecha:new Date()}
			
			switch(selected){
				case 'Mensual':
				case 'Quincenal':
				case 'Semanal':
			}


			while(fechas.length > 0 && fechas[fechas.length -1].fecha > fechaActual && (!fechas[fechas.length -1].pagada || fechas[fechas.length -1].pagada == 0)){
				
				fechaUltima = fechas.pop();
				//console.log(fechaUltima._id)
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
	}
	
}