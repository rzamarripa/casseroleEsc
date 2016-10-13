angular
  .module('casserole')
  .controller('CategoriasForosCtrl', CategoriasForosCtrl);
 
function CategoriasForosCtrl($scope, $meteor, $reactive, $state, toastr) {
	$reactive(this).attach($scope);
	this.action = true;
	this.nuevo = true;
	
	this.subscribe("categoriasForos",()=>{
		return [{seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : "" }]
	 });

  this.helpers({
	  categoriasForos : () => {
		  return CategoriasForos.find();
	  }	  
  });
  
  this.nuevaCategoria = function()
  {
	   	this.action = true;
	    this.nuevo = !this.nuevo;
	    this.categoria = {};
    
  };
  
  this.guardar = function(categoria,form)
	{
			if(form.$invalid){
	      toastr.error('Error al guardar los datos.');
	      return;
		  }
			categoria.estatus = true;
			categoria.campus_id = Meteor.user().profile.campus_id;
			categoria.seccion_id = Meteor.user().profile.seccion_id;
			categoria.usuarioInserto = Meteor.userId();
			CategoriasForos.insert(this.categoria);
			toastr.success('Guardado correctamente.');
			this.categoria = {};
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
	    form.$setUntouched();
	};
	
	this.editar = function(id)
	{
	    this.categoria = CategoriasForos.findOne({_id:id});
	    this.action = false;
	    $('.collapse').collapse('show');
	    this.nuevo = false;
	};
	
	this.actualizar = function(categoria,form)
	{
			if(form.$invalid){
		        toastr.error('Error al actualizar los datos.');
		        return;
		  }
			var idTemp = categoria._id;
			delete categoria._id;		
			categoria.usuarioActualizo = Meteor.userId(); 
			CategoriasForos.update({_id:idTemp},{$set:categoria});
			toastr.success('Actualizado correctamente.');
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
	    form.$setUntouched();	
	};
		
	this.cambiarEstatus = function(id)
	{
			var categoria = CategoriasForos.findOne({_id:id});
			if(categoria.estatus == true)
				categoria.estatus = false;
			else
				categoria.estatus = true;
			
			CategoriasForos.update({_id:id}, {$set : {estatus : categoria.estatus}});
	};	
}