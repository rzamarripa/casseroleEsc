angular.module("casserole")
.controller("TipoPublicidadCtrl", TipoPublicidadCtrl);  
 function TipoPublicidadCtrl($scope, $meteor, $reactive, $state, $stateParams, toastr){
 	let rc = $reactive(this).attach($scope);
  
  this.action = true;
  
	this.subscribe('tipoPublicidad',()=>{
		return [{}]
	 });

	this.helpers({
	  tipoPublicidades : () => {
		  return TipoPublicidad.find();
	  }
	 
  });
  	  
  this.nuevo = true;	  
  this.nuevoTipoPublicidad = function()
  {
	    this.action = true;
	    this.nuevo = !this.nuevo;
	    this.tipoPublicidad = {};		
  };
  
  this.guardar = function(tipoPublicidad,form)
	{
		if(form.$invalid){
      toastr.error('Error al guardar los datos.');
      return;
	  }
		tipoPublicidad.estatus = true;
		tipoPublicidad.campus_id = Meteor.user().profile.campus_id;
		//this.turno.seccion_id = Meteor.user().profile.seccion_id;
		tipoPublicidad.usuarioInserto = Meteor.userId();
		TipoPublicidad.insert(tipoPublicidad);
		toastr.success('Guardado correctamente.');
		this.tipoPublicidad = {}; 
		$('.collapse').collapse('hide');
		this.nuevo = true;
		form.$setPristine();
    form.$setUntouched();
	};
	
	this.editar = function(id)
	{
	    this.tipoPublicidad = TipoPublicidad.findOne({_id:id});
	    if("a" != "B"){
		    this.tipoPublicidad = {nombre : "Prueba"}
	    }
	    this.action = false;
	    $('.collapse').collapse('show');
	    this.nuevo = false;
	};
	
	this.actualizar = function(tipoPublicidad,form)
	{
			if(form.$invalid){
        toastr.error('Error al actualizar los datos del Turno.');
        return;
		  }
			var idTemp = tipoPublicidad._id;
			delete tipoPublicidad._id;		
			tipoPublicidad.usuarioActualizo = Meteor.userId(); 
			TipoPublicidad.update({_id:idTemp},{$set:tipoPublicidad});
			toastr.success('Actualizado correctamente.');
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
	    form.$setUntouched();
	};

	this.cambiarEstatus = function(id)
	{
			var tipoPublicidad = TipoPublicidad.findOne({_id:id});
			if(tipoPublicidad.estatus == true)
				tipoPublicidad.estatus = false;
			else
				tipoPublicidad.estatus = true;
			
			TipoPublicidad.update({_id: id},{$set :  {estatus : tipoPublicidad.estatus}});
  };
	
};
