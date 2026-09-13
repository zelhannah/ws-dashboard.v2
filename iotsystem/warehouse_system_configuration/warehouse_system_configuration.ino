#include <WiFi.h>
#include <PubSubClient.h>
#include <SPI.h>
#include <MFRC522.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

const char* WIFI_SSID = "Redmi Note 11";
const char* WIFI_PASS = "1234567890";
const char* MQTT_SERVER = "broker.emqx.io";
const int MQTT_PORT = 1883;
const char* MQTT_CLIENT = "warehouse_floor2_monitoring";

const char* TOPIC_SYSTEM = "warehouse/floor2/system";
const char* TOPIC_SECURITY = "warehouse/floor2/security";
const char* TOPIC_ACCESS = "warehouse/floor2/access";
const char* TOPIC_ATTACK = "warehouse/floor2/attack";
const char* TOPIC_REEDB = "warehouse/floor2/reedB";
const char* TOPIC_DOOR = "warehouse/floor2/warehousedoor";
const char* TOPIC_LED = "warehouse/floor2/ledlight";
const char* TOPIC_BUZZERB = "warehouse/floor2/buzzerB";
const char* TOPIC_LCD = "warehouse/floor2/displaytext";
const char* TOPIC_ALARM = "warehouse/floor2/alarm";
const char* TOPIC_RESET = "warehouse/floor2/reset";

const int PIN_RFID_SS = 5;
const int PIN_RFID_RST = 27;
const int PIN_REEDB = 4;
const int PIN_LED_GREEN = 25;
const int PIN_LED_YELLOW = 26;
const int PIN_LED_RED = 33;
const int PIN_BUZZERB = 14;

WiFiClient espClient;
PubSubClient mqtt(espClient);

MFRC522 rfid(PIN_RFID_SS, PIN_RFID_RST);
LiquidCrystal_I2C lcd(0x27, 16, 2);

const String ALLOWED_UID = "7729CD05";

bool accessGranted = false;
bool alarmActive = false;
bool forcedDoorAlarm = false;
bool alertBypass = false;
bool isDefenseActive = false;

int lastDoorState = LOW;
int currentDoorState = LOW;

void setupWiFi() {
  Serial.println();
  Serial.print("Connecting WiFi : ");
  Serial.println(WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASS);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.println("WiFi Connected");
  Serial.print("IP Address : ");
  Serial.println(WiFi.localIP());
}

void publishEvent(const char* topic, String message) {
  mqtt.publish(topic, message.c_str());
  Serial.print("[MQTT] ");
  Serial.print(topic);
  Serial.print(" -> ");
  Serial.println(message);
}

void reconnectMQTT() {
  while (!mqtt.connected()) {
    Serial.print("Connecting MQTT...");

    if (mqtt.connect(MQTT_CLIENT)) {
      Serial.println("CONNECTED");
      mqtt.subscribe(TOPIC_RESET);
      publishEvent(TOPIC_SYSTEM, "WAREHOUSE FLOOR 2 ONLINE");
    } else {
      Serial.println("FAILED");
      delay(3000);
    }
  }
}

void updateLCD(String line1, String line2) {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print(line1);

  lcd.setCursor(0, 1);
  lcd.print(line2);

  String displayText = line1 + " | " + line2;
  publishEvent(TOPIC_LCD, displayText);
}

void setNormalState() {
  accessGranted = false;
  alarmActive = false;
  
  digitalWrite(PIN_LED_GREEN, HIGH);
  digitalWrite(PIN_LED_YELLOW, LOW);
  digitalWrite(PIN_LED_RED, LOW);
  noTone(PIN_BUZZERB);

  updateLCD("System ACTIVE", "Scan RFID");

  publishEvent(TOPIC_SYSTEM, "NORMAL");
  publishEvent(TOPIC_SECURITY, "SAFE");
  publishEvent(TOPIC_LED, "GREEN");
  publishEvent(TOPIC_ALARM, "OFF");
  publishEvent(TOPIC_BUZZERB, "OFF");
}

void setWarningState() {
  digitalWrite(PIN_LED_GREEN, LOW);
  digitalWrite(PIN_LED_YELLOW, HIGH);
  digitalWrite(PIN_LED_RED, LOW);

  updateLCD("ACCESS DENIED", "Warning");

  publishEvent(TOPIC_ACCESS, "INVALID ACCESS");
  publishEvent(TOPIC_SECURITY, "WARNING");
  publishEvent(TOPIC_LED, "YELLOW");
  publishEvent(TOPIC_ALARM, "WARNING");

  for (int i = 0; i < 5; i++) {
    tone(PIN_BUZZERB, 1000);
    delay(200);

    noTone(PIN_BUZZERB);
    delay(200);
  }

  setNormalState();
}

void setDangerState() {
  alarmActive = true;
  digitalWrite(PIN_LED_GREEN, LOW);
  digitalWrite(PIN_LED_YELLOW, LOW);
  digitalWrite(PIN_LED_RED, HIGH);
  tone(PIN_BUZZERB, 1000);

  updateLCD("UNAUTHORIZED", "DOOR ACCESS");

  publishEvent(TOPIC_SECURITY, "DANGER");
  publishEvent(TOPIC_LED, "RED");
  publishEvent(TOPIC_ALARM, "ACTIVE");
  publishEvent(TOPIC_BUZZERB, "CONTINUOUS");
}

