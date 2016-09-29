angular.module('smartadmin').directive('smartMenu', ['$state', '$rootScope', function ($state, $rootScope) {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      var $body = $('body');

      var $collapsible = element.find('li[data-menu-collapse]');
      $collapsible.each(function (idx, li) {
        var $li = $(li);
        $li
          .on('click', '>a', function (e) {

            // collapse all open siblings
            $li.siblings('.open').smartCollapseToggle();

            // toggle element
            $li.smartCollapseToggle();

            // add active marker to collapsed element if it has active childs
            if (!$li.hasClass('open') && $li.find('li.active').length > 0) {
              $li.addClass('active');
            }

            e.preventDefault();
          })
          .find('>a').append('<b class="collapse-sign"><em class="fa fa-plus-square-o"></em></b>');

        // initialization toggle
        if ($li.find('li.active').length) {
          $li.smartCollapseToggle();
          $li.find('li.active').parents('li').addClass('active');
        }
      });

      // click on route link
      element.on('click', 'a[data-ui-sref]', function (e) {
        // collapse all siblings to element parents and remove active markers
        $(this)
          .parents('li').addClass('active')
          .each(function () {
            $(this).siblings('li.open').smartCollapseToggle();
            $(this).siblings('li').removeClass('active')
          });

        if ($body.hasClass('mobile-view-activated')) {
          // TODO: Find out what this shit is all about
          $rootScope.$broadcast('requestToggleMenu');
        }
      });


      scope.$on('$smartLayoutMenuOnTop', function (event, menuOnTop) {
        if (menuOnTop) {
          $collapsible.filter('.open').smartCollapseToggle();
        }
      });

    }
  }
}]);