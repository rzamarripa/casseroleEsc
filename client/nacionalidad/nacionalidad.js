angular
  .module('casserole')
  .controller('NacionalidadesCtrl', NacionalidadesCtrl);
 
function NacionalidadesCtrl($scope, $meteor, $reactive, $state, toastr) {
	$reactive(this).attach($scope);

  this.subscribe("nacionalidades",()=>{
		return [{campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }]
	 });
  this.action = true;  
  this.helpers({
	  nacionalidades : () => {
		  return Nacionalidades.find();
	  }
  });
	this.nuevo = true;
	
  this.nuevoNacionalidad = function()
  {
		  this.action = true;
		  this.nuevo = !this.nuevo;
		  this.nacionalidad = {}; 
  };
  
  this.guardar = function(nacionalidad,form)
	{
			if(form.$invalid){
		        toastr.error('Error al guardar los datos.');
		        return;
		  }
			nacionalidad.estatus = true;
			nacionalidad.campus_id = Meteor.user().profile.campus_id;
			nacionalidad.usuarioInserto = Meteor.userId();
			Nacionalidades.insert(nacionalidad);
			toastr.success('Guardado correctamente.');
			nacionalidad = {};
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
	    form.$setUntouched();
		
	};
	
	this.editar = function(id)
	{
			this.nacionalidad = Nacionalidades.findOne({_id:id});
	    this.action = false;
	    $('.collapse').collapse('show');
	    this.nuevo = false;
	};
	
	this.actualizar = function(nacionalidad,form)
	{
			if(form.$invalid){
		        toastr.error('Error al actualizar los datos de la Nacionalidad.');
		        return;
		  }
			var idTemp = nacionalidad._id;
			delete nacionalidad._id;		
			nacionalidad.usuarioActualizo = Meteor.userId(); 
			Nacionalidades.update({_id:idTemp},{$set:nacionalidad});
			toastr.success('Actualizado correctamente.');
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
	    form.$setUntouched();
	};
		
	this.cambiarEstatus = function(id)
	{
			var nacionalidad = Nacionalidades.findOne({_id:id});
			if(nacionalidad.estatus == true)
				nacionalidad.estatus = false;
			else
				nacionalidad.estatus = true;
			
			Nacionalidades.update({_id:id}, {$set : {estatus : nacionalidad.estatus}});
		
	};
}