void runFloodingAttackScenario3() {
  Serial.println("[CYBER LOGIC] SCENARIO 3");
  publishEvent(TOPIC_ATTACK, "FLOODING ATTACK");

  if (isDefenseActive) {
    Serial.println("[DEFENSE] SCENARIO 3 BLOCKED");
    publishEvent(TOPIC_ATTACK, "SCENARIO 3 BLOCKED");
    digitalWrite(PIN_LED_GREEN, HIGH);
    digitalWrite(PIN_LED_YELLOW, LOW);
    digitalWrite(PIN_LED_RED, LOW);

    tone(PIN_BUZZERB, 1000);
    delay(200);
    noTone(PIN_BUZZERB);
    updateLCD("DEFENSE ACTIVE", "ATTACK BLOCKED");
    return;
  }

  for (int i = 0; i < 50; i++) {
    publishEvent(TOPIC_SECURITY, "SCENARIO 3 DETECTED");
    publishEvent(TOPIC_ALARM, "ACTIVE");

    digitalWrite(PIN_LED_GREEN, LOW);
    digitalWrite(PIN_LED_YELLOW, LOW);
    digitalWrite(PIN_LED_RED, HIGH);

    publishEvent(TOPIC_LED, "ON");
    publishEvent(TOPIC_BUZZERB, "ON");

    tone(PIN_BUZZERB, 1000);
    delay(200);
    noTone(PIN_BUZZERB);
    delay(200);

    updateLCD("DANGER", "FLOODING ATTACK");

    Serial.print("[ATTACK] Flood Packet ");
    Serial.println(i + 1);
  }

  digitalWrite(PIN_LED_RED, HIGH);
  publishEvent(TOPIC_BUZZERB, "CONTINUOUS");
  tone(PIN_BUZZERB, 1000);
  updateLCD("Flood Attack", "Alarm Active");
}

void activateSecuritySuppressionScenario4() {
  Serial.println("[CYBER LOGIC] SCENARIO 4");

  if (isDefenseActive) {
    Serial.println("[DEFENSE] SUPPRESSION BLOCKED");
    publishEvent(TOPIC_ATTACK, "SCENARIO 4 BLOCKED");
    publishEvent(TOPIC_ACCESS, "ACCESS DENIED");

    digitalWrite(PIN_LED_GREEN, LOW);
    digitalWrite(PIN_LED_YELLOW, LOW);
    digitalWrite(PIN_LED_RED, HIGH);

    tone(PIN_BUZZERB, 1000);
    delay(200);
    noTone(PIN_BUZZERB);

    updateLCD("ATTACK BLOCKED", "ACCESS DENIED");
    return;
  }

  alertBypass = true;
  digitalWrite(PIN_LED_GREEN, HIGH);
  digitalWrite(PIN_LED_YELLOW, LOW);
  digitalWrite(PIN_LED_RED, LOW);
  publishEvent(TOPIC_LED, "ON");
  noTone(PIN_BUZZERB);

  updateLCD("System ACTIVE", "SAFE");

  publishEvent(TOPIC_ATTACK, "SCENARIO 4");
  publishEvent(TOPIC_SECURITY, "SECURITY DISABLED");
}

void resetSystemMode() {
  Serial.println("[SYSTEM] NORMAL MODE RESTORED");

  alertBypass = false;
  accessGranted = false;
  alarmActive = false;
  forcedDoorAlarm = false;
  isDefenseActive = false;
  noTone(PIN_BUZZERB);

  digitalWrite(PIN_LED_GREEN, HIGH);
  digitalWrite(PIN_LED_YELLOW, LOW);
  digitalWrite(PIN_LED_RED, LOW);

  updateLCD("System ACTIVE", "Scan RFID");

  publishEvent(TOPIC_ATTACK, "ATTACK RESET");
  publishEvent(TOPIC_SYSTEM, "NORMAL CONDITION");
  publishEvent(TOPIC_SECURITY, "SYSTEM ACTIVE");
  publishEvent(TOPIC_DOOR, "LOCKED");
}

void handleSerialCommand() {
  if (!Serial.available()) {
    return;
  }

  char input = toupper(Serial.read());

  while (Serial.available()) {
    Serial.read();
  }

  if (input == 'F') {
    runFloodingAttackScenario3();

  } else if (input == 'C') {
    activateSecuritySuppressionScenario4();

  } else if (input == 'D') {
    isDefenseActive = true;

    Serial.println("[SYSTEM] DEFENSE MODE ACTIVE");
    updateLCD("DEFENSE MODE", "SYSTEM SAFE");
    publishEvent(TOPIC_SYSTEM, "DEFENSE MODE");

    digitalWrite(PIN_LED_GREEN, HIGH);
    digitalWrite(PIN_LED_YELLOW, LOW);
    digitalWrite(PIN_LED_RED, LOW);
    noTone(PIN_BUZZERB);

  } else if (input == 'X') {
    resetSystemMode();
  }
}

