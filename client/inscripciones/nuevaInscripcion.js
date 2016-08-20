angular.module("casserole")
.controller('NuevaInscripcionCtrl', NuevaInscripcionCtrl); 
function NuevaInscripcionCtrl($scope, $meteor, $reactive, $state, toastr) {
	let rc = $reactive(this).attach($scope);

	this.inscripcion = {tipoInscripcion:""};
	this.inscripcion.totalPagar = 0.00;
	this.diaActual = moment(new Date()).weekday();
	this.semanaPago = moment(new Date()).isoWeek();
	this.subscribe('vendedores');
	this.subscribe('ciclos',()=>{
		return [{estatus:true,
		seccion_id : this.getReactively('inscripcion.seccion_id')? this.getReactively('inscripcion.seccion_id'):""
	}]
	});
	this.subscribe('cuentas', ()=>{
		return [{estatus:true, seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : ""}]
	});
	this.subscribe('generaciones',()=>{
		return [{estatus:true, seccion_id : this.getReactively('inscripcion.seccion_id')? this.getReactively('inscripcion.seccion_id'):"" }]
	 });
	this.subscribe("secciones",() => {
		return [{estatus:true, campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""}]
	});
	//this.subscribe("conceptosPago");
	this.subscribe("tiposingresos",() => {
		return [{estatus:true, campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }]
	});
	this.subscribe('alumnos',()=>{
		return [{estatus:true, campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""}]
	});
	this.subscribe("grupos", () => {
		return [{
		 estatus:true,
		 seccion_id :  this.getReactively('inscripcion.seccion_id')? this.getReactively('inscripcion.seccion_id'):"",
		 ciclo_id : this.getReactively('inscripcion.ciclo_id')? this.getReactively('inscripcion.ciclo_id'):"",
		}]
	});
	this.subscribe("planesEstudios",() => {
		return [{
			estatus:true,
			seccion_id :  this.getReactively('inscripcion.seccion_id')? this.getReactively('inscripcion.seccion_id'):""
		
		}]
	});
	this.subscribe('inscripciones',()=>{
		return [{estatus:true, campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""}]
	});

	var quitarhk=function(obj){
		if(Array.isArray(obj)){
			for (var i = 0; i < obj.length; i++) {
				obj[i] =quitarhk(obj[i]);
			}
		}
		else if(obj !== null && typeof obj === 'object')
		{
			delete obj.$$hashKey;
			for (var name in obj) {
	  			obj[name] = quitarhk(obj[name]);
			}

		}
		return obj;
	}




	this.helpers({
		ciclos : () => {
			return Ciclos.find();
		},
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
	  	generaciones : () => {
		  return Generaciones.find();
	  },
	  secciones : () => {
		  return Secciones.find();
	  },
	  tiposIngresos : () => {
		  return TiposIngresos.find();
	  },
	  alumnos : () => {
		  return Alumnos.find();
	  },
	  grupos : () => {
		  return Grupos.find();
	  },
	  planesEstudios : () => {
		  return PlanesEstudios.find();
	  },
	  inscripciones : () => {
		  return Inscripciones.find();
	  }/*,
	  conceptosPago : () => {
		  return ConceptosPago.find();
	  }*/
  });


	
	//this.inscripcion.fechaInscripcion = new Date();
	//this.inscripcion.conceptosSeleccionados = [];
	this.alumnoSeleccionado = {};
	this.cupo = false;
	this.inscripcion.abono = 0.00;
	this.periodoVisible = function(periodo){
	  	for (var i = 0; periodo && periodo.datos && i < periodo.datos.length; i++) {
	  		if(periodo.datos[i] && periodo.datos[i].activa )
	  			return true;
	  	}
	  	return false;

	}
	
	this.pagosRealizados =[];
	this.comisiones = []

	this.llenarPago=function(concepto,plan,tipoPlan){
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
		var procedimientos= concepto.procedimientos;
		var fechaActual = this.inscripcion.fechaInscripcion;
		var fechaCobro = new Date(plan.fecha);

		var diasRecargo = Math.floor((fechaActual-fechaCobro) / (1000 * 60 * 60 * 24)); 
		var diasDescuento = Math.floor((fechaCobro-fechaActual) / (1000 * 60 * 60 * 24));
		for (var procid in procedimientos) {
			var procedimiento = procedimientos[procid];
			if(procedimiento.tipoProcedimiento == 'Recargo' && tipoPlan=='inscripcion' && diasRecargo >=procedimiento.dias){
					this.pagosRealizados.push({
								fechaPago 	: new Date(),
								alumno_id 	: this.inscripcion.alumno_id,
								grupo_id	: this.inscripcion.grupo_id,
								seccion_id  : this.inscripcion.seccion_id,
								campus_id 	: Meteor.user().profile.campus_id,
								numero 		: plan.no,
								semana 		: plan.numero,
								anio 		: plan.anio,
								estatus 	: 1,
								concepto 	: concepto.nombre+" - "+procedimiento.nombre,
								tipo 		: "Recargo",
								usuario_id 	: Meteor.userId(),
								importe 	: procedimiento.monto,
								cuenta_id : tipoPlan == 'inscripcion' ? this.cuentaInscripcion._id:this.cuentaActiva._id,
								weekday : this.diaActual,
								semanaPago: this.semanaPago
							});
			}
			if(procedimiento.tipoProcedimiento == 'Descuento' && tipoPlan=='inscripcion' && diasDescuento >=procedimiento.dias){
				this.pagosRealizados.push({
								fechaPago 	: new Date(),
								alumno_id 	: this.inscripcion.alumno_id,
								grupo_id	: this.inscripcion.grupo_id,
								seccion_id  : this.inscripcion.seccion_id,
								campus_id 	: Meteor.user().profile.campus_id,
								numero 		: plan.no,
								semana 		: plan.numero,
								anio 		: plan.anio,
								estatus 	: 1,
								concepto 	: concepto.nombre+" - "+procedimiento.nombre,
								tipo 		: "Descuento",
								usuario_id 	: Meteor.userId(),
								importe 	: procedimiento.monto * -1,
								cuenta_id : tipoPlan == 'inscripcion' ? this.cuentaInscripcion._id:this.cuentaActiva._id,
								weekday : this.diaActual,
								semanaPago: this.semanaPago
							});
			}	
		}
	}
	this.llenarComision = function(_comision,importe){
		var vendedor = Meteor.users.findOne({_id:this.inscripcion.vendedor_id});
		console.log(_comision)
		this.comisiones.push({
			fechaPago 	: new Date(),
			alumno_id 	: this.inscripcion.alumno_id,
			grupo_id	: this.inscripcion.grupo_id,
			seccion_id  : Meteor.user().profile.seccion_id,
			campus_id 	: Meteor.user().profile.campus_id,
			vendedor_id	: vendedor._id,
			gerente_id	: vendedor.profile.gerenteVenta_id,
			status		: 1,
			beneficiario : _comision.beneficiario,
			importe 	: importe,
			modulo		: _comision.modulo,
			comision_id : _comision._id,
			cuenta_id : this.cuentaInscripcion._id,
			weekday : this.diaActual,
			semanaPago: this.semanaPago
		});
	}
	
	this.guardar = function(inscripcion)
	{   
		this.inscripcion.estatus = true;
		/*_.each(inscripcion.conceptosSeleccionados, function(concepto){
			delete concepto.$$hashKey;
		})*/
		console.log("hola")
		quitarhk(inscripcion);
		console.log(inscripcion);
		this.pagosRealizados = [];
		this.comisiones =[]

		var grupo = Grupos.findOne(inscripcion.grupo_id);

		//inscripcion.plan = grupo.plan;
		var comisionColegiaturaObligatoria =0;
		if(grupo.comisiones){
			
  			for(var ind in grupo.comisiones){
  				var comision = grupo.comisiones[ind];
  				console.log(comision);
				if(comision && comision.activa && comision.prioridad=='Alta' && comision.modulo=='colegiatura'){
	  				comisionColegiaturaObligatoria+=comision.importe;
	  				console.log(comisionColegiaturaObligatoria)
	  				this.llenarComision(comision,comision.importe);
				}
	  		}
	  		
	  		var rPagoInscripcion= parseFloat(inscripcion.importePagado)-comisionColegiaturaObligatoria;
	  		for(var ind in grupo.comisiones){
  				var comision = grupo.comisiones[ind];
				if(comision && comision.activa && comision.prioridad=='Alta' && comision.modulo=='inscripcion'){
	  				var rfPago =0;
	  				if(rPagoInscripcion>=comision.importe){
	  					rfPago=comision.importe;
	  					rPagoInscripcion-=comision.importe;
	  				}else{
	  					rfPago= rPagoInscripcion;
	  					rPagoInscripcion=0;
	  				}
	  				this.llenarComision(comision,rfPago);
				}
	  		}
	  		for(var ind in grupo.comisiones){
  				var comision = grupo.comisiones[ind];
				if(comision && comision.activa && comision.prioridad=='Media' && comision.modulo=='inscripcion'){
	  				var rfPago =0;
	  				if(rPagoInscripcion>=comision.importe){
	  					rfPago=comision.importe;
	  					rPagoInscripcion-=comision.importe;
	  				}else{
	  					rfPago= rPagoInscripcion;
	  					rPagoInscripcion=0;
	  				}
	  				this.llenarComision(comision,rfPago);
				}
	  		}
	  		for(var ind in grupo.comisiones){
  				var comision = grupo.comisiones[ind];
				if(comision && comision.activa && comision.prioridad=='Baja' && comision.modulo=='inscripcion'){
	  				var rfPago =0;
	  				if(rPagoInscripcion>=comision.importe){
	  					rfPago=comision.importe;
	  					rPagoInscripcion-=comision.importe;
	  				}else{
	  					rfPago= rPagoInscripcion;
	  					rPagoInscripcion=0;
	  				}
	  				this.llenarComision(comision,rfPago);
				}
	  		}
	  	}


		inscripcion.campus_id=Meteor.user().profile.campus_id;
		//inscripcion.seccion_id = Meteor.user().profile.seccion_id;

		
		for (var i in inscripcion.plan) {
			var _periodo = inscripcion.plan[i];
			var totIns =inscripcion.totalPagar-comisionColegiaturaObligatoria;
			var abonon = (parseFloat(inscripcion.importePagado)-inscripcion.totalPagar )>0? (parseFloat(inscripcion.importePagado)-inscripcion.totalPagar ):0;
			abonon = this.inscripcion.quiereAbonar? abonon:0;

			//console.log(_periodo);
			if(_periodo.tipoPlan=='inscripcion' && this.periodoVisible(_periodo)==true){
				_periodo.pago= parseFloat(inscripcion.importePagado)-comisionColegiaturaObligatoria;	
				//console.log(_periodo.pago)
				if(totIns<=_periodo.pago
					&& _periodo.planPago && _periodo.planPago instanceof Array){
					_periodo.planPago[0].pago= totIns;	
					_periodo.planPago[0].pagada =1;
					for (var conceptoid in  _periodo.datos) {
						var concepto = _periodo.datos[conceptoid]
						console.log(concepto.nombre)
						this.llenarPago(concepto,_periodo.planPago[0],_periodo.tipoPlan);
						
					}

				}
				else if( _periodo.planPago && _periodo.planPago instanceof Array){
					_periodo.planPago[0].pago= _periodo.pago	
					_periodo.planPago[0].faltante= inscripcion.totalPagar-_periodo.pago	
					_periodo.planPago[0].pagada =6;
					this.llenarPago({nombre:'Abono a inscripcion',importe:_periodo.pago,procedimientos:[]},_periodo.planPago[0],_periodo.tipoPlan);


				}
				//break;
			}
			if((comisionColegiaturaObligatoria+abonon)>0 && _periodo.tipoPlan=='colegiatura' && this.periodoVisible(_periodo)==true){
				var resta = comisionColegiaturaObligatoria+abonon;
				var valorColegiatura =0;
				for(var j in _periodo.datos){
					var datoColegiatura = _periodo.datos[j];
					if (datoColegiatura.activa && datoColegiatura.estatus==1) {
						valorColegiatura+=datoColegiatura.importe;
					}
				}
				for (var j = 0; resta>0 && j < _periodo.planPago.length; j++) {
					var pago = _periodo.planPago[j];
					var fechaPago = new Date(pago.fecha);
					
					if(fechaPago>this.inscripcion.fechaInscripcion){
						pago.pagada= (valorColegiatura<=resta)? 1:6;
						pago.faltante = (valorColegiatura<=resta)? 0: valorColegiatura-resta;
						pago.pago = (valorColegiatura>=resta)? valorColegiatura: resta;
						for(var k in _periodo.datos){
							var concepto = _periodo.datos[k];
							this.llenarPago(concepto,pago,_periodo.tipoPlan);
						}
						if(resta>valorColegiatura){
							resta-=valorColegiatura;
						}
						else{
							resta =0;
						}

					}
					else{
						pago.pagada=5;
					}
					//console.log()
				}
			}
		}

		//inscripcion.planPagoInscripcion.pago = parseFloat(inscripcion.importePagado);

		
		

		Inscripciones.insert(inscripcion);
		//var grupo = Grupos.findOne(inscripcion.grupo_id);
		console.log(grupo);
		grupo.inscritos = parseInt(grupo.inscritos) + 1;
		delete grupo._id;
		Grupos.update({_id: inscripcion.grupo_id},{$set:grupo});
		toastr.success('Alumno Inscrito');
		$state.go("root.inscripciones");
		for (var i = 0; i < this.pagosRealizados.length; i++) {
			Pagos.insert(this.pagosRealizados[i]);
		}
		for (var i = 0; i < this.comisiones.length; i++) {
			Comisiones.insert(this.comisiones[i]);
		}
		console.log(this.inscripcion);
		console.log(this.pagosRealizados)
		console.log(this.comisiones)
	};

	this.calcularImporteU= function(datos,pago,tipoPlan){
		//console.log(datos,pago)
		//console.log(this.inscripcion);
		if(datos && datos.activa==false)
			return 0;
		var fechaActual = this.inscripcion.fechaInscripcion;
  		var fechaCobro = new Date(pago.fecha);
  		//console.log(fechaActual,fechaCobro);
  		var diasRecargo = Math.floor((fechaActual-fechaCobro) / (1000 * 60 * 60 * 24)); 
  		var diasDescuento = Math.floor((fechaCobro-fechaActual) / (1000 * 60 * 60 * 24)); 
  		var importe = datos.importe;
  		//console.log(diasRecargo,diasDescuento);
  		for (var i = 0; datos.procedimientos && i < datos.procedimientos.length; i++) {
  			console.log(importe);
  			if(datos.procedimientos[i].tipoProcedimiento == 'Recargo' && tipoPlan=='inscripcion' && diasRecargo >=datos.procedimientos[i].dias ){
  			//	console.log('Recargo');
  				importe+=datos.procedimientos[i].monto;
  			}
  			if(datos.procedimientos[i].tipoProcedimiento == 'Descuento' && tipoPlan=='inscripcion' && diasDescuento >=datos.procedimientos[i].dias){
  			//	console.log('Descuento');
  				importe-=datos.procedimientos[i].monto;
  			}
  		};
  		return importe
	}	

	this.calcularImporte=function(concepto){
		console.log("calcular importe");
		console.log(concepto);
		var grupoid = this.getReactively("inscripcion.grupo_id");
	  	var tipoInsc = this.getReactively("inscripcion.tipoInscripcion");
	  	var grupo = undefined;
	  	if(grupoid)
			grupo = Grupos.findOne(grupoid);
		//console.log(grupo);
	  	if(grupo && grupo.plan ){
	  		this.inscripcion.totalPagar = 0;
	  		if(!this.inscripcion.plan || this.inscripcion.plan.grupo_id!=grupo._id){
	  			this.inscripcion.plan = grupo.plan;
	  			this.inscripcion.plan.grupo_id=grupo._id
	  		}
	  		
	  		var _periodo = null;
	  		for(var ind in this.inscripcion.plan){
	  			if(this.inscripcion.plan[ind] && ind == tipoInsc){
	  				_periodo = this.inscripcion.plan[ind];
	  				break;
	  			}
	  		}
	  		if(grupo.comisiones){
	  			for(var ind in grupo.comisiones){
	  				var comision = grupo.comisiones[ind];
	  				if(comision && comision.activa && comision.prioridad=='Alta' && comision.modulo=='colegiatura')
	  					this.inscripcion.totalPagar+=comision.importe;
	  			}
	  		}
	  		 
	  		//console.log(_periodo);
	  		for (var j = 0; _periodo && j < _periodo.datos.length; j++) {
	  			this.inscripcion.totalPagar+=this.calcularImporteU(_periodo.datos[j],_periodo.planPago[0],_periodo.tipoPlan);

	  		}
	  		/*if(_periodo.tipoPlan=='inscripcion'){
	  				for (var j = 0; j < _periodo.datos.length; j++) {
	  					this.inscripcion.totalPagar+=_periodo.datos[j].importe
	  				}
	  				break;
	  		}*/

	  	}
	}

	this.autorun(() => {
	  	this.calcularImporte();
			
		
  	});
	
	//Conceptos de cobro
  
  /*this.seleccionarConcepto = function(concepto) {	  
	  var idx = this.inscripcion.conceptosSeleccionados.indexOf(concepto);
  
    if (idx > -1) {
	    this.inscripcion.totalPagar -= parseFloat(concepto.importe);
      this.inscripcion.conceptosSeleccionados.splice(idx, 1);
    }
    else {
	    this.inscripcion.totalPagar += parseFloat(concepto.importe);
      this.inscripcion.conceptosSeleccionados.push(concepto);
    }
  };*/

	this.cuantoPaga = function(importe){
		if(importe>this.inscripcion.totalPagar)
			this.inscripcion.cambio = parseFloat(importe) - parseFloat(this.inscripcion.totalPagar);
		else 
			this.inscripcion.cambio =0;
	}
	
  	this.getAlumnoSeleccionado= function(id)
	{
		var alumno = Alumnos.findOne(id);
		if(alumno){
			this.alumnoSeleccionado = alumno;
			this.alumnoSeleccionado.activo = true;
		}
	};	
	
	this.getCiclo= function(ciclo_id)
	{
		var ciclo = Ciclos.findOne(ciclo_id);
		if(ciclo)
		return ciclo.descripcion;
	};	
	
	this.hayCupo = function(grupo_id){
		var grupo = Grupos.findOne(grupo_id);
		if(grupo.inscritos <= grupo.cupo){
			this.cupo = "check";
		}else{
			this.cupo = "remove";
		}
	}
	
	this.getGrupos = function(seccion_id, alumno_id){
		var inscrito = Inscripciones.findOne({seccion_id : seccion_id, alumno_id : alumno_id});
		if(!inscrito){
			toastr.success('El alumno puede inscribirse');
			rc.grupos = Grupos.find({seccion_id : seccion_id, estatus : true}).fetch();
		}else{
			toastr.error('Este alumno ya está inscrito en esta Sección');
		}
	}	
	
	this.dejoAbono = function(){
		if(this.inscripcion.quiereAbonar){
			rc.inscripcion.abono = rc.inscripcion.cambio;
			rc.inscripcion.cambio = 0.00;
		}else{
			rc.inscripcion.cambio = rc.inscripcion.abono;
			rc.inscripcion.abono = 0.00;
		}
	}
};