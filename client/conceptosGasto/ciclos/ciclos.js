angular
  .module('casserole')
  .controller('CiclosCtrl', CiclosCtrl);
 
function CiclosCtrl($scope, $meteor, $reactive, $state, toastr) {
	$reactive(this).attach($scope);
	this.action = true;
	this.subscribe('ciclos',()=>{
		return [{seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : "" }]
	});
  
  this.helpers({
		ciclos : () => {
		  return Ciclos.find();
	  }
  });
  	  
  this.nuevo = true;	  
  this.nuevoCiclo = function()
  {
    this.action = true;
    this.nuevo = !this.nuevo;
    this.ciclo = {};		
  };
	
  this.guardar = function(ciclo,form)
	{
			if(form.$invalid){
	      toastr.error('Error al guardar los datos.');
	      return;
	    }
			
			ciclo.estatus = true;
			ciclo.campus_id = Meteor.user().profile.campus_id;
			ciclo.seccion_id = Meteor.user().profile.seccion_id;
			ciclo.usuarioInserto = Meteor.userId();
			console.log(ciclo);
			Ciclos.insert(ciclo);
			toastr.success('Guardado correctamente.');
			ciclo = {};
			$('.collapse').collapse('hide');
			this.nuevo = true;
			$state.go('root.ciclos');
			form.$setPristine();
	    form.$setUntouched();
	};
	
	this.editar = function(id)
	{
	    this.ciclo = Ciclos.findOne({_id:id});
	    this.action = false;
	    $('.collapse').collapse('show');
	    this.nuevo = false;
	};
	
	this.actualizar = function(ciclo,form)
	{
	    if(form.$invalid){
	        toastr.error('Error al actualizar los datos.');
	        return;
	    }
		 			var idTemp = ciclo._id;
			delete ciclo._id;		
			ciclo.usuarioActualizo = Meteor.userId(); 
			Ciclos.update({_id:idTemp},{$set:ciclo});
			toastr.success('Actualizado correctamente.');
			console.log(ciclo);
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
	    form.$setUntouched();
	};
		
	this.cambiarEstatus = function(id)
	{
			var ciclo = Ciclos.findOne({_id:id});
			if(ciclo.estatus == true)
				ciclo.estatus = false;
			else
				ciclo.estatus = true;
			
			Ciclos.update({_id:id}, {$set : {estatus : ciclo.estatus}});
	};	
};