angular.module("casserole")
.controller("AlumnoMuroCtrl",AlumnoMuroCtrl)
function AlumnoMuroCtrl($scope, $meteor, $reactive, $state, toastr, $stateParams) {
	
	$(document).ready(function(){
    $('[data-toggle="popover"]').popover(); 
	});

  let rc = $reactive(this).attach($scope);
	window.rc = rc;
	this.usuarioActual = null;
	var eventosTotales = [];
	this.calendario = {};
	this.calendario.eventos = [];
	this.amigos_ids = [];
	moment.locale("es");
	this.buscar = {};
	this.buscar.nombre = "";

	this.perPage = 10;
  this.page = 1;
  this.sort = {
    createdAt: -1
  };
  
  this.pageChanged = (newPage) => {
		this.page = newPage;
  };
  
  this.loadMore=function(){
		this.perPage +=10; 
  }
 
  this.subscribe('buscarAlumnos', () => {
    return [{
	    options : { limit: 10 },
	    where : { 
				nombreCompleto : this.getReactively('buscar.nombre'), 
				seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : "",
				campus_id :  Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""
			}
    }];
  });
  
  this.subscribe("alumnos",()=>{
		return [{
			"profile.estatus" : true, 
			_id : { $in : this.getCollectionReactively("amigos_ids")}
		}];
	});
	
	this.subscribe("calendarios",()=>{
		return [{estatus : true, campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }];
	});
	
	this.subscribe('posts',()=>{
		return [
		{
      limit: parseInt(this.getReactively('perPage')),
      skip: parseInt((this.getReactively('page') - 1) * this.perPage),
      //sort: this.getReactively('sort')
    },
		{
			campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""
		}]
	});
	
	this.helpers({
		calendarios : () => {
			return Calendarios.find();
		},
		alumnos : () => {
			return Meteor.users.find({roles : ["alumno"]}, { sort : {"profile.nombreCompleto" : 1 }});
		},		
		posts : () => {
	  	return Posts.find({},{sort: this.getReactively("sort")});
  	},
		postsCount: () => {
			return Counts.get('numberOfPosts');
    },
    usuarioActual : () => {
	    return Meteor.user();
    },
    amigos : () => {
	    rc.amigos_ids = Meteor.user().profile.friends;
	    return Meteor.users.find({ _id : {"$in" : Meteor.user().profile.friends}}, {limit : 10}).fetch();
    },
    calendario : () => {
	    if(this.getReactively("calendarios")){
		    return Calendarios.findOne();
	    }
    }

	});
	
	this.comentar = function(mensaje){
		mensajeActual = {
			message : mensaje.mensaje,
			user_id : Meteor.userId(),
			photo : Meteor.user().profile.fotografia,
			gender : Meteor.user().profile.sexo,
			name : Meteor.user().profile.nombreCompleto,
			username : Meteor.user().username,
			role : Meteor.user().roles[0],
			replies : [],
			createdAt : new Date(),
			campus_id : Meteor.user().profile.campus_id,
		}
		Posts.insert(mensajeActual);
		mensaje = {};
		toastr.success("Has hecho un comentario");
	}
	
	this.reply = function(message, post_id, $index){
		comentarioActual = {
			comment : message,
			user_id : Meteor.userId(),
			photo : Meteor.user().profile.fotografia,
			gender : Meteor.user().profile.sexo,
			name : Meteor.user().profile.nombreCompleto,
			username : Meteor.user().username,
			role : Meteor.user().roles[0],
			replies : [],
			createdAt : new Date(),
			campus_id : Meteor.user().profile.campus_id
		}
		Posts.update(post_id, { $push : {"replies" : comentarioActual }});
		rc.reply[$index].message = "";
	}
	
	this.duracion = function(fecha){
		var fechaMilisegundos = moment().diff(fecha);
		return moment.duration(fechaMilisegundos).humanize();
	}
	
	this.deletePost = function(post_id){
		Posts.remove(post_id);
	}
	
	this.tieneFoto = function(foto, sexo){
		
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
  
  this.agregarAmigo = function(alumno_id){
	  console.log(alumno_id);
	  Meteor.users.update(Meteor.userId(), { $push : { "profile.friends" : alumno_id }});
	  toastr.info("Ahora tienes un nuevo amigo");
  }
  
  this.masAmigos = function(cantidad){
	  return cantidad - 10;
  }
  
  this.hora = function(fecha){
  	var ahora = new Date();
  	var minuto = 60 * 1000;
  	var hora = minuto * 60;
  	var dia = hora * 24;
  	var anio = dia * 365;
  	var diferencia = ahora-fecha;
  	if(diferencia < minuto)
  		return "Hace menos de un minuto"
  	else if(diferencia<hora)
  		return "Hace "+Math.round(diferencia/minuto)+" minutos"
  	else if(diferencia<dia)
  		return "Hace "+Math.round(diferencia/hora)+" horas"
  	else if(diferencia<anio)
  		return "Hace "+Math.round(diferencia/dia)+" dias"
  	else
  		return "Hace mucho tiempo"
  }
  
};