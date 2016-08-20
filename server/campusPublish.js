Meteor.publish("campus", function(options){
	return Campus.find(options);
});