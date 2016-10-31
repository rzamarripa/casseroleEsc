Meteor.methods({
  agregacion: function () {
    return Inscripciones.aggregate([
      {$match:{_id:"$campus_id"}}])
  }
});