angular
  .module('casserole')
  .controller('AlumnoCalendarioCtrl', AlumnoCalendarioCtrl);
 
function AlumnoCalendarioCtrl($compile, $scope, $meteor, $reactive, $state, $stateParams, toastr) {
	let rc = $reactive(this).attach($scope);

  this.calendario = {};
  this.calendario.eventos = [];
  var eventosTotales = [];
  this.eventSources = [];
  
	this.subscribe("calendarios",()=>{
		return [{estatus : true, campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""}];
	});
	
	this.helpers({
		calendarios : () => {
			return Calendarios.find();
		},
		calendario : () => {
			var calendario = Calendarios.findOne();
			if(calendario.eventos.length > 0){
				rc.eventSources = [calendario.eventos];
				return calendario;
			}
		}
	});	
  
  /* Render Tooltip */


  this.eventRender = function( event, element, view ) { 
    //element.attr({'tooltip': event.title, 'tooltip-append-to-body': true});
    element.find('.fc-title').append('<div class="hr-line-solid-no-margin"></div><span style="font-size: 10px">'+event.description+'</span></div>');
    //$compile(element)(this);
    element.popover({
	    	html : true,
        title: event.name,
        placement: 'right',
        content: + '<br />Start: ' + moment(event.start, "DD/MM/YYYY") + '<br />End: ' + moment(event.end, "DD/MM/YYYY") + '<br />Descripción: ' + event.description,
    });
  };

	
  this.uiConfig = {
    calendar:{
      height: 500,
      editable: true,
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
      dayNames : ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
      dayNamesShort : ["Dom", "Lun", "Ma", "Mi", "Jue", "Vie", "Sab"],
      eventRender: this.eventRender,
    }
  };
  
  this.eventSources = [this.calendario.eventos, this.calendario.eventos.lenght];
  
};