angular
  .module('casserole')
  .controller('ConceptosGastoCtrl', ConceptosGastoCtrl);
 
function ConceptosGastoCtrl($scope, $meteor, $reactive, $state, toastr) {
  let rc = $reactive(this).attach($scope);
  this.nuevo = true;
  this.conceptoGasto = {};
  this.tiposGasto = ["Cheques","Relaciones","Admon"]
  this.conceptoGasto.tipoGasto = "";
  window.rc = rc;
  
  this.subscribe('conceptosGasto', () => {
    return [{tipoGasto: this.getReactively('conceptoGasto.tipoGasto')}];
  });

  this.helpers({
    conceptosGasto : () => {
      return ConceptosGasto.find().fetch();
    }  
  });

  this.editar = function(conceptoGasto){
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
  
  this.agregarSubconcepto = function(subconcepto){
	  if(subconcepto.nombre.length > 0){
		  subconcepto.estatus = true;
		  console.log(subconcepto);
		  if(rc.conceptoGasto.subconceptos == undefined){
			  rc.conceptoGasto.subconceptos = [];
			  rc.conceptoGasto.subconceptos.push(subconcepto);
		  }else{
			  rc.conceptoGasto.subconceptos.push(subconcepto);
		  }
		  rc.subconceptoGasto = {};
		  $( "#subconceptoGasto" ).focus();
	  }
	  $( "#subconceptoGasto" ).focus();
  }
  
  this.eliminarSubconcepto = function(subconcepto, index){
	  var res = confirm("Está seguro de querer eliminar el concepto");
	  if(res == true){
		  rc.conceptoGasto.subconceptos.splice(index, 1);
	  }
  }
  
  this.mostrarSubconceptos = function(estatus){
	  if(estatus == false){
		  var res = confirm("Está seguro de eliminar todos los subconceptos de este gasto");
		  if(res == true){
			  rc.conceptoGasto.subconceptos = [];
		  }
	  }else{
		  rc.subconceptoGasto = "";
	  }
  }
  
};