angular.module("casserole")
.controller("CampusCtrl", CampusCtrl);  
 function CampusCtrl($scope, $meteor, $reactive, $state, $stateParams, toastr){
 	let rc = $reactive(this).attach($scope);
  this.action = true;
  this.nuevo = true;
  this.campus = {};

	this.subscribe('campus', function(){
		return [{}]
	});

	this.helpers({
	  	campuses : () => {
		  	return Campus.find();
			}
  });
  
  this.nuevoCampus = function()
  {
	    this.action = true;
	    this.nuevo = !this.nuevo;
	    this.campus = {};		
	    var cantidad = Campus.find().count();
		  if(cantidad > 0){
			  var ultimo = Campus.findOne({}, {sort: {fechaCreacion:-1}});
			  if(ultimo){
				  anterior = parseInt(ultimo.clave) + 1;
				  anterior = '' + anterior;
	
				  for(var i = 0; i <= ultimo.clave.length; i++){
					  if(anterior.length <= 1){
						  anterior = "0" + anterior;
					  }
				  }
			  	rc.campus.clave = anterior;
			  }
		  }else{
			  rc.campus.clave = "01";
		  }
  };
  
  this.guardar = function(campus,form)
	{
			if(form.$invalid){
				toastr.error('Error al guardar los datos.');
				return;
		    }
			campus.estatus = true;
			campus.usuarioInserto = Meteor.userId();
			campus.fechaCreacion = new Date();
			Campus.insert(this.campus);
			toastr.success('Guardado correctamente.');
			this.campus = {}; 
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
			form.$setUntouched();
	};
	
	this.editar = function(id)
	{
	    this.campus = Campus.findOne({_id:id});
	    this.action = false;
	    $('.collapse').collapse('show');
	    this.nuevo = false;
	};
	
	this.actualizar = function(campus,form)
	{
		  if(form.$invalid){
	        toastr.error('Error al actualizar los datos.');
	        return;
	    }
		  var idTemp = campus._id;
		  delete campus._id;
		  campus.usuarioActualizo = Meteor.userId(); 
		  Campus.update({_id:idTemp},{$set:campus});
		  toastr.success('Actualizado correctamente.');
		  $('.collapse').collapse('hide');
		  this.nuevo = true;
		  form.$setPristine();
      form.$setUntouched();
	};

	this.cambiarEstatus = function(id)
	{
		var campus = Campus.findOne({_id:id});
		if(campus.estatus == true)
			campus.estatus = false;
		else
			campus.estatus = true;
		
		Campus.update({_id: id},{$set :  {estatus : campus.estatus}});
  };
		
};
