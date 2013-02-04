// JSLint Options
/*global chrome: false */
/*jslint browser: true, devel: true*/


var connectionId = -1;
var bitrates = [300, 1200, 2400, 4800, 9600, 14400, 19200, 28800, 38400, 57600, 115200];

function setStatus(status) {
    document.getElementById('status').innerText = status;
}

function onOpen() {
    if (!serial_lib.isConnected()) {
        setStatus('Could not open');
        return;
    }
    setStatus('Connected');
}

function openSelectedPort() {
    var portPicker = document.getElementById('port-picker');
    var selectedPort = portPicker.options[portPicker.selectedIndex].value;
    var bitratePicker = document.getElementById('bitrate-picker');
    var selectedBitrate = bitratePicker.options[bitratePicker.selectedIndex].value;
    serial_lib.setBitrate(parseInt(selectedBitrate,10));
    serial_lib.openSerial(selectedPort, onOpen);
}

function buildPortPicker(ports) {
    var eligiblePorts = ports.filter(function (port) {
        return !port.match(/[Bb]luetooth/);
    });

    var portPicker = document.getElementById('port-picker');
    eligiblePorts.forEach(function (port) {
        var portOption = document.createElement('option');
        portOption.value = portOption.innerText = port;
        portPicker.appendChild(portOption);
    });

    portPicker.onchange = function () {
        if (connectionId !== -1) {
            serial_lib.closeSerial(serial_lib.onClose);
            return;
        }
        openSelectedPort();
    };
}

function buildBitratePicker(bitrates) {

    var brPicker = document.getElementById('bitrate-picker');
    bitrates.forEach(function (br) {
        var brOption = document.createElement('option');
        brOption.value = brOption.innerText = br;
        brPicker.appendChild(brOption);
    });
    

    brPicker.value = serial_lib.getBitrate();
    
    brPicker.onchange = function () {
        if (connectionId !== -1) {
            serial_lib.closeSerial(serial_lib.onClose);
            return;
        }
        openSelectedPort();
    };
}
    

var writeSerial = function (writeString) {
    if (!serial_lib.isConnected()) {
        return;
    }
    if (!writeString) {
        console.log("Nothing to write");
        return;
    }
    if (writeString.charAt(writeString.length - 1) !== '\n') {
        writeString += "\n";
    }
    serial_lib.writeSerial(writeString);
};

var onRead = function (readData) {
    if (readData.indexOf("log:") >= 0) {
        console.log("log:");
        return;
    }

    var output = document.getElementById('output');
    output.innerHTML += readData + '<br/>';
};


onload = function () {
    serial_lib.getPorts(function (ports) {
        buildPortPicker(ports);
        buildBitratePicker(bitrates);
        openSelectedPort();


        var sendButton = document.getElementById('send');

        sendButton.addEventListener('click', function () {
            var input = document.getElementById('input').value;
            writeSerial(input);
            setInterval(function () {
                serial_lib.startListening(onRead);
            }, 200);
        });
    });
};