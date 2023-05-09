const controlButton = document.getElementById("controlButton");
const deviceNameInput = document.getElementById("deviceNameInput");
const connectionStatus = document.getElementById("connectionStatus");
const rgb1Button = document.getElementById("dropdownRGB1Button");
const rgb2Button = document.getElementById("dropdownRGB2Button");
const rgb3Button = document.getElementById("dropdownRGB3Button");
let connectedDevice = null
let characteristic = null

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
            optionalServices: ["04001301-4202-1600-ea11-11beec7a1806"]
        });

        //0x93, 0x40, 0xc0, 0xa6, 0x9e, 0xc9, 0x48, 0x84, 0x8e, 0xaa, 0x72, 0x23, 0x3a, 0xf9, 0x8b, 0x66
        //668bf93a-2372-aa8e-8448-c99ea6c04093
        connectedDevice = await device.gatt.connect()
        console.log("Device Connected")
        const service = await connectedDevice.getPrimaryService("04001301-4202-1600-ea11-11beec7a1806");
        console.log("Services obtained")
        characteristic = await service.getCharacteristic("668bf93a-2372-aa8e-8448-c99ea6c04093");
        console.log("Characteristic obtained")
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
    const thingToSend = Uint8Array.of(value);
    characteristic.writeValue(thingToSend)
    console.log("Thing sent!")
  }
}