angular
.module("casserole")
.controller("GruposActivosCtrl", GruposActivosCtrl);
function GruposActivosCtrl($scope, $meteor, $reactive,  $state, $stateParams, toastr) {
	
	let rc = $reactive(this).attach($scope);
	
  this.action = true;
  this.nuevo = true;  
	this.grupos_id = [];
	this.maestros_id = [];
	this.materias_id = [];
	this.mmgs_id = [];
	this.horarios_id = [];
  
	this.subscribe('maestrosMateriasGrupos', () => {		
		return [{ estatus : true	}]
	});
	
	this.subscribe('grupos', () => {		
		return [{
			_id : { $in : this.getCollectionReactively('grupos_id')}
		}]
	});
	
	this.subscribe('maestros', () => {		
		return [{
			_id : { $in : this.getCollectionReactively('maestros_id')}
		}]
	});
	
	this.subscribe('materias', () => {		
		return [{
			_id : { $in : this.getCollectionReactively('materias_id')}
		}]
	});
	
	this.subscribe('materias', () => {		
		return [{
			_id : { $in : this.getCollectionReactively('materias_id')}
		}]
	});
	
	this.subscribe('asistencias', () => {		
		return [{
			maestroMateriaGrupo_id : { $in : this.getCollectionReactively('mmgs_id')}
		}]
	});
	
	this.subscribe('horarios', () => {
		return [{
			_id : { $in : this.getCollectionReactively('horarios_id')}
		}]
	});

  this.helpers({
	  gruposActivos : () => {
		  var mmgs = MaestrosMateriasGrupos.find().fetch();
		  rc.grupos_id = _.pluck(mmgs, "grupo_id");
		  rc.maestros_id = _.pluck(mmgs, "maestro_id");
		  rc.materias_id = _.pluck(mmgs, "materia_id");
		  rc.mmgs_id = _.pluck(mmgs, "_id");
		  rc.horarios_id = _.pluck(Grupos.find().fetch(), "horario_id");
		  _.each(mmgs, function(mmg){
			  mmg.grupo = Grupos.findOne(mmg.grupo_id);
			  mmg.maestro = Maestros.findOne(mmg.maestro_id);
			  mmg.materia = Materias.findOne(mmg.materia_id);
			  
			  if(mmg.grupo){
				  mmg.grupo.display = "none";
				  mmg.horario = Horarios.findOne(mmg.grupo.horario_id);
				  mmg.asistencias = Asistencias.find({grupo_id : mmg.grupo_id}).fetch();
				  if(mmg.horario){
					  _.each(mmg.horario.clases, function(clase){
						  clase.start = new Date(clase.start);
					  })
					  mmg.horario.display = "none";
				  }
			  }
		  });
		  var acomodado = _.groupBy(mmgs, "maestro_id");
		  return acomodado;
	  }	  
  });
  
  this.getMaestro = function(maestro_id){
	  var maestro = Maestros.findOne(maestro_id);
	  if(maestro){
		  return maestro.nombre + " " + maestro.apPaterno + " " + maestro.apMaterno;
	  }
  }
  
  this.getHorario = function(horario_id){
	  var horario = Horarios.findOne(horario_id);
	  if(horario){
		  return horario.clases;
	  }
  }
  
  this.contraerExpandirAsistencia = function(display){
	  if(display == "none")
	  	display = "list-item";
	  else
	  	display = "none";
	  return display;
  }
  
  this.contraerExpandirGrupo = function(grupo){
	  if(grupo == "none")
	  	grupo = "list-item";
	  else
	  	grupo = "none";
	  return grupo;
  }
 
	
};