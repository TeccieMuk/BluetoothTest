Engineering-prototype client that shows how to use Bluetooth for configuring the tap sensor. 
In particular, it shows the specific interactions with the sensor and the sensor cloud in order to configure a sensor's 
network and link it to a customer cloud account so that it can be used. It also demonstrates the other interactions
that are possible with the sensor via bluetooth:

* Control LED
* Real-time monitoring of tap event
* Obtain sensor status


** HOW TO USE **
This site can be run on a local bluetooth-enabled laptop using a host such as SimpleWebServer or other methods,
or it can be hosted online. HTTPS must be enabled. An easy way to accomplish this is to upload this to a 
Github repository (or Bitbucket Cloud). You can use the Github Pages function to host it online. It can then
be reached by an android browser.

More information on Github Pages can be found here:
https://pages.github.com/


** DISCLAIMER **

This web page is not intended for end-users but as a guide for developers on how to integrate with the sensor cloud. This demonstrator UI is very basic
on purpose to focus on the sensor and cloud interactions. The code can be understood without knowledge of specific frameworks.
It lacks progress bars/spinners, so it is recommended to have the browser's development console open to see what kind of messages/responses
are being sent/received and to determine when to perform the next action.


** USER GUIDE **

** SENSOR CONFIGURATION **
To configure sensors, click the "Configure Sensor" button in Index. Then perform the following actions:

* Open the tap containing the sensor that needs to be connected to.
* Enter a sensor name prefix (such as tjecco_) and click 'Connect' to search for devices. Select a device to be configured.
  In the Console there will be messages indicating progress. At this point the Protobuf definitions are also being read in bluetooth_service.

* The serial number will be entered automatically. Enter the Account ID to which this sensor should be connected. Click 'Add To Account and Configure'
  The sensor will be connected to the account and a Sensor ID will be generated. If the sensor is already connected to that account, the
  existing sensor ID will be returned. This Sensor ID must be used for queries in the database. 
  
  The configured Network Groups will now also be populated. Note that this may take a few seconds due to cold starts in AWS. Watch the Console for progress.

* Select an existing network for this device, or scan and create a new network group.
* Existing Network: 
    * Select a Network Group and click 'Connect'. The following steps are now performed:
        * The Network Group details incl. ssid and password are retrieved from the Cloud.
        * A cloud connection will be made between the sensor and the Network Group.
        * A Bootstrap command will be sent to the sensor over Bluetooth containing the SSID and Password, and a response is awaited.
        * When a response is received, a notification is given to the user. The tap can now be closed, after which the sensor will:
            * Store the bootstrap network.
            * Close the Bluetooth connection.
            * Contact the cloud using the provided bootstrap network.
            * Send an empty Bootstrap event.
            * The sensor should receive a response with the current timestamp, (network) configuration and updated firmware, if any.
            * The sensor can now be used for tap events.
        * To verify that the bootstrap event has been received, make a 'sensors/{sensor_id}/events' GET request. A bootstrap event with no datapoint should be
          visible at the time the command was sent.

- OR -

* Scan And Create New Network Group:
    * Click Scan Networks. This will instruct the sensor to close the bluetooth connection and perform a network scan for 10 seconds.
    * After 10 seconds, click Get Networks. This will reconnect to the bluetooth device and retrieve the stored networks.
    * Select a network from the list
    * Enter the wifi password
    * Enter a group name
    * Click Create & Connect. This will result in:
        * Creating a new Network Group in the cloud
        * Connecting the sensor to the Network Group, as described in the Existing Network flow above.


** SENSOR STATUS / WIP **
This page has not been fully tested yet and is subject to changes during testing. 
The sensor status page allows the user to connect to a sensor and perform various functions. Initiate a connection by following the same steps as sensor configuration.
The following actions can be peformed:
    * Send a LED command to the sensor using the 'Send RGB command' message
    * Collect live datapoints. After clicking 'Start Collecting Datapoints' the app will collect datapoints every 5 seconds. The 'Tap Event Response' list will contain up to 20 data points
    * Perform a Factory Reset. To retrieve the necessary secret perform a 'sensordevices/{{serial_number}}' GET request (NOT AVAILABLE AT TIME OF WRITING)
    * Collect status data. Every 5 seconds the status will be retrieved and displayed in the 'Status Response ' list


** OPEN ISSUES **
The following open issues are present in frontend:
* Status page is not fully tested
* Factory Reset query is not available in the cloud
* Useability issues, such as spinners and more intelligent waiting, e.g. wait automatically for a bootstrap event in the cloud.
