angular.module("casserole")
.controller("EscuelaCtrl", EscuelaCtrl);  
 function EscuelaCtrl($scope, $meteor, $reactive, $state, $stateParams, toastr){
 	$reactive(this).attach($scope);
  this.action = true;
  this.nuevo = true;	  
  
	this.subscribe('escuelas',()=>{
		return [{campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }]
	 });
	 
	this.helpers({
	  escuelas : () => {
		  return Escuelas.find();
	  }
  }); 
  
  this.nuevoEscuelas = function()
  {
    this.action = true;
    this.nuevo = false;
    this.escuela = {};		
  };
  
  this.guardar = function(escuela,form)
	{
			if(form.$invalid){
		        toastr.error('Error al guardar los datos.');
		        return;
		  }
			escuela.estatus = true;
			escuela.campus_id = Meteor.user().profile.campus_id;
			escuela.usuarioInserto = Meteor.userId();
			Escuelas.insert(escuela);
			toastr.success('Guardado correctamente.');
			this.escuela = {}; 
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
	    form.$setUntouched();
		
	};
	
	this.editar = function(id)
	{
	    this.escuela = Escuelas.findOne({_id:id});
	    this.action = false;
	    $('.collapse').collapse('show');
	    this.nuevo = false;
	};
	
	this.actualizar = function(escuela,form)
	{
			if(form.$invalid){
		        toastr.error('Error al actualizar los datos.');
		        return;
		  }
			var idTemp = escuela._id;
			delete escuela._id;		
			escuela.usuarioActualizo = Meteor.userId(); 
			Escuelas.update({_id:idTemp},{$set : escuela});
			toastr.success('Actualizado correctamente.');
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
      form.$setUntouched();
	};

	this.cambiarEstatus = function(id)
	{
			var escuela = Escuelas.findOne({_id:id});
			if(escuela.estatus == true)
				escuela.estatus = false;
			else
				escuela.estatus = true;
			
			Escuelas.update({_id: id},{$set :  {estatus : escuela.estatus}});
  };	
};

/*

{
	cantidadPeriodos : 110,
	tipoPeriodo : "semana",
	fechaInicio : new Date(),
	importe : 550,
	opciones : [
		{
			cantidadPeriodo : 7,
			tipoRecardo : "dias",
			operador : "+",
			importe : 50
		},
		{
			cantidadPeriodo : 7,
			tipoRecargo : "dias",
			operador : "-",
			importe : 50
		}
	]
}

var stooges = [
			{name: 'moe', age: 40}, 
			{name: 'larry', age: 50}, 
			{name: 'curly', age: 60}
		];
_.sortBy(stooges, 'name');

[
	{name: 'curly', age: 60}, 
	{name: 'larry', age: 50}, 
	{name: 'moe', age: 40}
];

*/
