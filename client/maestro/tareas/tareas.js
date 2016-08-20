angular
.module("casserole")
.controller("TareasCtrl", TareasCtrl);
function TareasCtrl($scope, $meteor, $reactive,  $state, $stateParams, toastr) {
$reactive(this).attach($scope);
  this.action = true;

	

	this.subscribe('grupos',()=>{
		return [{estatus:true}]
	 })
	this.subscribe('maestros',()=>{
		return [{estatus:true}]
	 });
		this.subscribe('tareas',()=>{
		return [{ grupo_id : $stateParams.id, estatus:true}]
	});
 
  this.helpers({
	  tareas : () => {
		  return Tareas.find();
	  },
	  maestros : () => {
		  return Maestros.find();
	  },
	   grupo : () => {
		  return Grupos.findOne();
	  },
	 
  });
  
  this.nuevo = true;  
  this.nuevoTarea = function()
  {
	this.action = true;
    this.nuevo = !this.nuevo;
    this.tarea = {}; 
  };
 
	this.guardar = function(tarea)
	{
		var maestro = Maestros.findOne({nombreUsuario:Meteor.user().username});
	    tarea.maestro_id = maestro._id; 

	    tarea.grupo_id = $stateParams.id;
		this.tarea.estatus = true;
		console.log(this.tarea);
		Tareas.insert(this.tarea);
		toastr.success('Tarea guardada.');
		this.tarea = {};
		$('.collapse').collapse('hide');
		this.nuevo = true;
		$state.go('root.tareas');
		
	};


   this.mostrarArchivos= function(id)
	{
		console.log(id);
		rc.nada = nombre;
		this.grupo_id = id;
	};


	
	this.editar = function(id)
	{
    this.tarea = Tareas.findOne({_id:id});
    this.action = false;
    $('.collapse').collapse('show');
    this.nuevo = false;
	};
	
	this.actualizar = function(tarea)
	{
		var idTemp = tarea._id;
		delete tarea._id;		
		Tareas.update({_id:idTemp},{$set:tarea});
		$('.collapse').collapse('hide');
		this.nuevo = true;
	};
		
	this.cambiarEstatus = function(id)
	{
		var tarea = Tareas.findOne({_id:id});
		if(tarea.estatus == true)
			tarea.estatus = false;
		else
			tarea.estatus = true;
		
		Tareas.update({_id:id}, {$set : {estatus : tarea.estatus}});
	};


};