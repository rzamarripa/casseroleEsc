
angular.module('casserole',
  [
    'angular-meteor',
    'ngMaterial',    
    'ngAnimate',
    'ngCookies',
    'ngSanitize',    
    'toastr',
    'ui.router',
    'ui.grid',
    'smartadmin',
    'datePicker',
    'ui.calendar',
    'ui.bootstrap',
    'checklist-model',
    'ncy-angular-breadcrumb',
    'angularUtils.directives.dirPagination',
    'angular-meteor.auth',
    'ngFileUpload'
  ]
);

$( "html" ).attr({
    lang: "es"
});

NProgress.configure({ easing: 'ease', speed: 500 });
