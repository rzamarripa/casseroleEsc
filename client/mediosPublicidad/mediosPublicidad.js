angular
  .module('casserole')
  .controller('MediosPublicidadCtrl', MediosPublicidadCtrl);
 
function MediosPublicidadCtrl($scope, $meteor, $reactive, $state, toastr) {
	$reactive(this).attach($scope);
	this.action = true;
	
/*
	$(document).ready(function() {
	  $('.summernote').summernote();
	});
*/
	
	this.subscribe("mediosPublicidad",()=>{
		return [{estatus:true }]
	 });
	

  this.helpers({
	  mediosPublicidad : () => {
		  return MediosPublicidad.find();
	  },
		deptosAcademicos : () => {
		  return DeptosAcademicos.find();
	  }	  
  });
    
  this.nuevo = true;
  this.nuevamedios = function()
  {
	   	this.action = true;
	    this.nuevo = !this.nuevo;
	    this.medios = {};
    
  };

  this.guardar = function(medios)
	{
			medios.estatus = true;
			//medios.usuarioInserto = Meteor.userId();
			MediosPublicidad.insert(this.medios);
			toastr.success('Guardado correctamente.');
			this.medios = {};
			$('.collapse').collapse('hide');
			this.nuevo = true;
			//form.$setPristine();
	  //  form.$setUntouched();
	};
	
	this.editar = function(id)
	{
	    this.medios = MediosPublicidad.findOne({_id:id});
	    this.action = false;
	    $('.collapse').collapse('show');
	    this.nuevo = false;
	};
	
	this.actualizar = function(medios,form)
	{
		   
			var idTemp = medios._id;
			delete medios._id;		
			//medios.usuarioActualizo = Meteor.userId(); 
			MediosPublicidad.update({_id:idTemp},{$set:medios});
			toastr.success('Actualizado correctamente.');
			$('.collapse').collapse('hide');
			this.nuevo = true;
			// form.$setPristine();
	  //   form.$setUntouched();	
	};
		
	this.cambiarEstatus = function(id)
	{
			var medios = MediosPublicidad.findOne({_id:id});
			if(medios.estatus == true)
				medios.estatus = false;
			else
				medios.estatus = true;
			
			MediosPublicidad.update({_id:id}, {$set : {estatus : medios.estatus}});

	};
	
	this.getDeptoAcademico = function(depto_id){
			var depto = Departamentos.findOne(DeptosAcademicos, depto_id, false);
			return depto.descripcion;
	};
	
}