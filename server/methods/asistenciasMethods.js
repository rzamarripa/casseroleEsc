Meteor.methods({
  getAlumnosGrupo: function (query) {
    query = query || {};
    var maestro = Maestros.findOne({nombreUsuario:Meteor.user().username});
    var inscripciones = Inscripciones.find(query).fetch();
    var alumnos = [];
    inscripciones.forEach(function(inscripcion){
      var alumno = Alumnos.findOne({_id:inscripcion.alumno_id});
      alumnos.push({_id:alumno._id, 
	      						matricula:alumno.matricula, 
	      						nombre:alumno.nombre, 
	      						apPaterno:alumno.apPaterno, 
	      						apMaterno:alumno.apMaterno, 
	      						checked:true});
    });
    return alumnos;
  },
  setAsistencia: function (asistencia) {
	  var maestro = Maestros.findOne({nombreUsuario:Meteor.user().username});
	  asistencia.maestro_id = maestro._id; 
	  Asistencias.insert(asistencia);
	  return true;
  },
  getAsistencias: function(grupo_id, materia_id){
	  return Asistencias.find({grupo_id:grupo_id, materia_id: materia_id},{sort:{fechaAsistencia:1}}).fetch();
  },
  getAsistencia: function(options){
	  return Asistencias.find(options).fetch();
  }
});