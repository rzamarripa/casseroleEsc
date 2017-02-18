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
	}else if(Meteor.user() && Meteor.user().roles && Meteor.user().roles[0] == "alumno"){ 
		this.solicitudes_ids = [];
		
		this.subscribe("alumnos",()=>{
			return [{
				_id : { $in : this.getCollectionReactively("solicitudes_ids")}
			}];
		});
	
		this.helpers({
	    alumnos : () => {
		    rc.solicitudes_ids = _.pluck(Meteor.user().profile.solicitudesRecibidas, "alumno_id");
		    return Meteor.users.find({ _id : {"$in" : rc.solicitudes_ids}}, {limit : 10}).fetch();
	    },
	    solicitudes : () => {
		    var solicitudes = _.where(Meteor.user().profile.solicitudesRecibidas, {estatus : 0});
		    if(this.getReactively("alumnos")){
			    _.each(solicitudes, function(solicitud){
				    solicitud.alumno = Meteor.users.findOne(solicitud.alumno_id);
			    })
		    }
		    console.log(solicitudes);
		    return solicitudes;
	    }
		});
		
		this.aceptarSolicitud = function(solicitud){
			rc.avisosVentana = "none";
			Meteor.apply("aceptarSolicitud", [solicitud, Meteor.userId()], function(error, result){
				if(result == 1){
					toastr.success("Ya tiene un nuevo amigo.");
					console.log(result);
					$scope.$apply();
				}else{
					toastr.danger("No se pudo completar la amistad, inténtelo más tarde");
				}
			});
		}
		
		this.rechazarSolicitud = function(solicitud){
			rc.avisosVentana = "none";
			Meteor.apply("rechazarSolicitud", [solicitud, Meteor.userId()], function(error, result){
				if(result == 1){
					toastr.danger("Se ha declinado la invitación.")
					console.log(result);
					$scope.$apply();
				}
			});
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
  };
	
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