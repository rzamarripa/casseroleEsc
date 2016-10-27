angular
.module("casserole")
.controller("GruposDetalleCtrl", GruposDetalleCtrl);
 function GruposDetalleCtrl($scope, $meteor, $reactive , $state, $stateParams, toastr){
	 
 	let rc = $reactive(this).attach($scope);
 	window.rc = rc;
 	this.grupo = {};
  this.action = true;
  this.alumnos_id = [];
  this.alumnosGrupo = [];
  this.asignacion = {};
  this.buscar = {};
  this.buscar.nombre = "";
  
  $(document).ready(function(){
	  $("select").select2();
  })
  
  this.subscribe('alumnos', () => {		
		return [{
			_id : { $in : this.getCollectionReactively('alumnos_id')}
		}]
	});
	
	this.subscribe('buscarNoAlumnos', () => {
    return [{
	    options : { limit: 10 },
	    where : {
	    	_id : { $nin : this.getCollectionReactively('alumnos_id')},
		    nombreCompleto : this.getReactively('buscar.nombre'),
				seccion_id :  Meteor.user() != undefined ? Meteor.user().profile.seccion_id : ""
 		  }
    }];
  });

  this.subscribe('grupos', () => {
	  return [{_id : $stateParams.grupo_id }]
  });
	
	this.helpers({
	  grupo : () => {
  		var grupo=Grupos.findOne();
  		this.alumnos_id = grupo ? grupo.alumnos ? grupo.alumnos : [] : [];
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
		  return Meteor.users.find({_id : { $in : this.getReactively("alumnos_id")},roles : ["alumno"]}, { sort : { "profile.matricula" : 1}});
	  },
	  balumnos : ()=>{
	  	  return Meteor.users.find({_id : { $nin : this.getReactively("alumnos_id")},roles : ["alumno"]});
	  }
  });
  
  this.actualizar = function(grupo)
	{
		delete grupo._id;		
		Grupos.update({_id:$stateParams.id}, {$set : grupo});
		toastr.success('Grupo modificado.');
		$state.go("root.grupos");
	};	
	
	this.quitarAlumno = function($index, alumno_id){
		rc.grupo.alumnos= _.without(rc.grupo.alumnos, $index);
		var idTemp = rc.grupo._id;
		delete rc.grupo._id;
		rc.grupo.inscritos--;
		Grupos.update({_id : idTemp}, {$set : rc.grupo});
		toastr.success("Ha eliminado al alumno correctamente");
	}

	this.agregarAlumno = function(){
		console.log(rc.alumnose);
		var alumno_id = rc.alumnose
		//console.log(rc.grupo)
		if(!rc.grupo.alumnos)
			rc.grupo.alumnos=[];
		var x=rc.grupo.alumnos.indexOf(alumno_id);
		console.log("si entre",x,alumno_id)
		if(x==-1){
			rc.grupo.alumnos.push(alumno_id)
			rc.grupo.inscritos++;
			var idTemp = rc.grupo._id;
			delete rc.grupo._id;
			Grupos.update({_id : idTemp}, {$set : rc.grupo});
			toastr.success("Ha insertado al alumno correctamente");
		}
	}
	
	this.tieneFoto = function(sexo, foto){
	  if(foto === undefined){
		  if(sexo === "masculino")
			  return "img/badmenprofile.jpeg";
			else if(sexo === "femenino"){
				return "img/badgirlprofile.jpeg";
			}else{
				return "img/badprofile.jpeg";
			}
			  
	  }else{
		  return foto;
	  }
  }
};