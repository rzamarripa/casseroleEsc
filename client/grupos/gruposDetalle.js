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
	

	this.subscribe('buscarAlumnos', () => {
    return [{
	    options : { limit: 3 },
	    where : { 
	    	id : { $nin : this.getCollectionReactively('alumnos_id')},
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
	  		console.log(this.alumnos_id)
		  return Meteor.users.find({_id : { $in : this.getReactively("alumnos_id")},roles : ["alumno"]});
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
		Grupos.update({_id : idTemp}, {$set : rc.grupo});
		toastr.success("Ha eliminado al alumno correctamente");
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