const controlButton = document.getElementById("controlButton");
const deviceNameInput = document.getElementById("deviceNameInput");
const connectionStatus = document.getElementById("connectionStatus");
const rgb1Button = document.getElementById("dropdownRGB1Button");
const rgb2Button = document.getElementById("dropdownRGB2Button");
const rgb3Button = document.getElementById("dropdownRGB3Button");
const lastResponseLabel = document.getElementById("lastResponseLabel");
const wifiSsidInput = document.getElementById("wifiSsidInput");
const wifiPasswordInput = document.getElementById("wifiPasswordInput");
const accountIdInput = document.getElementById("accountIdInput");
const sendWifiSetupButton = document.getElementById("sendWifiSetupButton");

// Note that the byte order of the uuid's is reversed with respect to the device.
const serviceUuid = "04001301-4202-1600-ea11-11beec7a1806"
const ledCharacteristicUuid = "668bf93a-2372-aa8e-8448-c99ea6c04093"
const wifiCharacteristicUuid = "TBD"
let connectedDevice = null
let ledCharacteristic = null
let ledControlRequest = null
let ledControlResponse = null
let cloudConnectionCharacteristic = null
let cloudConnectionRequest = null
let cloudConnectionResponse = null

controlButton.addEventListener("click", handleConnectButton);
sendWifiSetupButton.addEventListener("click", handleSendWifiSetupButton);
rgb1Button.addEventListener("click", Rgb1Send)
rgb2Button.addEventListener("click", Rgb2Send)
rgb3Button.addEventListener("click", Rgb3Send)

async function handleConnectButton() {
    connectionStatus.textContent = "SEARCHING";
    try {

        const device = await navigator.bluetooth.requestDevice({
            filters: [{
              namePrefix: deviceNameInput.value
            }],
            optionalServices: [serviceUuid]
        });

        connectionStatus.textContent = "CONNECTING";
        connectedDevice = await device.gatt.connect()
        console.log("Device Connected")
        const service = await connectedDevice.getPrimaryService(serviceUuid);
        console.log("Services obtained")
        ledCharacteristic = await service.getCharacteristic(ledCharacteristicUuid);
        console.log("Characteristic obtained")
        ledCharacteristic.addEventListener('characteristicValueChanged', handleLedCharacteristicResponse)
        console.log("Loading protobuf..")
        const root = await protobuf.load("./assets/proto/bluetooth.proto");
    
        // Obtain message types
        ledControlRequest = root.lookupType("LedControlRequest");
        ledControlResponse = root.lookupType("LedControlResponse");
        cloudConnectionRequest = root.lookupType("CloudConnectionRequest");
        cloudConnectionResponse = root.lookupType("CloudConnectionResponse");
        connectionStatus.textContent = "CONNECTED";
    }
    catch (err){
        connectionStatus.textContent = err
     }
}

async function Rgb1Send(){
  var payload = { 
    mode: 2,
    color: 1
  };
  sendProtobufOverBluetooth(ledControlRequest, payload, ledCharacteristic)
}

async function Rgb2Send(){
  var payload = { 
    mode: 2,
    color: 2
  };
  sendProtobufOverBluetooth(ledControlRequest, payload, ledCharacteristic)
}

async function Rgb3Send(){
  var payload = { 
    mode: 2,
    color: 3
  };
  sendProtobufOverBluetooth(ledControlRequest, payload, ledCharacteristic)
}

async function handleSendWifiSetupButton() {
  // TODO: THIS LIBRARY MESSES UP THE CASING!
  // One would expect the properties to be "bootstrap_network", but this results in an empty object.
  // It is possible to set a 'keep-case' flag in the load function, but I got some errors when attempting this.
  var payload = { 
    bootstrapNetwork: {
      ssid: wifiSsidInput.value,
      password: wifiPasswordInput.value
    },
    accountId: accountIdInput.value
  };
  // TODO: Use correct characteristic.
  sendProtobufOverBluetooth(cloudConnectionRequest, payload, ledCharacteristic)
}

async function sendProtobufOverBluetooth(request, payload, characteristic){
  if (characteristic === null)
  {
    // TODO better check if device is still connected.
    console.log("Characteristic unknown, connect first.")
  }
  else
  {
    try
    {
      const buffer = await createProtobufBuffer(request, payload)
      characteristic.writeValue(buffer)
      console.log('Buffer through bluetooth:')
      console.log(buffer)
      console.log("Message sent!")
    }
    catch (err){
      connectionStatus.textContent = err
   }
  }
}

async function createProtobufBuffer(request, payload){
  // Verify the payload if necessary (i.e. when possibly incomplete or invalid)
  var errMsg = request.verify(payload);
  if (errMsg)
      throw Error(errMsg);
  
  // Create a new message
  var message = request.create(payload); // or use .fromObject if conversion is necessary
  console.log('Message:')
  console.log(message)
  // Encode a message to an Uint8Array (browser) or Buffer (node)
  const buffer = request.encode(message).finish();
  console.log('Buffer:')
  console.log(buffer)
  // Log te b64 encoded string for debugging purposes.
  console.log('Encoded:')
  console.log(toBase64(buffer))
  // The bufer is sliced since it will create an array with a reserved length of ~8000 characters,
  // bluetooth will complain about this.
  return buffer.slice(0, buffer.byteLength)
}

function handleLedCharacteristicResponse(event) {
  const buffer = event.target.value;
  console.log(buffer)
  // Decode an Uint8Array (browser) or Buffer (node) to a message
  var message = ledControlResponse.decode(buffer);
  console.log(message)
  lastResponseLabel.textContent = toBase64(buffer);
}

function toBase64(buffer)
{
  var decoder = new TextDecoder('utf8');
  var b64encoded = btoa(decoder.decode(buffer));
  return b64encoded
}

