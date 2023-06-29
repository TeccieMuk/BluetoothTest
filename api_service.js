/* 
    Contains all cloud api requests.
*/

let base_url = ''
let auth_header = ''
let headers = ''

export function setEnvironment(environment) {
    console.log(`Setting environment URL to ${environment.base_url}`)
    base_url = environment.base_url
    auth_header = environment.auth_header
    headers = { 
        'Content-Type': 'application/json',
        'Authorization': auth_header
    }
}

export async function connectTapSensorToAccount(serial_number, accountId) {
    const data = {
        'account-id': accountId,
        'serial-number': serial_number
    };
    
    const url = `${base_url}/sensordevice/connect`

    const response = await fetch(
        url, { 
        method: 'POST',
        body: JSON.stringify(data),
        headers: headers}
    );
    
    const result = await handleBodyResponse(response)
    if (result == null)
    {
        return null
    }
    
    return result.tapSensorId
}

export async function getNetwork(network_id) {
    const url = `${base_url}/networks/${network_id}`

    const response = await fetch(
        url, { 
        method: 'GET',
        headers: headers}
    );
    
    return handleBodyResponse(response)
}

export async function getNetworks() {
    const url = `${base_url}/networks`

    const response = await fetch(
        url, { 
        method: 'GET',
        headers: headers}
    );
    
    return handleBodyResponse(response)
}

export async function getDevice(serial_number) {
    const url = `${base_url}/sensordevices/${serial_number}`

    const response = await fetch(
        url, { 
        method: 'GET',
        headers: headers}
    );

    return await handleBodyResponse(response)
}

export async function getDeviceSecret(serial_number) {
    const device = await getDevice(serial_number)
    
    const url = `${base_url}/sensors/${device.tapsensor_id}/status`

    const response = await fetch(
        url, { 
        method: 'GET',
        headers: headers}
    );

    const result = await handleBodyResponse(response)
    return Number(result.secret)
}

export async function createNetwork(name, ssid, password)
{
    const data = {
        'name': name,
        'mainSsid': ssid,
        'mainPassword': password
    };
    
    const url = `${base_url}/networks`

    const response = await fetch(
        url, { 
        method: 'POST',
        body: JSON.stringify(data),
        headers: headers}
    );
    
    return handleBodyResponse(response)
}

export async function connectSensorToNetwork(networkConfigId, sensor_id)
{
    const url = `${base_url}/sensors/${sensor_id}/network/${networkConfigId}`

    const response = await fetch(
        url, { 
        method: 'POST',
        headers: headers}
    );
    
    return response.status == 200
}

async function handleBodyResponse(response)
{
    if (response.status != 200)
    {
        console.log(await response.json())
        return null
    }
    else
    {
        const result = await response.json()
        console.log(result)
        return result
    }
}