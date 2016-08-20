angular.module("casserole")
.controller("DocumentosCtrl", DocumentosCtrl);  
 function DocumentosCtrl($scope, $meteor, $reactive, $state, $stateParams, toastr){
 	$reactive(this).attach($scope);
  this.action = true;
	this.subscribe('documentos',()=>{
		return [{campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""}]
	 });


	this.helpers({
	  documentos : () => {
		  return Documentos.find();
	  }
  });
  	  
  this.nuevo = true;	  
  this.nuevoDocumento = function()
  {
	    this.action = true;
	    this.nuevo = !this.nuevo;
	    this.documento = {};		
  };
  
  this.guardar = function(documento,form)
	{
			if(form.$invalid){
		        toastr.error('Error al guardar los datos.');
		        return;
		  }
			documento.estatus = true;
			documento.campus_id = Meteor.user().profile.campus_id;
			documento.usuarioInserto = Meteor.userId();
			Documentos.insert(this.documento);
			toastr.success('Guardado correctamente.');
			documento = {}; 
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
	    form.$setUntouched();
			$state.go('root.documentos')
	};
	
	this.editar = function(id)
	{
	    this.documento = Documentos.findOne({_id:id});
	    this.action = false;
	    $('.collapse').collapse('show');
	    this.nuevo = false;
	};
	
	this.actualizar = function(documento,form)
	{
			if(form.$invalid){
		        toastr.error('Error al actualizar los datos.');
		        return;
		  }
			var idTemp = documento._id;
			delete documento._id;		
			ciclo.usuarioActualizo = Meteor.userId(); 
			Documentos.update({_id:idTemp},{$set:documento});
			toastr.success('Actualizado correctamente.');
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
	    form.$setUntouched();
	};

	this.cambiarEstatus = function(id)
	{
		var documento = Documentos.findOne({_id:id});
		if(documento.estatus == true)
			documento.estatus = false;
		else
			documento.estatus = true;
		
		Documentos.update({_id: id},{$set :  {estatus : documento.estatus}});
    };
		
};
