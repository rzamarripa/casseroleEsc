angular
.module("casserole")
.controller("ExamenesCtrl", ExamenesCtrl);
function ExamenesCtrl($scope, $meteor, $reactive,  $state, $stateParams, toastr) {
$reactive(this).attach($scope);
  this.action = true;
	

	this.subscribe('examenes',()=>{
		return [{estatus:true}]
	 });
	this.subscribe('maestros',()=>{
		return [{estatus:true}]
	 });
 
  this.helpers({
	  examen : () => {
		  return Examenes.find();
	  },
	  maestros : () => {
		  return Maestros.find();
	  },
	 
  });
  
  this.nuevo = true;  
  this.nuevoExamen = function()
  {
	this.action = true;
    this.nuevo = !this.nuevo;
    this.examen = {}; 
  };
 
	this.guardar = function(examen)
	{
	
		this.examen.estatus = true;
		console.log(this.examen);
		Tareas.insert(this.examen);
		toastr.success('Examen guardada.');
		this.examen = {};
		$('.collapse').collapse('hide');
		this.nuevo = true;
		$state.go('root.examen');
		
	};



	
	this.editar = function(id)
	{
    this.examen = Examenes.findOne({_id:id});
    this.action = false;
    $('.collapse').collapse('show');
    this.nuevo = false;
	};
	
	this.actualizar = function(examen)
	{
		var idTemp = examen._id;
		delete examen._id;		
		Examenes.update({_id:idTemp},{$set:examen});
		$('.collapse').collapse('hide');
		this.nuevo = true;
	};
		
	this.cambiarEstatus = function(id)
	{
		var examen = Tareas.findOne({_id:id});
		if(examen.estatus == true)
			examen.estatus = false;
		else
			examen.estatus = true;
		
		Examenes.update({_id:id}, {$set : {estatus : examen.estatus}});
	};


};