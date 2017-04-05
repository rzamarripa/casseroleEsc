angular.module("casserole")
.controller("PagosVacacionesCtrl", PagosVacacionesCtrl);  
	function PagosVacacionesCtrl($scope, $meteor, $reactive, $state, $stateParams, toastr){
	let rc = $reactive(this).attach($scope);
	this.nuevo = true;
	this.pagoVacaciones = {};
 	
 	this.subscribe('secciones', function(){
		return [{
			estatus : true
		}]
	});
	
	this.subscribe('pagoVacaciones', function(){
		return [{
			estatus : true
		}]
	});

	this.helpers({
	  secciones : () => {
		  return Secciones.find();
	  },
	  vacaciones : () => {
		  var vaca = PagoVacaciones.find().fetch();
		  if(vaca){
			  _.each(vaca, function(v){
				  v.seccion = Secciones.findOne(v.seccion_id);
			  });
		  }
		  return vaca;
	  }
  });
  
  this.nuevoPagoVacaciones = function()
  {
    this.action = true;
    this.nuevo = !this.nuevo;
    this.pagoVacacion = {};
  };
  
  this.guardar = function(pagoVacacion,form)
	{
		if(form.$invalid){
			toastr.error('Error al guardar los datos.');
			return;
	    }
		pagoVacacion.estatus = true;
		pagoVacacion.usuarioInserto = Meteor.userId();
		pagoVacacion.fechaCreacion = new Date();
		PagoVacaciones.insert(pagoVacacion);
		pagoVacacion = {};
		rc.nuevo = true;
		$('.collapse').collapse('hide');
		toastr.success("Guardado correctamente");			
	};
	
	this.editar = function(id)
	{
	    this.pagoVacacion = PagoVacaciones.findOne({_id:id});
	    this.action = false;
	    $('.collapse').collapse('show');
	    this.nuevo = false;
	};
	
	this.actualizar = function(pagoVacacion,form)
	{
		  if(form.$invalid){
	        toastr.error('Error al actualizar los datos.');
	        return;
	    }
		  var idTemp = pagoVacacion._id;
		  delete pagoVacacion._id;
		  pagoVacacion.usuarioActualizo = Meteor.userId(); 
		  PagoVacaciones.update({_id:idTemp},{$set:pagoVacacion});
		  toastr.success('Actualizado correctamente.');
		  $('.collapse').collapse('hide');
		  this.nuevo = true;
	};

	this.cambiarEstatus = function(id)
	{
		var pagoVacacion = PagoVacaciones.findOne({_id:id});
		if(pagoVacacion.estatus == true)
			pagoVacacion.estatus = false;
		else
			pagoVacacion.estatus = true;
		
		PagoVacaciones.update({_id: id},{$set :  {estatus : pagoVacacion.estatus}});
  };
};
