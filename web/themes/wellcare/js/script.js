/*jslint browser: true*/
/*global $, jQuery, Modernizr, enquire*/
(function (window, document, $) {
  var $html = $('html'),
    mobileOnly = "screen and (max-width:47.9375em)", // 767px.
    mobileLandscape = "(min-width:30em)", // 480px.
    tablet = "(min-width:48em)"; // 768px.

  var animationIn = 'scale-in-br',
      animationOut = 'scale-out-br';
  // Add  functionality here.

  // Table responsive
  Drupal.behaviors.tableResponsive = {
    attach: function (context, settings) {
      var $table = $('table', context);
      if ($table.length &&
        !$table.parent().hasClass('table-responsive')) {
        $table.not($table.find('table')).wrap('<div class="table-responsive"></div>');
      }
    }
  };

  Drupal.behaviors.headerMobile = {
    attach: function (context, settings) {
      var $toggleMainMenu = $('.js--toggle-main-menu', context);
      var $toggleUserMenu = $('.js--toggle-user-menu', context);

      $toggleMainMenu.click(function(e){
        $('.header').toggleClass('menu-active');
        e.preventDefault();
      });

      $toggleUserMenu.click(function(e){
        $('.user-menu__dropdown').toggleClass('active');
        e.preventDefault();
      })

      // Hidden block when click outside
      $(document).mouseup(function(e) {
        var userMenu = $('.user-menu');
        // if the target of the click isn't the container nor a descendant of the container
        if (!userMenu.is(e.target) && userMenu.has(e.target).length === 0) {
          $('.user-menu__dropdown').removeClass("active");
        }

        var mainMenu = $('.js--toggle-main-menu');
        // if the target of the click isn't the container nor a descendant of the container
        if (!mainMenu.is(e.target) && mainMenu.has(e.target).length === 0) {
          $('.header').removeClass("menu-active");
        }
      });

    }
  };

  Drupal.behaviors.select = {
    attach: function (context, settings) {
      $('select:not([data-vote-value])').SumoSelect();
      // $('.js-form-type-select select').SumoSelect();
      // $('.gtranslate select').SumoSelect();
    }
  };

  $.fn.addAnimation = function(type, animationClass) {
    if(type == 'in') {
      $(this).addClass('active');
      $(this).addClass(animationClass || animationIn);
      var $fakeThis = $(this);
      setTimeout(function(){
        $fakeThis.removeClass(animationClass || animationIn);
      },500);
    }
    else {
      $(this).addClass(animationClass || animationOut);
      var $fakeThis = $(this);
      setTimeout(function(){
        $fakeThis.removeClass(animationClass || animationOut);
        $fakeThis.removeClass('active');
      },500);
    }
  };

  Drupal.behaviors.chatbox = {
    attach: function (context, settings) {
      var $chatBox = $('.chatbox');

      $('.js-open-chat').click(function(e){
        /*if (typeof ws == "undefined") {
          performKeyExchange(true);
        }*/
        // $chatBox.addAnimation('in');
        // $(this).addAnimation('out');
        $chatBox.addClass('active');
        $(this).removeClass('active');
        e.preventDefault();
      });

      $(".chatbox__search input").on("keyup", function() {
        var value = $(this).val().toLowerCase();
        $(".buddies li").filter(function() {
          $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
      });

      $('.js-close-chat').click(function(e){
        // $('.chatbox').addAnimation('out');
        // $('.chatbox-button').addAnimation('in');
        $('.chatbox').removeClass('active');
        $('.chatbox-button').addClass('active');
        e.preventDefault();
      });

      $('body').on('click', '.js-open-chatItem', function(e){
        var id = $(this).data('id'),
            name = $(this).find('h6').text(),
            avatar = buddies[id]['photo'],
            link = buddies[id]['url'] || '#',
            content = '';
        // Show window if existing
        if($('#user-'+id).length) {
          $('#user-'+id).parents('.chatbox__item').find('.js-show-chatItem').removeClass('active');
          $('#user-'+id).parents('.chatbox__item').find('.js-hide-chatItem').addClass('active');
          $('#user-'+id).parents('.chatbox__item').find('.chatbox__inner').show();
        }
        else {
          //Clone markup from template
          $('.chatbox__wrapper').append($("#chatbox-template .chatbox__item").clone().html(function(index,oldHTML){
            var newHTML = "";
            newHTML = oldHTML.replace("[avatar]", avatar);
            newHTML = newHTML.replace("[link]", link);
            newHTML = newHTML.replace("[name]", name);
            newHTML = newHTML.replace("[id]", id);
            newHTML = newHTML.replace("[content]", content);
            return newHTML;
          }));
          $('#user-'+id).parents('.chatbox__item').addAnimation('in','scale-in-ver-bottom');

          if (typeof id !== 'undefined') {
            loadHistoryMessages(id, 0);
          }
        }
        e.preventDefault();
      });

      $('body').on('click', '.js-close-chatItem', function(e){
        $(this).parents('.chatbox__item').remove();
        e.preventDefault();
      });

      $('body').on('click','.js-hide-chatItem',function(e){
        $(this).parents('.chatbox__item').find('.chatbox__inner').hide();
        $(this).removeClass('active');
        $(this).parents('.chatbox__item').find('.js-show-chatItem').addClass('active');
        e.preventDefault();
      });

      $('body').on('click', '.js-show-chatItem', function(e){
        $(this).parents('.chatbox__item').find('.chatbox__inner').show();
        $(this).removeClass('active');
        $(this).parents('.chatbox__item').find('.js-hide-chatItem').addClass('active');
        e.preventDefault();
      });

      $(document).on('submit', '.chatbox__input', function(e) {
        if (typeof ws !== "undefined") {
          var sendingMsg = $(this).find('input').val();

          if (sendingMsg != '') {
            var $yChatContent = $(this).parent().find('.chatbox__content');
            $yChatContent.append('<div class="ms-you">' + sendingMsg + '</div>');
            $yChatContent.scrollTop($yChatContent[0].scrollHeight);
            $(this).find('input').val('');

            var buddy_userId = $(this).parent().parent().find('.chatbox__title').find('a').attr('id');
            if (buddy_userId != '' && loginData) {
              buddy_userId = buddy_userId.replace('user-', '');
              var fromUserId = loginData.userName;
              var displayName = loginData.displayName;
              var curTimestamp = Math.floor(Date.now() / 1000);
              var msgObj = {
              "adhoc": {
                  "chatMsg": AESEncryption.encryptMsg(sendingMsg),
                  "toUserId": buddy_userId,
                  "displayName": displayName,
                  "fromUserId": fromUserId,
                  "deliverId": curTimestamp
                }
              }

              var message = JSON.stringify(msgObj);
              ws.send(message);

              console.log('message is sent');
            }

          }


        }
        e.preventDefault();
      });

    }
  };

}(this, this.document, this.jQuery));
