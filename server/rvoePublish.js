Meteor.publish("rvoe", function(params){
	return Rvoe.find(params);
}); 

