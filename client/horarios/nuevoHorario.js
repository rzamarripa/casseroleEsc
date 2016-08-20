angular
  .module('casserole')
  .controller('HorarioDetalleCtrl', HorarioDetalleCtrl);
 
function HorarioDetalleCtrl($compile, $scope, $meteor, $reactive, $state, $stateParams, toastr) {
	let rc = $reactive(this).attach($scope);
	  
	this.clase = {};
  this.actionAgregar = true;
  this.colorSeleccionado = null;
  
  var clasesTotales = [];
  var aulasTotales = [];
  this.horario 	= {};
	this.horario.clases = [];
  
  var date = new Date();
  var d = date.getDate();
  var m = date.getMonth();
  var y = date.getFullYear();
  
  this.subscribe("maestros",()=>{
		return [{estatus:true, campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }];
	 });
  this.subscribe("materias",()=>{
		return [{estatus:true, seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : "" }];
	 });
  this.subscribe("horarios",()=>{
		return [{_id : $stateParams.id}];
	 });
  this.subscribe("aulas",()=>{
		return [{estatus:true, campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }];
	 });
	 
	this.helpers({
		maestros : () => {
			return Maestros.find();
		},
		materias : () => {
			return Materias.find();
		},
		aulas : () => {
			return Aulas.find();
		},
		ultimoHorario : () => {
			return Horarios.findOne();
		},
	});
		
	if($stateParams.id != ""){
		rc.horario 	= Horarios.findOne($stateParams.id);
		rc.action 	= false;
	}else{
		rc.horario 	= {};
	  rc.horario.clases = [];
	  rc.horario.estatus = true;
	  rc.action 	= true;	  
	}
	
	window.rc = rc.horario;
	
  this.agregarClase = function(clase, form){
  	if(form.$invalid){
	    toastr.error('Error al agregar la Clase.');
	    return;
    }
	  eliminarTemporalesOcupados();
	  var materia 	= Materias.findOne(clase.materia_id);
		var maestro 	= Maestros.findOne(clase.maestro_id);
		var aula 			= Aulas.findOne(clase.aula_id);
	  clase.materia = materia.nombreCorto;
	  clase.title 	= maestro.nombre + " " + maestro.apPaterno + "\n"+ materia.nombreCorto + "\n" + aula.nombre;
	  clase.maestro = maestro.nombre + " " + maestro.apPaterno;
	  clase.aula 		= aula.nombre;
	  clase.className = ["event", rc.clase.className];
	  clase.estatus = true;
	  clase.start 	= moment(clase.start).format("YYYY-MM-DD HH:mm");
		clase.end 		= moment(clase.end).format("YYYY-MM-DD HH:mm");
	  rc.horario.clases.push(clase);
	  rc.horario.semana = moment(clase.start).isoWeek();
	  rc.clase 	= {};
  }
  
  this.cancelarClase = function(){
	  eliminarTemporalesOcupados();
	  for(i = 0; i < rc.horario.clases.length; i++){
		  if(rc.horario.clases[i]._id == rc.clase._id){
				rc.horario.clases[i].className = rc.colorSeleccionado;
			}
		}
	  
	  rc.actionAgregar = true; 
	  rc.clase 	= {};
  }

  this.modificarClase = function(clase,form2){
	  console.log(clase);
	  console.log(this.horario.clases);
	  
	  _.each(this.horario.clases, function(claseActual){
		  console.log("entre", clase);
		  if(claseActual._id == clase._id){
			  var materia = $meteor.object(Materias, clase.materia_id, false);
				var maestro = $meteor.object(Maestros, clase.maestro_id, false);
				var aula 		= $meteor.object(Aulas, clase.aula_id, false);
			  clase.materia = materia.nombreCorto;
			  clase.title = maestro.nombre + " " + maestro.apPaterno + "\n" + materia.nombreCorto + "\n" + aula.nombre;
			  clase.maestro = maestro.nombre + " " + maestro.apPaterno;
			  clase.aula 	= aula.nombre;
			  clase.estatus = true;
			  
			  var claseCopy = null;
			  claseCopy 	= clase;				
				claseCopy 	= angular.copy(clase);
				claseActual.title 	= claseCopy.title;
				claseActual.id 			= claseCopy.id;
				claseActual.materia_id = claseCopy.materia_id;
				claseActual.maestro_id = claseCopy.maestro_id;
				claseActual.className = claseCopy.className;
				claseActual.aula_id = claseCopy.aula_id;
			  claseActual.materia = claseCopy.materia;
			  claseActual.maestro = claseCopy.maestro;
			  claseActual.aula 		= claseCopy.aula;			  
			  claseActual.start 	= moment(claseCopy.start).format("YYYY-MM-DD HH:mm");
			  claseActual.end 		= moment(claseCopy.end).format("YYYY-MM-DD HH:mm");
			  claseActual.estatus = true;
		  }
	  });
	  rc.clase = {};
	  rc.actionAgregar = true;
	  eliminarTemporalesOcupados();
  }
  
  this.modificarHorario = function(horario,form){
  	if(form.$invalid){
	    toastr.error('Error al guardar los datos del Horario.');
	    return;
    }
	  this.horario.semana = horario.semana;
	  var idTemp = horario._id;
	  delete horario._id;
		Horarios.update({_id:idTemp},{$set:horario});
		toastr.success("Se modificó el horario");
		$state.go("root.listarHorarios");
  }
   
  this.muestraMateriasMaestro = function(maestro_id){
	  var horariosTotales = angular.copy(this.horarios);
	  while(clasesTotales.length>0)clasesTotales.pop();
	  _.each(horariosTotales, function(horario){
		  if(horario._id != $stateParams.id){
			  for(i = 0; i < horario.clases.length; i++){
				  if(horario.clases[i].maestro_id == maestro_id){
					  horario.clases[i]._id 	= i;
					  horario.clases[i].start 		= moment(horario.clases[i].start).format("YYYY-MM-DD HH:mm");
					  horario.clases[i].end 			= moment(horario.clases[i].end).format("YYYY-MM-DD HH:mm");
					  horario.clases[i].className = ["event", "bg-color-magenta"];
					  clasesTotales.push(angular.copy(horario.clases[i]));
				  }
			  }		
		  }		    
	  });	  
  }
  
  this.muestraAulasMaestro = function(aula_id){
	  var horariosTotales = angular.copy(this.horarios);		
	  while(aulasTotales.length>0)aulasTotales.pop();
	  _.each(horariosTotales, function(horario){
		  if(horario._id != $stateParams.id){
			  for(i = 0; i < horario.clases.length; i++){
				  if(horario.clases[i].aula_id == aula_id){
					  horario.clases[i]._id 	= Math.random();
					  horario.clases[i].start 		= moment(horario.clases[i].start).format("YYYY-MM-DD HH:mm");
					  horario.clases[i].end 			= moment(horario.clases[i].end).format("YYYY-MM-DD HH:mm");
					  horario.clases[i].className = ["event", "bg-color-grayDark"];
					  aulasTotales.push(angular.copy(horario.clases[i]));
				  }
			  }
		  }
	  });
  }
  
  this.alertOnEventClick = function(date, jsEvent, view){
	  
	  eliminarTemporalesOcupados();
	  rc.clase = angular.copy(date);
	  rc.colorSeleccionado = date.className;
    rc.clase.start 	= moment(date.start).format("YYYY-MM-DD HH:mm");
    rc.clase.end 		= moment(date.end).format("YYYY-MM-DD HH:mm");
    rc.actionAgregar = false;

	  for(i = 0; i < rc.horario.clases.length; i++){
		  if(rc.horario.clases[i]._id == rc.clase._id){
			  rc.horario.clases[i].className = ["event", "bg-color-orange"];
			}else{
				//rc.horario.clases[i].className = rc.clase.className;
			}
		}
  };
  
	this.alertOnDrop = function(event, delta, revertFunc, jsEvent, ui, view){
		console.log(delta);
		console.log(event);
		this.clase = event;
		rc.clase.start 	= moment(event.start).add(delta).format("YYYY-MM-DD HH:mm");
		rc.clase.end 		= moment(event.end).add(delta).format("YYYY-MM-DD HH:mm");
		rc.actionAgregar = false;
		//this.alertOnEventClick(event, jsEvent, view);
  };
  
  this.alertOnResize = function(event, delta, revertFunc, jsEvent, ui, view ){
     this.alertMessage = ('Event Resized to make dayDelta ' + delta);
  };
  
  this.guardarHorario = function(form) {
  	if(form.$invalid){
	    toastr.error('Error al guardar los datos.');
	    return;
    }
		eliminarTemporalesOcupados();
		this.horario.fechaCreacion = new Date();
		this.horario.campus_id = Meteor.user().profile.campus_id;
		this.horario.seccion_id = Meteor.user().profile.seccion_id;
		this.horario.usuarioInserto = Meteor.userId();
    Horarios.insert(this.horario);
    toastr.success('Guardado correctamente.');
		$state.go("root.listarHorarios");
  };
  
  this.eliminarClase = function() {
	  eliminarTemporalesOcupados();
	  for(i = 0; i <= rc.horario.clases.length -1; i++){
		  if(rc.horario.clases[i]._id == rc.clase._id){
			  rc.horario.clases.splice(i, 1);
			  rc.actionAgregar = true;
			  rc.clase = {};
		  }
	  }
  };
  
  var eliminarTemporalesOcupados = function(){
	  while(aulasTotales.length>0)aulasTotales.pop();
	  while(clasesTotales.length>0)clasesTotales.pop();
  }
    
  /* Render Tooltip */
	/*
	  this.eventRender = function( event, element, view ) { 
	    element.attr({'tooltip': event.title, 'tooltip-append-to-body': true});
	    $compile(element)(this);
	  };
	*/
	
  this.uiConfig = {
    calendar:{
      height: 500,
      editable: false,
      lang:'es',
      defaultView:'agendaWeek',
      defaultDate: this.getReactively("horario.fechaCreacion"),
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
      dayNames : ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
      dayNamesShort : ["Dom", "Lun", "Ma", "Mi", "Jue", "Vie", "Sab"],
      eventClick: this.alertOnEventClick,
      eventDrop: this.alertOnDrop,
      eventResize: this.alertOnResize,
      eventRender: this.eventRender
    }
  };

  this.eventSources = [rc.horario.clases, clasesTotales, aulasTotales];
  var fechaInicioConfig = moment().subtract(10, 'days');
  var d2 = new Date("2011/02/01")
  console.log(d2);
  var view = $('#calendar').fullCalendar('getView');
};