angular
.module("casserole")
.controller("GruposDetalleCtrl", GruposDetalleCtrl);
 function GruposDetalleCtrl($scope, $meteor, $reactive , $state, $stateParams, toastr){
	 
 	let rc = $reactive(this).attach($scope);
 	this.grupo = {};
  this.action = true;
  this.alumnos_id = [];
  this.alumnosGrupo = [];
  this.asignacion = {};
  this.inscripcion = {};
  this.buscar = {};
  this.buscar.nombre = "";
  this.alumno_id = "";
  this.ins = "";
  this.confirmar = false;
  this.buscando = false;
  this.hoy = new Date();
  window.rc = rc;
  
  $(document).ready(function(){
	  $("select").select2({dropdownAutoWidth: 'true', width : "100%"});
	})
  this.subscribe('alumnos', () => {		
		return [{
			_id : { $in : this.getCollectionReactively('alumnos_id')}
		}]
	});
	
	this.subscribe('inscripciones', () => {		
		console.log(rc.getReactively("alumno_id"));
		return [{
			alumno_id : this.getReactively('alumno_id')
		}]
	});
	
/*
	this.subscribe('buscarNoAlumnos', () => {
    return [{
	    options : { limit: 10 },
	    where : {
	    	_id : { $nin : this.getCollectionReactively('alumnos_id')},
		    nombreCompleto : this.getReactively('buscar.nombre'),
				seccion_id :  Meteor.user() != undefined ? Meteor.user().profile.seccion_id : "",
				estatus : true
 		  }
    }];
  });
*/

  this.subscribe('grupos', () => {
	  return [{_id : $stateParams.grupo_id }]
  });
	
	this.helpers({
	  grupo : () => {
  		var grupo=Grupos.findOne();
  		if(grupo){
	  		
  		}
  		this.alumnos_id = grupo ? grupo.alumnos ? _.pluck(grupo.alumnos, "alumno_id") : [] : [];
			return Grupos.findOne();
	  },
	  asignacion : () => {
		  var asignacionActiva = {};
		  if(this.getReactively("grupo")){
			  var grupo = Grupos.findOne({},{ fields : { asignaciones : 1 }});			  
			  _.each(grupo.asignaciones, function(asignacion){
				  if(asignacion.estatus == true){
					  asignacionActiva = asignacion;
				  }				  	
			  })
		  }
		  return asignacionActiva;
	  },
	  alumnos : () => {
		  return Meteor.users.find({_id : { $in : this.getCollectionReactively("alumnos_id")},roles : ["alumno"]}, { sort : { "profile.nombreCompleto" : 1}});
	  },
	  inscripcion : () => {
		  return Inscripciones.findOne();
	  }
  });
  
  this.actualizar = function(grupo)
	{
		delete grupo._id;		
		Grupos.update({_id:$stateParams.id}, {$set : grupo});
		toastr.success('Grupo modificado.');
		$state.go("root.grupos");
	};	
	
	this.quitarAlumno = function(alumno_id){
		var res = confirm("Está seguro de querer sacar al alumno del grupo");
		if(res == true){
			_.each(rc.grupo.alumnos, function(alumno, indice){
				if(alumno.alumno_id == alumno_id){
					rc.grupo.alumnos.splice(indice, 1);
				}
			})
			//rc.grupo.alumnos = _.without(rc.grupo.alumnos, $index);
			var idTemp = rc.grupo._id;
			delete rc.grupo._id;
			rc.grupo.inscritos--;
			Grupos.update({_id : idTemp}, {$set : rc.grupo});
			toastr.success("Ha eliminado al alumno correctamente");
		}
	}

	this.agregarAlumno = function(alumno_id, inscripcion_id, nombreCompleto){
		var res = confirm("Está seguro de querer agregar al alumno " + nombreCompleto)
		if(res){
			if(!rc.grupo.alumnos)
				rc.grupo.alumnos=[];
			var alumnos_id = _.pluck(rc.grupo.alumnos, "alumno_id");
			var x = alumnos_id.indexOf(alumno_id);
			console.log(x);
			if(x==-1){
				rc.grupo.alumnos.push({alumno_id : alumno_id, inscripcion_id : inscripcion_id})
				rc.grupo.inscritos++;
				console.log(rc.grupo);
				var idTemp = rc.grupo._id;
				console.log(idTemp);
				delete rc.grupo._id;
				console.log(rc.grupo);
				Grupos.update({_id : idTemp}, {$set : rc.grupo});
				rc.buscando = false;
				rc.buscar.nombre = "";
				console.log("listo");
				toastr.success("Ha insertado al alumno correctamente");
			}else{
				toastr.error("Este alumno ya se encuentra en el grupo");
			}
		}
	}
	
	this.buscandoNoAlumno = function(){
		this.hoy = new Date();
		
		if(this.buscar.nombre.length > 0){
			rc.buscando = true;
		}else{
			rc.buscando = false;
		}
		Meteor.apply("buscarEnGrupo", [rc.buscar.nombre, Meteor.user().profile.seccion_id], function(error, result){
			if(result){
				rc.balumnos = result;
			}
		});
	}
	
	this.tieneFoto = function(sexo, foto){
	  if(foto === undefined){
		  if(sexo === "masculino")
			  return "img/badmenprofile.png";
			else if(sexo === "femenino"){
				return "img/badgirlprofile.png";
			}else{
				return "img/badprofile.png";
			}
			  
	  }else{
		  return foto;
	  }
  }
};