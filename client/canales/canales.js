angular
  .module('casserole')
  .controller('CanalesCtrl', CanalesCtrl);
 
function CanalesCtrl($scope, $meteor, $reactive, $state, toastr) {
	$reactive(this).attach($scope);
	this.action = true;
	
/*
	$(document).ready(function() {
	  $('.summernote').summernote();
	});
*/
	
	this.subscribe("canales",()=>{
		return [{estatus:true }]
	 });
	

  this.helpers({
	  canales : () => {
		  return Canales.find();
	  }  
  });
    
  this.nuevo = true;
  this.nuevoCanal = function()
  {
	   	this.action = true;
	    this.nuevo = !this.nuevo;
	    this.canal = {};
    
  };

  this.guardar = function(canal)
	{
			canal.estatus = true;
			//medios.usuarioInserto = Meteor.userId();
			Canales.insert(this.canal);
			toastr.success('Guardado correctamente.');
			this.canal = {};
			$('.collapse').collapse('hide');
			this.nuevo = true;
			//form.$setPristine();
	  //  form.$setUntouched();
	};
	
	this.editar = function(id)
	{
	    this.canal = Canales.findOne({_id:id});
	    this.action = false;
	    $('.collapse').collapse('show');
	    this.nuevo = false;
	};
	
	this.actualizar = function(canal,form)
	{
		   
			var idTemp = canal._id;
			delete canal._id;		
			//medios.usuarioActualizo = Meteor.userId(); 
			Canales.update({_id:idTemp},{$set:canal});
			toastr.success('Actualizado correctamente.');
			$('.collapse').collapse('hide');
			this.nuevo = true;
			// form.$setPristine();
	  //   form.$setUntouched();	
	};
		
	this.cambiarEstatus = function(id)
	{
			var canal = Canales.findOne({_id:id});
			if(canal.estatus == true)
				canal.estatus = false;
			else
				canal.estatus = true;
			
			Canales.update({_id:id}, {$set : {estatus : canal.estatus}});

	};
	
}