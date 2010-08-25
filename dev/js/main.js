$(document).ready(function() {
  var jm = jsMARS($('#core'), 1600, 10, 100);
  
  jm.addProgram($('#program1').val());
  jm.addProgram($('#program2').val());
  
  jm.compileError(function(program, line, error) {
    if(console) console.log('Compile error in program "' + program.name + '" in line "' + line + '": ' + error);
  });
  
  jm.programTerminated(function(program) {
    if(console) console.log('Program "' + program.name + '" got terminated.');
  });
  
  
  
  
  $('#start').click(function() {
    jm.fight();
    return false;
  });
  
  $('#pause').toggle(function() {
    jm.pause();
    $(this).text('Resume');
  }, function() {
    jm.fight();
    $(this).text('Pause');
  });
  
  $('#reset').click(function() {
    jm.pause();
    jm.initialize();
    return false;
  }).click();
  
  
  
  
  var canvas  = $('#shine').get(0),
      context = canvas.getContext('2d');
  
  context.fillStyle = 'rgba(255, 255, 255, 0.08)';
  context.arc(0, 0, 439, 0, 360, false);
  context.fill();
  
  
  var game  = $('#game'),
      about = $('#about');
  
  function swap(gameLeft, aboutLeft) {
    game.animate({ left: gameLeft });
    about.animate({ left: aboutLeft });
  }
  
  $('#navi a:last').toggle(function() {
    swap(-2000, 0);
    $(this).text('Back to the game');
  }, function() {
    swap(0, -2000);
    $(this).text('About this 10k entry');
  });
});