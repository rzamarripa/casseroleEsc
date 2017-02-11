angular.module("casserole")
.controller("GruposCtrl", GruposCtrl);
 function GruposCtrl($scope, $meteor, $reactive , $state, $stateParams, toastr){
 	let rc = $reactive(this).attach($scope);

  if ($stateParams.id != undefined) {
  	this.action = false;
  }else{
  	this.action = true;
  }
  
	this.grupos_ids = [];
	this.ciclos_ids = [];
	this.subCiclos_ids = [];
	this.periodos_ids = [];
	this.subCiclos = [];
	

	
	this.subscribe('grupo', () => {
		return [{_id : $stateParams.id, seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : ""}];
	});
	
	this.subscribe("secciones",()=>{
		return [{estatus:true, campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }]
	 });
	
	this.subscribe('inscripciones', () => {
		return [{
			grupo_id : {$in : this.getCollectionReactively('grupos_ids')},seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : ""
		}]
	});
	
	this.subscribe('subCiclos', () => {
		return [{
			ciclo_id : {$in : this.getCollectionReactively('ciclos_ids')},estatus:true,seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : ""
		}]
	});
	
	this.subscribe('periodos', () => {

		return [{
			subCiclo_id : {$in : this.getCollectionReactively('subCiclos_ids')},seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : ""
		}]
	});

	rc.subscribe('planesEstudios',function(){
  		return [{seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : "" }] 
	});
	
	this.subscribe('ciclos',()=>{
		return [{estatus:true, seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : "" }]
	 });

	this.subscribe('maestros',()=>{
		return [{estatus:true, campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }]
	 });
	
	this.subscribe('turnos',()=>{
		return [{estatus:true, campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }]
	 }); 

	this.helpers({		
		grupo : () => {
			return Grupos.findOne($stateParams.id);
		},
		planes : () => {
		  	return PlanesEstudios.find();
	  	},
	  grupos : () => {
		  _grupos = Grupos.find().fetch();
		  if(_grupos != undefined){
			  _.each(_grupos, function(grupo){
				  rc.grupos_ids.push(grupo._id);
			  });
		  }
		  return _grupos;
	  },
	  secciones : () => {
		  return Secciones.find();
	  },
	  ciclos : () => {
		  _ciclos = Ciclos.find().fetch();
		  if(_ciclos != undefined){
			  _.each(_ciclos, function(ciclo){
				  rc.ciclos_ids.push(ciclo._id);
			  })
		  }
		  return _ciclos;
	  },
	  turnos : () => {
		  return Turnos.find();
	  },
	  maestros : () => {
		  return Maestros.find();
	  },
	  subCiclos : () => {
		  _subCiclos = SubCiclos.find().fetch();
		  if(_subCiclos != undefined){
			  _.each(_subCiclos, function(subCiclo){
				  rc.subCiclos_ids.push(subCiclo._id);
			  })
		  }
		  return _subCiclos;
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

	  	_.each(periodos,function(periodo){
	  		this.grupo.plan[periodo.nombre]={};
	  		_.each(periodo.conceptos,function(concepto){
	  			this.grupo.plan[periodo.nombre][concepto.nombre]={}
	  			this.grupo.plan[periodo.nombre][concepto.nombre].activa=true
	  			this.grupo.plan[periodo.nombre][concepto.nombre].plan = periodo.plan;
	  			this.grupo.plan[periodo.nombre][concepto.nombre].modulo = periodo.modulo;
	  			this.grupo.plan[periodo.nombre][concepto.nombre].concepto = concepto;
	  			if(planviejo && planviejo[periodo.nombre] && 
	  				planviejo[periodo.nombre][concepto.nombre] && 
	  				planviejo[periodo.nombre][concepto.nombre].concepto &&
	  				planviejo[periodo.nombre][concepto.nombre].concepto.importe)
	  					this.grupo.plan[periodo.nombre][concepto.nombre].concepto.importe=
	  						planviejo[periodo.nombre][concepto.nombre].concepto.importe
	  			if(planviejo && planviejo[periodo.nombre] && 
	  				planviejo[periodo.nombre][concepto.nombre] && 
	  				planviejo[periodo.nombre][concepto.nombre].activa )
	  					this.grupo.plan[periodo.nombre][concepto.nombre].activa=
	  						planviejo[periodo.nombre][concepto.nombre].activa

	  			this.grupo.plan[periodo.nombre][concepto.nombre].procedimientos = periodo.procedimiento[concepto.nombre];
	  				
	  		})
	  	});
	  	return Periodos.find({subCiclo_id:this.getReactively('grupo.subCicloAdministrativo_id')});
	  },
	  periodos : () => {
		  _periodos = Periodos.find().fetch();
		  if(_periodos != undefined){
			  _.each(_periodos, function(periodo){
				  rc.periodos_ids.push(periodo._id);
			  })
		  }
		  return _periodos;
	  },
  });
 

  this.nuevoGrupo = function()
  {
    this.action = true;
    this.nuevo = !this.nuevo;
    this.grupo = {};
  }; 

  this.guardar = function(grupo,form)
	{
		if(form.$invalid){
      toastr.error('Error al guardar los datos.');
      return;
    }
		grupo.estatus = true;
		grupo.campus_id = Meteor.user().profile.campus_id;
		grupo.seccion_id = Meteor.user().profile.seccion_id;
		grupo.usuarioInserto = Meteor.userId();
		grupo.inscritos = 0;
		Grupos.insert(this.grupo);
		toastr.success('Guardado correctamente.');
		this.grupo = {}; 
		$('.collapse').collapse('hide');
		this.nuevo = true;
		form.$setPristine();
    form.$setUntouched();
		$state.go('root.grupos');
	};

  this.actualizar = function(grupo){
    if(form.$invalid){
      toastr.error('Error al actualizar los datos.');
      return;
	  }
    var idTemp = grupo._id;
		delete grupo._id;		
		grupo.usuarioActualizo = Meteor.userId(); 
		Grupos.update({_id:$stateParams.id}, {$set : grupo});
		toastr.success('Actualizado correctamente.');
		$state.go("root.grupos",{"id":$stateParams.id});
		form.$setPristine();
    form.$setUntouched();
	};

	this.cambiarEstatus = function(id)
	{
		var grupo = Grupos.findOne({_id:id});
		if(grupo.estatus == true)
			grupo.estatus = false;
		else
			grupo.estatus = true;		
		Grupos.update({_id:id},  {$set : {estatus: grupo.estatus}});
	};

	this.getSeccion = function(seccion_id)
	{
		var seccion = Secciones.findOne(seccion_id);
		if(seccion)
		return [seccion.descripcion, seccion.grados];
	};

	this.getCiclo = function(ciclo_id)
	{
		ciclo = Ciclos.findOne(ciclo_id);
		if(ciclo)
			return ciclo.nombre;
	};	
	
	this.getTurno = function(turno_id)
	{
		var turno = Turnos.findOne(turno_id);
		if (turno) 
		return turno.nombre + " " + turno.horaInicio + "-" + turno.horaFin;
	};	
	
	this.getEstatus = function(estatus){
		if (estatus == false)
			return "Activar";
		else
			return "Desactivar";
	}
	
	this.getInscritos = function(id){		
		var inscritos = Inscripciones.find({grupo_id : id}).count();
		return inscritos;
	}
	
	this.getMaestro = function(maestro_id){
		var maestro = Maestros.findOne(maestro_id);
		if(maestro)
			return maestro.nombre;
	}
};