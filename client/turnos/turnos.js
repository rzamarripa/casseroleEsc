angular.module("casserole")
.controller("TurnosCtrl", TurnosCtrl);  
 function TurnosCtrl($scope, $meteor, $reactive, $state, $stateParams, toastr){
 	$reactive(this).attach($scope);
  this.action = true;
	this.subscribe('turnos',()=>{
		return [{campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }]
	 });

	this.helpers({
	  turnos : () => {
		  return Turnos.find({campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" });
	  }
  });
  	  
  this.nuevo = true;	  
  this.nuevoTurno = function()
  {
    this.action = true;
    this.nuevo = !this.nuevo;
    this.turno = {};		
  };
  
  this.guardar = function(turno,form)
	{
		if(form.$invalid){
	        toastr.error('Error al guardar los datos.');
	        return;
	  }
		turno.estatus = true;
		var diaFinal = (turno.diaFinal == undefined || turno.diaFinal == "") ? "" : "-" + turno.diaFinal
		turno.nombre = turno.diaInicial + diaFinal;
		turno.campus_id = Meteor.user().profile.campus_id;
		//this.turno.seccion_id = Meteor.user().profile.seccion_id;
		turno.usuarioInserto = Meteor.userId();
		Turnos.insert(turno);
		toastr.success('Guardado correctamente.');
		this.turno = {}; 
		$('.collapse').collapse('hide');
		this.nuevo = true;
		form.$setPristine();
    form.$setUntouched();
		$state.go('root.turnos')
	};
	
	this.editar = function(id)
	{
    this.turno = Turnos.findOne({_id:id});
    this.action = false;
    $('.collapse').collapse('show');
    this.nuevo = false;
	};
	
	this.actualizar = function(turno,form)
	{
		if(form.$invalid){
      toastr.error('Error al actualizar los datos del Turno.');
      return;
    }
		var idTemp = turno._id;
		delete turno._id;		
		var diaFinal = (turno.diaFinal == undefined || turno.diaFinal == "") ? "" : "-" + turno.diaFinal
		turno.nombre = turno.diaInicial + diaFinal;
		console.log(diaFinal)
		turno.usuarioActualizo = Meteor.userId(); 
		Turnos.update({_id:idTemp},{$set:turno});
		toastr.success('Actualizado correctamente.');
		$('.collapse').collapse('hide');
		this.nuevo = true;
		form.$setPristine();
    form.$setUntouched();
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
