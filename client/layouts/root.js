angular.module("casserole").controller("RootCtrl", RootCtrl);  
function RootCtrl($scope, $meteor, $reactive, $state, $stateParams, toastr){
	let rc = $reactive(this).attach($scope); 
	this.usuarioActual = {};
	this.avisosVentana = "none";
	this.hoy = new Date();
	
	if(Meteor.user() && Meteor.user().roles && Meteor.user().roles[0] != "admin"){

		this.subscribe('campus', function(){
			return [{
				_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""
			}]
		});
		
		this.subscribe('avisos', function(){
			return [{
				estatus : true
			}]
		});
		
		this.subscribe('secciones', function(){
			return [{
				_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : ""
			}]
		});
				
		this.helpers({
			campus : () => {
			  return Campus.findOne(Meteor.user().profile.campus_id);
			},
			seccion : () => {
			  return Secciones.findOne(Meteor.user().profile.seccion_id);
			},
			avisos : () => {
			  return Avisos.find();
			}
		});
	}
	
	this.autorun(function() {
 	
    if(Meteor.user() && Meteor.user()._id){
      rc.usuarioActual=Meteor.user();
    }
    
  });
  
	this.muestraAvisos = function(){
	  if(rc.avisosVentana == "none"){
		  rc.avisosVentana = "block";
	  }else{
		  rc.avisosVentana = "none";
	  }
  }
};