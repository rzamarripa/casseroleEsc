angular
  .module('casserole')
  .controller('ConceptosCtrl', ConceptosCtrl);
 
function ConceptosCtrl($scope, $meteor, $reactive, $state, toastr) {
	$reactive(this).attach($scope);

  this.subscribe("conceptos",()=>{
		return [{campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }]
	 });
  this.action = true;  
  this.helpers({
	  conceptos : () => {
		  return Conceptos.find();
	  }
  });
	this.nuevo = true;
	
  this.nuevoConcepto = function()
  {
		  this.action = true;
		  this.nuevo = !this.nuevo;
		  this.concepto = {}; 
  };
  
  this.guardar = function(concepto,form)
	{
			if(form.$invalid){
		        toastr.error('Error al guardar los datos.');
		        return;
		  }
			concepto.estatus = true;
			concepto.campus_id = Meteor.user().profile.campus_id;
			concepto.usuarioInserto = Meteor.userId();
			Concepto.insert(concepto);
			toastr.success('Guardado correctamente.');
			concepto = {};
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
	    form.$setUntouched();
		
	};
	
	this.editar = function(id)
	{
			this.concepto = Conceptos.findOne({_id:id});
	    this.action = false;
	    $('.collapse').collapse('show');
	    this.nuevo = false;
	};
	
	this.actualizar = function(concepto,form)
	{
			if(form.$invalid){
		        toastr.error('Error al actualizar los datos de Concepto.');
		        return;
		  }
			var idTemp = concepto._id;
			delete concepto._id;		
			concepto.usuarioActualizo = Meteor.userId(); 
			Conceptos.update({_id:idTemp},{$set:concepto});
			toastr.success('Actualizado correctamente.');
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
	    form.$setUntouched();
	};
		
	this.cambiarEstatus = function(id)
	{
			var concepto = Conceptos.findOne({_id:id});
			if(concepto.estatus == true)
				concepto.estatus = false;
			else
				concepto.estatus = true;
			
			Conceptos.update({_id:id}, {$set : {estatus : concepto.estatus}});
		
	};
}