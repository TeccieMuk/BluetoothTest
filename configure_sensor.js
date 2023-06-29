/*
  Contains javascript functions for the configure_sensor.html page,
  such as button event handlers and calling functions in the
  bluetooth_service and api_service.

  Configure_sensor allows the user to connect to a sensor and configure the
  network settings.
*/
 

import { connectTapSensorToAccount, getNetworks, getNetwork, connectSensorToNetwork, createNetwork } from "./api_service.js"
import { sendRgbValue, searchAndConnectToDevice, performNetworkScan, getNetworksAfterScan, bootstrapNetwork,
         reconnectBluetooth } from "./bluetooth_service.js";
import { initializeEnvironments } from "./environments.js"

const connectButton = document.getElementById("connectButton");
const deviceNameInput = document.getElementById("deviceNameInput");
const connectionResult = document.getElementById("connectionResult");
const addAccountButton = document.getElementById("addAccountButton");
const serialNumberInput = document.getElementById("serialNumberInput");
const accountIdInput = document.getElementById("accountIdInput");
const rgb1Button = document.getElementById("dropdownRGB1Button");
const rgb2Button = document.getElementById("dropdownRGB2Button");
const rgb3Button = document.getElementById("dropdownRGB3Button");

const networkGroupListBox = document.getElementById("networkGroupListBox")
const connectNetworkGroupButton = document.getElementById("connectNetworkGroupButton")
const scanNetworksButton = document.getElementById("scanNetworksButton")
const getNetworksButton = document.getElementById("getNetworksButton")
const wifiNetworksListBox = document.getElementById("wifiNetworksListBox")
const wifiPasswordInput = document.getElementById("wifiPasswordInput")
const networkGroupName = document.getElementById("networkGroupName")
const createNetworkGroupButton = document.getElementById("createNetworkGroupButton")
const environmentsDropdownContainer = document.getElementById("environmentsDropdownContainer")
const dropdownEnvironmentButton = document.getElementById("dropdownEnvironmentButton")

serialNumberInput.disabled = true
accountIdInput.disabled = true
addAccountButton.disabled = true
let connected_tap_sensor = null

connectButton.addEventListener("click", handleConnectButton);
addAccountButton.addEventListener("click", handleAddAccountButton)
rgb1Button.addEventListener("click", Rgb1Send)
rgb2Button.addEventListener("click", Rgb2Send)
rgb3Button.addEventListener("click", Rgb3Send)
connectNetworkGroupButton.addEventListener("click", handleConnectNetworkGroupButton)
scanNetworksButton.addEventListener("click", handleScanNetworksButton)
getNetworksButton.addEventListener("click", handleGetNetworksButton)
createNetworkGroupButton.addEventListener("click", handleCreateNetworkGroupButton)

initializeEnvironments(environmentsDropdownContainer, dropdownEnvironmentButton)

async function handleConnectButton() {
  try {
    serialNumberInput.disabled = true
    accountIdInput.disabled = true
    addAccountButton.disabled = true
    connectionResult.textContent = "Connecting..."
    const device = await searchAndConnectToDevice(deviceNameInput.value)
    
    console.log(`Device Connected: ${device.id}`)
    sessionStorage.setItem('connected_sensor', device.id)
    const serial_number = device.name.replace('tjecco_', '')
    serialNumberInput.value = serial_number
    connectionResult.textContent = "Connected"
    serialNumberInput.disabled = false
    accountIdInput.disabled = false
    addAccountButton.disabled = false
  }
  catch (err) {
    connectionResult.textContent = err
  }
}

async function handleAddAccountButton() {
  try {
    const tapsensor_id = await connectTapSensorToAccount(serialNumberInput.value, accountIdInput.value)
    console.log(tapsensor_id)
    if (tapsensor_id == null) {
      connectionResult.textContent = "Unable to add/configure sensor."
    }
    else {
      connected_tap_sensor = tapsensor_id
      sessionStorage.setItem('account_id', accountIdInput.value)
      await Promise.all([load_networks()]);
      alert(`Sensor created/found with ID ${tapsensor_id}. Use this ID to query sensor results.`)
    }
  }
  catch (err) {
    connectionResult.textContent = err
  }
}

async function Rgb1Send() {
  await sendRgbValue(1, 2)
}

async function Rgb2Send() {
  await sendRgbValue(2, 2)
}

async function Rgb3Send() {
  await sendRgbValue(3, 2)
}

async function handleConnectNetworkGroupButton() {
  if (networkGroupListBox.selectedIndex < 0) {
      alert("Select a network first.")
      return
  }
  const selectedNetworkId = networkGroupListBox.options[networkGroupListBox.selectedIndex].value;
  const network = await getNetwork(selectedNetworkId);
  if (network == null)
  {
      alert("Error while retrieving network.")
      return
  }

  const connectResult = await connectSensorToNetwork(network.networkConfigId, connected_tap_sensor)
  if (connectResult == false)
  {
      alert('Could not connect sensor to network.')
      window.location.replace('/')
  }

  const bootstrapResult = await bootstrapNetwork(network.mainSsid, network.mainPassword)
  console.log(bootstrapResult)
  if (bootstrapResult.result == 1) {
    alert('Sensor configured. Close the tap and inspect if tap an empty bootstrap event is received in the cloud to confirm configuration.')
  }
  else {
      alert(`Sensor not configured. Result: ${bootstrapResult.result}. Try again.`)
  }
}

async function handleScanNetworksButton() {
  console.log('Scanning!')
  await performNetworkScan(10);
  alert('Performing network scan. Wait 10 seconds before pressing \'GetNetworks\' to reconnect Bluetooth and retrieve the results.')
}

async function handleGetNetworksButton() {
  // We need to reconnect to bluetooth since scanning turns off bluetooth
  await reconnectBluetooth()
  const networks = await getNetworksAfterScan()
  if (networks.wifiNetworks == null) {
    return;
  }

  wifiNetworksListBox.empty
  for (let index = 0; index < networks.wifiNetworks.length; ++index) {
      const network = networks.wifiNetworks[index];
      wifiNetworksListBox.options[index] = new Option(`${network.ssid}, ${network.rssi}`, network.ssid)
  }
}

async function handleCreateNetworkGroupButton() {
  if (wifiNetworksListBox.selectedIndex < 0) {
      alert("Select a scanned wifi network first.")
      return
  }

  const ssid = wifiNetworksListBox.options[wifiNetworksListBox.selectedIndex].value
  const password = wifiPasswordInput.value
  const groupName = networkGroupName.value
  const createResult = await createNetwork(groupName, ssid, password)
  if (createResult == null) {
      alert("Could not create network.")
      return
  }

  const connectResult = await connectSensorToNetwork(createResult.networkConfigId, connected_tap_sensor)
  if (connectResult == false)
  {
      alert('Could not connect sensor to network.')
      window.location.replace('/')
  }

  const bootstrapResult = await bootstrapNetwork(ssid, password)
  console.log(bootstrapResult)
  if (bootstrapResult.result == 1) {
    alert('Sensor configured. Close the tap and inspect if tap an empty bootstrap event is received in the cloud to confirm configuration.')
  }
  else {
      alert(`Sensor not configured. Result: ${bootstrapResult.result}. Try again.`)
  }
}

async function load_networks() {
  console.log("Loading networks...")
  const networks = await getNetworks()
  if (networks == null) {
      return;
  }

  networkGroupListBox.empty
  for (let index = 0; index < networks.length; ++index) {
      const network = networks[index];
      networkGroupListBox.options[index] = new Option(network.name, network.networkConfigId);
  }
}

