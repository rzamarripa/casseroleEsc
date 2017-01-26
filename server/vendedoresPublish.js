Meteor.publish("vendedoresGerentes", function(options){
	return Meteor.users.find(options)
});

Meteor.publish("vendedores", function(options){
	return Meteor.users.find(options)
});