angular
  .module('casserole')
  .controller('ConceptosGastoCtrl', ConceptosGastoCtrl);
 
function ConceptosGastoCtrl($scope, $meteor, $reactive, $state, toastr) {
  $reactive(this).attach($scope);
  this.nuevo = true;
  this.conceptoGasto = {};
  this.tiposGasto = ["cheques","relaciones","admon"]
  this.conceptoGasto.tipoGasto = "";
  this.subscribe('conceptosGasto', () => {
    return [{tipoGasto: this.getReactively('conceptoGasto.tipoGasto')}];
  });

  this.helpers({
    conceptosGasto : () => {
      return ConceptosGasto.find().fetch();
    }  
  });

  this.editar = function(conceptoGasto){
    console.log(conceptoGasto)
    this.conceptoGasto = conceptoGasto;
    this.nuevo = false;
  }

  this.cancelar = function(){
    this.conceptoGasto = {};
    this.conceptoGasto.tipoGasto = "";
    this.nuevo = true;
  }

  this.actualizar = function(conceptoGasto, form){
    if(form.$invalid){
      toastr.error('error.');
      return;
    }
    console.log(conceptoGasto);
    idTemp = conceptoGasto._id;
    delete conceptoGasto.$$hashKey;
    delete conceptoGasto._id;
    ConceptosGasto.update(idTemp,{$set:conceptoGasto})
    this.nuevo = true;
    this.conceptoGasto = {};
    this.conceptoGasto.tipoGasto = conceptoGasto.tipoGasto;
  }

  this.guardar = function(conceptoGasto, form){
    if(form.$invalid){
      toastr.error('error.');
      return;
    }
    conceptoGasto.estatus = true;
    ConceptosGasto.insert(conceptoGasto);
    form.$setPristine();
    form.$setUntouched();
    this.conceptoGasto = {};
    this.conceptoGasto.tipoGasto = conceptoGasto.tipoGasto;
    $('.collapse').collapse('hide');
    return toastr.success('Guardado correctamente');
  }

  this.guardarConcepto = function(conceptoGasto, form){
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

  this.cambiarEstatus = function(conceptoGasto){
    estatus = !conceptoGasto.estatus;
    ConceptosGasto.update(conceptoGasto._id,{$set:{estatus:estatus}});
  }
};