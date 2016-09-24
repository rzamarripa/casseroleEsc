Meteor.publish("curriculas", function(options){
	return Curriculas.find(options);
});