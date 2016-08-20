angular
  .module('casserole')
  .controller('TitulosCtrl', TitulosCtrl);
 
function TitulosCtrl($scope, $meteor, $reactive, $state, toastr) {
	$reactive(this).attach($scope);

  this.subscribe("titulos",()=>{
		return [{campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }]
	 });

  this.action = true;  
	this.nuevo = true;
	
  this.helpers({
	  titulos : () => {
		  return Titulos.find();
	  }
  });

  this.nuevoTitulo = function()
  {
	    this.action = true;
	    this.nuevo = !this.nuevo;
	    this.titulo = {}; 
	};
  
  this.guardar = function(titulo,form)
	{
			if(form.$invalid){
		        toastr.error('Error al guardar los datos.');
		        return;
		  }
			titulo.estatus = true;
			titulo.campus_id = Meteor.user().profile.campus_id;
			titulo.usuarioInserto = Meteor.userId();
			Titulos.insert(titulo);
			toastr.success('Guardado correctamente.');
			this.titulo = {};
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
	    form.$setUntouched();
			$state.go('root.titulos');
	};
	
	this.editar = function(id)
	{
			this.titulo = Titulos.findOne({_id:id});
	    this.action = false;
	    $('.collapse').collapse('show');
	    this.nuevo = false;
		
	};
	
	this.actualizar = function(titulo,form)
	{
			if(form.$invalid){
		        toastr.error('Error al actualizar los datos.');
		        return;
		    }
			var idTemp = titulo._id;
			delete titulo._id;	
			titulo.usuarioActualizo = Meteor.userId(); 
			Titulos.update({_id:idTemp},{$set:titulo});
			toastr.success('Actualizado correctamente.');
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
	    form.$setUntouched();
		
	};

	this.cambiarEstatus = function(id)
	{
			var titulo = Titulos.findOne({_id:id});
			if(titulo.estatus == true)
				titulo.estatus = false;
			else
				titulo.estatus = true;
			
			Titulos.update({_id: id},{$set :  {estatus : titulo.estatus}});		
    };
		
}