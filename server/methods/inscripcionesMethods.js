Meteor.methods({
  getInscripciones: function (query) {
    query = query || {};
    
    var inscripciones = Inscripciones.find(query).fetch();

    var alumnos 	= Alumnos.find().fetch();
    var grupos 		= Grupos.find().fetch();
    var secciones = Secciones.find().fetch();
    var ciclos	 	= Ciclos.find().fetch();
    var planesEstudios = PlanesEstudios.find().fetch();

    inscripciones.forEach(function (inscripcion) {
      inscripcion.alumno = findInCollection(alumnos, inscripcion.alumno_id);
      inscripcion.grupo = findInCollection(grupos, inscripcion.grupo_id);
      inscripcion.seccion = findInCollection(secciones, inscripcion.seccion_id);
      inscripcion.ciclo = findInCollection(ciclos, inscripcion.ciclo_id);
      inscripcion.planEstudio = findInCollection(planesEstudios, inscripcion.planEstudio_id);
    });
    
    return inscripciones;

    function findInCollection(lista, valor) {
      return _.find(lista, function (x) {
        return x._id == valor;
      });
    }
  }
});