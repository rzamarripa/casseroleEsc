angular.module("casserole")
.controller("InscripcionesCtrl",InscripcionesCtrl)
function InscripcionesCtrl($scope, $meteor, $reactive, $state, toastr) {
  let rc = $reactive(this).attach($scope);


	this.subscribe('ciclos',()=>{
		return [{estatus:true,
		seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : ""
	}]
	});
	this.subscribe("secciones",() => {
		return [{estatus:true, campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""}]
	});
	this.subscribe("tiposingresos",() => {
		return [{estatus:true, campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }]
	});
	this.subscribe('alumnos',()=>{
		return [{"profile.estatus":true, "profile.campus_id" : Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""}]
	});
	this.subscribe("grupos", () => {
		return [{
		 estatus:true,
		 seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : ""
		}]
	});
	this.subscribe("planesEstudios",() => {
		return [{
			estatus:true,
			seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : ""
		
		}]
	});
	this.subscribe('inscripciones',() => {
		return [{
		 	seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : ""
		}]
	});

	rc.helpers({
		ciclos : () => {
			return Ciclos.find();
		},
	  secciones : () => {
		  return Secciones.find();
	  },
	  tiposIngresos : () => {
		  return TiposIngresos.find();
	  },
	  grupos : () => {
		  return Grupos.find();
	  },
	  planesEstudios : () => {
		  return PlanesEstudios.find();
	  },
	  inscripciones : () => {
	  	function findInCollection(lista, valor) {
	      return _.find(lista, function (x) {
	        return x._id == valor;
	      });
	    }
	  	var a = Inscripciones.find();
	  	var _inscripciones = Inscripciones.find().fetch();
	  	var alumnos 	= Meteor.users.find({roles : ["alumno"]}).fetch();
	    var grupos 		= Grupos.find().fetch();
	    var secciones = Secciones.find().fetch();
	    var ciclos	 	= Ciclos.find().fetch();
	    var planesEstudios = PlanesEstudios.find().fetch();
	    _inscripciones.forEach(function (inscripcion) {
	      inscripcion.alumno = findInCollection(alumnos, inscripcion.alumno_id);
	      inscripcion.grupo = findInCollection(grupos, inscripcion.grupo_id);
	      inscripcion.seccion = findInCollection(secciones, inscripcion.seccion_id);
	      inscripcion.ciclo = findInCollection(ciclos, inscripcion.ciclo_id);
	      inscripcion.planEstudio = findInCollection(planesEstudios, inscripcion.grupo.planEstudios_id);
	    });
	    return _inscripciones;
	  },
  });

	this.getCiclo= function(ciclo_id)
	{
		var ciclo = Ciclos.findOne(ciclo_id);
		if(ciclo != undefined)
		return ciclo.descripcion;
	};	

	this.getSeccion= function(seccion_id)
	{
		var seccion = Secciones.findOne(seccion_id);
		if(seccion != undefined)
		return seccion.descripcion;
	};	

	this.getGrupo= function(grupo_id)
	{
		var grupo = Grupos.findOne(grupo_id);
		console.log(grupo_id);
		console.log(grupo);
		if(grupo)
			return grupo.identificador;
	};	

	this.getPlan= function(plan_id)
	{
		var plan = PlanesEstudios.findOne(plan_id);
		if(plan != undefined)
		return plan.clave;
	};
	
	//Método para crear las currículas
	this.createCurricula = function(){
		toastr.success("inicio")
		_.each(rc.inscripciones, function(inscripcion){
			Curriculas.insert({estatus : true, alumno_id : inscripcion.alumno_id, planEstudios_id : inscripcion.planEstudios_id, grados : inscripcion.planEstudio.grados });
		})
		toastr.success("ya")
	}
  
};