/* 
    Contains functions to connect/disconnect from Bluetooth. 
    Also allows for communicating with the sensor through the Protobuf protocol.

    There are commented logs here and there that might assist with debugging through
    the application.
*/

const serviceUuid = "7aa93d62-3c60-db9a-f64a-5bd1468bf478"
const ledCharacteristicUuid = "66d9a057-40e9-ef8b-0e4f-e11255d8f7d2"
const wifiCharacteristicUuid = "7927009f-3a9e-6cb0-5447-cae4ce4692e8"
const tapDataPointCharacteristicUuid = "a05310b3-4a46-3989-eb4b-c7d81f97dd61"
const factoryResetCharacteristicUuid = "16384ff9-9ec2-b69d-4044-8d2ce0d87bfb"
const statusCharacteristicUuid = "6e729130-e21b-0296-9842-986a943debab"
const scanWifiNetworksCharacteristicUuid = "ec336eb8-227d-c0bb-424f-9c179c4c3c1f"
let previouslyConnectedDevice = null
let connectedDevice = null
let ledCharacteristic = null
let ledControlRequest = null
let ledControlResponse = null
let setBootstrapNetworkCharacteristic = null
let setBootstrapNetworkRequest = null
let setBootstrapNetworkResponse = null
let tapDataPointRequest = null
let tapDataPointResponse = null
let tapDataPointCharacteristic = null
let factoryResetRequest = null
let factoryResetResponse = null
let factoryResetCharacteristic = null
let statusRequest = null
let statusResponse = null
let statusCharacteristic = null
let scanWifiNetworksRequest = null
let scanWifiNetworksResponse = null
let scanWifiNetworksCharacteristic = null

export async function reconnectBluetooth() {
    await initialize_device(previouslyConnectedDevice)
}

export async function searchAndConnectToDevice(deviceNamePrefix) {
    let device = null
    if (deviceNamePrefix == "")
    {
        device = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: [serviceUuid]
        });
    }
    else
    {
        device = await navigator.bluetooth.requestDevice({
            filters: [{
                namePrefix: deviceNamePrefix
            }],
            optionalServices: [serviceUuid]
        });
    }

    initialize_device(device)
    return device
}

export async function bootstrapNetwork(ssid, password) {
    const payload = {
        bootstrapNetwork: {
            ssid: ssid,
            password: password
        }
    }
    console.log('Sending wifi config:')
    return await sendProtobufOverBluetoothAndReceiveResponse(
        setBootstrapNetworkRequest,
        setBootstrapNetworkResponse,
        payload,
        setBootstrapNetworkCharacteristic)
}

export async function performNetworkScan(duration) {
    const payload = {
        scanDurationInSeconds: duration
    }

    await sendProtobufOverBluetoothAndReceiveResponse(scanWifiNetworksRequest, scanWifiNetworksResponse, payload, scanWifiNetworksCharacteristic)
}

export async function getNetworksAfterScan() {
    const payload = {
        scanDurationInSeconds: 0
    }

    return await sendProtobufOverBluetoothAndReceiveResponse(scanWifiNetworksRequest, scanWifiNetworksResponse, payload, scanWifiNetworksCharacteristic)
}

export async function sendRgbValue(color, mode) {
    var payload = {
        mode: mode,
        color: color
    };

    await sendProtobufOverBluetooth(ledControlRequest, payload, ledCharacteristic)
}

export async function getTapEventDatapoints(){
    return await readProtobufResponse(tapDataPointResponse, tapDataPointCharacteristic)
}

export async function getStatus(){
    return await sendProtobufOverBluetoothAndReceiveResponse(statusRequest, statusResponse, {}, statusCharacteristic)
}

export async function factoryReset(secret){
    var payload = {
        secret: secret
    };
    return await sendProtobufOverBluetoothAndReceiveResponse(factoryResetRequest, factoryResetResponse, payload, factoryResetCharacteristic)
}

