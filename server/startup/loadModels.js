/*
Meteor.startup(function() {   
  return Meteor.methods({
		removeAllCursos: function() {
			return Cursos.remove({});
		},
		removeAllGrupos: function() {
			return Grupos.remove({});
		},	
		removeAllCiclos: function() {
			return Ciclos.remove({});
		},		
		removeAllInscripciones: function() {
			return Inscripciones.remove({});
		},
		removeAllAlumnos: function() {
			return Alumnos.remove({});
		},
		removeAllProfesores: function() {
			return Profesores.remove({});
		},
		removeAllMaterias: function() {
			return Materias.remove({});
		},
		removeAllMaestros: function() {
			return Maestros.remove({});
		},
		removeAllInstituciones: function() {
			return Instituciones.remove({});
		},
		removeAllClases: function() {
			return Clases.remove({});
		},
		getUsuarios: function(){
			return Meteor.users.find().fetch();
		},		
		removeAllUsuarios: function(){			
			return Meteor.users.remove({});
		},
		removeAll: function() {
			Grupos.remove({});
			Cursos.remove({});
			Alumnos.remove({});
			Profesores.remove({});
			Sucursales.remove({});
			Configuraciones.remove({});
			Presupuestos.remove({});
			ConceptosGasto.remove({});
			Materias.remove({});
			return "Se reinició la base de datos correctamente";
		}
	});
});
*/