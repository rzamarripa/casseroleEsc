angular
  .module('casserole')
  .controller('CalendarioDetalleCtrl', CalendarioDetalleCtrl);
 
function CalendarioDetalleCtrl($compile, $scope, $meteor, $reactive, $state, $stateParams, toastr) {
	let rc = $reactive(this).attach($scope);
	  
	this.calendario = {};
  this.actionAgregar = true;
  this.colorSeleccionado = null;
  
  var eventosTotales = [];
  this.evento 	= {};
	this.calendario.eventos = [];
	moment.locale('es');
  var date = new Date();
  var d = date.getDate();
  var m = date.getMonth();
  var y = date.getFullYear();
  
	this.helpers({
		calendario : () => {
			var calendario = Calendarios.findOne();
			if(calendario){
				return calendario;
			}	
		}
	});
		
	if($stateParams.id != ""){
		this.subscribe("calendarios",()=>{
			return [{estatus : true}];
		});
		rc.calendario 	= Calendarios.findOne($stateParams.id);
		rc.action = false;
	}else{
		rc.calendario	= {};
	  rc.calendario.eventos = [];
	  rc.calendario.estatus = true;
	  rc.action = true;
	}
	
	window.calendario = rc.calendario;
	
  this.agregarEvento = function(evento, form){
  	if(form.$invalid){
	    toastr.error('Error al agregar la evento.');
	    return;
    }
	  evento.estatus = true;
	  evento.start 	= moment(evento.start).format("YYYY-MM-DD HH:mm");
		evento.end 		= moment(evento.end).format("YYYY-MM-DD HH:mm");
	  rc.calendario.eventos.push(evento);
	  rc.calendario.semana = moment(evento.start).isoWeek();
	  evento = {};
	  rc.evento = angular.copy(rc.evento);
	  rc.evento._id += 1;
	  
  }
  
  this.cancelarEvento = function(){
	  
	  for(i = 0; i < rc.calendario.eventos.length; i++){
		  if(rc.calendario.eventos[i]._id == rc.evento._id){
				rc.calendario.eventos[i].className = rc.colorSeleccionado;
			}
		}
	  rc.actionAgregar = true; 
	  rc.evento 	= {};
  }

  this.modificarEvento = function(evento,form2){
	  _.each(this.calendario.eventos, function(eventoActual){
		  if(eventoActual._id == evento._id){
			  evento.title = maestro.nombre + " " + maestro.apPaterno + "\n" + materia.nombreCorto + "\n" + aula.nombre;
			  evento.estatus = true;
			  
			  var eventoCopy = null;
			  eventoCopy 	= evento;				
				eventoCopy 	= angular.copy(evento);
				eventoActual.title 	= eventoCopy.title;
				eventoActual._id 			= eventoCopy._id;
				eventoActual.className = eventoCopy.className;
			  eventoActual.aula 		= eventoCopy.aula;
			  eventoActual.start 	= moment(eventoCopy.start).format("YYYY-MM-DD HH:mm");
			  eventoActual.end 		= moment(eventoCopy.end).format("YYYY-MM-DD HH:mm");
			  eventoActual.estatus = true;
		  }
	  });
	  rc.evento = angular.copy(rc.evento);
	  rc.actionAgregar = true;
  }
  
  //TODO 
  this.duplicarEvento = function(evento){
	  var nuevoEvento = {}; 
	  nuevoEvento.title 	= evento.title;
		nuevoEvento._id 			= evento._id;
		nuevoEvento.className = evento.className;
	  nuevoEvento.aula 		= evento.aula;			  
	  nuevoEvento.start 	= moment(evento.start).format("YYYY-MM-DD HH:mm");
	  nuevoEvento.end 		= moment(evento.end).format("YYYY-MM-DD HH:mm");
	  nuevoEvento.estatus = true;
	  
	  var mayor = 0;
	  _.each(this.calendario.eventos, function(evento){
		  if(mayor == 0){
			  rc.evento.semana = moment(evento.start).isoWeek();
		  }
		  if(evento._id > mayor){
			  mayor = evento._id;
		  }
	  });
	  nuevoEvento._id = mayor + 1;
	  
	  this.calendario.eventos.push(nuevoevento);
  }
  
  this.modificarCalendario = function(Calendario,form){
  	if(form.$invalid){
	    toastr.error('Error al guardar los datos del Calendario.');
	    return;
    }
    
	  this.evento.semana = Calendario.semana;
	  var idTemp = Calendario._id;
	  delete Calendario._id;
		Calendarios.update({_id:idTemp},{$set:Calendario});
		toastr.success("Se modificó el Calendario");
		$state.go("root.calendarios");
  }
  
  this.alertOnEventClick = function(date, jsEvent, view){
	  _.each(rc.calendario.eventos, function(evento){
		  if(evento.className == "bg-color-orange"){
			  evento.className = rc.colorSeleccionado;
		  }
	  })
	  
	  
	  rc.evento = angular.copy(date);
	  rc.colorSeleccionado = date.className;
    rc.evento.start 	= moment(date.start).format("YYYY-MM-DD HH:mm");
    rc.evento.end 		= moment(date.end).format("YYYY-MM-DD HH:mm");
    rc.actionAgregar = false;

	  for(i = 0; i < rc.calendario.eventos.length; i++){
		  if(rc.calendario.eventos[i]._id == rc.evento._id){
			  rc.calendario.eventos[i].className = "bg-color-orange";
			}else{
				//rc.calendario.eventos[i].className = rc.evento.className;
			}
		}
  };
  
	this.alertOnDrop = function(event, delta, revertFunc, jsEvent, ui, view){
		_.each(rc.calendario.eventos, function(evento){
			if(event._id == evento._id){
				evento.start 	= moment(event.start).format("YYYY-MM-DD HH:mm");
				evento.end 		= moment(event.end).format("YYYY-MM-DD HH:mm");
			}
		});		
  };
  
  this.alertOnResize = function(event, delta, revertFunc, jsEvent, ui, view ){
     this.alertMessage = ('Event Resized to make dayDelta ' + delta);
     _.each(rc.calendario.eventos, function(evento){
			if(event._id == evento._id){
				evento.start 	= moment(event.start).format("YYYY-MM-DD HH:mm");
				evento.end 		= moment(event.end).format("YYYY-MM-DD HH:mm");
			}
		});
  };
  
  this.guardarCalendario = function(form) {
  	if(form.$invalid){
	    toastr.error('Error al guardar los datos.');
	    return;
    }
		
		this.calendario.fechaCreacion = new Date();
		this.calendario.campus_id = Meteor.user().profile.campus_id;
		this.calendario.seccion_id = Meteor.user().profile.seccion_id;
		this.calendario.usuarioInserto = Meteor.userId();
    Calendarios.insert(this.calendario);
    toastr.success('Guardado correctamente.');
		$state.go("root.calendarios");
  };
  
  this.eliminarEvento = function() {
	  
	  for(i = 0; i <= rc.calendario.eventos.length -1; i++){
		  if(rc.calendario.eventos[i]._id == rc.evento._id){
			  rc.calendario.eventos.splice(i, 1);
			  rc.actionAgregar = true;
			  rc.evento = {};
		  }
	  }
  };
    
  /* Render Tooltip */

  this.eventRender = function( event, element, view ) { 
    element.attr({'tooltip': event.title, 'tooltip-append-to-body': true});
    //$compile(element)(this);
  };
	
  this.uiConfig = {
    calendar:{
      height: 500,
      editable: true,
      lang:'es',
      defaultView:'month',
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
      monthNames : ["Enero", "Febrero", "Marzo", "Abril", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
      dayNames : ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
      dayNamesShort : ["Dom", "Lun", "Ma", "Mi", "Jue", "Vie", "Sab"],
      eventClick: this.alertOnEventClick,
      eventDrop: this.alertOnDrop,
      eventResize: this.alertOnResize,
      eventRender: this.eventRender,
    }
  };
  
  this.eventSources = [rc.calendario.eventos, eventosTotales];
  
};