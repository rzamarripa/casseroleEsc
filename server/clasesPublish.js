Meteor.publish("clases", function(){
	return Clases.find({estatus:true});
});