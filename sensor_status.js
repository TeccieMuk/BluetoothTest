/*
  Contains javascript functions for the sensor_status.html page,
  such as button event handlers and calling functions in the
  bluetooth_service.

  Sensor_status allows the user to perform miscellaneous actions
  on the sensor, including displaying the status, led control and
  factory reset.
*/

import { searchAndConnectToDevice, sendRgbValue, getStatus, factoryReset, getTapEventDatapoints } from './bluetooth_service.js'
import { getDeviceSecret } from './api_service.js'
import { initializeEnvironments } from "./environments.js"

const connectButton = document.getElementById("connectButton");
const connectionStatus = document.getElementById("connectionStatus");
const rgb1Button = document.getElementById("dropdownRGB1Button");
const rgb2Button = document.getElementById("dropdownRGB2Button");
const rgb3Button = document.getElementById("dropdownRGB3Button");
const dataPointsButton = document.getElementById("dataPointsButton");
const factoryResetButton = document.getElementById("factoryResetButton")
const statusResponseTextArea = document.getElementById("statusTextArea");
const tapEventDataResponseSelect = document.getElementById("tapEventDataResponseSelect")
const environmentsDropdownContainer = document.getElementById("environmentsDropdownContainer")
const dropdownEnvironmentButton = document.getElementById("dropdownEnvironmentButton")
const dropdownRGBButton = document.getElementById("dropdownRGBButton")

connectButton.addEventListener("click", handleConnectButton);
rgb1Button.addEventListener("click", Rgb1Send)
rgb2Button.addEventListener("click", Rgb2Send)
rgb3Button.addEventListener("click", Rgb3Send)
dataPointsButton.addEventListener("click", handleDataPointsButton)
factoryResetButton.addEventListener("click", handleFactoryResetButton)

const maxDataPoints = 20
let isStreaming = false
let timer_id = null
let currentDataPointIndex = 0
let serialNumber = null

initializeEnvironments(environmentsDropdownContainer, dropdownEnvironmentButton)

async function handleConnectButton() {
    connectionStatus.textContent = "SEARCHING";
    try {
        connectionStatus.textContent = "CONNECTING";
        const device = await searchAndConnectToDevice(deviceNameInput.value)
        serialNumber = device.name.replace('tjecco_', '')
        connectionStatus.textContent = "CONNECTED";
        timer_id = window.setInterval(timerTick, 5000)
    }
    catch (err) {
        connectionStatus.textContent = err
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

async function handleDataPointsButton() {
    if (isStreaming) {
        dataPointsButton.textContent = "Start Collecting Datapoints and Status"
        window.clearTimeout(timer_id)
        factoryResetButton.disabled = false
        dropdownRGBButton.disabled = false
    }
    else {
        dataPointsButton.textContent = "Stop Collecting Datapoints and Status"
        timer_id = window.setTimeout(timerTick, 5000)
        factoryResetButton.disabled = true
        dropdownRGBButton.disabled = true
    }
    isStreaming = !isStreaming
}

async function handleFactoryResetButton() {
    const secret = await getDeviceSecret(serialNumber)
    const response = await factoryReset(secret)
    alert(`Received secret response: ${JSON.stringify(response)}`)
}

async function updateDatapoints() {
    const dataPointsResponse = await getTapEventDatapoints()
    for (let i = dataPointsResponse.dataPoints.length -1; i >= 0; --i)
    {
        const datapoint = dataPointsResponse.dataPoints[i]
        if (currentDataPointIndex == maxDataPoints)
        {
            currentDataPointIndex = 0
        }
        const timestamp = new Date(datapoint.timeStamp.unixTime * 1000)
        const hour = timestamp.getHours()
        const minute = timestamp.getMinutes()
        const seconds = timestamp.getSeconds()
        const degrees =  datapoint.temperature.temperatureDegrees
        const centi_degrees = datapoint.temperature.temperatureCentiDegrees
        const flow_l = datapoint.flowRate.litersPerMinute
        const flow_cl = datapoint.flowRate.centiLitersPerMinute
        const battery = datapoint.battery.levelInPercent

        const header = `${hour}:${minute}:${seconds} - T:${degrees}.${centi_degrees} F:${flow_l}.${flow_cl} B:${battery}`
        tapEventDataResponseSelect.options[currentDataPointIndex] = new Option(header)
        tapEventDataResponseSelect.options[currentDataPointIndex+1] = new Option('')
        currentDataPointIndex += 1
    }
}

async function timerTick(){
    if (isStreaming == false)
    {
        console.log("Not streaming, skip.")
        return
    }

    console.log("Streaming!")
    await updateStatus()
    await updateDatapoints()

    if (isStreaming == false)
    {
        factoryResetButton.disabled = false
        dropdownRGBButton.disabled = false
    }
}

async function updateStatus() {
    const statusResponse = await getStatus()
    statusResponseTextArea.value = JSON.stringify(statusResponse)
}
