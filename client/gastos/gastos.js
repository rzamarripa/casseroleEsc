angular
  .module('casserole')
  .controller('GastosCtrl', GastosCtrl);
 
function GastosCtrl($scope, $meteor, $reactive, $state, toastr) {
	$reactive(this).attach($scope);
  this.nuevo = false;
  this.tipoGasto = 'cheques';
  this.gasto = {};
  this.semanaActual = moment(new Date()).isoWeek();
  this.diaActual = moment(new Date()).weekday();
  dias = ["Lunes","Martes","Miercoles","Jueves","Viernes","Sabado","Domingo"];
  this.diasActuales = [];
  for(i = 0; i < this.diaActual; i++){this.diasActuales.push(dias[i])};

  this.subscribe('gastos', () => {
    return [{estatus: true, semana: this.semanaActual, campus_id: Meteor.user() != undefined ? Meteor.user().profile.campus_id : ''}];
  });

  this.subscribe('conceptosGasto', () => {
    return [{estatus: true, tipoGasto: this.getReactively('tipoGasto')}];
  });

  this.subscribe('pagos', () => {
    return [{semanaPago: this.semanaActual, campus_id: Meteor.user() != undefined ? Meteor.user().profile.campus_id : ''}];
  });

  this.subscribe('comisiones', () => {
    return [{semanaPago: this.semanaActual, campus_id: Meteor.user() != undefined ? Meteor.user().profile.campus_id : ''}];
  });

  this.subscribe('cuentas', () => {
    return [{estatus: true, seccion_id: Meteor.user() != undefined ? Meteor.user().profile.seccion_id : ''}];
  });

  this.helpers({
		gastos : () => {
			return Gastos.find({tipoGasto  : this.getReactively('tipoGasto')});
		},
    conceptos : () =>{
      return ConceptosGasto.find();
    },
    cuentas : ()=>{
      _cuentas = Cuentas.find().fetch();
      _.each(_cuentas,function(cuenta){
        cuenta.depositos = Gastos.find({tipoGasto:"depositos",cuenta_id: cuenta._id}).fetch();
        cuenta.totalDepositos = _.reduce(cuenta.depositos, function(memo, deposito){return memo + deposito.importe},0);
      });
      return _cuentas;
    },
    cuentaInscripcion : () =>{
      return Cuentas.findOne({inscripcion:true});
    }
  });

  this.cambiar = function(tipoGasto){
    this.tipoGasto = tipoGasto;
    this.nuevo = false;
    this.gasto = {};
  }
  this.boton = function(){
    this.nuevo = !this.nuevo;
    console.log(this.nuevo)
  }
  this.guardar = function(gasto, form){
    if(form.$invalid){
      toastr.error('error.');
      return;
    }
    gasto.estatus = true;
    gasto.semana = this.semanaActual;
    gasto.campus_id = Meteor.user().profile.campus_id;
    gasto.seccion_id = Meteor.user().profile.seccion_id;
    gasto.tipoGasto = this.tipoGasto;
    gasto.weekday = this.diaActual;
    Gastos.insert(gasto);
    form.$setPristine();
    form.$setUntouched();
    this.gasto = {}; 
    this.nuevo = false;
    $('.collapse').collapse('hide');
    return toastr.success('Guardado correctamente');
  }

  this.guardarConcepto = function(concepto, form){
    if(form.$invalid){
      toastr.error('error.');
      return;
    }
    concepto.tipoGasto = this.tipoGasto;
    concepto.estatus = true;
    ConceptosGasto.insert(concepto);
    this.concepto = {}; 
    form.$setPristine();
    form.$setUntouched();
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
////////Depositos
  this.importeDiarioPagos = function(dia, cuenta_id){
    pagos = Pagos.find({weekday:dia, cuenta_id:cuenta_id}).fetch();
    importe = _.reduce(pagos, function(memo, pago){return memo + pago.importe},0);
    return importe
  }

  this.importeSemanalPagos = function(cuenta_id){
    pagos = Pagos.find({cuenta_id:cuenta_id}).fetch();
    importe = _.reduce(pagos, function(memo, pago){return memo + pago.importe},0);
    return importe
  }

  this.importeDiarioGastos = function(dia, cuenta_id){
    gastos = Gastos.find({weekday:dia, cuenta_id:cuenta_id}).fetch();  
    importe = _.reduce(gastos, function(memo, gasto){return memo + gasto.importe},0);
    return importe
  }

  this.importeSemanalGastos = function(cuenta_id){
    gastos = Gastos.find({cuenta_id:cuenta_id}).fetch();
    importe = _.reduce(gastos, function(memo, gasto){return memo + gasto.importe},0);
    return importe
  }

  this.porDepositar = function(cuenta_id){
    pagos = Pagos.find({cuenta_id:cuenta_id}).fetch();
    gastos = Gastos.find({cuenta_id:cuenta_id}).fetch();
    totalPagos = _.reduce(pagos, function(memo, pago){return memo + pago.importe},0);
    totalGastos = _.reduce(gastos, function(memo, gasto){return memo + gasto.importe},0);
    return totalPagos - totalGastos
  }
  this.gastosRelaciones = function(cuenta_id){
    comisiones = Comisiones.find({modulo:"colegiatura", cuenta_id:cuenta_id}).fetch();
    gastos = Gastos.find({tipoGasto:"relaciones"}).fetch();
    totalComisiones = _.reduce(comisiones, function(memo, comision){return memo + comision.importe},0);
    totalGastos = _.reduce(gastos, function(memo, gasto){return memo + gasto.importe},0);
    return totalComisiones + totalGastos;
  }
  this.restosInscripcion = function(cuenta_id){
    comisiones = Comisiones.find({modulo:"inscripcion", cuenta_id:cuenta_id}).fetch();
    totalComisiones = _.reduce(comisiones, function(memo, comision){return memo + comision.importe},0);
    return totalComisiones
  }
////////////////////////
///////////relaciones
  this.comisiones = function(cuenta_id){
    comisiones = Comisiones.find({modulo:"colegiatura", cuenta_id:cuenta_id}).fetch();
    totalComisiones = _.reduce(comisiones, function(memo, comision){return memo + comision.importe},0);
    return totalComisiones
  }
////////////////////////
};