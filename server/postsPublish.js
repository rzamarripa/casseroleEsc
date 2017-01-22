Meteor.publish("posts",function (options, params) {
	Counts.publish(this, 'numberOfPosts', Posts.find(params), {noReady: true});
	return Posts.find(params, options);
});