async function initialize_device(device) {
    connectedDevice = await device.gatt.connect()
    console.log("Device Connected")
    const service = await connectedDevice.getPrimaryService(serviceUuid);
    console.log("Services obtained")
    ledCharacteristic = await service.getCharacteristic(ledCharacteristicUuid);
    tapDataPointCharacteristic = await service.getCharacteristic(tapDataPointCharacteristicUuid)
    factoryResetCharacteristic = await service.getCharacteristic(factoryResetCharacteristicUuid)
    statusCharacteristic = await service.getCharacteristic(statusCharacteristicUuid)
    scanWifiNetworksCharacteristic = await service.getCharacteristic(scanWifiNetworksCharacteristicUuid)
    setBootstrapNetworkCharacteristic = await service.getCharacteristic(wifiCharacteristicUuid)
    console.log("Characteristics obtained")

    console.log("Loading protobuf..")
    const root = await protobuf.load("./assets/proto/bluetooth.proto");

    // Obtain message types
    ledControlRequest = root.lookupType("LedControlRequest");
    ledControlResponse = root.lookupType("LedControlResponse");
    tapDataPointRequest = root.lookupType("TapDataPointRequest")
    tapDataPointResponse = root.lookupType("TapDataPointResponse")
    factoryResetRequest = root.lookupType("FactoryResetRequest")
    factoryResetResponse = root.lookupType("FactoryResetResponse")
    statusRequest = root.lookupType("StatusRequest")
    statusResponse = root.lookupType("StatusResponse")
    scanWifiNetworksRequest = root.lookupType("ScanWifiNetworksRequest")
    scanWifiNetworksResponse = root.lookupType("ScanWifiNetworksResponse")
    setBootstrapNetworkRequest = root.lookupType("SetBootstrapNetworkRequest")
    setBootstrapNetworkResponse = root.lookupType("SetBootstrapNetworkResponse")
    console.log("Protobuf loaded!")
    previouslyConnectedDevice = device
}

async function sendProtobufOverBluetoothAndReceiveResponse(request, response, payload, characteristic) {
    await sendProtobufOverBluetooth(request, payload, characteristic)
    return await readProtobufResponse(response, characteristic)
}

async function readProtobufResponse(response, characteristic) {
    if (characteristic === null) {
        // TODO better check if device is still connected.
        console.log("Characteristic unknown, connect first.")
        return null
    }

    const result = await characteristic.readValue()
    console.log(`ReadValue result: ${buf2hex(result.buffer)}`)
    //console.log('Buffer through bluetooth:')
    //console.log(buffer)
    return response.decode(new Uint8Array(result.buffer))
}

async function sendProtobufOverBluetooth(request, payload, characteristic) {
    if (characteristic === null) {
        // TODO better check if device is still connected.
        console.log("Characteristic unknown, connect first.")
        return null
    }
    else {
        const buffer = await createProtobufBuffer(request, payload)
        console.log('Sending...')
        await characteristic.writeValueWithResponse(buffer)
        console.log("Message sent!")
    }
}

async function createProtobufBuffer(request, payload) {
    // Verify the payload if necessary (i.e. when possibly incomplete or invalid)
    var errMsg = request.verify(payload);
    if (errMsg)
        throw Error(errMsg);

    // Create a new message
    var message = request.create(payload); // or use .fromObject if conversion is necessary
    //console.log('Message:')
    //console.log(message)
    // Encode a message to an Uint8Array (browser) or Buffer (node)
    const buffer = request.encode(message).finish();
    //console.log('Buffer:')
    //console.log(buffer)
    // Log te b64 encoded string for debugging purposes.
    console.log('Encoded:')
    console.log(toBase64(buffer))
    // The bufer is sliced since it will create an array with a reserved length of ~8000 characters,
    // bluetooth will complain about this.
    return buffer.slice(0, buffer.byteLength)
}

function toBase64(buffer)
{
  var decoder = new TextDecoder('utf8');
  var b64encoded = btoa(decoder.decode(buffer));
  return b64encoded
}

function buf2hex(buffer) { // buffer is an ArrayBuffer
    return [...new Uint8Array(buffer)]
        .map(x => x.toString(16).padStart(2, '0'))
        .join('');
  }