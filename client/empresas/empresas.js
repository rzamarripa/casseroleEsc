angular
  .module('casserole')
  .controller('EmpresasCtrl', EmpresasCtrl);
 
function EmpresasCtrl($scope, $meteor, $reactive, $state, toastr) {
	$reactive(this).attach($scope);

  this.subscribe('empresas',()=>{
			return [{campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }]
	});
	 
  this.action = true;  
  this.nuevo = true;
  
  this.helpers({
	  empresas : () => {
		  return Empresas.find();
	  }
  });

 
  this.nuevoEmpresa = function()
  {
		  this.action = true;
	    this.nuevo = !this.nuevo;
	    this.empresa = {}; 
  };
  
 this.guardar = function(empresa,form)
	{
			if(form.$invalid){
		        toastr.error('Error al guardar los datos.');
		        return;
		  }
		  empresa.estatus = true;
		  empresa.campus_id = Meteor.user().profile.campus_id;
			empresa.usuarioInserto = Meteor.userId();
			Empresas.insert(empresa);
			toastr.success('Guardado correctamente.');
			this.empresa = {};
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
	    form.$setUntouched();
			$state.go('root.empresas');
	};
	
	this.editar = function(id)
	{
			this.empresa = Empresas.findOne({_id:id});
	    this.action = false;
	    $('.collapse').collapse('show');
	    this.nuevo = false;
		
	};
	
	this.actualizar = function(empresa,form)
	{
			if(form.$invalid){
		        toastr.error('Error al actualizar los datos.');
		        return;
		  }
			var idTemp = empresa._id;
			delete empresa._id;		
			empresa.usuarioActualizo = Meteor.userId(); 
			Ciclos.update({_id:idTemp},{$set:empresa});
			toastr.success('Actualizado correctamente.');
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
	    form.$setUntouched();
	};
		
	this.cambiarEstatus = function(id)
	{
			var empresa = Empresas.findOne({_id:id});
			if(empresa.estatus == true)
				 empresa.estatus = false;
			else
				empresa.estatus = true;
			Empresas.update({_id:id}, {$set : {estatus : empresa.estatus}});
	};
	   //  this.remove = function(empresa)
       // {
       //     this.empresa.estatus = false;
       //     this.empresas.save(empresa);
       // };
}