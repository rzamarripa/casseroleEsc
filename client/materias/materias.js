angular
  .module('casserole')
  .controller('MateriasCtrl', MateriasCtrl);
 
function MateriasCtrl($scope, $meteor, $reactive, $state, toastr) {
	$reactive(this).attach($scope);
	this.action = true;
	
/*
	$(document).ready(function() {
	  $('.summernote').summernote();
	});
*/
	
	this.subscribe("materias",()=>{
		return [{seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : "" }]
	 });
	this.subscribe("deptosAcademicos",()=>{
		return [{estatus:true, seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : "" }]
	 });

  this.helpers({
	  materias : () => {
		  return Materias.find();
	  },
		deptosAcademicos : () => {
		  return DeptosAcademicos.find();
	  }	  
  });
    
  this.nuevo = true;
  this.nuevaMateria = function()
  {
	   	this.action = true;
	    this.nuevo = !this.nuevo;
	    this.materia = {};
    
  };
/*
  this.submit = function(){
  		console.log("entro al submit");
  		this.submitted=true;
  		console.log(this.validForm);
  		if(this.validForm)
  			this.guardar(this.materia)
  }
*/
  
  this.guardar = function(materia,form)
	{
			if(form.$invalid){
	      toastr.error('Error al guardar los datos.');
	      return;
		  }
			materia.estatus = true;
			materia.campus_id = Meteor.user().profile.campus_id;
			materia.seccion_id = Meteor.user().profile.seccion_id;
			materia.usuarioInserto = Meteor.userId();
			Materias.insert(this.materia);
			toastr.success('Guardado correctamente.');
			this.materia = {};
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
	    form.$setUntouched();
	};
	
	this.editar = function(id)
	{
	    this.materia = Materias.findOne({_id:id});
	    this.action = false;
	    $('.collapse').collapse('show');
	    this.nuevo = false;
	};
	
	this.actualizar = function(materia,form)
	{
			if(form.$invalid){
		        toastr.error('Error al actualizar los datos.');
		        return;
		  }
			var idTemp = materia._id;
			delete materia._id;		
			materia.usuarioActualizo = Meteor.userId(); 
			Materias.update({_id:idTemp},{$set:materia});
			toastr.success('Actualizado correctamente.');
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
	    form.$setUntouched();	
	};
		
	this.cambiarEstatus = function(id)
	{
			var materia = Materias.findOne({_id:id});
			if(materia.estatus == true)
				materia.estatus = false;
			else
				materia.estatus = true;
			
			Materias.update({_id:id}, {$set : {estatus : materia.estatus}});

	};
	
	this.getDeptoAcademico = function(depto_id){
			var depto = Departamentos.findOne(DeptosAcademicos, depto_id, false);
			return depto.descripcion;
	};
	
}