angular
  .module('casserole')
  .controller('OcupacionesCtrl', OcupacionesCtrl);
 
function OcupacionesCtrl($scope, $meteor, $reactive, $state, toastr) {
	$reactive(this).attach($scope);

	this.subscribe("ocupaciones",()=>{
		return [{campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }]
	 });

	this.action = true;
	this.helpers({
			ocupaciones : () => {
				return Ocupaciones.find();
			}
	})
	this.nuevo = true;
	this.nuevaOcupacion = function()
	{
		  this.action = true;
	    this.nuevo = !this.nuevo;
	    this.ocupacion = {}; 
	};
	
	this.guardar = function(ocupacion,form)
	{
			if(form.$invalid){
		        toastr.error('Error al guardar los datos.');
		        return;
		  }
			ocupacion.estatus = true;
			ocupacion.campus_id = Meteor.user().profile.campus_id;
			ocupacion.usuarioInserto = Meteor.userId();
			Ocupaciones.insert(ocupacion);
			toastr.success('Guardado correctamente.');
			this.ocupacion = {};
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
	    form.$setUntouched();
			$state.go('root.ocupaciones');
	};
	
	this.editar = function(id)
	{
			this.ocupacion = Ocupaciones.findOne({_id:id});
	    this.action = false;
	    $('.collapse').collapse('show');
	    this.nuevo = false;
	};
	
	this.actualizar = function(ocupacion,form)
	{
			if(form.$invalid){
		        toastr.error('Error al actualizar los datos.');
		        return;
		  }
			var idTemp = ocupacion._id;
			delete ocupacion._id;		
			ocupacion.usuarioActualizo = Meteor.userId(); 
			Ocupaciones.update({_id:idTemp},{$set:ocupacion});
			toastr.success('Actualizado correctamente.');
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
	    form.$setUntouched();
	};
	
	this.cambiarEstatus = function(id)
	{
			var ocupacion = Ocupaciones.findOne({_id:id});
			if(ocupacion.estatus == true)
				ocupacion.estatus = false;
			else
				ocupacion.estatus = true;
			
			Ocupaciones.update({_id:id}, {$set : {estatus : ocupacion.estatus}});

	};
	
}