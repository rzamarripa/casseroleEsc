angular
  .module('casserole')
  .controller('GastosCtrl', GastosCtrl);
 
function GastosCtrl($scope, $meteor, $reactive, $state, toastr) {
	let rc = $reactive(this).attach($scope);
  this.nuevo = false;
  this.tipoGasto = 'Cheques';
  this.gasto = {};
  this.gasto.fecha = new Date();
  this.semanaActual = moment(new Date()).isoWeek();
  this.anioActual = moment().get("year");
  this.diaActual = moment().isoWeekday();
  this.campoSubconceptos = false;
  this.registrosComision = 0;
  this.registrosInscripcion = 0;
  this.totalBonoGerente = 0;
  this.totalBonoVendedor = 0;
  this.detallePagos = [];
  dias = ["Lunes","Martes","Miercoles","Jueves","Viernes","Sabado","Domingo"];
  this.diasActuales = [];
  
  for(i = 0; i < this.diaActual; i++){this.diasActuales.push(dias[i])};
  window.rc = rc;
 
  this.subscribe('gastos', () => {
    return [{estatus: true, semana: this.semanaActual, anio: this.anioActual, seccion_id: Meteor.user() != undefined ? Meteor.user().profile.seccion_id : ''}];
  });

  this.subscribe('conceptosGasto', () => {
    return [{estatus: true, tipoGasto: this.getReactively('tipoGasto')}];
  });

  this.subscribe('pagos', () => {
    return [{semanaPago: this.semanaActual, seccion_id: Meteor.user() != undefined ? Meteor.user().profile.seccion_id : ''}];
  });

  this.subscribe('comisiones', () => {
    return [{semanaPago: this.semanaActual, campus_id: Meteor.user() != undefined ? Meteor.user().profile.campus_id : ''}];
  });

  this.subscribe('cuentas', () => {
    return [{estatus: true, seccion_id: Meteor.user() != undefined ? Meteor.user().profile.seccion_id : ''}];
  });

  this.helpers({
		gastos : () => {
			var gas = Gastos.find({tipoGasto  : this.getReactively('tipoGasto')}).fetch();
			if(rc.getReactively("tipoGasto") == "Depositos"){
				_.each(gas, function(g){
					g.cuenta = Cuentas.findOne(g.cuenta_id);
				})
			}else if(rc.getReactively("tipoGasto") == "Relaciones"){
				_.each(gas, function(g){
					g.concepto = ConceptosGasto.findOne(g.concepto_id);
				})
			}
			return gas;
		},
    conceptos : () =>{
      return ConceptosGasto.find();
    },
    cuentas : ()=>{
      _cuentas = Cuentas.find().fetch();
      _.each(_cuentas,function(cuenta){
        cuenta.depositos = Gastos.find({tipoGasto:"Depositos", cuenta_id: cuenta._id}).fetch();
        cuenta.totalDepositos = _.reduce(cuenta.depositos, function(memo, deposito){return memo + deposito.importe},0);
      });
      return _cuentas;
    },
    cuentaActiva : () =>{
      return Cuentas.findOne({inscripcion:true});
    },
    cuentaCheques : () => {
	    return Cuentas.findOne({inscripcion:false});
    }
  });

  this.cambiar = function(tipoGasto){
    this.tipoGasto = tipoGasto;
    this.nuevo = false;
    this.gasto = {};
  }
  this.boton = function(){
    this.nuevo = !this.nuevo;
  }
  this.guardar = function(gasto, form){
    if(form.$invalid){
      toastr.error('Llene toda la información.');
      return;
    }
    gasto.estatus = true;
    gasto.semana = this.semanaActual;
    gasto.anio = this.anioActual;    
    gasto.campus_id = Meteor.user().profile.campus_id;
    gasto.seccion_id = Meteor.user().profile.seccion_id;
    gasto.tipoGasto = this.tipoGasto;
    gasto.diaSemana = this.diaActual;
    if(gasto.tipoGasto == "Cheques")
	    gasto.cuenta_id = this.cuentaCheques._id;
    else if(gasto.tipoGasto != "Depositos")
	    gasto.cuenta_id = this.cuentaActiva._id;
    Gastos.insert(gasto);
    this.gasto = {}; 
    this.nuevo = false;
    $('.collapse').collapse('hide');
    return toastr.success('Guardado correctamente');
  }

  this.guardarConcepto = function(concepto, form){
    if(form.$invalid){
      toastr.error('Por favor llene la información correctamente.');
      return;
    }
    concepto.tipoGasto = this.tipoGasto;
    concepto.estatus = true;
    ConceptosGasto.insert(concepto);
    this.concepto = {}; 
    return toastr.success('Guardado correctamente');
  }

  this.cambiarEstatus = function(gasto){
    estatus = !gasto.estatus;
    Gastos.update(gasto._id,{$set:{estatus:estatus}});
  }

  this.getConcepto = function(concepto_id){
    concepto = ConceptosGasto.findOne(concepto_id);
    if(concepto != undefined)
      return concepto.codigo + " | " + concepto.nombre;
  }
  
  this.sum = function(){
    var sum = _.reduce(this.gastos, function(memo, gasto){ return memo + gasto.importe; },0);
    return sum
  }
  
  this.descripcion = function(concepto_id){
    if(concepto_id != undefined){
      concepto = ConceptosGasto.findOne(concepto_id);
      if(concepto.campoDeDescripcion)
        return true
      else
        return false
    }else{
      return false
    }
  }
  
	////////Depositos////////
	
  this.importeDiarioPagos = function(dia, cuenta_id){
    pagos = Pagos.find({diaSemana:dia, cuenta_id:cuenta_id}).fetch();
    importe = _.reduce(pagos, function(memo, pago){return memo + pago.pago}, 0);
    return importe;
  }

  this.importeSemanalPagos = function(cuenta_id){
    pagos = Pagos.find({cuenta_id:cuenta_id}).fetch();
    importe = _.reduce(pagos, function(memo, pago){return memo + pago.pago},0);
    return importe;
  }

  this.importeDiarioGastos = function(dia, cuenta_id){
    gastos = Gastos.find({diaSemana:dia, cuenta_id:cuenta_id}).fetch();  
    importe = _.reduce(gastos, function(memo, gasto){return memo + gasto.importe},0);
    return importe;
  }

  this.importeSemanalGastos = function(cuenta_id){
    gastos = Gastos.find({cuenta_id:cuenta_id}).fetch();
    importe = _.reduce(gastos, function(memo, gasto){return memo + gasto.importe},0);
    return importe;
  }

  this.porDepositar = function(cuenta_id){
    pagos = Pagos.find({cuenta_id:cuenta_id}).fetch();
    gastos = Gastos.find({cuenta_id:cuenta_id}).fetch();
    totalPagos = _.reduce(pagos, function(memo, pago){return memo + pago.importe},0);
    totalGastos = _.reduce(gastos, function(memo, gasto){return memo + gasto.importe},0);
    return totalPagos - totalGastos;
  }
  this.gastosRelaciones = function(cuenta_id){
    //comisiones = Comisiones.find({beneficiario:"gerente", cuenta_id:cuenta_id, semanaPago : this.semanaActual, anioPago : this.anioActual}).fetch();
    gastos = Gastos.find({tipoGasto:"Relaciones", cuenta_id : cuenta_id }).fetch();
    admon = Gastos.find({tipoGasto:"Admon", cuenta_id : cuenta_id }).fetch();
    //totalComisiones = _.reduce(comisiones, function(memo, comision){return memo + comision.importeComision},0);
    totalGastos = _.reduce(gastos, function(memo, gasto){return memo + gasto.importe},0);
    totalGastos += _.reduce(admon, function(memo, gasto){return memo + gasto.importe},0);
    //console.log(totalGastos + totalComisiones)
    return totalGastos;// + totalComisiones;
  }
  
  this.gastosCheques = function(cuenta_id){
    gastos = Gastos.find({tipoGasto:"Cheques", cuenta_id : cuenta_id }).fetch();
    totalGastos = _.reduce(gastos, function(memo, gasto){return memo + gasto.importe},0);
    return totalGastos;
  }
  
  this.restosInscripcion = function(cuenta_id){
	  comisionesVendedor = Comisiones.find({beneficiario:"vendedor", cuenta_id:cuenta_id}).fetch();
	  rc.registrosInscripcion = _.uniq(_.pluck(comisionesVendedor, "alumno_id")).length;
    totalComisiones = _.reduce(comisionesVendedor, function(memo, comision){return memo + comision.importeComision},0);
    return totalComisiones;
  }

	///////////relaciones////////////////////////
  
  this.comisiones = function(cuenta_id){
	  comisionesGerente = Comisiones.find({beneficiario:"gerente", cuenta_id:cuenta_id}).fetch();
	  rc.registrosComision = comisionesGerente.length;
    totalComisiones = _.reduce(comisionesGerente, function(memo, comision){return memo + comision.importeComision},0);
    this.getBonosGerentes();
  this.getBonosVendedores();
    return totalComisiones;
  }
	////////////////////////

	this.tieneSubconceptos = function(concepto_id){
		var concepto = ConceptosGasto.findOne(concepto_id);
		//console.log(concepto);
		if(concepto.campoSubconceptos == true){
			rc.campoSubconceptos = true;
			rc.subconceptos = concepto.subconceptos;
		}else{
			rc.campoSubconceptos = false;
			rc.subconceptos = [];
			rc.gasto.subConcepto = "NA";
		}
		
	}
	
	this.desgloseImporteDiarioPagos = function(dia, cuenta_id){
		var id = "#myModal" + dia + cuenta_id;
		$(id).modal('show');
		rc.diaSeleccionado = dias[dia];
		rc.detallePagos = Pagos.find({diaSemana:dia+1, cuenta_id:cuenta_id}).fetch();
	}
	
	this.getBonosGerentes = function(){
	  Meteor.apply('reporteComisionesGerentes', [this.semanaActual, this.anioActual, Meteor.user().profile.seccion_id, Meteor.user().profile.campus_id], function(error, result){
		  if(result){
			  rc.totalBonoGerente = 0;
			  _.each(result, function(gerente){
				  if(gerente.importe)
					  rc.totalBonoGerente += gerente.importe;
			  })
		  }
		  return rc.totalBonoGerente;
	  }); 
  }
  
  this.getBonosVendedores = function(){
	  Meteor.apply('reporteComisionesVendedores', [this.semanaActual, this.anioActual, Meteor.user().profile.seccion_id, Meteor.user().profile.campus_id], function(error, result){
		  if(result){
			  rc.totalBonoVendedor = 0;
			  _.each(result, function(vendedor){
				  if(vendedor.bono)
					  rc.totalBonoVendedor += vendedor.bono;
			  })
		  }
	  });
	  
	  
  }
};