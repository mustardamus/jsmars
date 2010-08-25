var jsMARS = function(canvas, coreSize, cellSize, programLength) {
  var context       = canvas.get(0).getContext('2d'),
      core          = [],
      programs      = [],
      currentProgram= 0,
      programColors = [
                        '11, 127, 201',
                        '223, 5, 1',
                        '91, 255, 59'
                      ],
      opacity       = {
                        current : 0.9,
                        executed: 0.6,
                        edited  : 0.4,
                        data    : 0.2
                      },
      cycleInterval = 0,
      compileErrorCallback,
      programTerminatedCallback;
  
  
  
  instructions = {
    dat: {
      execute: function(instruction) {
        //console.log('hola');
      },
      modifier: function(fieldA, fieldB) {
        return 'f';
      }
    },
    nop: {
      modifier: function(fieldA, fieldB) {
        return 'f';
      }
    },
    mov: {
      execute: function(instruction) {
        if(instruction.modeA == '$' && instruction.modeB == '$') {
          setInstruction(instruction.valB, getInstruction(instruction.valA));
        } else {
          var inst = getInstruction(instruction.valB);
          setInstruction(inst.valB, getInstruction(instruction.valA));
        }
        
        setCurrentProgramPos(1);
      },
      modifier: function(fieldA, fieldB) {
        return immediateModifier(fieldA, fieldB, 'i');
      }
    },
    seq: {
      modifier: function(fieldA, fieldB) {
        return immediateModifier(fieldA, fieldB, 'i');
      }
    },
    sne: {
      modifier: function(fieldA, fieldB) {
        return immediateModifier(fieldA, fieldB, 'i');
      }
    },
    add: {
      execute: function(instruction) {
        var inst = getInstruction(instruction.valB);
        inst.valB += instruction.valA;
        inst.status = 'edited';
        
        setInstruction(instruction.valB, inst);
        setCurrentProgramPos(1);
      },
      modifier: function(fieldA, fieldB) {
        return immediateModifier(fieldA, fieldB, 'f');
      }
    },
    sub: {
      modifier: function(fieldA, fieldB) {
        return immediateModifier(fieldA, fieldB, 'f');
      }
    },
    mul: {
      modifier: function(fieldA, fieldB) {
        return immediateModifier(fieldA, fieldB, 'f');
      }
    },
    div: {
      modifier: function(fieldA, fieldB) {
        return immediateModifier(fieldA, fieldB, 'f');
      }
    },
    mod: {
      modifier: function(fieldA, fieldB) {
        return immediateModifier(fieldA, fieldB, 'f');
      }
    },
    slt: {
      modifier: function(fieldA, fieldB) {
        if(getMode(fieldA) == '#') return 'ab';
        return 'b';
      }
    },
    jmp: {
      execute: function(instruction) {
        setCurrentProgramPos(instruction.valA);
      },
      modifier: function(fieldA, fieldB) {
        return 'b';
      }
    },
    jmz: {
      modifier: function(fieldA, fieldB) {
        return 'b';
      }
    },
    jmn: {
      modifier: function(fieldA, fieldB) {
        return 'b';
      }
    },
    djn: {
      modifier: function(fieldA, fieldB) {
        return 'b';
      }
    },
    spl: {
      modifier: function(fieldA, fieldB) {
        return 'b';
      }
    }
  }
  
  
  function rand(min, max) {
    return Math.round(Math.random() * (max-min) + min);
  }
  
  
  
  function addProgram(source) {
    var lines = source.split("\n"),
        name, author, strategy = '', code = '';
    
    for(i = 0; i < lines.length; i++) {
      var line = $.trim(lines[i]),
          lineLow = line.toLowerCase();
      
      if(line.length) {
        if(lineLow.indexOf(';name')     != -1) name      = line.substr(6);
        if(lineLow.indexOf(';author')   != -1) author    = line.substr(8);
        if(lineLow.indexOf(';strategy') != -1) strategy += line.substr(10) + "\n";
        
        line = line.indexOf(';') != -1 ? lineLow.substr(0, line.indexOf(';')) : lineLow;
        if(line.length) code += line + "\n";
      }
    }
    
    programs.push({
      name    : name,
      author  : author,
      strategy: strategy,
      code    : code,
      color   : programColors.pop(),
      position: [],
      process : 0
    });
  }
  
  
  function placePrograms() {
    var space = Math.round(coreSize / programs.length);
    
    for(p = 0; p < programs.length; p++) {
      var lines = programs[p].code.split("\n"),
          pos   = rand(0, coreSize);
          
      if(programs[p-1]) {
        var lastPos = programs[p-1].position[0];
            pos = rand(lastPos + programLength, lastPos + space);
      }
      
      programs[p].position.push(pos);
      
      for(i = 0; i < lines.length; i++) {
        if(lines[i].length) {
          var success = placeInstruction(pos++, lines[i], programs[p]);
          
          if(success != true) {
            compileErrorCallback(programs[p], lines[i], success);
            return false;
          }
        }
      }
    }
    
    return true;
  }
  
  
  function getMode(field) {
    return field.substr(0, 1);
  }
  
  
  function getValue(field) {
    return parseInt(field.substr(1));
  }
  
  
  function immediateModifier(fieldA, fieldB, def) {
    if(getMode(fieldA) == '#')                           return 'ab';
    if(getMode(fieldA) != '#' && getMode(fieldB) == '#') return 'b';
                                                         return def;
  }
  
  
  
  
  
  function placeInstruction(pos, line, program) {
    var fieldsStart = line.indexOf(' '),
        instruction = line.substr(0, fieldsStart),
        fields      = line.split(','),
        fieldA      = $.trim(fields[0].substr(fieldsStart)),
        fieldB      = $.trim(fields[1]),
        modifier    = instruction.split('.'),
        status      = 'data';
        
    if(fieldA.length == 0)  fieldA = 0;
    if(fieldB.length == 0)  fieldB = 0;    
    if(!isNaN(fieldA))      fieldA = '$' + fieldA;
    if(!isNaN(fieldB))      fieldB = '$' + fieldB;
    
    instruction = instruction.substr(0, 3);
    if(instruction == 'cmp') instruction = 'seq';
    
    if(!instructions[instruction])
      return 'Unknown instruction "' + instruction + '"';
    
    var modes = ['#', '$', '*', '@', '{', '}', '<', '>'],
        modeA = getMode(fieldA),
        modeB = getMode(fieldB),
        uam   = 'Unknown address mode "';
    
    if($.inArray(modeA, modes) == -1)
      return uam + modeA + '"';
    
    if($.inArray(modeB, modes) == -1)
      return uam + modeB + '"';
    
    if(modifier.length == 1) {
      modifier = instructions[instruction].modifier(fieldA, fieldB);
    } else {
      modifier = $.trim(modifier[1]);
      
      if($.inArray(modifier, ['a', 'b', 'ab', 'ba', 'f', 'x', 'i']) == -1)
        return 'Unknown modifier "' + modifier + '"';
    }
    
    if(instruction != 'dat') status = 'executed';
    
    setInstruction(pos, {
      instruction: instruction,
      modifier   : modifier,
      modeA      : modeA,
      modeB      : modeB,
      valA       : getValue(fieldA),
      valB       : getValue(fieldB),
      owner      : program.name,
      status     : status
    }, true);
    
    return true;
  }
  
  
  function validPos(pos) {
    if(pos < 0) while(pos < 0) pos += coreSize;
    return pos % coreSize;
  }

  
  var setInstruction = function() {
    var pos     = arguments[0],
        oldInst = getInstruction(pos, true),
        inst    = $.extend({}, oldInst, arguments[1]);
    
    if(arguments.length != 3) {
      pos  = getCurrentProgramPos() + arguments[0];
      inst = $.extend({}, inst, { owner: curProgram().name });
    }
        
    core[validPos(pos)] = inst;
  };
  
  
  var getInstruction = function() {
    var pos  = arguments.length == 2 ? arguments[0] : getCurrentProgramPos() + arguments[0]
        inst = core[validPos(pos)];
    
    if(inst) return inst;
    else return {
      instruction: 'dat',
      modifier   : 'f',
      modeA      : '#',
      modeB      : '#',
      valA       : 0,
      valB       : 0,
      owner      : 0,
      status     : 'data'
    }
  };
  
  
  function executeInstruction(pos) {
    var inst = core[validPos(pos)];
    
    if(inst) {
      instructions[inst.instruction].execute(inst);
    } else programTerminatedCallback(programs[currentProgram]);
  }
  
  
  function compileError(callback) {
    compileErrorCallback = callback;
  }
  
  
  function programTerminated(callback) {
    programTerminatedCallback = callback;
  }
  
  
  function getProgramColor(name) {
    for(i = 0; i < programs.length; i++) {
      if(programs[i].name == name) return programs[i].color;
    }
  }
  
  
  function curProgram() {
    return programs[currentProgram];
  }
  
  
  function getCurrentProgramPos() {
    return curProgram().position[curProgram().process];
  }
  
  
  function setCurrentProgramPos(pos) {
    var oldPos = curProgram().position[curProgram().process];
    
    setInstruction(oldPos, { status: 'executed' }, true);
    curProgram().position[curProgram().process] = oldPos + pos;
  }
  
  
  function updateCore() {
    var pos = 0;
    
    context.clearRect(0, 0, canvas.width(), canvas.height());
    
    for(col = 0; col < coreSize/4/cellSize; col++) {
      for(row = 0; row < coreSize/4/cellSize; row++) {
        var instruction = core[pos++],
            fillStyle   = '#111';
        
        if(instruction) fillStyle = 'rgba(' + getProgramColor(instruction.owner) + ',' + opacity[instruction.status] + ')';
        
        context.fillStyle = fillStyle;
        context.fillRect(row * (cellSize + 1), col * (cellSize + 1), cellSize, cellSize);
      }
    }
  }
  
  
  function initialize() {
    placePrograms();
    updateCore();
  }
  
  
  function fight() {
    cycleInterval = setInterval(function() {
      executeInstruction(getCurrentProgramPos());
      updateCore();
      
      if(currentProgram == programs.length - 1) currentProgram = 0;
      else currentProgram++;
    }, 100);
  }
  
  
  function pause() {
    clearInterval(cycleInterval);
  }
  
  
  return {
    initialize       : initialize,
    fight            : fight,
    pause            : pause,
    addProgram       : addProgram,
    compileError     : compileError,
    programTerminated: programTerminated
  }
}