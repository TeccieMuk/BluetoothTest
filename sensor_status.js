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

const connectButton = document.getElementById("connectButton");
const connectionStatus = document.getElementById("connectionStatus");
const rgb1Button = document.getElementById("dropdownRGB1Button");
const rgb2Button = document.getElementById("dropdownRGB2Button");
const rgb3Button = document.getElementById("dropdownRGB3Button");
const dataPointsButton = document.getElementById("dataPointsButton");
const factoryResetButton = document.getElementById("factoryResetButton")
const statusResponseTextArea = document.getElementById("statusTextArea");
const tapEventDataResponseSelect = document.getElementById("tapEventDataResponseSelect")

connectButton.addEventListener("click", handleConnectButton);
rgb1Button.addEventListener("click", Rgb1Send)
rgb2Button.addEventListener("click", Rgb2Send)
rgb3Button.addEventListener("click", Rgb3Send)
dataPointsButton.addEventListener("click", handleDataPointsButton)
factoryResetButton.addEventListener("click", handleFactoryResetButton)

const maxDataPoints = 20
let isStreaming = false
let streamTimerId = null
let statusTimerId = null
let currentDataPointIndex = 0
let serialNumber = null
let lastStreamTimestamp = null

async function handleConnectButton() {
    connectionStatus.textContent = "SEARCHING";
    try {
        connectionStatus.textContent = "CONNECTING";
        const device = await searchAndConnectToDevice(deviceNameInput.value)
        serialNumber = device.name.replace('tjecco_', '')
        connectionStatus.textContent = "CONNECTED";
        statusTimerId = window.setInterval(updateStatus, 5000)
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
        dataPointsButton.textContent = "Start Collecting Datapoints"
        window.clearTimeout(streamTimerId)
    }
    else {
        dataPointsButton.textContent = "Stop Collecting Datapoints"
        streamTimerId = window.setInterval(stream, 5000)
    }
    isStreaming = !isStreaming
}

async function handleFactoryResetButton() {
    const secret = await getDeviceSecret(serialNumber)
    const response = await factoryReset(secret)
    alert(`Received secret response: ${response}`)
}

async function stream() {
    if (lastStreamTimestamp == null) {
        lastStreamTimestamp = Date.now() - 5
    }

    const dataPoints = await getTapEventDatapoints(lastStreamTimestamp)
    lastStreamTimestamp = Date.now()

    for (let datapoint in dataPoints.data_points)
    {
        if (currentDataPointIndex == maxDataPoints)
        {
            currentDataPointIndex = 0
        }

        const timestamp = new Date(datapoint.time_stamp.unix_time * 1000)
        const hour = timestamp.getHours()
        const minute = timestamp.getMinutes()
        const seconds = timestamp.getSeconds()
        const degrees =  datapoint.temperature.temperature_centi_degrees
        const centi_degrees = datapoint.temperature.temperature_degrees
        const flow_l = datapoint.flow_rate.liters_per_minute
        const flow_cl = datapoint.flow_rate.centi_liters_per_minute
        const battery = datapoint.battery.level_in_percent

        const header = `${hour}:${minute}:${seconds} - T:${degrees}.${centi_degrees} F:${flow_l}.${flow_cl} B:${battery}`
        tapEventDataResponseSelect.options[currentDataPointIndex] = new Option(header)
        tapEventDataResponseSelect.options[currentDataPointIndex+1] = new Option('')
        currentDataPointIndex += 1
    }
}

async function updateStatus() {
    const statusResponse = await getStatus()
    statusResponseTextArea.value = statusResponse
}
