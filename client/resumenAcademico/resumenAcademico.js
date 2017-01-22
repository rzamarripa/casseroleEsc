angular
.module("casserole")
.controller("ResumenAcademicoCtrl", ResumenAcademicoCtrl);
function ResumenAcademicoCtrl($scope, $meteor, $reactive,  $state, $stateParams, toastr) {
	
	let rc = $reactive(this).attach($scope);
	this.maestros_id = [];
	this.subscribe('asistenciasr', ()  => {
			return [{},{maestro_id:1,grupo_id:1,semana:1}]
		});
	this.subscribe('calificaciones', () => {		
		return [{
			
		}]
	});
  
	this.subscribe('gruposResumen',()=>{
		return [{ where : {seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : ""},
							fields : { fields : { inscripcion : 0, colegiatura : 0, conceptosComision : 0 }}}]
	});
	this.subscribe('maestros',()=>{
		return [{estatus:true, campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }]
	});
	this.subscribe('ciclos',()=>{
		return [{seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : "",estatus:true}]
	});

	this.subscribe('turnos',()=>{
		return [{estatus:true, campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }]
	});

	this.helpers({
		grupos : () => {
		 return Grupos.find({ seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : ""});
		 //fields : { fields : { inscripcion : 0, colegiatura : 0, conceptosComision : 0 }}}
		},
		ciclos: () => {
			return Ciclos.find({seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : "",estatus:true});
		},
		turnos : () => {
		 return Turnos.find({estatus:true, campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" });
		}
	});
  
	this.getMaestro = function(maestro_id){
		var maestro = Maestros.findOne(maestro_id);
		if(maestro)
			return maestro.nombre + " " + maestro.apPaterno;
	}

	this.semanal = function(c){
		var _semanas = [];
		var i =0;
		try{
		  var ciclo = this.ciclos[c];
		  var fini= moment(ciclo.fechaInicio);
		  while(fini.diff(ciclo.fechaFin)<0){
		   _semanas.push({numero:fini.isoWeek(),anio:fini.year(),id:i++})
		   fini.day(8);
		  }
		  fini = moment(ciclo.fechaFin);
		  if(fini.isoWeek()>_semanas[_semanas.length-1])
		   _semanas.push({numero:fini.isoWeek(),anio:fini.year(),id:i++});
	 }catch(ex){

	 }
	 if (angular.equals($scope.prevSemanal, _semanas)) {
    return $scope.prevSemanal;
  }
  $scope.prevSemanal = _semanas;
  return _semanas;
	}
	this.getMaestro = function(maestro_id){
		var maestro = Maestros.findOne(maestro_id);
		if(maestro)
			return maestro.nombre + " " + maestro.apPaterno;
	}
	
	this.generarRowGrupo = function(grupo){
		var cola =[];
		var colb =[];
		var colc =[];
		var cold =[];
		var hoy = moment(new Date());

		//console.log(hoy.isoWeek(),hoy.year())
		var semanas = this.semanal(0);
		cola.push({texto:grupo.nombre,
																		colspan:1,
																		bgcolor:'bg-color-greenLight',
																		rowspan:2,th:true});
		colc.push({texto:'Alumnos: '+ grupo.inscritos,
																		colspan:1,
																		bgcolor:'',
																		rowspan:2,th:true});
		
		for(var i=0;i<semanas.length;i++){
			var materia = undefined;
			for(var j=0; !materia && j<grupo.asignaciones.length;j++){
				
				//console.log('asd',grupo.asignaciones[j].semanas[0],semanas[i]);

				if(grupo.asignaciones[j].semanas[0].semana==semanas[i].numero && grupo.asignaciones[j].semanas[0].anio==semanas[i].anio)
					materia=grupo.asignaciones[j]
			}
			
			if(materia){
				//console.log("materia",materia,semanas[i]);
				i+=(materia.semanas.length-1);


				
				var calificaciones = Calificaciones.find({maestro_id:materia.maestro_id,materia_id:materia.materia_id,grupo_id:grupo._id}).count();
				var _asistencias = Asistencias.find({maestro_id:materia.maestro_id,materia_id:materia.materia_id,grupo_id:grupo._id}).fetch();
				var faltas ={};
				for(var aid in _asistencias){
					var asistencia = _asistencias[aid];
					for(var alid in asistencia.alumnos){
						var alm = asistencia.alumnos[alid];
						if(!alm.estatus){
							if(!faltas[alm._id])
								faltas[alm._id]=1;
							else
								faltas[alm._id]++;
						}
					}
				}
				
				//console.log({maestro_id:materia.maestro_id,materia_id:materia.materia_id,grupo_id:grupo._id});

				var turno = Turnos.findOne({_id:grupo.turno_id});
				//console.log('asistencias',cantidadAsistencias,turno)
				var faltasTotales=0
				for(var xds in faltas){
					if(faltas[xds]>=turno.inasistencias)
						faltasTotales++;
				}
				var clase = "progress-bar bg-color-greenLight"
				if(parseInt((cantidadAsistencias/turno.asistencias)*100)<50)
					clase ="progress-bar bg-color-redLight"
				else if(parseInt((cantidadAsistencias/turno.asistencias)*100)<100)
					clase ="progress-bar bg-color-blue"

				if(parseInt((cantidadAsistencias/turno.asistencias)*100)<100 && materia.semanas[materia.semanas.length-1]<=hoy.isoWeek())
					clase ="progress-bar bg-color-redLight"

				

				

				cola.push({texto:materia.materia.nombre,
					rowspan:1,
					bgcolor:'bg-color-greenLight',
					colspan:materia.semanas.length,th:false})
				colb.push({texto:this.getMaestro(materia.maestro_id),
					rowspan:1,
					bgcolor:(grupo.semanaFin<hoy.isoWeek() && calificaciones==0)? "bg-color-red":'bg-color-blueLight',
					colspan:materia.semanas.length,th:false})
				for(var idsem in materia.semanas){
					var _semana = materia.semanas[idsem];
					var cantidadAsistencias = Asistencias.find({maestro_id:materia.maestro_id,
																																																	materia_id:materia.materia_id,
																																																	grupo_id:grupo._id,
																																																 semana:_semana.semana}).count();
						
					colc.push({texto: cantidadAsistencias,
																
																rowspan:1,
																bgcolor:cantidadAsistencias<turno.asistencias?  
																								((_semana.semana<hoy.isoWeek() && _semana.anio== hoy.year() ) || _semana.anio< hoy.year()? "bg-color-red":
																									(_semana.semana==hoy.isoWeek() && _semana.anio== hoy.year()? "bg-color-yellow":"bg-color-lighten")):"bg-color-greenLight" ,
																colspan:1,th:false})

				}

				
		
				cold.push({texto: 'Faltas: '+faltasTotales,
																
																rowspan:1,
																bgcolor:faltasTotales>0 ? "bg-color-red":"" ,
																colspan:materia.semanas.length,th:false})
			}else{
				cola.push({texto:'',
																rowspan:1,
																bgcolor:'bg-color-greenLight',
																colspan:1,th:false})
				colb.push({texto:'',
																rowspan:1,
																bgcolor:'bg-color-blueLight',
																colspan:1,th:false})
				colc.push({texto:'',
																rowspan:1,
																bgcolor:'',
																colspan:1,th:false})
				cold.push({texto:'',
																rowspan:1,
																bgcolor:'',
																colspan:1,th:false})

			}
		}
		return {cola:cola,colb:colb,colc:colc,cold:cold};

	}
	this.generarHorario =function(datos){
			var grupos =this.gruposPorHorario(datos);
			//console.log('grupos',grupos);
			var filas = [];
			var columnas= [];
			var semanas = this.semanal(0);
		 //	var columnasb = [];

			columnas.push({texto:datos.horaInicio+"-"+datos.horaFin,
																		colspan:1,
																		bgcolor:'',
																		rowspan:grupos.length>0? grupos.length*4:1,th:true});
			if(grupos.length>0){
			
				//console.log("si entre");
				var x =	this.generarRowGrupo(grupos[0]);
				//console.log("row",x);
				filas.push(columnas.concat(x.cola));
				filas.push(x.colb);
				filas.push(x.colc);
				filas.push(x.cold);
				for(var i =1;i<grupos.length;i++){
					x= this.generarRowGrupo(grupos[i]);
					filas.push(x.cola);
					filas.push(x.colb);
					filas.push(x.colc);
					filas.push(x.cold);
				}
			}
			else{
				var colc=[];
				colc.push({texto:'',
																rowspan:1,
																bgcolor:'',
																colspan:1,th:false})
				for(var i=0;i<semanas.length;i++){
					colc.push({texto:'',
																rowspan:1,
																bgcolor:'',
																colspan:1,th:false})
				}
				filas.push(columnas.concat(colc));
			}
			//console.log("filas",filas)

			return filas;

	}
	this.horarios = function(){
		var _horarios=[];
		var _ret =[]
		try{
			for(var idTurno in this.turnos){
				var turno = this.turnos[idTurno];
				var ban = true;
				for(var i=0;ban && i<_horarios.length;i++){
					ban= ban && (turno.horaInicio!=_horarios[i].horaInicio || turno.horaFin!=_horarios[i].horaFin)
				}
				if(ban){
					_horarios.push({horaInicio:turno.horaInicio,horaFin:turno.horaFin})
					_ret=_ret.concat(this.generarHorario({horaInicio:turno.horaInicio,horaFin:turno.horaFin}))
				}
			}

		}
		catch(ex){ 
			//console.log(ex,ex.stack)
		}
		//console.log('1',_ret)
		if (angular.equals($scope.prevHorarios, _ret)) {
    return $scope.prevHorarios;
  }
  $scope.prevHorarios = _ret;
  return _ret;
	}

	this.gruposPorHorario = function(horario){
		
		var _grupos = [];
		try{
			var gpos = this.grupos;
			//console.log("gpos", gpos);
			for(var gpoId in gpos){
				var grupo=gpos[gpoId];
				//console.log("grupo", grupo);
				var turno = Turnos.findOne({_id:grupo.turno_id});
				//console.log("turno", turno);
				if(horario.horaInicio==turno.horaInicio && horario.horaFin==turno.horaFin)
					_grupos.push(grupo);
			}
		}
		catch(ex){
			//console.log(ex)
		}
		if (angular.equals($scope.prevGruposPorHorario, _grupos)) {
    return $scope.prevGruposPorHorario;
  }
  $scope.prevGruposPorHorario = _grupos;
  //console.log("grupos", _grupos);
  return _grupos;
	}
};