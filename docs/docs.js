define([
  'text!Behavior-Trees.md',
  'text!Design-Notes.md',
  'text!Devlog.md',
  'text!Pieces.md',
  'text!Gameplay.md',
  'text!Internals.md',
  'text!Misc.md',
  'text!Tools.md'
], function(){
  var $ol = $('<ol/>');
  var pages = [];
  
  for(var i=0; i<arguments.length; i++) {
    var title = arguments[i].substr(0, arguments[i].indexOf('\n')).replace(/#/g,'');
    
    $ol.append(
      $('<li/>')
        .attr({
          'data-id' : i
        })
        .text(title)
        .click(function(e){
          $('li').removeClass('selected');
          $(e.target).addClass('selected');
          $('div').hide();
          var newPage = '#'+$(e.target).attr('data-id');
          $(newPage).show();
          //$(window).scrollTop(0);
          window.location.href = window.location.href.split('#')[0] + newPage;
        })
    );
    
    pages.push(
      $('<div/>')
        .attr('id', i)
        .addClass('hide')
        .html(markdown.toHTML(arguments[i]))
    );
  }

  $('body').append($ol, pages);
  var previousPage = window.location.href.split('#')[1];
  setTimeout(function(){ $('[data-id="'+( previousPage || '0' )+'"]').click(); });
});