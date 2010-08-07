$(document).ready(function() {
  var jm = jMARS($('#core'), 1600, 10, 100);
  
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
    ";name Imp 2\n" +
    ";author Sebastian Senf\n" +
    ";strategy An simple Imp\n" +
    "mov 0,1"
  );
  
  jm.compileError(function(program, line, error) {
    if(console) console.log('Compile error in program "' + program.name + '" in line "' + line + '": ' + error);
  });
  
  jm.programTerminated(function(program) {
    if(console) console.log('Program "' + program.name + '" got terminated.');
  });
  
  jm.fight();
});