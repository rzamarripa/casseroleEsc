angular
  .module('casserole')
  .controller('AvisosCtrl', AvisosCtrl);
 
function AvisosCtrl($scope, $meteor, $reactive, $state, toastr) {
	$reactive(this).attach($scope);
	this.action = true;
	
	this.subscribe('avisos',()=>{
		return [{}]
	});
  
  this.subscribe('campus',()=>{
		return [{estatus:true}]
	 });
  
  this.helpers({
		avisos : () => {
		  return Avisos.find();
	  },
	  campus : () => {
		  return Campus.find();
	  }
  });
  
  	  
  this.nuevo = true;	  
  this.nuevoAviso = function()
  {
    this.action = true;
    this.nuevo = !this.nuevo;
    this.aviso = {};		
  };
	
  this.guardar = function(aviso,form)
	{			
			if(form.$invalid){
	      toastr.error('Error al guardar los datos.');
	      return;
	    }
			
			aviso.estatus = true;
			aviso.estadoEnvio = "Enviado";
			aviso.fecha = new Date();
			aviso.campus_id = Meteor.user().profile.campus_id;
			aviso.usuarioInserto = Meteor.userId();
			Avisos.insert(aviso);
			toastr.success('Guardado correctamente.');
			aviso = {};
			$('.collapse').collapse('hide');
			this.nuevo = true;
			$state.go('root.avisos');
			form.$setPristine();
	    form.$setUntouched();
	    
	};
	
	this.editar = function(id)
	{
	    this.aviso = Avisos.findOne({_id:id});
	    this.action = false;
	    $('.collapse').collapse('show');
	    this.nuevo = false;
	};
	
	this.actualizar = function(aviso,form)
	{
	    if(form.$invalid){
	        toastr.error('Error al actualizar los datos.');
	        return;
	    }
		  var idTemp = aviso._id;
			delete aviso._id;		
			aviso.usuarioActualizo = Meteor.userId(); 
			Avisos.update({_id:idTemp},{$set:aviso});
			toastr.success('Actualizado correctamente.');
			//console.log(aviso);
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
	    form.$setUntouched();
	};
		
	this.cambiarEstatus = function(id)
	{
			var aviso = Avisos.findOne({_id:id});
			if(aviso.estatus == true)
				aviso.estatus = false;
			else
				aviso.estatus = true;
			
			Avisos.update({_id:id}, {$set : {estatus : aviso.estatus}});
	};
	
	this.getCampus = function(campusIds){
		  
		  var campusString ="";
		  for (i = 0; i < campusIds.length; i++)
		  {
			   var campu = Campus.findOne(campusIds[i]);
				 if (campu)
				 		campusString = campusString + campu.nombre + ", ";	
		  }
		 	return campusString; 	
	};
};