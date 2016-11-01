angular
  .module('casserole')
  .controller('TiposIngresosCtrl', TiposIngresosCtrl);
 
function TiposIngresosCtrl($scope, $meteor, $reactive, $state, toastr) {
	$reactive(this).attach($scope);
	
	this.subscribe('tiposingresos',()=>{
		return [{campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }]
	 });
	 
	this.action = true;	
	
	
  this.helpers({
	  tiposingresos : () => {
		  return TiposIngresos.find({campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" });
	  }
  });
	this.nuevo = true;
	
	this.nuevoTipoIngresos = function()
	{
			this.action = true;
	    this.nuevo = !this.nuevo;
	    this.tipoingreso = {}; 
	};
	
	this.guardar = function(tipoingreso,form)
	{
			if(form.$invalid){
		        toastr.error('Error al guardar los datos.');
		        return;
		  }
			tipoingreso.estatus = true;
			tipoingreso.campus_id = Meteor.user().profile.campus_id;
			tipoingreso.usuarioInserto = Meteor.userId();
			TiposIngresos.insert(tipoingreso);
			toastr.success('Guardado correctamente.');
			this.tipoingreso = {};
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
	    form.$setUntouched();
	};
	
	this.editar = function(id)
	{
		this.tipoingreso = TiposIngresos.findOne({_id:id});
	    this.action = false;
	    $('.collapse').collapse('show');
	    this.nuevo = false;
    
	};
	
	this.actualizar = function(tipoingreso,form)
	{
			if(form.$invalid){
		        toastr.error('Error al actualizar los datos.');
		        return;
		    }
			var idTemp = tipoingreso._id;
			delete tipoingreso._id;		
			tipoingreso.usuarioActualizo = Meteor.userId(); 
			TiposIngresos.update({_id:idTemp},{$set:tipoingreso});
			toastr.success('Actualizado correctamente.');
			$('.collapse').collapse('hide');
			this.nuevo = true;	
			form.$setPristine();
	    form.$setUntouched();
	};
		
	this.cambiarEstatus = function(id)
	{
		var tipoingreso = TiposIngresos.findOne({_id:id});
		if(tipoingreso.estatus == true)
			tipoingreso.estatus = false;
		else
			tipoingreso.estatus = true;
		
		TiposIngresos.update({_id:id}, {$set : {estatus : tipoingreso.estatus}});

	};
	
}