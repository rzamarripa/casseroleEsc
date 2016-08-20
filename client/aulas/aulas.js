angular.module("casserole")
.controller("AulasCtrl", AulasCtrl);  
 function AulasCtrl($scope, $meteor, $reactive, $state, $stateParams, toastr){
 	$reactive(this).attach($scope);
  this.action = true;
	this.subscribe('aulas',()=>{
		return [{campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }]
	 });

	this.helpers({
	  aulas : () => {
		  return Aulas.find();
	  }
  });
  	  
  this.nuevo = true;	  
  this.nuevoAula = function()
  {
	    this.action = true;
	    this.nuevo = !this.nuevo;
	    this.aula = {};		
  };
  
  this.guardar = function(aula,form)
	{
			if(form.$invalid){
		        toastr.error('Error al guardar los datos.');
		        return;
		  }
			aula.estatus = true;
			aula.campus_id = Meteor.user().profile.campus_id;
			//this.aula.seccion_id = Meteor.user().profile.seccion_id;
			aula.usuarioInserto = Meteor.userId();	
			Aulas.insert(aula);
			toastr.success('Guardado correctamente.');
			aula = {}; 
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
	    form.$setUntouched();
			$state.go('root.aulas')
	};
	
	this.editar = function(id)
	{
	    this.aula = Aulas.findOne({_id:id});
	    this.action = false;
	    $('.collapse').collapse('show');
	    this.nuevo = false;
	};
	
	this.actualizar = function(aula,form)
	{
			if(form.$invalid){
		        toastr.error('Error al actualizar los datos.');
		        return;
		  }
			var idTemp = aula._id;
			delete aula._id;		
			aula.usuarioActualizo = Meteor.userId(); 
			Aulas.update({_id:idTemp},{$set:aula});
			toastr.success('Actualizado correctamente.');
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
	    form.$setUntouched();
	};

	this.cambiarEstatus = function(id)
	{
		var aula = Aulas.findOne({_id:id});
		if(aula.estatus == true)
			aula.estatus = false;
		else
			aula.estatus = true;
		
		Aulas.update({_id: id},{$set :  {estatus : aula.estatus}});
    };
		
};
