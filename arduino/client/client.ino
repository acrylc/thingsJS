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

// Digital Pin Vars
int digPins[20] = {};
int digVals[20] = {};
int numDigPins = 0;

// Analog Pin Vars
int anPins[20] = {};
int anVals[20] = {};
int numAnPins = 0;

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
  int i=0;
  for(i=0;i<20;i++){
    digVals[i]=0;
    digPins[i]=0;
  }
  Ethernet.begin(mac);
  if (client.connect("arduinoClient")) {
    client.publish("arduino","hello world");
    client.subscribe("b");
  }
}

void loop()
{
  client.loop();
  
  // Do all digital writes
  
  // Do all analog writes
 
  // Do all digital reads
  // Only send message if value changes
    int i = 0;
  for (i=0;i<numDigPins;i++){
      int val = digitalRead(digPins[i]);
      if (val != digVals[i]){
       digVals[i]=val; 
       String msg = "";
     msg = String("{\"arduinoId\":0,\"pin\":")+digPins[i]+String(",\"value\":")+val+String("}");
  unsigned int length = msg.length();
  char charBuf[length+1];
  msg.toCharArray(charBuf, length+1);
  client.publish("digitalRead",charBuf);
      }
  }
  
  // Do all analog reads
    // Do all digital reads
  // Only send message if value changes
     i = 0;
  for (i=0;i<numAnPins;i++){
      int val = analogRead(digPins[i]);
      if (val != anVals[i]){
       anVals[i]=val; 
       String msg = "";
     msg = String("{\"arduinoId\":0,\"pin\":")+anPins[i]+String(",\"value\":")+val+String("}");
  unsigned int length = msg.length();
  char charBuf[length+1];
  msg.toCharArray(charBuf, length+1);
  debug(msg);
  client.publish("analogRead",charBuf);
      }
  }

}

// Publish a string to the DEBUG channel
void debug( String str ){
  unsigned int length = str.length();
  char charBuf[length+1];
  str.toCharArray(charBuf, length+1);
  client.publish("debug",charBuf);
}

// Publish a string to the DEBUG channel
void debug2( String str ){
  unsigned int length = str.length();
  char charBuf[length+1];
  str.toCharArray(charBuf, length+1);
  client.publish("digitalRead",charBuf);
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
   
   // Initalize Digital Input
   // Form a listener that runs through loop and constantly updates
   // Value of virtual element
   if (content[1]=='a' && content[2] =='d'){

     pinMode(pin, INPUT);
     debug("Configuring pin "+String(pin)+" as a input");

     digPins[numDigPins] = pin;
     numDigPins++;
     
     
   // Initialize Analog Input
   } else  if (content[1]=='a' && content[2] =='a'){
         anPins[numAnPins] = pin;
         numAnPins++;
 
   // Initialize Digital output 
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
  
