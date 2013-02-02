// JSLint Options
/*global chrome: false */
/*jslint browser: true, devel: true*/


var connectionId = -1;

function onOpen() {
  if (serial_lib.isConnected) {
    setStatus('Could not open');
    return;
  }
  setStatus('Connected');
}

function setStatus(status) {
  document.getElementById('status').innerText = status;
}

function buildPortPicker(ports) {
  var eligiblePorts = ports.filter(function(port) {
    return !port.match(/[Bb]luetooth/);
  });

  var portPicker = document.getElementById('port-picker');
  eligiblePorts.forEach(function(port) {
    var portOption = document.createElement('option');
    portOption.value = portOption.innerText = port;
    portPicker.appendChild(portOption);
  });

  portPicker.onchange = function() {
    if (connectionId != -1) {
      serial_lib.closeSerial(serial_lib.onClose);
      return;
    }
    openSelectedPort();
  };
}

function openSelectedPort() {
  var portPicker = document.getElementById('port-picker');
  var selectedPort = portPicker.options[portPicker.selectedIndex].value;
  serial_lib.openSerial(selectedPort, onOpen);
}

var writeSerial=function(writeString) {
    if (!serial_lib.isConnected()) {
      return;
    }
    if (!writeString) {
      logError("Nothing to write");
      return;
    }
    if (writeString.charAt(writeString.length-1)!=='\n') {
      writeString+="\n"; 
    }
    serial_lib.writeSerial(writeString); 
}

var onRead=function(readData) {
    if (readData.indexOf("log:")>=0) {
      return;
    }
    
    var output = document.getElementById('output');
    output.innerHTML += readData + '<br/>';
};


onload = function() {
  serial_lib.getPorts(function(ports) {
    buildPortPicker(ports);
    openSelectedPort();
    
    var input = document.getElementById('input');
    var sendButton = document.getElementById('send');
    
    sendButton.addEventListener('click', function() {
        writeSerial(input);
        serial_lib.startListening(onRead);
    })
    //setInterval(function() { writeSerial("data"); }

    
  });
};