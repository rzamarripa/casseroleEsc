angular.module("casserole").controller("RootCtrl", RootCtrl);  
function RootCtrl($scope, $meteor, $reactive, $state, $stateParams, toastr){
	let rc = $reactive(this).attach($scope); 
	this.usuarioActual = {};
	this.avisosVentana = "none";
	this.grupos_id = [];
	this.hoy = new Date();
	// Director
	if(Meteor.user() && Meteor.user().roles && Meteor.user().roles[0] == "director"){
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
		
		this.subscribe('campus', function(){
			return [{
				_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""
			}]
		});
		
		this.subscribe('maestrosMateriasGrupos', () => {		
			return [{
				maestro_id : Meteor.user().profile.maestro_id, estatus : true
			}]
		});
		
		this.subscribe('grupos', () => {		
			return [{
				_id : { $in : this.getCollectionReactively('grupos_id')}
			}]
		});
		
		this.helpers({
			campus : () => {
			  return Campus.findOne(Meteor.user().profile.campus_id);
			},
			avisos : () => {
			  return MensajesVendedores.find().fetch();
			},
			mmgs : () => {
				return MaestrosMateriasGrupos.find().fetch();
			},
			grupos : () => {
				if(this.mmgs){
					rc.grupos_id = _.pluck(MaestrosMateriasGrupos.find().fetch(), "grupo_id");
					return Grupos.find().fetch()
				}
			}
			
		});
		
		this.getNombreGrupo = function(grupo_id){
			var grupo = Grupos.findOne(grupo_id);
			if(grupo)
				return grupo.nombre;
		}
		
		this.getHorarioGrupo = function(grupo_id){
			var grupo = Grupos.findOne(grupo_id);
			if(grupo)
				return grupo.horario_id;
		}
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