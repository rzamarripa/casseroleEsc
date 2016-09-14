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
	this.plan = {};
	
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
			
	this.subscribe('planesEstudios', () => 
	{
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
		},
		grados : () => {
			var grados = [];
			rc.plan = PlanesEstudios.findOne(rc.grupo.planEstudios_id);
			if(this.getReactively("plan")){
				rc.grados = [];
				for(var i = 1; i <= rc.plan.grado; i++ ){
					rc.grados.push(i);
				}
			}
			return rc.grados;
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
		
		__grupo_id = Grupos.insert(grupo);
		_.each(grupo.asignaciones, function(asignacion){
			var relacion = {
				maestro_id : asignacion.maestro_id,
				materia_id : asignacion.materia_id,
				grupo_id : __grupo_id,
				turno_id : grupo.turno_id,
				fechaCreacion : new Date(),
				estatus : true
			}
			MaestrosMateriasGrupos.insert(relacion);
		})

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

		toastr.success('Grupo modificado.');
		$state.go("root.grupos",{"id":$stateParams.id});
		form.$setPristine();
		form.$setUntouched();
	};	
	
	this.getGrados = function(planEstudio_id){
		if(planEstudio_id != undefined){
			rc.plan = PlanesEstudios.findOne(planEstudio_id);
			if(this.getReactively("plan")){
				console.log(rc.plan)
				rc.grados = [];
				for(var i = 1; i <= rc.plan.grado; i++ ){
					rc.grados.push(i);
				}
			}
			
		}		
	}

	this.getMaterias = function(planEstudio_id, grado){
		console.log(planEstudio_id, grado);
		if(planEstudio_id != undefined && grado != undefined){
			var plan = PlanesEstudios.findOne(planEstudio_id);
			console.log("plan", plan);
			grado--;
			rc.materias = [];
			_.each(plan.grados, function(val, key){
				console.log(key, " == ", grado, " val ", val);
				if(key == grado){
					console.log("entré al grado ", grado);
					console.log("mi val es ", val);
					_.each(val, function(materia){
						
						rc.materias.push(materia.materia);
					});				
					console.log("arreglo de materias", rc.materias);
				}
			})
		}
	};

	this.agregarAsignacion = function(asignacion, form2){
		
		//TODO me quedé validando la asignación
		console.log(asignacion);
		if(asignacion == undefined || asignacion.maestro_id == undefined || asignacion.materia == undefined || asignacion.grado == undefined){
			toastr.error('Por favor seleccione maestro, plan de estudios, grado y materia para agregar una asignación.');
			return
		}
		var materia = JSON.parse(asignacion.materia);
		
		var x = !!_.where(rc.grupo.asignaciones, {materia_id:materia._id}).length;
		if(x == true){
			toastr.warning('Esta materia ya está agregada.');
			return
		}
				
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
		rc.materias = [];
	}
	
	this.editarAsignacion = function(asignacionCambio){
		console.log(asignacionCambio);
		rc.asignacion = asignacionCambio;
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
		rc.grupo.semanaInicio = moment(fecha).isoWeek();
	}
	
	this.quitarAsignacion = function(index){
		rc.grupo.asignaciones.splice(index, 1);
	}
	
	this.cambiarEstatus = function(asignacionCambio){
		_.each(rc.grupo.asignaciones, function(asignacionActual){
			if(asignacionCambio.estatus == true && asignacionCambio.materia_id != asignacionActual.materia_id){
				asignacionActual.estatus = false;
			}
		});
	}

};