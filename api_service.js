/* 
    Contains all cloud api requests.
*/

const base_url = 'https://22ajohpbrd.execute-api.eu-west-1.amazonaws.com/dev'
const auth_header = 'Bearer eyJhbGciOiJSUzI1NiJ9.eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImlzcyI6InRqZWNjby5jb20iLCJhdWQiOiJzZW5zb3JpbmciLCJpYXQiOjE2ODM1NDkyNzEsImV4cCI6MTcxNTQxOTgzMiwianRpIjozNzMsImtpZCI6NjIsImFpZCI6Mywic2NvcGUiOlt7InJpZCI6IlNTT0NPTUEiLCJvcmciOiJUZXN0QWNjb3VudCJ9XX0.RgDztCPTOFFcO3yzcwapchx5oSNQx9opb6AmkHFJ7Z2y2VOCXco5iGC3aJRg6-zYAHuoczsWo7-7DdtS_r3svBdFvtPEkGbSg6J6hjCQWE2ktndjhaxjVO2aG5rb6WH5u1m-jMuocq7d26ZLJpWreuYW2EhZjFDhyQvhnmyqYoK2eQP0CLlKIlEwlHdQWym8CSiJ2NpHu8Qgj1umvbtED_Kw9vgrxDcrU9vMeMU5DMha7DF2M_LLD8LyQKNK-2OmWr07yxWv-JmskVRkYo2zN0QfHvEZpA2LbAHeb73GyTcMT4-nK5MuW-rBS69Mmgr7AtzMWpb0xsgmH8JBEnc21A'
const headers = { 
    'Content-Type': 'application/json',
    'Authorization': auth_header
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
    device = await getDevice(serial_number)
    
    const url = `${base_url}/secrets/${device.tapsensorId}`

    const response = await fetch(
        url, { 
        method: 'GET',
        headers: headers}
    );

    result = await handleBodyResponse(response)
    return result.secret
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