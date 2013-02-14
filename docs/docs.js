define([
  'text!Behavior-Trees.md',
  'text!Design-Notes.md',
  'text!Devlog.md',
  'text!Gamepieces-(Battle-view).md',
  'text!Gameplay.md',
  'text!Internals.md',
  'text!Promo-stuff.md',
  'text!Tools.md'
], function(){
  var $ol = $('<ol/>');
  var pages = [];
  
  for(var i=0; i<arguments.length; i++) {
    var title = arguments[i].substr(0, 16) + '...';
    
    $ol.append(
      $('<li/>')
        .attr({
          'data-id' : i
        })
        .text(title)
        .click(function(e){
          $('div').hide();
          $('#'+$(e.target).attr('data-id')).show();
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
  $('#0').show();
});