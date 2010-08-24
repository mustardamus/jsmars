$(document).ready(function() {
  var jm = jsMARS($('#core'), 1600, 10, 100);
  
  jm.addProgram(
    ";redcode-94\n" +
    ";name Imp\n" +
    ";author Sebastian Senf\n" +
    ";strategy An simple Imp\n" +
    ";strategy Just another strategy line :)\n"+
    "mov 0,1"
  );
  
  jm.addProgram(
    ";redcode-94\n" +
    ";name Dwarf\n" +
    ";author Sebastian Senf\n" +
    ";strategy Bomb it\n" +
    "add #4, 3\n"/* +
    "mov 2, @2\n" +
    "jmp -2\n" +
    "dat #0, #4"*/
  );
  
  jm.compileError(function(program, line, error) {
    if(console) console.log('Compile error in program "' + program.name + '" in line "' + line + '": ' + error);
  });
  
  jm.programTerminated(function(program) {
    if(console) console.log('Program "' + program.name + '" got terminated.');
  });
  
  jm.fight();
  
  
  var canvas  = $('#shine').get(0),
      context = canvas.getContext('2d');
  
  context.fillStyle = 'rgba(255, 255, 255, 0.08)';
  context.arc(0, 0, 439, 0, 360, false);
  context.fill();
  
});