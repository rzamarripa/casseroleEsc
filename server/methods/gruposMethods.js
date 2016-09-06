Meteor.methods({
  getGrupos: function (query, usuario) {
    query = query || {};
    var mmgs = MaestrosMateriasGrupos.find({maestro_id:Meteor.user().profile.maestro_id}).fetch()

    mmgs.forEach(function (mmg) {
      mmg.alumnos = [];
			mmg.maestro = Maestros.findOne(mmg.maestro_id);
      mmg.materia = Materias.findOne(mmg.materia_id);
      mmg.grupo = Grupos.findOne(mmg.grupo_id);
      var inscripciones = Inscripciones.find({grupo_id:mmg.grupo_id}).fetch();
      inscripciones.forEach(function(inscripcion){
        var alumno = Alumnos.findOne({_id:inscripcion.alumno_id});
        mmg.alumnos.push(alumno);
      });
    });
		
    return mmgs;

    function findInCollection(lista, valor) {
      return _.find(lista, function (x) {
        return x._id == valor;
      });
    }
  },
  insertMaestrosMateriasGrupos: function (clases, grupo_id) {
    clases.forEach(function(clase){
      mmg = {}; 
      mmg.materia_id = clase.materia_id; 
      mmg.maestro_id = clase.maestro_id;
      mmg.grupo_id = grupo_id;
      mmg.estatus = true;
      mmg.fechaCreacion = new Date();
      MaestrosMateriasGrupos.insert(mmg);
    });
    return
  },
  deleteMaestrosMateriasGrupos: function (grupo_id) {
    MaestrosMateriasGrupos.remove({grupo_id: grupo_id});
    return
  }
});
