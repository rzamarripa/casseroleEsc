angular.module("casserole")
.controller('NuevaInscripcionCtrl', NuevaInscripcionCtrl); 
function NuevaInscripcionCtrl($scope, $meteor, $reactive, $state, toastr) {
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
	window.rc = rc;

	this.inscripcion.fechaInscripcion = new Date();
	this.inscrito = "";
	this.cantidadAlumnos = 0;
	this.prospecto = {};
	this.grupoSeleccionado = {};
	this.turnoSeleccionado = "";
	
	this.planPagos = [];
	
	$(document).ready(function(){
	  $("select").select2({dropdownAutoWidth: 'true', width : "100%"});
	})

	this.subscribe('prospectosPorInscribir',()=>{
		return [{"profile.estatus" : 2, "profile.campus_id" : Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""}, {sort: {"profile.nombre":1}}]
	});
	
	this.subscribe('vendedores', () => {
		return [{roles : ["vendedor"], "profile.estatus":true, "profile.campus_id" : Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""}]
	});
	
	this.subscribe("secciones",() => {
		return [{estatus:true, campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""}]
	});

	this.subscribe('conceptosComision',() => {
		return [{seccion_id : this.getReactively('inscripcion.seccion_id') ? this.getReactively('inscripcion.seccion_id'):"a"}]
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
		cuentaActiva : () =>{
			return Cuentas.findOne({activo: true});
		},
		cuentaInscripcion: () =>{
			return Cuentas.findOne({inscripcion: true});
		},
		vendedores : () => {
			return Meteor.users.find({roles : ["vendedor"]}).fetch();
		},
		prospectos : () => {
			return Prospectos.find({},{sort : {"profile.nombre" : 1}});
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
		conceptosComision : () => {
			return ConceptosComision.find();
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

	
	
	
	this.planPagosSemana =function () {
		var fechaInicial = this.inscripcion.planPagos.colegiatura.fechaInicial;
		// Si este alumno está entrando con fecha posterior, se tomará como primer semana la actual y de ahí se incrmentará las semanas.
		if(rc.esNuevaInscripcion == false){
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
		
		rc.planPagos = [];
		for (var i = 0; i < totalPagos; i++) {
			
			var anio = mfecha.get('year');
			
			if(mfecha.isoWeek() == 52){
				ultimoPago = _.last(rc.planPagos);
				anio = moment(ultimoPago.fecha).get("year");
			}
			
			if(rc.planPagos.length > 0){
				var ultimoPago = _.last(rc.planPagos);
				if(mfecha.isoWeek() < ultimoPago.semana){					
					anio = moment(ultimoPago.fecha).get("year") + 1;
				}
			}
			
			
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
				anio				: anio
			}
			
			if(i == 0){
				pago.pagada = 1;
			}
			
			rc.planPagos.push(pago);
			mfecha = mfecha.day(8);
		}
		return rc.planPagos;
	}
	
	this.planPagosMensual=function() {
		mfecha = "";
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
		rc.planPagos = [];
		var dife = mfecha.diff(fechaInicial,'days');

		if(Math.abs(dife) >= 15)
			mfecha.add(1,'month');
		for (var i = 0; i < totalPagos; i++) {
			//console.log(mfecha.startOf("week").toDate(), mfecha.toDate(), mfecha.isoWeek(), mfecha.get('year'))
			var anio = mfecha.get('year');
			if(moment(mfecha).isoWeek() == 52){
				var ultimoPago = _.last(rc.planPagos);
				anio = moment(ultimoPago.fecha).get("year");
			}
			
			if(rc.planPagos.length > 0){
				var ultimoPago = _.last(rc.planPagos);
				
				if(mfecha.isoWeek() < ultimoPago.semana){
					anio = moment(ultimoPago.fecha).get("year") + 1;
				}
			}
				
			
			var pago = {
				semana 			    : mfecha.isoWeek(),
				fecha 			    : new Date(mfecha.toDate().getTime()),
				dia                 : mfecha.isoWeekday(),
				tipoPlan 		    		: 'Mensual',
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
				anio				: anio
			}
			
			if(i == 0){
				pago.pagada = 1;
			}
			
			rc.planPagos.push(pago);
			mfecha.add(1,'month');
			
		}
		return rc.planPagos;
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
	
	this.calcularInscripcion=function(){
		//Se suman los conceptos de inscripción
		var tipo = this.inscripcion.planPagos.colegiatura.tipoColegiatura;
		var _concepto = this.inscripcion.planPagos.colegiatura[this.inscripcion.planPagos.colegiatura.tipoColegiatura];
		var cobroObligatorio =  _concepto.importeRegular;
		var conIns = this.inscripcion.planPagos.inscripcion;
		this.inscripcion.totalPagar =  _concepto.importeRegular;
		this.comisiones = [];
		this.inscripcion.pagos={};
		this.inscripcion.abono=0;


		for(var connceptoId in this.inscripcion.planPagos.inscripcion.conceptos){
			var concepto = this.inscripcion.planPagos.inscripcion.conceptos[connceptoId];
			if(concepto.estatus){
				this.inscripcion.totalPagar += concepto.importe;
			}
		}
		
		//Calcula comision obligada
		this.comisionObligada = _concepto.importeRegular;
		
	}

	this.hayCupo = function(grupo_id){
		console.log(grupo_id);
		this.grupoSeleccionado = Grupos.findOne(grupo_id);
		console.log(this.grupoSeleccionado);
		this.turnoSeleccionado = this.grupoSeleccionado.turno_id;
		var planEstudios = PlanesEstudios.findOne(this.grupoSeleccionado.planEstudios_id);
		this.grupoSeleccionado.turno = Turnos.findOne(this.turnoSeleccionado);
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
		var res = confirm("Revise que la Carga Inicial esté activada en caso de inscribir alumnos ya existentes, o desactivada para inscribir un alumno a un grupo nuevo.?");
		if(res == true){
						
			console.log(inscripcion);
			Meteor.call('inscribirAlumno', inscripcion, function(error, result){
				if(error){
					console.log(error);
				}else{
					if(result){
						toastr.success('Alumno Inscrito');
						$state.go("root.alumnoDetalle",{alumno_id : result});
					}
				}
			});
			
			//Termina la creación del alumno
			
			//Generar los pagos realizados
			for (var i = 0; i < this.pagosRealizados.length; i++) {
				Pagos.insert(this.pagosRealizados[i]);
			}
	/*
			for (var i = 0; i < this.comisiones.length; i++) {
				Comisiones.insert(this.comisiones[i]);
			}

	
			$state.go("root.inscripciones");
*/
		}
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