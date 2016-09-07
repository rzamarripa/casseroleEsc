angular
.module("casserole")
.controller("NuevoGrupoCtrl", NuevoGrupoCtrl); 
function NuevoGrupoCtrl($scope, $meteor, $reactive, $state, $stateParams, toastr){
	let rc = $reactive(this).attach($scope);
	
	this.grupo = {};
	this.grupo.inscripcion = {};
	this.grupo.colegiatura = {};
	this.grupo.conceptosComision=[];
	this.grupo.asignaciones = [];
	this.grados = [];
	this.materias = [];
	this.subCiclosAcademicos = [];
	this.subCiclosAdministrativos = [];
	this.periodosAcademicos = [];
	this.periodosAdministrativos = [];
	
	window.objeto = this.grupo;



	this.subscribe('grupos', () => 
	{
		return [{
			_id : $stateParams.id,
			estatus : true, seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : ""
		}];
	}, 
	{
		onReady:function(){
			rc.grupo = Grupos.findOne({_id:$stateParams.id});
		}
	});
			
	this.subscribe('planesEstudios',function(){
		return [{seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : "" }] 
	});
	
	this.subscribe('ciclos', () => {
		return [{
			estatus : true, seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : ""
		}];
	});
	
	this.subscribe('conceptosComision',()=>{
			return [{estatus:true, seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : ""}]
		}
	);
	
	this.subscribe('conceptosPago', () => {
			return [{
				seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : ""
			}];
		},
		{
			onReady:function (argument) {
				var conceptos = ConceptosPago.find().fetch();
				
				
				if(!this.grupo){
					this.grupo={};
					this.grupo.asignaciones = [];
					this.grupo.fechaInicio = new Date();
					this.grupo.semanaInicio = moment().isoWeek();
					this.grupo.semanaFin = 52;
				}
					
				if(!this.grupo.inscripcion)
					this.grupo.inscripcion={
						recargo : 0,
						importeRecargo : 0,
						diasRecargo : 7,
						descuento : 0,
						importeDescuento : 0,
						diasDescuento : 7
					}
				if(!this.grupo.inscripcion.conceptos)
					this.grupo.inscripcion.conceptos={};
				if (!this.grupo.colegiatura) 
					this.grupo.colegiatura={}
				if(!this.grupo.colegiatura.conceptos)
					this.grupo.colegiatura.conceptos ={};
				for(var idcol in this.tiposColegiatura){
					var col = this.tiposColegiatura[idcol];
					if(!this.grupo.colegiatura[col]){
						this.grupo.colegiatura[col]={
							recargo : 0,
							importeRecargo : 0,
							diasRecargo : 7,
							descuento : 0,
							importeDescuento : 0,
							diasDescuento : 7,
							conceptos : {}
						}
					}
					if(col=='Semanal' || col=='Mensual'){
						this.grupo.colegiatura[col].diaColegiatura=1;
					}
					else{
							this.grupo.colegiatura[col].diaColegiatura=[1,16];
					}

				}

				for (var i = 0; i < conceptos.length; i++) {
					var concepto = conceptos[i]
					
					if(concepto.modulo=='inscripcion'){
						if(!this.grupo.inscripcion.conceptos[concepto._id]){
							this.grupo.inscripcion.conceptos[concepto._id]=concepto;
							delete this.grupo.inscripcion.conceptos[concepto._id]._id

						}
					}
					else if(concepto.modulo=='colegiatura'){
						for(var idcol in this.tiposColegiatura){
							var col = this.tiposColegiatura[idcol];
							if(!this.grupo.colegiatura[col].conceptos[concepto._id]){
								this.grupo.colegiatura[col].conceptos[concepto._id]=angular.copy(concepto);
								
								delete this.grupo.colegiatura[col].conceptos[concepto._id]._id
							}
						}

					}
				}
				console.log("grupo", this.grupo);
			}
		}
	);
	
	this.subscribe('turnos',()=>{
		return [{estatus:true, campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }]
	});
	
	this.subscribe('maestros',()=>{
		return [{estatus:true, campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }]
	});

	this.helpers({
		subCiclosAcademicos : () => {
			return SubCiclos.find({ciclo_id : this.getReactively("grupo.ciclo_id"), tipo : "Academico"});
		},
		subCiclosAdministrativos : () => {
			return SubCiclos.find({ciclo_id : this.getReactively("grupo.ciclo_id"), tipo : "Administrativo"});
		},
		periodosAcademicos : () => {
			return Periodos.find({subCiclo_id : this.getReactively("grupo.subCicloAcademico_id")});
		},
		periodosAdministrativos : () => {
			return Periodos.find({subCiclo_id : this.getReactively("grupo.subCicloAdministrativo_id")});
		},
		planes : () => {
				return PlanesEstudios.find();
			},
		grupos : () => {
			return Grupos.findOne();
		},
		ciclos : () => {
			return Ciclos.find();
		},
		tiposColegiatura : () =>{
			return ['Semanal','Quincenal','Mensual'];
		},
		conceptosInscripcion : () => {
	
			return ConceptosPago.find({modulo:'inscripcion'});
		},
		turnos : () => {
			return Turnos.find();
		},
		maestros : () => {
			return Maestros.find();
		}
	});

	if($stateParams.id)
		this.action = false; 
	else
		this.action = true;

	this.guardar = function(grupo,form)
	{
		if(form.$invalid){
			toastr.error('Error al guardar los datos del Grupo.');
			return;
		}
		this.grupo.estatus = true;
		var conceptosComision =ConceptosComision.find().fetch();
		this.grupo.conceptosComision = conceptosComision;
		this.grupo.campus_id = Meteor.user().profile.campus_id;
		this.grupo.seccion_id = Meteor.user().profile.seccion_id;
		grupo.inscritos = 0;
		grupo.fechaCreacion = new Date();
		
		//_grupo =quitarhk(grupo)
		__grupo_id = Grupos.insert(grupo);

/*
		horario = Horarios.findOne(grupo.horario_id);
		
		var clases = _.uniq(horario.clases, function(clase){
			return clase.materia_id;
		});
				
		console.log(clases);
		$meteor.call("insertMaestrosMateriasGrupos", clases, __grupo_id);
*/

		toastr.success('Grupo guardado.');
		this.grupo = {}; 
		rc.grupo.asignaciones = [];
		$('.collapse').collapse('hide');
		this.nuevo = true;
		form.$setPristine();
		form.$setUntouched();
		$state.go('root.grupos');
	};
	
	this.editarGrupo = function(id)
	{
	rc.grupo = Grupos.findOne({_id:$stateParams.id});
	rc.grupo.asignaciones = [];
	this.action = false;
	$('.collapse').collapse("show");
	this.nuevo = false;
	};
	
	this.actualizar = function(grupo,form)
	{
		if(form.$invalid){
			toastr.error('Error al actualizar los datos del Grupo.');
			return;
		}
		
		var idTemp = grupo._id;
		
		delete grupo._id;	
		
		Grupos.update({_id:$stateParams.id}, {$set : grupo});

		$meteor.call("deleteMaestrosMateriasGrupos", $stateParams.id);
/*		
		horario = Horarios.findOne(grupo.horario_id);		

		var clases = _.uniq(horario.clases, function(clase){
			return clase.materia_id;
		});
		
		$meteor.call("insertMaestrosMateriasGrupos", clases, $stateParams.id);
*/

		toastr.success('Grupo modificado.');
		$state.go("root.grupos",{"id":$stateParams.id});
		form.$setPristine();
		form.$setUntouched();
	};	
	
	this.getGrados = function(planEstudio_id){
		var plan = PlanesEstudios.findOne(planEstudio_id);
		rc.grados = [];
		for(var i = 1; i <= plan.grado; i++ ){
			rc.grados.push(i);
		}
	}
	
	this.getMaterias = function(planEstudio_id, grado){
		var plan = PlanesEstudios.findOne(planEstudio_id);
		grado--;
		rc.materias = [];
		_.each(plan.grados, function(val, key){
			if(key == grado){
				_.each(val, function(materia){
					rc.materias.push(materia.materia);
				});				
			}
		})
	};

	this.agregarAsignacion = function(asignacion){
		
		
		var materia = JSON.parse(asignacion.materia);
		asignacion.materia_id = materia._id;
		asignacion.materia = materia;
		asignacion.semanas = [];
		
		asignacion.estatus = false;
		if(rc.grupo.asignaciones.length == 0){
			asignacion.semanas = _.range(rc.grupo.semanaInicio, rc.grupo.semanaInicio + asignacion.materia.semanas);			
		}else{
			var ultimaAsignacion = _.last(rc.grupo.asignaciones);
			var ultimaSemana = _.last(ultimaAsignacion.semanas);
			asignacion.semanas = _.range(ultimaSemana + 1, ultimaSemana + asignacion.materia.semanas + 1); 
			console.log("ultima asignacion", ultimaAsignacion);
			console.log("ultima semana", ultimaSemana);
		}
		rc.grupo.asignaciones.push(asignacion);
		rc.grupo.ultimaSemanaPlaneada = _.last(asignacion.semanas)
		rc.asignacion = {};
		console.log("objeto general", rc.grupo);
	}
	
	this.getMaestro = function(maestro_id){
		var maestro = Maestros.findOne(maestro_id);
		if(maestro)
			return maestro.nombre + " " + maestro.apPaterno;
	}
	
	this.getMaestroFoto = function(maestro_id){
		var maestro = Maestros.findOne(maestro_id);
		if(maestro)
			return maestro.fotografia;
	}
	
	this.getNumeroSemana = function(fecha){
		console.log(fecha);
		rc.grupo.semanaInicio = moment(fecha).isoWeek();
	}

};