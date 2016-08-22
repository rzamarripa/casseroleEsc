angular
.module("casserole")
.controller("NuevoGrupoCtrl", NuevoGrupoCtrl); 
function NuevoGrupoCtrl($scope, $meteor, $reactive, $state, $stateParams, toastr){
	let rc = $reactive(this).attach($scope);
	
	this.grupo = {};
	this.grupo.inscripcion = {};
	this.grupo.colegiatura = {};
	this.grupo.conceptosComision=[];
	this.grados = [];
	this.subCiclosAcademicos = [];
	this.subCiclosAdministrativos = [];
	this.periodosAcademicos = [];
	this.periodosAdministrativos = [];



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
			
	this.subscribe('horarios',()=>{
			return [{estatus:true, seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : ""}]
		}
	);
			
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
				
				
				if(!this.grupo)
					this.grupo={};
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
						console.log(this.grupo.inscripcion.conceptos[concepto._id]);
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
		secciones : () => {
			rc.grados = [];
				var seccionSeleccionada = Secciones.findOne();
				for(var i = 1; seccionSeleccionada && i <= seccionSeleccionada.grados; i++ ){
					rc.grados.push(i);
				}
			return Secciones.findOne();
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
		horarios : ()=>{
			return Horarios.find();
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
		horario = Horarios.findOne(grupo.horario_id);
		//_grupo =quitarhk(grupo)
		__grupo_id = Grupos.insert(grupo);

		var clases = _.uniq(horario.clases, function(clase){
			return clase.materia_id;
		});
		$meteor.call("insertMaestrosMateriasGrupos", clases, __grupo_id);

		toastr.success('Grupo guardado.');
		this.grupo = {}; 
		$('.collapse').collapse('hide');
		this.nuevo = true;
		form.$setPristine();
		form.$setUntouched();
		$state.go('root.grupos');
	};
	
	this.editarGrupo = function(id)
	{
	rc.grupo = Grupos.findOne({_id:$stateParams.id});
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
		horario = Horarios.findOne(grupo.horario_id);
		var clases = _.uniq(horario.clases, function(clase){
			return clase.materia_id;
		});
		$meteor.call("insertMaestrosMateriasGrupos", clases, $stateParams.id);

		toastr.success('Grupo guardado.');
		$state.go("root.grupos",{"id":$stateParams.id});
		form.$setPristine();
	form.$setUntouched();
	};	

};