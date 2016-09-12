angular
.module("casserole")
.controller("ResumenAcademicoCtrl", ResumenAcademicoCtrl);
function ResumenAcademicoCtrl($scope, $meteor, $reactive,  $state, $stateParams, toastr) {
	
	let rc = $reactive(this).attach($scope);
	
	this.maestros_id = [];
  
	this.subscribe('gruposResumen',()=>{
		return [{ where : {seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : ""},
							fields : { fields : { inscripcion : 0, colegiatura : 0, conceptosComision : 0 }}}]
	});
this.subscribe('maestros',()=>{
		return [{estatus:true, campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }]
	});
	this.subscribe('ciclos',()=>{
		return [{seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : "" }]
	});

	this.subscribe('turnos',()=>{
		return [{estatus:true, campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }]
	});
	
	
	
 this.helpers({
	 grupos : () => {
		 return Grupos.find();
	 },
	 ciclos: () => {
	 	return Ciclos.find();
	 },
	 turnos : () => {
		 return Turnos.find();
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
		var semanas = this.semanal(0);
		cola.push({texto:grupo.nombre,
																		colspan:1,
																		bgcolor:'bg-color-greenLight',
																		rowspan:2,th:true});
		colc.push({texto:'Alumnos: '+ grupo.inscritos,
																		colspan:1,
																		bgcolor:'',
																		rowspan:1,th:true});
		
		for(var i=0;i<semanas.length;i++){
			var materia = undefined;
			for(var j=0; !materia && j<grupo.asignaciones.length;j++){
				console.log(grupo.asignaciones[j].semanas);
				if(grupo.asignaciones[j].estatus && grupo.asignaciones[j].semanas[0]==semanas[i].numero)
					materia=grupo.asignaciones[j]
			}
			console.log("materia",materia,semanas[i]);
			if(materia){
				i+=(materia.semanas.length-1);
				cola.push({texto:materia.materia.nombre,
																rowspan:1,
																bgcolor:'bg-color-greenLight',
																colspan:materia.semanas.length,th:false})
				colb.push({texto:this.getMaestro(materia.maestro_id),
																rowspan:1,
																bgcolor:'bg-color-blueLight',
																colspan:materia.semanas.length,th:false})
				colc.push({texto:'',
																rowspan:1,
																bgcolor:'',
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

			}
		}
		return {cola:cola,colb:colb,colc:colc};

	}
	this.generarHorario =function(datos){
			var grupos =this.gruposPorHorario(datos);
			console.log('grupos',grupos);
			var filas = [];
			var columnas= [];
			var semanas = this.semanal(0);
		 //	var columnasb = [];
			columnas.push({texto:datos.horaInicio+"-"+datos.horaFin,
																		colspan:1,
																		bgcolor:'',
																		rowspan:grupos.length>0? grupos.length*3:1,th:true});
			if(grupos.length>0){
			
				console.log("si entre");
				var x =	this.generarRowGrupo(grupos[0]);
				console.log("row",x);
				filas.push(columnas.concat(x.cola));
				filas.push(x.colb);
				filas.push(x.colc);
				for(var i =1;i<grupos.length;i++){
					x= this.generarRowGrupo(grupos[i]);
					filas.push(x.cola);
					filas.push(x.colb);
					filas.push(x.colc);
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
			console.log("filas",filas)

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
			console.log(ex,ex.stack)
		}
		console.log('1',_ret)
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
			for(var gpoId in gpos){
				var grupo=gpos[gpoId];
				var turno = Turnos.findOne({_id:grupo.turno_id});
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
  return _grupos;
	}
};