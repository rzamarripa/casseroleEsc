angular
  .module('casserole')
  .controller('FinancieroCtrl', FinancieroCtrl);
 
function FinancieroCtrl($scope, $meteor, $reactive, $state, toastr) {
	$reactive(this).attach($scope);
};