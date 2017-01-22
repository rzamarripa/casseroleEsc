angular.module("casserole")
.controller("TurnosCtrl", TurnosCtrl);  
 function TurnosCtrl($scope, $meteor, $reactive, $state, $stateParams, toastr){
 	$reactive(this).attach($scope);
  this.action = true;
	this.subscribe('turnos');

	this.helpers({
	  turnos : () => {
		  return Turnos.find();
	  }
	 
  });
  //TODO me quede haciendo la tabla de configuraciones
  this.nuevo = true;	  
  this.nuevoTurno = function()
  {
    this.action = true;
    this.nuevo = !this.nuevo;
    this.turno = {};		
  };
  
  this.guardar = function(turno)
	{
		this.turno.estatus = true;
		Turnos.insert(this.turno);
		toastr.success('Turno guardado.');
		this.turno = {}; 
		$('.collapse').collapse('hide');
		this.nuevo = true;
		$state.go('root.turnos')
	};
	
	this.editar = function(id)
	{
    this.turno = Turnos.findOne({_id:id});
    this.action = false;
    $('.collapse').coll
    this.nuevo = false;
	};
	
	this.actualizar = function(turno)
	{
		var idTemp = turno._id;
		delete turno._id;		
		Turnos.update({_id:idTemp},{$set:turno});
		$('.collapse').collapse('hide');
		this.nuevo = true;
	};

	this.cambiarEstatus = function(id)
	{
		var turno = Turnos.findOne({_id:id});
		if(turno.estatus == true)
			turno.estatus = false;
		else
			turno.estatus = true;
		
		Turnos.update({_id: id},{$set :  {estatus : turno.estatus}});
    };
		
};
