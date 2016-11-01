angular
  .module('casserole')
  .controller('RvoeCtrl', RvoeCtrl);
 
function RvoeCtrl($scope, $meteor, $reactive, $state, toastr) {
	$reactive(this).attach($scope);
  this.action = true;
	this.subscribe('rvoe',()=>{
		return [{seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : ""}]
	 });
  
  this.helpers({
	  rvoes : () => {
		  return Rvoe.find({seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : ""});
	  }
  });
  	  
  this.nuevo = true;	  
  this.nuevoRvoe = function()
  {
	    this.action = true;
	    this.nuevo = !this.nuevo;
	    this.rvoe = {};		
  };
	
  this.guardar = function(rvoe,form)
	{
			if(form.$invalid){
		        toastr.error('Error al guardar los datos.');
		        return;
		  }
			rvoe.estatus = true;
		  rvoe.campus_id = Meteor.user().profile.campus_id;
		  rvoe.seccion_id = Meteor.user().profile.seccion_id;
		  rvoe.usuarioInserto = Meteor.userId();
			Rvoe.insert(rvoe);
			toastr.success('Guardado correctamente.');
			rvoe = {};
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
	    form.$setUntouched();
			$state.go('root.rvoe');
	};
	
	this.editar = function(id)
	{
	    this.rvoe = Rvoe.findOne({_id:id});
	    this.action = false;
	    $('.collapse').collapse('show');
	    this.nuevo = false;
	};
	
	this.actualizar = function(rvoe,form)
	{
			if(form.$invalid){
		        toastr.error('Error al actualizar los datos.');
		        return;
		  }
			var idTemp = rvoe._id;
			delete rvoe._id;		
			rvoe.usuarioActualizo = Meteor.userId(); 
			Rvoe.update({_id:idTemp},{$set:rvoe});
			toastr.success('Actualizado correctamente.');
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
	    form.$setUntouched();
	};
		
	this.cambiarEstatus = function(id)
	{
			var rvoe = Rvoe.findOne({_id:id});
			if(rvoe.estatus == true)
				rvoe.estatus = false;
			else
				rvoe.estatus = true;
			
			Rvoe.update({_id:id}, {$set : {estatus : rvoe.estatus}});
	};
	
};