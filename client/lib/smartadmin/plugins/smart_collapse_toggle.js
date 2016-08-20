(function ($) {

  $.fn.smartCollapseToggle = function () {

    return this.each(function () {

      var $body = $('body');
      var $this = $(this);

      // only if not  'menu-on-top'
      if ($body.hasClass('menu-on-top')) {


      } else {

        $body.hasClass('mobile-view-activated');

        // toggle open
        $this.toggleClass('open');

        // for minified menu collapse only second level
        if ($body.hasClass('minified')) {
          if ($this.closest('nav ul ul').length) {
            $this.find('>a .collapse-sign .fa').toggleClass('fa-minus-square-o fa-plus-square-o');
            $this.find('ul:first').slideToggle(200);
          }
        } else {
          // toggle expand item
          $this.find('>a .collapse-sign .fa').toggleClass('fa-minus-square-o fa-plus-square-o');
          $this.find('ul:first').slideToggle(200);
        }
      }
    });
  };
})(jQuery);