void handleRFID() {
  if (!rfid.PICC_IsNewCardPresent()) {
    return;
  }

  if (!rfid.PICC_ReadCardSerial()) {
    return;
  }

  String cardUID = "";

  for (byte i = 0; i < rfid.uid.size; i++) {
    if (rfid.uid.uidByte[i] < 0x10) {
      cardUID += "0";
    }

    cardUID += String(rfid.uid.uidByte[i], HEX);
  }
  cardUID.toUpperCase();

  Serial.print("RFID UID : ");
  Serial.println(cardUID);

  if (cardUID == ALLOWED_UID || (alertBypass && !isDefenseActive)) {
    accessGranted = true;

    digitalWrite(PIN_LED_GREEN, HIGH);
    digitalWrite(PIN_LED_YELLOW, LOW);
    digitalWrite(PIN_LED_RED, LOW);
    noTone(PIN_BUZZERB);

    updateLCD("ACCESS GRANTED", "Door Ready");

    publishEvent(TOPIC_ACCESS, "AUTHORIZED");
    publishEvent(TOPIC_SECURITY, "SAFE");
    publishEvent(TOPIC_BUZZERB, "OFF");
    publishEvent(TOPIC_ALARM, "OFF");
    publishEvent(TOPIC_DOOR, "READY TO OPEN");
    delay(1500);

  } else {
    accessGranted = false;
    setWarningState();
  }

  rfid.PICC_HaltA();
}

void handleDoor() {
  currentDoorState = digitalRead(PIN_REEDB);

  if (currentDoorState != lastDoorState) {
    if (currentDoorState == HIGH) {
      publishEvent(TOPIC_REEDB, "OPEN");

      if (accessGranted) {
        Serial.println("Authorized Door Access");
        updateLCD("Door Opened", "Authorized");
        publishEvent(TOPIC_DOOR, "OPEN");
        publishEvent(TOPIC_SECURITY, "SAFE");
        accessGranted = false;

      } else {
        Serial.println("Unauthorized Door Access");
        forcedDoorAlarm = true;

        setDangerState();
        publishEvent(TOPIC_ATTACK, "DOOR FORCED OPEN");
        publishEvent(TOPIC_DOOR, "UNAUTHORIZED OPEN");
      }

    } else {
      publishEvent(TOPIC_REEDB, "CLOSED");

      if (forcedDoorAlarm || alarmActive) {
        updateLCD("ALARM ACTIVE", "Check Dashboard");
        publishEvent(TOPIC_SECURITY, "DANGER");

      } else {
        updateLCD("Door Closed", "System Secure");
        publishEvent(TOPIC_DOOR, "CLOSED");
        delay(1500);

        setNormalState();
      }
    }

    lastDoorState = currentDoorState;
  }
}

void callback(char* topic, byte* payload, unsigned int length) {
  String message = "";
  for (unsigned int i = 0; i < length; i++) {
    message += (char)payload[i];
  }

  Serial.print("TOPIC : ");
  Serial.println(topic);

  Serial.print("MESSAGE : ");
  Serial.println(message);

  if (String(topic) == TOPIC_RESET && message == "RESET") {
    Serial.println("Reset Command From Dashboard");
    resetSystemMode();
  }
}

void setup() {
  Serial.begin(115200);
  SPI.begin();
  rfid.PCD_Init();

  pinMode(PIN_REEDB, INPUT_PULLUP);
  pinMode(PIN_LED_GREEN, OUTPUT);
  pinMode(PIN_LED_YELLOW, OUTPUT);
  pinMode(PIN_LED_RED, OUTPUT);
  pinMode(PIN_BUZZERB, OUTPUT);
  noTone(PIN_BUZZERB);

  lcd.init();
  lcd.backlight();

  updateLCD("WareSafe Ready", "Initializing");

  setupWiFi();
  mqtt.setServer(MQTT_SERVER, MQTT_PORT);
  mqtt.setCallback(callback);

  Serial.println("WareSafe Warehouse Monitoring");
  Serial.println("Warehouse Floor 2 Online");
  Serial.println("F = Flooding Attack Scenario 3");
  Serial.println("C = Security Suppression Scenario 4");
  Serial.println("D = Defense Mode");
  Serial.println("X = Reset System");

  reconnectMQTT();
  publishEvent(TOPIC_SYSTEM, "FLOOR 2 ONLINE");
  publishEvent(TOPIC_SECURITY, "SYSTEM ACTIVE");
  publishEvent(TOPIC_SYSTEM, "NORMAL CONDITION");

  lastDoorState = digitalRead(PIN_REEDB);

  setNormalState();
}

void loop() {
  if (!mqtt.connected()) {
    reconnectMQTT();
  }

  mqtt.loop();
  handleSerialCommand();
  handleRFID();
  handleDoor();

  if (alarmActive) {
    tone(PIN_BUZZERB, 1000);
  }

  delay(100);
}