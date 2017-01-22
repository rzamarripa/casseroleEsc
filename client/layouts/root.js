angular.module("casserole").controller("RootCtrl", RootCtrl);  
function RootCtrl($scope, $meteor, $reactive, $state, $stateParams, toastr){
	let rc = $reactive(this).attach($scope); 
	this.usuarioActual = {};
	this.avisosVentana = "none";
	this.grupos_id = [];
	this.hoy = new Date();
	
	if(Meteor.user() && Meteor.user().roles && Meteor.user().roles[0] == "director"){
		// Director
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
	}else if(Meteor.user() && Meteor.user().roles && Meteor.user().roles[0] == "coordinadorFinanciero"){
		// Coordinador Financiero
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
	}else if(Meteor.user() && Meteor.user().roles && Meteor.user().roles[0] == "coordinadorAcademico"){
		// Coordinador Académico
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
	}else if(Meteor.user() && Meteor.user().roles && Meteor.user().roles[0] == "vendedor"){ 
		// Vendedores

		this.subscribe('campus', function(){
			return [{
				_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""
			}]
		});
		
		this.subscribe('mensajesVendedores', function(){
			return [{
				estatus : true, destinatario_id : Meteor.userId()
			}]
		});
		
		this.helpers({
			campus : () => {
			  return Campus.findOne(Meteor.user().profile.campus_id);
			},
			avisos : () => {
			  return MensajesVendedores.find().fetch();
			}
		});
		
	}else if(Meteor.user() && Meteor.user().roles && Meteor.user().roles[0] == "maestro"){ 
		// Maestros
		
		this.subscribe("grupos", function(){
			return [{
				estatus : true, campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""
			}]
		});
		
		this.subscribe("turnos", function(){
			return [{
				estatus : true, campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""
			}]
		});
		
		this.helpers({
			grupos : () => {
				return Grupos.find();
			},
			gruposMaestro : () => {
				var gruposMaestros = [];
				if(this.getReactively("grupos")){
					_.each(rc.grupos, function(grupo){
						_.each(grupo.asignaciones, function(asignacion){
							if(asignacion.maestro_id == Meteor.user().profile.maestro_id && asignacion.estatus == true){
								gruposMaestros.push({
									grupo : grupo,
									asignacion : asignacion,
									turno : Turnos.findOne(grupo.turno_id)
								})
							}
						})
					});
					return gruposMaestros;
				}
				
			}
		})
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
  
  this.fechaTitulo = function(date){
		moment.locale("es");
    return moment(date).calendar();
	}
	
	this.cambiarEstatus = function(aviso_id){
		var aviso = MensajesVendedores.findOne(aviso_id);
		if(aviso){
			MensajesVendedores.update({_id : aviso_id}, { $set : {estatus : !aviso.estatus}});
			if(aviso.estatus){
				toastr.success("Mensaje leído.");
			}else{
				toastr.info("Mensaje no leído");
			}
		}
		
	}
};