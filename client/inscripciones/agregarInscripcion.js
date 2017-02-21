angular.module("casserole")
.controller('AgregarInscripcionCtrl', AgregarInscripcionCtrl); 
function AgregarInscripcionCtrl($scope, $meteor, $reactive, $state, toastr, $stateParams) {
	let rc = $reactive(this).attach($scope);
	this.inscripcion = {tipoInscripcion:""};
	this.inscripcion.totalPagar = 0.00;
	this.comisionObligada =0;
	this.pagosRealizados = [];
	this.diaActual = moment(new Date()).isoWeekday();
	this.semanaPago = moment(new Date()).isoWeek();
	this.mesPago = moment(new Date()).get('month') + 1;
	this.anioPago = moment(new Date()).get('year');
	this.esNuevaInscripcion = true;
	this.alumno = {};
	window.rc = rc;

	this.inscripcion.fechaInscripcion = new Date();
	this.inscrito = "";
	this.cantidadAlumnos = 0;
	this.prospecto = {};
	this.grupoSeleccionado = {};
	this.alumno_id = $stateParams.alumno_id;
	this.inscripcion.alumno_id = this.alumno_id;
	
	$(document).ready(function(){
	  $("select").select2({dropdownAutoWidth: 'true', width : "100%"});
	})
	
	this.subscribe("alumnos",() => {
		return [{_id : $stateParams.alumno_id}]
	});
	
	this.subscribe('vendedores', () => {
		return [{roles : ["vendedor"], "profile.estatus":true, "profile.campus_id" : Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""}]
	});
	
	this.subscribe("secciones",() => {
		return [{estatus:true, campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""}]
	});
	
	this.subscribe('ciclos',()=>{
		return [{estatus:true,
			seccion_id : this.getReactively('inscripcion.seccion_id') ? this.getReactively('inscripcion.seccion_id'):""
		}];
	});
	
	this.subscribe("tiposingresos",() => {
		return [{estatus:true, campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }]
	});
	
	this.subscribe("grupos", () => {
		return [{
		 estatus:true,
		 seccion_id :  this.getReactively('inscripcion.seccion_id') ? this.getReactively('inscripcion.seccion_id'):"",
		 ciclo_id : this.getReactively('inscripcion.ciclo_id') ? this.getReactively('inscripcion.ciclo_id'):"",
		}]
	});
	
	this.subscribe("planesEstudios",() => {
		return [{
			estatus:true,
			seccion_id :  this.getReactively('inscripcion.seccion_id') ? this.getReactively('inscripcion.seccion_id'):""
		}]
	});
	
	this.subscribe('cuentas', ()=>{
		return [{estatus:true, seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : ""}]
	});
	
	this.subscribe('turnos', ()=>{
		return [{estatus:true, campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""}]
	});
	
	this.subscribe('campus', ()=>{
		return [{estatus:true, _id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""}]
	});
	
	this.subscribe('etapasVenta', ()=>{
		return [{estatus:true}]
	});
	
	this.subscribe("ocupaciones", () => {
	  return [{estatus : true}];
  });
  
  this.subscribe("mediosPublicidad",()=>{
		return [{estatus:true }]
	});

	this.helpers({
		alumno : () => {
			var alumno = Meteor.users.findOne({roles : ["alumno"], _id : $stateParams.alumno_id});
			if(alumno){
				this.inscripcion.vendedor_id = alumno.profile.vendedor_id;
				return alumno;
			}
			
		},
		cuentaActiva : () =>{
			return Cuentas.findOne({activo: true});
		},
		cuentaInscripcion: () =>{
			return Cuentas.findOne({inscripcion: true});
		},
		vendedores : () => {
			return Meteor.users.find({roles : ["vendedor"]}).fetch();
		},
		grupos : () => {
			return Grupos.find();
		},
		secciones : () => {
			return Secciones.find();
		},
		tiposIngresos : () => {
			return TiposIngresos.find();
		},
		ciclos : () => {
			return Ciclos.find();
		},
		campus : () => {
			return Campus.findOne();
		},
		ocupaciones :  () => {
			return Ocupaciones.find({estatus : true});
		},
	  mediosPublicidad : () => {
			return MediosPublicidad.find();
	  }
	});

	this.llenarComision = function(_comision,importe){
		try{
			var vendedor = Meteor.users.findOne({_id:this.inscripcion.vendedor_id});
			this.comisiones.push({
				fechaPago 	: new Date(),
				alumno_id 	: this.inscripcion.alumno_id,
				grupo_id		: this.inscripcion.grupo_id,
				seccion_id  : Meteor.user().profile.seccion_id,
				campus_id 	: Meteor.user().profile.campus_id,
				vendedor_id	: vendedor._id,
				gerente_id	: vendedor.profile.gerenteVenta_id,
				estatus			: 1,
				beneficiario : _comision.beneficiario,
				importe 		: importe,
				modulo			: _comision.modulo,
				comision_id : _comision._id,
				cuenta_id 	: this.cuentaInscripcion._id,
				weekday 		: this.diaActual,
				semanaPago	: this.semanaPago
			});
		}
		catch(e){

		}
	};
	/*this.llenarPago=function(concepto,plan,tipoPlan){
		this.pagosRealizados.push({
						fechaPago 	: new Date(),
						alumno_id 	: this.inscripcion.alumno_id,
						grupo_id	: this.inscripcion.grupo_id,
						seccion_id  : Meteor.user().profile.seccion_id,
						campus_id 	: Meteor.user().profile.campus_id,
						numero 		: plan.no,
						semana 		: plan.numero,
						anio 		: plan.anio,
						estatus 	: 1,
						concepto 	: concepto.nombre,
						tipo 		: "Cobro",
						usuario_id 	: Meteor.userId(),
						importe 	: concepto.importe,
						cuenta_id : tipoPlan == 'inscripcion' ? this.cuentaInscripcion._id:this.cuentaActiva._id,
						weekday : this.diaActual,
						semanaPago: this.semanaPago
					});
	}*/
	
	this.planPagosSemana =function () {
		var fechaInicial = this.inscripcion.planPagos.colegiatura.fechaInicial;
		// Si este alumno está entrando con fecha posterior, se tomará como primer semana la actual y de ahí se incrmentará las semanas.
		console.log("es nueva inscripcion ", this.esNuevaInscripcion);
		if(rc.esNuevaInscripcion == false){
			console.log("fue nueva inscripción");
			var fechaActual = new Date();
			if(fechaInicial < fechaActual){
				console.log("es menor", fechaInicial, fechaActual);
				var fechaInicial = fechaActual;
			}
		}
		var dia = this.inscripcion.planPagos.colegiatura.Semanal.diaColegiatura;
		var totalPagos = this.inscripcion.planPagos.colegiatura.Semanal.totalPagos;
		var mfecha = moment(fechaInicial);
		mfecha = mfecha.day(dia);
		var inicio = mfecha.toDate();
		
		var plan = [];
		for (var i = 0; i < totalPagos; i++) {
			var pago = {
				semana 			    : mfecha.isoWeek(),
				fecha 			    : new Date(mfecha.toDate().getTime()),
				dia                 : mfecha.isoWeekday(),
				tipoPlan 		    : 'Semanal',
				numeroPago 	        : i + 1,				
				importeRecargo      : this.inscripcion.planPagos.colegiatura.Semanal.importeRecargo,
				importeDescuento    : this.inscripcion.planPagos.colegiatura.Semanal.importeDescuento,
				importeRegular      : this.inscripcion.planPagos.colegiatura.Semanal.importeRegular,
				diasRecargo         : this.inscripcion.planPagos.colegiatura.Semanal.diasRecargo,
				diasDescuento       : this.inscripcion.planPagos.colegiatura.Semanal.diasDescuento,
				importe             : this.inscripcion.planPagos.colegiatura.Semanal.importeRegular,
				fechaPago           : undefined,
				semanaPago          : undefined,
				diaPago             : undefined,
				pago                : 0,
				estatus             : 0,
				tiempoPago          : 0,
				modificada          : false,
				mes					: mfecha.get('month') + 1,
				anio				: mfecha.get('year')
			}
			
			if(i == 0){
				pago.pagada = 1;
			}
			
			plan.push(pago);
			mfecha = mfecha.day(8);
		}
		return plan;
	}
	
	this.planPagosMensual=function() {
		var fechaInicial = this.inscripcion.planPagos.colegiatura.fechaInicial;
		// Si este alumno está entrando con fecha posterior, se tomará como primer semana la actual y de ahí se incrmentará las semanas.
		if(this.esNuevaInscripcion == false){
			var res = confirm("Está inscribiendo un alumno de reciente ingreso?");
			if(res == true){
				var fechaActual = new Date();
				if(fechaInicial < fechaActual){
					var fechaInicial = fechaActual;
				}
			}		
		}
		var dia = this.inscripcion.planPagos.colegiatura.Mensual.diaColegiatura;
		var totalPagos = this.inscripcion.planPagos.colegiatura.Mensual.totalPagos;
		var mfecha = moment(fechaInicial);
		mfecha = mfecha.date(dia);
		var inicio = mfecha.toDate();
		var plan = [];
		var dife = mfecha.diff(fechaInicial,'days');
		if(Math.abs(dife) > 15)
			mfecha.add(1,'month');
		for (var i = 0; i < totalPagos; i++) {
			var pago = {
				semana 			    : mfecha.isoWeek(),
				fecha 			    : new Date(mfecha.toDate().getTime()),
				dia                 : mfecha.isoWeekday(),
				tipoPlan 		    : 'Mensual',
				numeroPago 	        : i + 1,
				importeRecargo      : this.inscripcion.planPagos.colegiatura.Mensual.importeRecargo,
				importeDescuento    : this.inscripcion.planPagos.colegiatura.Mensual.importeDescuento,
				importeRegular      : this.inscripcion.planPagos.colegiatura.Mensual.importeRegular,
				diasRecargo         : this.inscripcion.planPagos.colegiatura.Mensual.diasRecargo,
				diasDescuento       : this.inscripcion.planPagos.colegiatura.Mensual.diasDescuento,
				importe             : this.inscripcion.planPagos.colegiatura.Mensual.importeRegular,
				fechaPago           : undefined,
				semanaPago          : undefined,
				diaPago             : undefined,
				pago                : 0,
				estatus             : 0,
				tiempoPago          : 0,
				modificada          : false,
				mes					: mfecha.get('month') + 1,
				anio				: mfecha.get('year')
			}
			
			if(i == 0){
				pago.pagada = 1;
			}
			
			plan.push(pago);
			mfecha.add(1,'month');
		}
		return plan;
	}
	this.planPagosQuincenal = function() {
		var fechaInicial = this.inscripcion.planPagos.colegiatura.fechaInicial;
		// Si este alumno está entrando con fecha posterior, se tomará como primer semana la actual y de ahí se incrmentará las semanas.
		if(this.esNuevaInscripcion == false){
			var fechaActual = new Date();
			if(fechaInicial < fechaActual){
				var fechaInicial = fechaActual;
			}
		}	
		var dia = this.inscripcion.planPagos.colegiatura.Quincenal.diaColegiatura;
		var totalPagos = this.inscripcion.planPagos.colegiatura.Quincenal.totalPagos;
		var mfecha = moment(fechaInicial);
		var par = 0;
		mfecha = mfecha.date(dia[0]);
		var inicio = mfecha.toDate();
		var plan =[]
		var dife = mfecha.diff(fechaInicial,'days');
		if(Math.abs(dife) > 7){
			mfecha = mfecha.date(dia[1]);
			dife = mfecha.diff(fechaInicial,'days');
			if(Math.abs(dife) > 7)
				mfecha.add(1,'month');
			else
				par = 1;
		}
		for (var i = 0; i < totalPagos; i++) {
			var pago = {
				semana 			    		: mfecha.isoWeek(),
				fecha 			    		: new Date(mfecha.toDate().getTime()),
				dia                 : mfecha.isoWeekday(),
				tipoPlan 		    		: 'Quincenal',
				numeroPago 	        : i + 1,
				importeRecargo      : this.inscripcion.planPagos.colegiatura.Mensual.importeRecargo,
				importeDescuento    : this.inscripcion.planPagos.colegiatura.Mensual.importeDescuento,
				importeRegular      : this.inscripcion.planPagos.colegiatura.Mensual.importeRegular,
				diasRecargo         : this.inscripcion.planPagos.colegiatura.Mensual.diasRecargo,
				diasDescuento       : this.inscripcion.planPagos.colegiatura.Mensual.diasDescuento,
				importe             : this.inscripcion.planPagos.colegiatura.Mensual.importeRegular,
				fechaPago           : undefined,
				semanaPago          : undefined,
				diaPago             : undefined,
				pago                : 0,
				estatus             : 0,
				tiempoPago          : 0,
				modificada          : false,
				mes									: mfecha.get('month') + 1,
				anio								: mfecha.get('year')
			}
			
			if(i == 0){
				pago.e
			status = 1;
			}
			
			plan.push(pago);
			if(par == 1){
				par = 0;
				mfecha.add(1, 'month');
				mfecha.date(dia[par]);
			}else{
				par = 1;
				//mfecha.add(1,'month');
				mfecha.date(dia[par]);
			}
		}
		return plan;
	}
	/*this.llenarPago=function(concepto,plan,tipoPlan){
		this.pagosRealizados.push({
			fechaPago 	: new Date(),
			alumno_id 	: this.inscripcion.alumno_id,
			grupo_id	: this.inscripcion.grupo_id,
			seccion_id  : Meteor.user().profile.seccion_id,
			campus_id 	: Meteor.user().profile.campus_id,
			numero 		: plan.numeroPago,
			semana 		: plan.semana,
			anio 		: plan.anio,
			estatus 	: 1,
			concepto 	: concepto.nombre,
			tipo 		: "Cobro",
			usuario_id 	: Meteor.userId(),
			importe 	: concepto.importe,
			cuenta_id : tipoPlan == 'inscripcion' ? this.cuentaInscripcion._id:this.cuentaActiva._id,
			weekday : this.diaActual,
			semanaPago: this.semanaPago
		});
	}*/
	this.calcularInscripcion=function(){
		//Se suman los conceptos de inscripción
		var tipo = this.inscripcion.planPagos.colegiatura.tipoColegiatura;
		var _concepto = this.inscripcion.planPagos.colegiatura[this.inscripcion.planPagos.colegiatura.tipoColegiatura];
		var cobroObligatorio =  _concepto.importeRegular;
		var conIns = this.inscripcion.planPagos.inscripcion;
		this.inscripcion.totalPagar = 0;
		this.comisiones = [];
		this.inscripcion.pagos={};
		this.inscripcion.abono=0;

		for(var connceptoId in this.inscripcion.planPagos.inscripcion.conceptos){
			var concepto = this.inscripcion.planPagos.inscripcion.conceptos[connceptoId];
			if(concepto.estatus){
				this.inscripcion.totalPagar += concepto.importe;
				//this.inscripcion[connceptoId]=false;
				this.inscripcion.pagos[connceptoId]={
					_id:connceptoId,
					importeRegular:concepto.importe,
					importeDescuento:concepto.importe-conIns.importeDescuento,
					importeRecargo:concepto.importe+conIns.importeRecargo,
					importe:concepto.importe,
					estatus:0,
					nombre:concepto.nombre,
					pago:0,
					tiempoPago: 0,
					fecha: this.inscripcion.fechaInscripcion,
					fechaRegistro: new Date(),
					restante:0
				};
			}
			
		}
		//Se suman los conceptos de comisión
		this.comisionObligada = 0;
		for(var conceptoid in this.inscripcion.planPagos.conceptosComision){
			var concepto = this.inscripcion.planPagos.conceptosComision[conceptoid];
			if(concepto.estatus && concepto.prioridad == 'Alta'){
				//this.inscripcion.totalPagar += concepto.importe;
				this.comisionObligada += concepto.importe;
				//Se asigna la comisión al vendedor y gerente de venta
				this.llenarComision(concepto, concepto.importe);
			}
		}
		var resto = this.inscripcion.importePagado - this.comisionObligada;
		for(var i = 0; resto > 0, i < this.inscripcion.planPagos.conceptosComision.length; i++){
			var concepto = this.inscripcion.planPagos.conceptosComision[i];
			if(concepto.estatus && concepto.prioridad !='Alta'){
				if(concepto.importe > resto)
					this.llenarComision(concepto, resto);
				else
					this.llenarComision(concepto,concepto.importe);
				resto -= concepto.importe;
			}
		}

		

		
		
		//Se calcula 
		this.pagosRealizados=[];
		for (var i = 0; cobroObligatorio > 0 && i < this.inscripcion.planPagos.fechas.length; i++) {
			var pago = this.inscripcion.planPagos.fechas[i];
			var concepto = this.inscripcion.planPagos.colegiatura[this.inscripcion.planPagos.colegiatura.tipoColegiatura];
			this.inscripcion.totalPagar += concepto.importeRegular;
			//this.inscripcion.totalPaga
			//Esto está mal porque no debería de afectar la comisión al pago de la primer colegiatura
			if(concepto.importeRegular <= this.inscripcion.importePagado){
				pago.estatus = 1;
				pago.pago = concepto.importeRegular;
				/*for(var j in concepto.conceptos){
					this.llenarPago(concepto.conceptos[j], pago, 'colegiatura');
				}*/
				cobroObligatorio -=  pago.pago;

			}


			else{
				//pago.estatus = 6;
				this.inscripcion.abono += cobroObligatorio;
				//pago.faltante = concepto.importeRegular-cobroObligatorio;
				//this.llenarPago({nombre:'Abono Colegiatura',importe:cobroObligatorio},pago,'colegiatura');
				cobroObligatorio = 0;
			}
		};

		cobroObligatorio = _concepto.importeRegular
		
		if((this.inscripcion.importePagado - cobroObligatorio) >= this.inscripcion.planPagos.inscripcion.importeRegular)
		{
			this.inscripcion.planPagos.inscripcion.estatus = 1;
			//this.inscripcion.estatus=true;
			this.inscripcion.planPagos.inscripcion.pago = this.inscripcion.planPagos.inscripcion.importeRegular;
			var frg=moment(this.inscripcion.planPagos.colegiatura.fechaInicial);
			/*this.llenarPago({nombre : 'inscripcion',importe : this.inscripcion.planPagos.inscripcion.importeRegular},
				{numeroPago:1,semana : frg.isoWeek(),anio:frg.get("year")},'inscripcion');*/

			for(var connceptoId in this.inscripcion.planPagos.inscripcion.conceptos){
				var concepto = this.inscripcion.planPagos.inscripcion.conceptos[connceptoId];
				if(concepto.estatus){
					this.inscripcion[connceptoId]=true;
					this.inscripcion.pagos[connceptoId].pago=this.inscripcion.pagos[connceptoId].importeRegular;
					this.inscripcion.pagos[connceptoId].estatus=1;
					this.inscripcion.pagos[connceptoId].fechaPago = new Date();
					this.inscripcion.pagos[connceptoId].semanaPago = moment().isoWeek();
					this.inscripcion.pagos[connceptoId].anioPago = moment().get('year');
					this.inscripcion.pagos[connceptoId].mesPago = moment().get('month')+1;
					this.inscripcion.pagos[connceptoId].diaPago = moment().isoWeekday();
					this.inscripcion.pagos[connceptoId].tiempoPago = 0;
				}
			}
		}else{
			//this.inscripcion.planPagos.inscripcion.estatus=6;
			//this.inscripcion.abono+=(this.inscripcion.importePagado-cobroObligatorio);
			//this.inscripcion.planPagos.inscripcion.faltante=this.inscripcion.planPagos.inscripcion.importeRegular-
			//												this.inscripcion.planPagos.inscripcion.pago;
			var frg=moment(this.inscripcion.planPagos.colegiatura.fechaInicial);
			/*this.llenarPago({nombre:'Abono de inscripcion',importe:this.inscripcion.planPagos.inscripcion.pago},
				{numeroPago:1,semana:frg.isoWeek(),anio:frg.get("year")},'inscripcion');*/
			var _acumuladoConcepto=0;
			for(var connceptoId in this.inscripcion.planPagos.inscripcion.conceptos){
				var concepto = this.inscripcion.planPagos.inscripcion.conceptos[connceptoId];
				_acumuladoConcepto+= concepto.importe;
				if(concepto.estatus && _acumuladoConcepto<= this.inscripcion.importePagado-cobroObligatorio){
					this.inscripcion[connceptoId]=true;
					this.inscripcion.pagos[connceptoId].pago=this.inscripcion.pagos[connceptoId].importeRegular;
					this.inscripcion.pagos[connceptoId].estatus=1;
					this.inscripcion.pagos[connceptoId].fechaPago = new Date();
					this.inscripcion.pagos[connceptoId].semanaPago = moment().isoWeek();
					this.inscripcion.pagos[connceptoId].anioPago = moment().get('year');
					this.inscripcion.pagos[connceptoId].mesPago = moment().get('month')+1;
					this.inscripcion.pagos[connceptoId].diaPago = moment().isoWeekday();

					this.inscripcion.pagos[connceptoId].tiempoPago = 0;
				}
				else if(concepto.estatus && _acumuladoConcepto > this.inscripcion.importePagado-cobroObligatorio &&
					_acumuladoConcepto -concepto.importe < this.inscripcion.importePagado-cobroObligatorio) {
					this.inscripcion.abono+=(this.inscripcion.importePagado-cobroObligatorio)-(_acumuladoConcepto -concepto.importe );
					
				} 
			}
		}
	}

	this.hayCupo = function(grupo_id){
		this.grupoSeleccionado = Grupos.findOne(grupo_id);
		var planEstudios = PlanesEstudios.findOne(this.grupoSeleccionado.planEstudios_id);
		this.grupoSeleccionado.turno = Turnos.findOne(this.grupoSeleccionado.turno_id);
		this.inscripcion.planPagos = { inscripcion:this.grupoSeleccionado.inscripcion,colegiatura:this.grupoSeleccionado.colegiatura };
		this.inscripcion.planPagos.colegiatura.fechaInicial = this.grupoSeleccionado.fechaInicio;
		this.inscripcion.planPagos.colegiatura.Semanal.totalPagos = planEstudios.semanas;
		var _inscripcion = this.inscripcion.planPagos.inscripcion;
		_inscripcion.importeRegular =0;
		for(var sid in _inscripcion.conceptos){

			var _concepto = _inscripcion.conceptos[sid];
			if(_concepto.estatus){
				_inscripcion.importeRegular += _concepto.importe;
			}
		}

		var semanal = this.inscripcion.planPagos.colegiatura.Semanal;
		semanal.importeRegular =0;
		for(var sid in semanal.conceptos){
			var concepto = semanal.conceptos[sid];
			if(concepto.estatus)
				semanal.importeRegular += concepto.importe;
		}
		this.inscripcion.planPagos.colegiatura.Quincenal.totalPagos=planEstudios.quincenas;
		var quincenal = this.inscripcion.planPagos.colegiatura.Quincenal;
		quincenal.importeRegular =0;
		for(var sid in quincenal.conceptos){
			var concepto = quincenal.conceptos[sid];
			if(concepto.estatus)
				quincenal.importeRegular += concepto.importe;
		}
		this.inscripcion.planPagos.colegiatura.Mensual.totalPagos=planEstudios.meses;
		var mensual = this.inscripcion.planPagos.colegiatura.Mensual;
		mensual.importeRegular =0;
		for(var sid in mensual.conceptos){
			var concepto = mensual.conceptos[sid];
			if(concepto.estatus)
				mensual.importeRegular += concepto.importe;
		}
		this.inscripcion.planPagos.conceptosComision = this.grupoSeleccionado.conceptosComision;
		
		if(this.grupoSeleccionado.inscritos < this.grupoSeleccionado.cupo){
			this.cupo = "check";
		}else{
			this.cupo = "remove";
		}
	}
	this.cuantoPaga = function(importe){
		if(importe>this.inscripcion.totalPagar)
			this.inscripcion.cambio = parseFloat(importe) - parseFloat(this.inscripcion.totalPagar);
		else 
			this.inscripcion.cambio =0;
		this.calcularInscripcion();
	}

	this.cambioTipoColegiatura = function  (value) {
		this.inscripcion.importePagado = 0.00;
		
		if(value=='Semanal')
			this.inscripcion.planPagos.fechas = this.planPagosSemana()
		if(value=='Quincenal')
			this.inscripcion.planPagos.fechas = this.planPagosQuincenal()
		if(value=='Mensual')
			this.inscripcion.planPagos.fechas = this.planPagosMensual()
		
		this.calcularInscripcion();
	}
	
	this.guardar = function(inscripcion) {
		
		var grupo = Grupos.findOne(inscripcion.grupo_id);
		var campus = Campus.findOne(Meteor.user().profile.campus_id);
		
		inscripcion.planEstudios_id = grupo.planEstudios_id;
		inscripcion.campus_id = grupo.campus_id;
		inscripcion.seccion_id = grupo.seccion_id;
		inscripcion.estatus = 1;
		inscripcion.semana = moment(new Date()).isoWeek();
		var planEstudio = PlanesEstudios.findOne(inscripcion.planEstudios_id)
		
		Curriculas.insert({estatus : true, alumno_id : inscripcion.alumno_id, planEstudios_id : inscripcion.planEstudios_id, grados : planEstudio.grados });
		
		inscripcion._id=Inscripciones.insert(inscripcion);
		console.log(inscripcion._id)
		if(!grupo.alumnos)
			grupo.alumnos=[];
			
		//Se mete el objeto alumno al grupo
		grupo.alumnos.push({alumno_id : inscripcion.alumno_id, inscripcion_id : inscripcion._id});
		grupo.inscritos = parseInt(grupo.inscritos) + 1;
		delete grupo._id;
		Grupos.update({_id: inscripcion.grupo_id},{$set:grupo});
		
		inscripcion.pago_id = Pagos.insert({
			fechaPago 	: new Date(),
			alumno_id 	: rc.inscripcion.alumno_id,
			grupo_id		: rc.inscripcion.grupo_id,
			seccion_id  : grupo.seccion_id,
			campus_id 	: grupo.campus_id,
			estatus 		: 1,
			usuarioInserto_id 	: Meteor.userId(),
			importe 		: rc.inscripcion.importePagado-rc.inscripcion.cambio,
			cuenta_id   : rc.cuentaInscripcion._id,
			diaPago     : rc.diaActual,
			mesPago     : rc.mesPago,
			semanaPago  : rc.semanaPago,
			anioPago    : rc.anioPago,
			inscripcion_id : inscripcion._id,
			modulo 			: "inscripcion",
			descripcion : "inscripcion"
		});
		Meteor.call("generaPlanPagos", inscripcion,  (err, res) => {
			if(err){
				console.log(err);
			}else{
				//success
				toastr.success('Alumno Inscrito');
				$state.go("root.alumnoDetalle",{alumno_id : inscripcion.alumno_id});
			}
		});
	}
	
	this.cambiarConceptosInscripcion=function  (argument) {
		try{
			this.calcularInscripcion();
		}catch(e){

		}
	};
	
	this.getProspectoSeleccionado = function(prospecto_id){
		this.prospectoSeleccionado = Prospectos.findOne({_id : prospecto_id});
		this.prospecto = this.prospectoSeleccionado;
		this.inscripcion.vendedor_id = this.prospectoSeleccionado.profile.vendedor_id;
		this.prospectoSeleccionado.activo = true;
		$('.collapse').collapse('show');
		
	}
	
	this.actualizarProspecto = function(prospecto)
	{
		var idTemp = prospecto._id;
		delete prospecto._id;
		delete prospecto.activo;
		var etapaVenta = EtapasVenta.findOne({nombre : "Inscrito", campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" });		
/*
		if(etapaVenta._id == prospecto.profile.etapaVenta_id){
			prospecto.profile.estatus = 2;
		}else{
			prospecto.profile.estatus = 1;
		}
*/
		prospecto.profile.fechaUltimoContacto = new Date();
		Prospectos.update({_id:idTemp},{$set:prospecto});
		toastr.success('Prospecto Actualizado');
		$('.collapse').collapse('hide');
		this.nuevo = true;
	};
	
	this.cambioEsNuevaInscripcion = function(){
		if(this.inscripcion.planPagos.colegiatura.tipoColegiatura != undefined){
			rc.cambioTipoColegiatura(this.inscripcion.planPagos.colegiatura.tipoColegiatura);
		}
	}
	
};