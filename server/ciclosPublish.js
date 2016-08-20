Meteor.publish("ciclos", function(params){
	return Ciclos.find(params);
}); 

