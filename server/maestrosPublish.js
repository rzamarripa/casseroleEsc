Meteor.publish("maestros",function(params){
	console.log(params);
	return Maestros.find(params);
});