Meteor.publish("periodos", function(params){
	return Periodos.find(params);
}); 

