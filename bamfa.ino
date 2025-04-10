#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>

const char* host = "bemfa.com";          
const int httpPort = 8344;               

const char* WiFi_SSID = "DILV2-2";
const char* WiFi_Password = "dilv2023";

String uid = "qCeorNL1u0gUuuHeDaO2io5tkKPOJNfkkqk4RqtovsJFZJtobb5tXTTyTjiJe/b3";
String topic1 = "a006";
String topic2 = "b006";

unsigned long lastHeartbeatTime = 0;
const unsigned long heartRate = 3000;

ESP8266WiFiMulti wifiMulti;              
WiFiClient client;                       

const int Relay_Pin1 = 0;  // GPIO0
const int Relay_Pin2 = 2;  // GPIO2

void setup() {
  Serial.begin(115200);

  pinMode(Relay_Pin1, OUTPUT);
  digitalWrite(Relay_Pin1, LOW);

  pinMode(Relay_Pin2, OUTPUT);
  digitalWrite(Relay_Pin2, LOW);
  
  WiFi.mode(WIFI_STA);                      
  wifiMulti.addAP(WiFi_SSID, WiFi_Password); 
  Serial.println("Connecting ..."); 

  int i = 0;  
  while (wifiMulti.run() != WL_CONNECTED) { 
    delay(1000);
    Serial.print(i++); Serial.print(' ');
  }
  
  Serial.println("");
  Serial.print("Connected to ");
  Serial.println(WiFi.SSID());              
  Serial.print("IP address:\t");
  Serial.println(WiFi.localIP());           

  reconnectBemfa();
}

void reconnectBemfa() {
  while (!client.connected()) {
    if (WiFi.status() != WL_CONNECTED) {
      int i = 0;  
      while (wifiMulti.run() != WL_CONNECTED) { 
        delay(1000);
        Serial.print(i++); Serial.print(' ');
      } 
    }
   
    if (client.connect(host, httpPort)) {
      Serial.println("Connected to bemfa!");
      client.print("cmd=1&uid="+uid+"&topic="+topic1+"\r\n");
      client.print("cmd=1&uid="+uid+"&topic="+topic2+"\r\n");
    } else {
      Serial.println("Failed to connect to bemfa. Retry in 5 seconds.");
      delay(5000);
    }
  }
}

void loop() {
  if (!client.connected()) {
    reconnectBemfa();
  }

  if (client.available()) {
    String line = client.readStringUntil('\n');
    Serial.println(line);
    if (line.indexOf("&topic=" + topic1) > 0) {
      if (line.indexOf("&msg=on") > 0) {
        digitalWrite(Relay_Pin1, HIGH); // turn on
        delay(1000);
        digitalWrite(Relay_Pin1, LOW);
        Serial.println("Switch " + topic1 + " on");
      } 
    }
    if (line.indexOf("&topic=" + topic2) > 0) {
      if (line.indexOf("&msg=on") > 0) {
        digitalWrite(Relay_Pin2, HIGH); // turn on
        delay(1000);
        digitalWrite(Relay_Pin2, LOW);
        Serial.println("Switch " + topic2 + " on");
      } 
    }
  }

  if (millis() - lastHeartbeatTime > heartRate) {
    client.print("ping\r\n");
    Serial.println("ping");
    lastHeartbeatTime = millis();
  }
}
