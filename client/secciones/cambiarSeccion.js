angular
  .module('casserole')
  .controller('CambiarSeccionCtrl', CambiarSeccionCtrl);
 
function CambiarSeccionCtrl($scope, $meteor, $reactive, $state, toastr, $stateParams) {
	let rc = $reactive(this).attach($scope);
	this.parametros = $stateParams;
	this.action = true;  
  this.nuevo = true;
	
  this.subscribe('campus', function(){
		return [{ _id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }]
	});
	
	this.subscribe('secciones', function(){
		return [{campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""}]
	});
		
  this.helpers({
	  secciones : () => {
		  var secciones = Secciones.find().fetch();
		  if(secciones){
			  _.each(secciones, function(seccion){
				  if(seccion._id == Meteor.user().profile.seccion_id){
					  seccion.activo = true;
				  }
			  });
		  }
		  return secciones;
	  },
	   campus : () => {		   
		  return Campus.findOne();
	  }
  });
	
	this.seleccionarSeccion = function(seccion_id){
		var seccionSeleccionada = Secciones.findOne(seccion_id);
		var res = confirm("Está seguro que quiere cambiar a la Sección " + seccionSeleccionada.nombreseccion)
		if(res == true){
			_.each(rc.secciones, function(seccion){
				seccion.activo = false;
			})
			Meteor.users.update({ _id : Meteor.userId()},{ $set : { "profile.seccion_id" : seccion_id}});
			toastr.success('Se ha cambiado de escuela');
			seccionSeleccionada.activo = true;
		}
	}
		
}