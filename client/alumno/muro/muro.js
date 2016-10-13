angular.module("casserole")
.controller("AlumnoMuroCtrl",AlumnoMuroCtrl)
function AlumnoMuroCtrl($scope, $meteor, $reactive, $state, toastr, $stateParams) {
  let rc = $reactive(this).attach($scope);
	window.rc = rc;
	this.usuarioActual = null;
	var eventosTotales = [];
	this.calendario = {};
	this.calendario.eventos = [];

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
	
	this.subscribe("calendarios",()=>{
		return [{estatus : true, campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""}];
	});
	
	this.subscribe('posts',()=>{
		return [
		{
      limit: parseInt(this.getReactively('perPage')),
      skip: parseInt((this.getReactively('page') - 1) * this.perPage),
      //sort: this.getReactively('sort')
    },
		{
			campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : undefined,
		}]
	});
	
	this.helpers({
		calendario : () => {
			return Calendarios.findOne();
		},
		posts : () => {
	  	return Posts.find({},{sort:{createdAt: -1}});
  	},
		postsCount: () => {
			return Counts.get('numberOfPosts');
    },
    eventSources : () => {
	    if(this.getReactively("calendario")){
		    console.log(rc.calendario.eventos);
		    return rc.calendario.eventos;
	    }else{
		    console.log("entré acá");
		    return [];
	    }
    },
    usuarioActual : () => {
	    console.log(Meteor.user());
	    return Meteor.user();
    }
	});
	
	rc.calendario 	= Calendarios.findOne($stateParams.id);
	
	this.comentar = function(mensaje){
		mensajeActual = {
			message : mensaje.mensaje,
			user_id : Meteor.userId(),
			photo : Meteor.user().profile.fotografia,
			name : Meteor.user().profile.nombreCompleto,
			username : Meteor.user().username,
			role : Meteor.user().roles[0],
			replies : [],
			createdAt : new Date(),
			campus_id : Meteor.user().profile.campus_id,
		}
		Posts.insert(mensajeActual);
		toastr.success("Has hecho un comentario");
	}
	
	this.reply = function(reply, post_id){
		comentarioActual = {
			comment : reply.message,
			user_id : Meteor.userId(),
			photo : Meteor.user().profile.fotografia,
			name : Meteor.user().profile.nombreCompleto,
			username : Meteor.user().username,
			role : Meteor.user().roles[0],
			replies : [],
			createdAt : new Date(),
			campus_id : Meteor.user().profile.campus_id
		}
		
		Posts.update(post_id, { $push : {"replies" : comentarioActual }});
	}
	
	this.deletePost = function(post_id){
		Posts.remove(post_id);
	}
	
	//CALENDARIO
	
/*
	this.eventRender = function( event, element, view ) { 
    //element.attr({'tooltip': event.title, 'tooltip-append-to-body': true});
    element.find('.fc-title').append('<div class="hr-line-solid-no-margin"></div><span style="font-size: 10px">'+event.description+'</span></div>');
    //$compile(element)(this);
  };
*/
	
	this.uiConfig = {
    calendar:{
      height: 200,
      editable: false,
      lang:'es',
      defaultView:'month',
      firstDay: 1,
      //defaultDate: this.getReactively("calendario.fechaCreacion"),
      weekends : true,
      header:{
        left: 'title',
        center: '',
        right: 'today prev,next'
      },
      buttonText: {
        prev: 'Atrás',
        next: 'Siguiente',
        today: 'Hoy',        
    	},
      allDaySlot:false,
      columnFormat: {
        month: 'dddd',
        week: 'dddd',
        day: 'dddd'
      },
      monthNames : ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
      dayNames : ["D", "L", "M", "M", "J", "V", "S"],
      dayNamesShort : ["Dom", "Lun", "Ma", "Mi", "Jue", "Vie", "Sab"],      
      //eventRender: this.eventRender,
    }
  };
	
	this.eventSources = [rc.getReactively("eventSources"), eventosTotales];
};