angular
	.module('casserole')
	.controller('HistorialComentariosCtrl', HistorialComentariosCtrl);
 
function HistorialComentariosCtrl($scope, $meteor, $reactive, $state, toastr, $stateParams) {
	
	rc = $reactive(this).attach($scope);

	this.comentario = {};
	this.fechaActual = new Date();
	this.diaActual = moment(new Date()).weekday();
	this.semanaActual = moment(new Date()).isoWeek();
	this.usuarios_id = [];
	
	this.subscribe('alumno', () => {
		return [{
			id : $stateParams.alumno_id,
			campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""
		}];
	});

	this.subscribe("comentariosAlumnos",() => {
		return [{ alumno_id : $stateParams.alumno_id }];
	});
	
	this.subscribe("usuarios",() => {
		return [{campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "", _id : { $in : this.getCollectionReactively("usuarios_id")}}];
	});
	
	this.helpers({
		alumno : () => {
			return Meteor.users.findOne({_id : $stateParams.alumno_id});
		},
		usuarios : () => {
			
		},
		comentarios : () => {
			var comentarios = ComentariosAlumnos.find().fetch();
			_.each(comentarios, function(comentario){
			  rc.usuarios_id.push(comentario.usuarioInserto_id);
			  comentario.usuarioInserto = Meteor.users.findOne({},{fields : {"profile.nombreCompleto" : 1}})
		  });
		  			
			return comentarios;
		}		
	});
	
	this.tieneFoto = function(sexo, foto){
		if(foto === undefined){
			if(sexo === "masculino")
				return "img/badmenprofile.jpeg";
			else if(sexo === "femenino"){
				return "img/badgirlprofile.jpeg";
			}else{
				return "img/badprofile.jpeg";
			}
		}else{
			return foto;
		}
	}
	
}