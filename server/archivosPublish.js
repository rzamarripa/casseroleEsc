Meteor.publish("archivos",function(options){
  return Archivos.find(options.id);
});