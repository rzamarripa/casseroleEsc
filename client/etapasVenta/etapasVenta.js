angular.module("casserole")
.controller("EtapasVentaCtrl", EtapasVentaCtrl);  
 function EtapasVentaCtrl($scope, $meteor, $reactive, $state, $stateParams, toastr){
 	$reactive(this).attach($scope);
  this.action = true;
	
	this.subscribe('etapasVenta', function(){
		return [{campus_id : Meteor.user().profile.campus_id}];
	});

	this.helpers({
	  etapasVenta : () => {
		  return EtapasVenta.find();
	  }
	 
  });
  	  
  this.nuevo = true;	  
  this.nuevoEtapaVenta = function()
  {
	    this.action = true;
	    this.nuevo = !this.nuevo;
	    this.etapaVenta = {};		
  };

  this.guardar = function(etapaVenta,form)
	{
			if(form.$invalid){
		        toastr.error('Error al guardar los datos.');
		        return;
		  }
			this.etapaVenta.estatus = true;
			etapaVenta.campus_id = Meteor.user().profile.campus_id;
			etapaVenta.usuarioInserto = Meteor.userId();
			EtapasVenta.insert(this.etapaVenta);
			toastr.success('Guardado correctamente.');
			this.etapaVenta = {}; 
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
	    form.$setUntouched();
	};
	
	this.editar = function(id)
	{
	    this.etapaVenta = EtapasVenta.findOne({_id:id});
	    this.action = false;
	    $('.collapse').collapse('show');
	    this.nuevo = false;
	};
	
	this.actualizar = function(etapaVenta,form)
	{
			if(form.$invalid){
		        toastr.error('Error al actualizar los datos.');
		        return;
		  }
			var idTemp = etapaVenta._id;
			delete etapaVenta._id;		
			etapaVenta.usuarioActualizo = Meteor.userId(); 
			EtapasVenta.update({_id:idTemp},{$set:etapaVenta});
			toastr.success('Actualizado correctamente.');
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
	    form.$setUntouched();
	};

	this.cambiarEstatus = function(id)
	{
			var etapaVenta = EtapasVenta.findOne({_id:id});
			if(etapaVenta.estatus == true)
				etapaVenta.estatus = false;
			else
				etapaVenta.estatus = true;
			
			EtapasVenta.update({_id: id},{$set :  {estatus : etapaVenta.estatus}});
  };
		
};
