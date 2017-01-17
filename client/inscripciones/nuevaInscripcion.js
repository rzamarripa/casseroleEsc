angular.module("casserole")
.controller('NuevaInscripcionCtrl', NuevaInscripcionCtrl); 
function NuevaInscripcionCtrl($scope, $meteor, $reactive, $state, toastr) {
	let rc = $reactive(this).attach($scope);
	window.rc = rc;
	this.inscripcion = {tipoInscripcion:""};
	this.inscripcion.totalPagar = 0.00;
	this.comisionObligada =0;
	this.pagosRealizados = [];
	this.diaActual = moment(new Date()).weekday();
	this.semanaPago = moment(new Date()).isoWeek();
	this.mesPago = moment(new Date()).get('month') + 1;
	this.anioPago = moment(new Date()).get('year');

	this.inscripcion.fechaInscripcion = new Date();
	this.inscrito = "";
	this.cantidadAlumnos = 0;
	this.prospecto = {};

	this.subscribe('prospectosPorInscribir',()=>{

		return [{"profile.estatus" : 2, "profile.campus_id" : Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""}, {sort: {"profile.nombre":1}}]

	});
	
	this.subscribe('vendedores');
	
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
			var usuarios = Meteor.users.find().fetch();
			var vendedores = [];
			_.each(usuarios, function(usuario){
				if(usuario.roles[0] == "vendedor"&& usuario.profile.campus_id == Meteor.user().profile.campus_id ){
					vendedores.push(usuario);
				}
			});
			return vendedores;
		},
		prospectos : () => {
			return Prospectos.find();
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
		var fechaInicial=this.inscripcion.planPagos.colegiatura.fechaInicial;
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
				dia                 : mfecha.weekday(),
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
		var fechaInicial=this.inscripcion.planPagos.colegiatura.fechaInicial;
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
				dia                 : mfecha.weekday(),
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
				semana 			    : mfecha.isoWeek(),
				fecha 			    : new Date(mfecha.toDate().getTime()),
				dia                 : mfecha.weekday(),
				tipoPlan 		    : 'Quincenal',
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
		for(var connceptoId in this.inscripcion.planPagos.inscripcion.conceptos){
			var concepto = this.inscripcion.planPagos.inscripcion.conceptos[connceptoId];
			if(concepto.estatus){
				this.inscripcion.totalPagar += concepto.importe;
				this.inscripcion[connceptoId]=false;
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
				pago.estatus = 6;
				pago.pago = cobroObligatorio;
				pago.faltante = concepto.importeRegular-cobroObligatorio;
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
				}
			}
		}else{
			this.inscripcion.planPagos.inscripcion.estatus=6;
			this.inscripcion.planPagos.inscripcion.pago=(this.inscripcion.importePagado-cobroObligatorio);
			this.inscripcion.planPagos.inscripcion.faltante=this.inscripcion.planPagos.inscripcion.importeRegular-
															this.inscripcion.planPagos.inscripcion.pago;
			var frg=moment(this.inscripcion.planPagos.colegiatura.fechaInicial);
			/*this.llenarPago({nombre:'Abono de inscripcion',importe:this.inscripcion.planPagos.inscripcion.pago},
				{numeroPago:1,semana:frg.isoWeek(),anio:frg.get("year")},'inscripcion');*/
			var _acumuladoConcepto=0;
			for(var connceptoId in this.inscripcion.planPagos.inscripcion.conceptos){
				var concepto = this.inscripcion.planPagos.inscripcion.conceptos[connceptoId];
				_acumuladoConcepto+= concepto.importe;
				if(concepto.estatus && _acumuladoConcepto<= this.inscripcion.importePagado-cobroObligatorio){
					this.inscripcion[connceptoId]=true;
				}
			}
		}
	}

	this.hayCupo = function(grupo_id){
		var grupo = Grupos.findOne(grupo_id);
		var planEstudios = PlanesEstudios.findOne(grupo.planEstudios_id);

		this.inscripcion.planPagos = { inscripcion:grupo.inscripcion,colegiatura:grupo.colegiatura };
		this.inscripcion.planPagos.colegiatura.fechaInicial = grupo.fechaInicio;
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
		this.inscripcion.planPagos.conceptosComision = grupo.conceptosComision;
		
		if(grupo.inscritos < grupo.cupo){
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
		inscripcion.planEstudios_id=grupo.planEstudios_id;
		inscripcion.campus_id = Meteor.user().profile.campus_id;
		inscripcion.seccion_id = Meteor.user().profile.seccion_id;
		inscripcion.estatus = 1;
		inscripcion.semana = moment(new Date()).isoWeek();
		inscripcion.abono = 0.00;
		
		//Crear alumno a partir del prospecto
		
		var prospecto = Prospectos.findOne({_id : inscripcion.prospecto_id});
		delete prospecto._id;
		delete prospecto.estatus;
		var alumno = prospecto;
		var nombre = alumno.profile.nombre != undefined ? alumno.profile.nombre + " " : "";
		var apPaterno = alumno.profile.apPaterno != undefined ? alumno.profile.apPaterno + " " : "";
		var apMaterno = alumno.profile.apMaterno != undefined ? alumno.profile.apMaterno : "";
		alumno.profile.nombreCompleto = nombre + apPaterno + apMaterno;
		alumno.profile.fechaCreacion = new Date();
		alumno.profile.campus_id = inscripcion.campus_id;
		alumno.profile.seccion_id = inscripcion.seccion_id;
		alumno.profile.usuarioInserto = Meteor.userId();
		alumno.profile.estatus = true;
		Meteor.call('cantidadAlumnos', inscripcion.campus_id, function(error, result){
			if(error){
				alert('Error');
			}else{
				rc.cantidadAlumnos = result;
				var matriculaAnterior = 0;
			  anio = '' + new Date().getFullYear();
			  anio = anio.substring(2,4);
			  //Si existen Alumnos generamos la matrícula siguiente
				if(rc.cantidadAlumnos > 0){
			  	var matriculaOriginal = anio + rc.campus.clave + "0000";
			  	var matriculaOriginalN = parseInt(matriculaOriginal);
			  	var matriculaNueva = matriculaOriginalN+rc.cantidadAlumnos+1;
			  	matriculaNueva = 'e'+matriculaNueva
					alumno.username = matriculaNueva;
				  alumno.profile.matricula = matriculaNueva;
				  alumno.password = "123qwe";
				  
			  }else{
				  //Se no existen Alumnos generamos la primer matrícula
				  alumno.username = "e" + anio + campus.clave + "0001";
				  alumno.profile.matricula = "e" + anio + campus.clave + "0001";
				  alumno.password = "123qwe";
			  }

			  //Se crea el usuario del alumnos

			  Meteor.call('createGerenteVenta', alumno, 'alumno', function(error, result){
				  if(error){
					  console.log(error);
				  }else{
					  inscripcion.alumno_id = result;
					  Prospectos.update(inscripcion.prospecto_id, { $set : { "profile.estatus" : 3 }})
						var planEstudio = PlanesEstudios.findOne(inscripcion.planEstudios_id)
						Curriculas.insert({estatus : true, alumno_id : inscripcion.alumno_id, planEstudios_id : inscripcion.planEstudios_id, grados : planEstudio.grados });
						inscripcion._id=Inscripciones.insert(inscripcion);
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
							grupo_id	: rc.inscripcion.grupo_id,
							seccion_id  : Meteor.user().profile.seccion_id,
							campus_id 	: Meteor.user().profile.campus_id,
							estatus 	: 1,
							usuario_id 	: Meteor.userId(),
							importe 	: rc.inscripcion.importePagado-rc.inscripcion.cambio,
							cuenta_id   : rc.cuentaInscripcion._id,
							diaPago     : rc.diaActual,
							mesPago     : rc.mesPago,
							semanaPago  : rc.semanaPago,
							anioPago    : rc.anioPago,
							inscripcion_id : inscripcion._id
						});
						Meteor.call("generaPlanPagos", inscripcion,  (err, res) => {
							if(err){
								console.log(alert);
								alert(err);
							}else{
								//success
								toastr.success('Alumno Inscrito');
								//Generar los pagos realizados
								/*for (var i = 0; i < rc.pagosRealizados.length; i++) {
									Pagos.insert(rc.pagosRealizados[i]);
								}*/
								for (var i = 0; i < rc.comisiones.length; i++) {
									rc.comisiones[i].alumno_id = inscripcion.alumno_id;
									Comisiones.insert(rc.comisiones[i]);
								}
						
								$state.go("root.alumnoDetalle",{alumno_id : inscripcion.alumno_id});
							}
						});
						
						//return result;
				  }
			  });
			}
		});
		
		//Termina la creación del alumno
		
		//Generar los pagos realizados
		for (var i = 0; i < this.pagosRealizados.length; i++) {
			Pagos.insert(this.pagosRealizados[i]);
		}
		for (var i = 0; i < this.comisiones.length; i++) {
			Comisiones.insert(this.comisiones[i]);
		}

		$state.go("root.inscripciones");
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
};