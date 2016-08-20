Meteor.methods({
  getAlumnos: function () {
	  return Alumnos.find({}).fetch();
		
	},
	
});