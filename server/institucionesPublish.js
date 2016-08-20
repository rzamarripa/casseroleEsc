Meteor.publish("instituciones", function(){
	return Instituciones.find({});
});