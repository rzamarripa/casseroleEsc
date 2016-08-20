angular.module("casserole")
.controller("CampusDetalleCtrl", CampusDetalleCtrl);  
 function CampusDetalleCtrl($scope, $meteor, $reactive, $state, $stateParams, toastr){
 	$reactive(this).attach($scope);
  this.action = true;
  this.nuevo = true;
  this.parametros = $stateParams;
  //TODO tengo que corregir las subscripciones porque cambia de valor

	this.subscribe('campus', function(){
		return [{
			_id : this.getReactively("parametros.id")
		}]
	});
	
	this.subscribe('secciones', function(){
		return [{
			campus_id : this.getReactively("parametros.id")
		}]
	});

	this.helpers({
	  campus : () => {		  
		  return Campus.findOne();
	  },
	  secciones : () => {
		  return Secciones.find();
	  }
  });
  
  this.guardar = function(campus,form)
	{
		if(form.$invalid){
      toastr.error('No se pudo guardar la información del Campus.');
      return;
		}
		delete campus._id;
		Campus.update({ _id : $stateParams.id }, { $set : campus } );
		
		var nombre = campus.detalle.nombre != undefined ? campus.detalle.nombre + " " : "";
		var apPaterno = campus.detalle.apPaterno != undefined ? campus.detalle.apPaterno + " " : "";
		var apMaterno = campus.detalle.apMaterno != undefined ? campus.detalle.apMaterno : ""
		campus.detalle.nombreCompleto = nombre + apPaterno + apMaterno;
		var usuario = {
			username : campus.detalle.username,
			password : campus.detalle.password,
			profile : {
				nombre : campus.detalle.nombre,
				apPaterno : campus.detalle.apPaterno,
				apMaterno : campus.detalle.apMaterno,
				nombreCompleto : nombre + apPaterno + apMaterno,
				campus_id : $stateParams.id,
				campus_clave : campus.clave,
				estatus : true
			}
		}

		Meteor.call('createGerenteVenta', usuario, 'director');
		toastr.success('Se ha guardado la información del Campus correctamente.');
		this.campus = {}; 
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
	
	this.actualizar = function(campus)
	{
		var idTemp = campus._id;
		delete campus._id;		
		Campus.update({_id:idTemp},{$set:campus});
		$('.collapse').collapse('hide');
		this.nuevo = true;
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
