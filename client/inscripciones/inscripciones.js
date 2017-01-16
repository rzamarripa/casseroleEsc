angular.module("casserole")
.controller("InscripcionesCtrl",InscripcionesCtrl)
function InscripcionesCtrl($scope, $meteor, $reactive, $state, toastr) {
  let rc = $reactive(this).attach($scope);

	window.rc = rc;
	var subs = []
	this.buscar = {};
	this.buscar.nombre = "";
	
	subs.push(this.subscribe('ciclos',()=>{
		return [{estatus:true,
		seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : ""
	}]
	}));
	subs.push(this.subscribe("secciones",() => {
		return [{estatus:true, campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""}]
	}));
	subs.push(this.subscribe("tiposingresos",() => {
		return [{estatus:true, campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }]
	}));
	subs.push(this.subscribe('alumnos',()=>{
		return [{"profile.estatus":true, "profile.campus_id" : Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""}]
	}));
	subs.push(this.subscribe("grupos", () => {
		return [{
		 estatus:true,
		 seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : ""
		}]
	}));
	subs.push(this.subscribe("planesEstudios",() => {
		return [{
			estatus:true,
			seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : ""
		
		}]
	}));
/*
	subs.push(this.subscribe('inscripciones',() => {
		return [{ $or : [{estatus : 1}, {estatus : 0} ],		
		 	seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : ""
		}]
	}));
*/
	
	this.subscribe('buscarInscripciones', () => {
		if(this.getReactively("buscar.nombre").length > 3){
			return [{
		    options : { limit: 51 },
		    where : { 
					nombreCompleto : this.getReactively('buscar.nombre'), 
					seccion_id : rc.seccion._id,
					campus_id :  Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""
				} 		   
	    }];
		}
  });
	
	

	rc.helpers({
		ciclos : () => {
			return Ciclos.find();
		},
	  secciones : () => {
		  return Secciones.find();
	  },
	  seccion : () => {
		  return Secciones.findOne();
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
	  	//var a = Inscripciones.find();
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
	      inscripcion.planEstudio = findInCollection(planesEstudios, inscripcion.planEstudios_id);
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
	
	this.cambiarEstatus = function(inscripcion_id, estatus){
		console.log(estatus);
		if(estatus == 0){
			Inscripciones.update(inscripcion_id, { $set : { estatus : 1 }});
			Meteor.apply('reactivarPlanPagos', [inscripcion_id], function(error, result){
			  toastr.success("El alumno ha sido recuperado y su plan de pagos se ha activado");
		  });
		}else{
			Inscripciones.update(inscripcion_id, { $set : { estatus : 0 }});
			Meteor.apply('cancelarPlanPagos', [inscripcion_id], function(error, result){
			  toastr.success("El alumno ha sido dado de baja")
		  });
		}
	}
	
	this.getFocus = function(){
	  document.getElementById('buscar').focus();
  }; 
  
};