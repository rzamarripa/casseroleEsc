angular
  .module('casserole')
  .controller('SubCiclosCtrl', SubCiclosCtrl);
 
function SubCiclosCtrl($scope, $meteor, $reactive, $state, toastr) {
	$reactive(this).attach($scope);
  this.action = true;
	this.subscribe('subCiclos',()=>{
		return [{seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : "" }]
	 });


	this.subscribe('ciclos',()=>{
		return [{estatus:true, seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : "" }]
	 });

  this.helpers({
	  subCiclos : () => {
		  return SubCiclos.find({seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : "" });
	  },
	  ciclos : () => {
		  return Ciclos.find({estatus:true, seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : "" });
	  },
  });
  	  
  this.nuevo = true;	  
  this.nuevoSubCiclo = function()
  {
	    this.action = true;
	    this.nuevo = !this.nuevo;
	    this.subCiclo = {};		
  };
	
  this.guardar = function(subCiclo,form)
	{
			if(form.$invalid){
		        toastr.error('Error al guardar los datos.');
		        return;
		  }
			subCiclo.estatus = true;
			subCiclo.campus_id = Meteor.user().profile.campus_id;
			subCiclo.seccion_id = Meteor.user().profile.seccion_id;
			subCiclo.usuarioInserto = Meteor.userId();
			SubCiclos.insert(subCiclo);
			toastr.success('Guardado correctamente.');
			subCiclo = {};
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
	    form.$setUntouched();
			$state.go('root.subCiclos');
	};
	
	this.editar = function(id)
	{
	    this.subCiclo = SubCiclos.findOne({_id:id});
	    this.action = false;
	    $('.collapse').collapse('show');
	    this.nuevo = false;
	};
	
	this.actualizar = function(subCiclo,form)
	{
			if(form.$invalid){
		        toastr.error('Error al actualizar los datos.');
		        return;
		  }
		
			var idTemp = subCiclo._id;
			delete subCiclo._id;		
			subCiclo.usuarioActualizo = Meteor.userId();
			SubCiclos.update({_id:idTemp},{$set:subCiclo});
			toastr.success('Actualizado correctamente.');
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
	    form.$setUntouched();

	};

	this.getCiclo= function(ciclo_id)
	{
			var ciclo = Ciclos.findOne(ciclo_id);
			if (ciclo)
				 return ciclo.nombre;
	};
		
	this.cambiarEstatus = function(id)
	{
			var subCiclo = SubCiclos.findOne({_id:id});
			if(subCiclo.estatus == true)
					subCiclo.estatus = false;
			else
					subCiclo.estatus = true;
			SubCiclos.update({_id:id}, {$set : {estatus : subCiclo.estatus}});
	};
	
};