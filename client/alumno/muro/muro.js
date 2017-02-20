angular.module("casserole")
.controller("AlumnoMuroCtrl",AlumnoMuroCtrl)
function AlumnoMuroCtrl($scope, $meteor, $reactive, $state, toastr, $stateParams) {
  let rc = $reactive(this).attach($scope);
	this.usuarioActual = null;
	var eventosTotales = [];
	this.calendario = {};
	this.calendario.eventos = [];
	this.amigos_ids = [];
	this.amigosPosts = [];
	this.amigos = [];
	this.post = {};
	
	//Buscar amigos
	this.buscar = {};
	this.buscar.nombre = "";
	this.hoy = new Date();
	this.buscando = false;
	this.balumnos = [];
	
	window.rc = rc;

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
				seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : ""
			}
    }];
  });
  
  this.subscribe("alumnos",()=>{
		return [{
			_id : { $in : this.getCollectionReactively("amigos_ids")}
		}];
	});
	
	this.subscribe("alumnos",()=>{
		return [{
			_id : $stateParams.alumno_id
		}];
	});
	
	this.subscribe("calendarios",()=>{
		return [{estatus : true, campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }];
	});
	
	this.subscribe('posts',()=>{
		if($stateParams.alumno_id == Meteor.userId()){
			return [
			{
	      limit: parseInt(this.getReactively('perPage')),
	      skip: parseInt((this.getReactively('page') - 1) * this.perPage),
	      sort: this.getReactively('sort')
	    },
			{
				user_id : { $in : this.getCollectionReactively("amigosPosts")}
			}]
		}else{
			return [
			{
	      limit: parseInt(this.getReactively('perPage')),
	      skip: parseInt((this.getReactively('page') - 1) * this.perPage),
	      sort: this.getReactively('sort')
	    },
			{
				user_id : $stateParams.alumno_id
			}]
		}
	});
	
	this.helpers({
		calendarios : () => {
			return Calendarios.find();
		},
		amigos : () => {
			if($stateParams.alumno_id == Meteor.userId()){
				this.amigos_ids = _.pluck(Meteor.user().profile.friends, "alumno_id");
				this.amigosPosts = _.pluck(Meteor.user().profile.friends, "alumno_id");
				this.amigosPosts.push(Meteor.userId());
			}else{
				var alumno = Meteor.users.findOne({_id : $stateParams.alumno_id});
				if(alumno){
					rc.amigos_ids = [];
					rc.amigosPosts = [];
					rc.amigos_ids = _.pluck(alumno.profile.friends, "alumno_id");
					rc.amigosPosts = _.pluck(alumno.profile.friends, "alumno_id");
					rc.amigosPosts.push(alumno._id);
				}				
			}
			
			return Meteor.users.find({_id : { $in : rc.amigos_ids}}).fetch();
		},
		alumno : () => {
			return Meteor.users.findOne({_id : $stateParams.alumno_id});
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
    calendario : () => {
	    if(this.getReactively("calendarios")){
		    return Calendarios.findOne();
	    }
    },
    eventos : () => {
	    if(this.getReactively("calendario")){
		    //ME FALTA ORDENAR 
		    return _.sortBy(rc.calendario.eventos, function(evento) { return evento.start.dateTime; });
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
			geolocalizacion : mensaje.geolocalizacion
		}
		console.log("actual", mensajeActual);
		Posts.insert(mensajeActual);
		this.post = {};
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
		moment.locale("es")
		return moment.duration(fechaMilisegundos).humanize();
	}
	
	this.deletePost = function(post_id){
		Posts.remove(post_id);
	}
	
	this.tieneFoto = function(foto, sexo){
		
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
  
  this.solicitarAmistad = function(alumno_id, $index){
		var alumno = this.balumnos[$index];

	  Meteor.apply("solicitarAmistad", [Meteor.userId(), alumno_id], function(error, result){
		  console.log(result)
			if(parseInt(result) == 0){
				alumno.profile.tipoRelacion = 1;
				toastr.info("Tu solicitud se ha enviado.");
			}else{
				toastr.warning("Ya se había mandado una solicitud")
			}
			$scope.$apply();
		});
	  
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
  	else if(diferencia < hora)
  		return "Hace "+Math.round(diferencia/minuto)+" minutos"
  	else if(diferencia < dia)
  		return "Hace "+Math.round(diferencia/hora)+" horas"
  	else if(diferencia < anio)
  		return "Hace "+Math.round(diferencia/dia)+" días"
  	else
  		return "Hace mucho tiempo"
  }
  
  this.buscandoNoAlumno = function(){	
		if(this.buscar.nombre.length > 3){
			rc.buscando = true;
		}else{
			rc.buscando = false;
		}

		Meteor.apply("buscarEnMuro", [rc.buscar.nombre], function(error, result){
			rc.balumnos = [];
			if(result){
				rc.balumnos = result;
				console.log(rc.balumnos);
				$scope.$apply();
			}
		});
	}
	
	this.reportarPost = function(post_id){
		Meteor.apply("reportarPost", [post_id, Meteor.userId()], function(error, result){
			if(result){
				toastr.success("Se ha reportado el post, gracias por contribuir.")
			}
		});
	}
	
	this.mostrarGeolocalizacion = function() {
    if (navigator.geolocation) {
        var geo = navigator.geolocation.getCurrentPosition(rc.showPosition);
        console.log(geo);
    } else {
        toastr.error("Geolocalización no es soportada por tu navegador.");
    }
	}
	
	this.showPosition = function(position) {
	  rc.post.geolocalizacion = position.coords;
	}
  
};