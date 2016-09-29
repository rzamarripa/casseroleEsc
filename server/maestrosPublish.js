Meteor.publish("maestros",function(params){
	return Maestros.find(params);
});