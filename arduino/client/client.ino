/*
 Publishing in the callback 
 
  - connects to an MQTT server
  - subscribes to the topic "inTopic"
  - when a message is received, republishes it to "outTopic"
  
  This example shows how to publish messages within the
  callback function. The callback function header needs to
  be declared before the PubSubClient constructor and the 
  actual callback defined afterwards.
  This ensures the client reference in the callback function
  is valid.
  
*/

#include <SPI.h>
#include <Ethernet.h>
#include <PubSubClient.h>

// Update these with values suitable for your network.
byte mac[]    = {  0xDE, 0xED, 0xBA, 0xFE, 0xFE, 0xED };
byte server[] = { 162, 243, 38, 166};

byte ip[]     = { 172, 16, 0, 100 };
char message_buff[100];


// Callback function header
void callback(char* topic, byte* payload, unsigned int length);

EthernetClient ethClient;
PubSubClient client(server, 1883, callback, ethClient);

// Callback function
void callback(char* topic, byte* payload, unsigned int length) {
  // In order to republish this payload, a copy must be made
  // as the orignal payload buffer will be overwritten whilst
  // constructing the PUBLISH packet.
  
//  // Allocate the correct amount of memory for the payload copy
//  byte* p = (byte*)malloc(length);
//  // Copy the payload to the new buffer
//  memcpy(p,payload,length);

  int i = 0;

  for(i=0; i<length; i++) {
    message_buff[i] = payload[i];
  }
    message_buff[i] = '\0';

  String msgString = String(message_buff);

parseMsgForCommand(msgString);

}

void setup()
{
  
  Ethernet.begin(mac);
  if (client.connect("arduinoClient")) {
    client.publish("arduino","hello world");
    client.subscribe("b");
  }
}

void loop()
{
  client.loop();
}

// Publish a string to the DEBUG channel
void debug( String str ){
  unsigned int length = str.length();
  char charBuf[length+1];
  str.toCharArray(charBuf, length+1);
  client.publish("debug",charBuf);
}

void parseMsgForCommand( String str){

  // Construct an array of all possible string commands
  String configurePin = "\"msg\":\"configurePin\"";
  String msgDigitalWrite = "\"msg\":\"digitalWrite\"";
  String commandStrs[] = {"\"msg\":\"configurePin\"","\"msg\":\"digitalWrite\""}; 
  
  // Remove Outer curly braces of JSON object
  str = str.substring(1,str.length()-1);
  debug(str);

  // Check for type of command and call doCommand to execute
  int i;
  for (i=0;i<sizeof(commandStrs);i++){
    
      if ((str.substring(0, commandStrs[i].length() )) == commandStrs[i]) {
          debug(str);
          str = str.substring( str.indexOf(',')+1, str.length());
          if (str.substring(0,9)=="\"content\""){
            doCommand(i,str);
          }
      }
  }
}

void doCommand( int commandIndex, String msgContent ) {
 
  switch (commandIndex) {
     case 0:
       doConfigurePin(msgContent);
       break;
     case 1 :
       doDigitalWrite(msgContent);
       break;
  } 
  
}


// Parses the content of a command msg of type configurePin
// To configure a pin on the arduino
// Sample input : content:ab
// Where the first char in the content is the pin number
// And teh second char in the content is the pin type (INPUT or OUTPUT)
void doConfigurePin(String str){
  
  // Get content of msg
   String content = str.substring( str.indexOf(':')+1, str.length());
   content = content.substring(1, content.length()-1);
   
   // First char in msg is the pin number, where a=0, b=1, etc.
   // Only digital pins implemented
   int pin = ((int)content[0])-97;
   String type;
   
   // Second char is the type of pin to be configure, 
   // where a = INPUT and b = OUTPUT
   if (content[1]=='a'){

     pinMode(pin, INPUT);
     
   } else if (content[1]=='b'){

     pinMode(pin, OUTPUT);
     debug("Configuring pin "+String(pin)+" as a output");
     
   }

}


void doDigitalWrite(String str){
  
  // Get content of msg
   String content = str.substring( str.indexOf(':')+1, str.length());
   content = content.substring(1, content.length()-1);
  debug(content);
  int pin = ((int)content[0])-97;
  int val = content[1]-'0';
  debug("Calling digital write on pin " + String(pin) + " with value "+String(val));
  if (val == 0){
    digitalWrite(pin, LOW);
  } else if (val == 1){
   digitalWrite(pin, HIGH); 
  }

}
  