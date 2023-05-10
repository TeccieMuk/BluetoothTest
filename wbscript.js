const controlButton = document.getElementById("controlButton");
const deviceNameInput = document.getElementById("deviceNameInput");
const connectionStatus = document.getElementById("connectionStatus");
const rgb1Button = document.getElementById("dropdownRGB1Button");
const rgb2Button = document.getElementById("dropdownRGB2Button");
const rgb3Button = document.getElementById("dropdownRGB3Button");

// Note that the byte order of the uuid's is reversed with respect to the device.
const serviceUuid = "04001301-4202-1600-ea11-11beec7a1806"
const characteristicUuid = "668bf93a-2372-aa8e-8448-c99ea6c04093"
let connectedDevice = null
let characteristic = null
let ledControlRequest = null

controlButton.addEventListener("click", BLEManager);
rgb1Button.addEventListener("click", Rgb1Send)
rgb2Button.addEventListener("click", Rgb2Send)
rgb3Button.addEventListener("click", Rgb3Send)

async function BLEManager() {
    connectionStatus.textContent = "SEARCHING";
    try {

        const device = await navigator.bluetooth.requestDevice({
            filters: [{
              namePrefix: deviceNameInput.value
            }],
            optionalServices: [serviceUuid]
        });


        connectedDevice = await device.gatt.connect()
        console.log("Device Connected")
        const service = await connectedDevice.getPrimaryService(serviceUuid);
        console.log("Services obtained")
        characteristic = await service.getCharacteristic(characteristicUuid);
        console.log("Characteristic obtained")

        console.log("Loading protobuf..")
        protobuf.load("./assets/proto/bluetooth.proto", function(err, root) {
          if (err)
              throw err;
      
          // Obtain a message type
          ledControlRequest = root.lookupType("LedControlRequest");
          // // Decode an Uint8Array (browser) or Buffer (node) to a message
          // var message = AwesomeMessage.decode(buffer);
          // // ... do something with message
      
          // // If the application uses length-delimited buffers, there is also encodeDelimited and decodeDelimited.
      
          // // Maybe convert the message back to a plain object
          // var object = AwesomeMessage.toObject(message, {
          //     longs: String,
          //     enums: String,
          //     bytes: String,
          //     // see ConversionOptions
          // });
      });

        connectionStatus.textContent = "Connected";


    }
    catch (err){
        connectionStatus.textContent = err
     }
  }

async function Rgb1Send(){
  sendRgb(1)
}

async function Rgb2Send(){
  sendRgb(2)
}

async function Rgb3Send(){
  sendRgb(3)
}

async function sendRgb(value){
  if (connectedDevice === null)
  {
    console.log("Connect first.")
  }
  else
  {
    try
    {
      const buffer = await createProtobufBuffer(value)
      characteristic.writeValue(buffer)
      console.log("Message sent!")
    }
    catch (err){
      connectionStatus.textContent = err
   }
  }
}

async function createProtobufBuffer(value){
  var payload = { 
    mode: 2,
    color: value
  };
    
  // Verify the payload if necessary (i.e. when possibly incomplete or invalid)
  var errMsg = ledControlRequest.verify(payload);
  if (errMsg)
      throw Error(errMsg);
  
  // Create a new message
  var message = ledControlRequest.create(payload); // or use .fromObject if conversion is necessary
  
  // Encode a message to an Uint8Array (browser) or Buffer (node)
  const buffer = ledControlRequest.encode(message).finish();
  // Log te b64 encoded string for debugging purposes.
  var decoder = new TextDecoder('utf8');
  var b64encoded = btoa(decoder.decode(buffer));
  console.log(b64encoded)
  // The bufer is sliced since it will create an array with a reserved length of ~8000 characters,
  // bluetooth will complain about this.
  return buffer.buffer.slice(0, buffer.byteLength)
}