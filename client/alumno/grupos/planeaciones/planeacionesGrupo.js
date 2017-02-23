angular
.module("casserole")
.controller("PlaneacionesGrupoCtrl", PlaneacionesGrupoCtrl);
 function PlaneacionesGrupoCtrl($scope, $meteor, $reactive , $state, $stateParams, toastr){
 	let rc = $reactive(this).attach($scope);

 	this.hoy = new Date();
	this.grupos = [];
	window.rc = rc;
	
	this.subscribe('grupos', () => {		
		return [{
			estatus : true, _id : $stateParams.grupo_id
		}]
	});
	
	this.subscribe('maestros', () => {		
		return [{
			estatus : true, _id : $stateParams.maestro_id
		}]
	});
	
	this.subscribe('materias', () => {		
		return [{
			estatus : true, _id : $stateParams.materia_id
		}]
	});
	
	this.subscribe('planeaciones', () => {		
		return [{ $or : [{estatus : 4}, {estatus : 7}],
			grupo_id : $stateParams.grupo_id, materia_id : $stateParams.materia_id, maestro_id : $stateParams.maestro_id
		}]
	});

	this.helpers({
		grupo : () => {
			return Grupos.findOne({_id : $stateParams.grupo_id});
		},
		maestro : () => {
			return Maestros.findOne({_id : $stateParams.maestro_id});
		},
		materia : () => {
			return Materias.findOne({_id : $stateParams.materia_id});
		},
		planeaciones : () => {
			return Planeaciones.find().fetch();
		}
  });
  
  this.hora = function(fecha){
  	var ahora = new Date();
  	var minuto = 60 * 1000;
  	var hora = minuto * 60;
  	var dia = hora * 24;
  	var anio = dia * 365;
  	var diferencia = ahora-fecha;
  	if(diferencia < minuto)
  		return "Hace menos de un minuto"
  	else if(diferencia < hora)
  		return "Hace "+Math.round(diferencia/minuto)+" minutos"
  	else if(diferencia < dia)
  		return "Hace "+Math.round(diferencia/hora)+" horas"
  	else if(diferencia < anio)
  		return "Hace "+Math.round(diferencia/dia)+" días"
  	else
  		return "Hace mucho tiempo"
  }
  
  this.tieneFoto = function(sexo, foto){
	  if(foto === undefined){
		  if(sexo === "masculino")
			  return "img/badmenprofile.png";
			else if(sexo === "femenino"){
				return "img/badgirlprofile.png";
			}else{
				return "img/badprofile.png";
			}
			  
	  }else{
		  return foto;
	  }
  }
  
  this.meGusta = function(planeacion){
	  console.log(planeacion);
	  Meteor.apply("meGustaPlaneacion", [planeacion, Meteor.userId()], function(error, result){
		  if(result){
			  toastr.success("Gracias por calificar la planeación.")
		  }else{
			  toastr.error("No se pudo registrar la acción.")
		  }
		  $scope.$apply();
	  })
  }
  
  this.meGusto = function(planeacion){
	  var res = false;
	  _.each(planeacion.quienMeGusta, function(quien){
		  if(quien == Meteor.userId()){
			  console.log("entré aquí");
			  res = true;
		  }
	  });
	  
	  return res;
  }
  
  this.noMeGusta = function(planeacion){
	  Meteor.apply("noMeGustaPlaneacion", [planeacion, Meteor.userId()], function(error, result){
		  if(result){
			  toastr.success("Gracias por calificar la planeación.")
		  }else{
			  toastr.error("No se pudo registrar la acción.")
		  }
		  $scope.$apply();
	  })
  }
  
  this.noMeGusto = function(planeacion){
	  var res = false;
	  _.each(planeacion.quienNoMeGusta, function(quien){
		  if(quien == Meteor.userId()){
			  res = true;
		  }
	  });
	  
	  return res;
  }
  
  
};