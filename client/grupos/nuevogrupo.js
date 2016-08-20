angular
.module("casserole")
.controller("NuevoGrupoCtrl", NuevoGrupoCtrl); 
function NuevoGrupoCtrl($scope, $meteor, $reactive, $state, $stateParams, toastr){
	let rc = $reactive(this).attach($scope);
	
	this.grupo = {};
	this.grupo.inscripcion = {};
	this.grupo.colegiatura = {};
	this.grupo.comisiones=[];
	this.grados = [];
	this.subCiclosAcademicos = [];
	this.subCiclosAdministrativos = [];
	this.periodosAcademicos = [];
	this.periodosAdministrativos = [];

	var quitarhk=function(obj){
		if(Array.isArray(obj)){
			for (var i = 0; i < obj.length; i++) {
				obj[i] =quitarhk(obj[i]);
			}
		}
		else if(obj !== null && typeof obj === 'object')
		{
			delete obj.$$hashKey;
			for (var name in obj) {
	  			obj[name] = quitarhk(obj[name]);
			}

		}
		return obj;
	}

	this.subscribe('grupos', () => {
			return [{
				_id : $stateParams.id,
				estatus : true, seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : ""
			}];
		}, {
		onReady:function(){
			rc.grupo = Grupos.findOne({_id:$stateParams.id});
	}});

	this.subscribe('conceptosComision',()=>{
		return [{estatus:true, seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : ""}]
	});
	
	this.subscribe('secciones',()=>{
		return [{estatus:true, _id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : "" }]
	 });
	 
	this.subscribe('horarios',()=>{
		return [{estatus:true, seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : "" }]
	 });
	 
	this.subscribe('ciclos', () => {
		return [{
			estatus : true, seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : ""
		}];
	});
	
	this.subscribe('subCiclos', () => {
		return [{
			ciclo_id : this.getReactively("grupo.ciclo_id"), campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""
		}];
	});
	
	this.subscribe('periodos', () => {
		return [{
			subCiclo_id : this.getReactively("grupo.subCicloAdministrativo_id"), campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""
		}];
	});
		
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
	  turnos : () => {
		  return Turnos.find();
	  },
	  horarios : ()=>{
	  	return Horarios.find();
	  },
	  maestros : () => {
		  return Maestros.find();
	  },

	  periodosAdministrativos : () =>{
	  	var periodos =Periodos.find({subCiclo_id:this.getReactively('grupo.subCicloAdministrativo_id')}).fetch();
	  	var planviejo ={}
	  	if(!this.grupo)
	  		this.grupo={};
	  	if(!this.grupo.plan)
	  		this.grupo.plan={};
	  	else{
	  		planviejo=this.grupo.plan;
	  		this.grupo.plan={};
	  	}
	  	if(!this.grupo.comisiones || this.grupo.comisiones.length==0){
	  		this.grupo.comisiones = ConceptosComision.find().fetch();
	  	}
	  	for (var i = 0; i < periodos.length; i++) {
	  		var periodo =periodos[i];
	  		
	  		this.grupo.plan[periodo.nombre]={};
	  		this.grupo.plan[periodo.nombre].tipoPlan = '';
	  		this.grupo.plan[periodo.nombre].datos=[];
	  		this.grupo.plan[periodo.nombre].planPago = periodo.planPago;

	  		for (var j = 0; periodo && periodo.conceptos && j < periodo.conceptos.length; j++) {
	  			var concepto=periodos[i].conceptos[j];

	  			var _grupo = {}
	  			_grupo.activa=true
	  			_grupo = concepto;
	  			//_grupo.plan = periodo.plan;

	  			//_grupo.modulo = periodo.modulo;
	  			//_grupo = concepto;
	  			if(planviejo && planviejo[periodo.nombre] &&
	  				planviejo[periodo.nombre].datos )
	  				{
	  					var viejos=planviejo[periodo.nombre].datos ;
	  					for (var k = 0; k < viejos.length; k++) {
	  						if(viejos[k].nombre==_grupo.nombre){
	  							_grupo.importe = viejos[k].importe
	  							_grupo.activa = viejos[k].activa
	  						}
	  					}

	  				}
	  			this.grupo.plan[periodo.nombre].tipoPlan = periodo.modulo;
	  			this.grupo.plan[periodo.nombre].datos.push(_grupo);

	  			
	  		}
	  	}
	  	return Periodos.find({subCiclo_id:this.getReactively('grupo.subCicloAdministrativo_id')});
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
		this.grupo.campus_id = Meteor.user().profile.campus_id;
		this.grupo.seccion_id = Meteor.user().profile.seccion_id;
		grupo.inscritos = 0;
		horario = Horarios.findOne(grupo.horario_id);
		_grupo =quitarhk(grupo)
		__grupo_id = Grupos.insert(_grupo);
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
		_grupo =quitarhk(grupo)	
		Grupos.update({_id:$stateParams.id}, {$set : _grupo});
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