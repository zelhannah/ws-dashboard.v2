import pymysql
import paho.mqtt.client as mqtt
from datetime import datetime

MQTT_SERVER = "broker.emqx.io"
MQTT_PORT = 1883

DB_HOST = "127.0.0.1"
DB_USER = "root"
DB_PASSWORD = ""
DB_NAME = "waresafe_db"

TOPIC = {
    "OFFICE_SYSTEM": "office/floor1/system",
    "OFFICE_SECURITY": "office/floor1/security",
    "OFFICE_ATTACK": "office/floor1/attack",
    "OFFICE_IR": "office/floor1/IRsensor",
    "OFFICE_REED": "office/floor1/reedA",
    "OFFICE_DOOR": "office/floor1/maindoor",
    "OFFICE_VIBRATION": "office/floor1/vibration",
    "OFFICE_BUZZER": "office/floor1/buzzerA",
    "WAREHOUSE_SYSTEM": "warehouse/floor2/system",
    "WAREHOUSE_SECURITY": "warehouse/floor2/security",
    "WAREHOUSE_ACCESS": "warehouse/floor2/access",
    "WAREHOUSE_ATTACK": "warehouse/floor2/attack",
    "WAREHOUSE_REED": "warehouse/floor2/reedB",
    "WAREHOUSE_DOOR": "warehouse/floor2/warehousedoor",
    "WAREHOUSE_LED": "warehouse/floor2/ledlight",
    "WAREHOUSE_BUZZER": "warehouse/floor2/buzzerB",
    "WAREHOUSE_LCD": "warehouse/floor2/displaytext",
    "WAREHOUSE_ALARM": "warehouse/floor2/alarm",
}

TOPICS = [(t,0) for t in TOPIC.values()]

SENSOR = {
    "IR":1,"REEDA":2,"VIBRATION":3,"BUZZERA":4,
    "RFID":5,"REEDB":6,"LED_GREEN":7,"LED_YELLOW":8,
    "LED_RED":9,"BUZZERB":10,"LCD":11
}

ATTACK = {
    "SCENARIO_1":1,
    "SCENARIO_2":2,
    "SCENARIO_3":3,
    "SCENARIO_4":4
}

SENSOR_TOPIC = {
    TOPIC["OFFICE_SYSTEM"]: SENSOR["IR"],
    TOPIC["OFFICE_SECURITY"]: SENSOR["IR"],
    TOPIC["OFFICE_IR"]: SENSOR["IR"],
    TOPIC["OFFICE_REED"]: SENSOR["REEDA"],
    TOPIC["OFFICE_DOOR"]: SENSOR["REEDA"],
    TOPIC["OFFICE_VIBRATION"]: SENSOR["VIBRATION"],
    TOPIC["OFFICE_BUZZER"]: SENSOR["BUZZERA"],
    TOPIC["WAREHOUSE_SYSTEM"]: SENSOR["LCD"],
    TOPIC["WAREHOUSE_SECURITY"]: SENSOR["LCD"],
    TOPIC["WAREHOUSE_ACCESS"]: SENSOR["RFID"],
    TOPIC["WAREHOUSE_REED"]: SENSOR["REEDB"],
    TOPIC["WAREHOUSE_DOOR"]: SENSOR["REEDB"],
    TOPIC["WAREHOUSE_BUZZER"]: SENSOR["BUZZERB"],
    TOPIC["WAREHOUSE_LCD"]: SENSOR["LCD"],
    TOPIC["WAREHOUSE_ALARM"]: SENSOR["BUZZERB"],
    TOPIC["WAREHOUSE_LED"]: None,
}

LED_SENSOR = {
    "GREEN": SENSOR["LED_GREEN"],
    "YELLOW": SENSOR["LED_YELLOW"],
    "RED": SENSOR["LED_RED"],
}

ATTACK_RULES = {
    TOPIC["OFFICE_ATTACK"]:[
        ({"SCENARIO_1_STARTED","SCENARIO_1_BLOCKED"},SENSOR["IR"],ATTACK["SCENARIO_1"]),
        ({"SCENARIO_2_STARTED","SCENARIO_2_BLOCKED"},SENSOR["VIBRATION"],ATTACK["SCENARIO_2"])
    ],
    TOPIC["WAREHOUSE_ATTACK"]:[
        ({"SCENARIO_3_STARTED","SCENARIO_3_BLOCKED","FLOODING_ATTACK"},SENSOR["BUZZERB"],ATTACK["SCENARIO_3"]),
        ({"SCENARIO_4_STARTED","SCENARIO_4_BLOCKED"},SENSOR["RFID"],ATTACK["SCENARIO_4"])
    ]
}

def get_connection():
    return pymysql.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
        cursorclass=pymysql.cursors.DictCursor
    )

def execute_query(sql, values):
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(sql, values)
        conn.commit()
    finally:
        conn.close()

def insert_sensor_data(sensor_id, value):
    execute_query(
        "INSERT INTO sensor_data (sensor_id,value,timestamp) VALUES (%s,%s,%s)",
        (sensor_id, value, datetime.now())
    )

def insert_alert(sensor_id, attack_id, alert_type):
    execute_query(
        "INSERT INTO alerts (sensor_id,attack_id,alert_type,timestamp) VALUES (%s,%s,%s,%s)",
        (sensor_id, attack_id, alert_type, datetime.now())
    )



def handle_sensor_data(topic, payload):
    if topic == TOPIC["WAREHOUSE_LED"]:
        sensor_id = LED_SENSOR.get(payload)
    else:
        sensor_id = SENSOR_TOPIC.get(topic)

    if sensor_id is not None:
        insert_sensor_data(sensor_id, payload)

def handle_attack(topic, payload):
    for payloads, sensor_id, attack_id in ATTACK_RULES.get(topic, []):
        if payload in payloads:
            insert_alert(sensor_id, attack_id, payload)
            return

def on_connect(client, userdata, flags, rc):
    print(f"[MQTT] Connected : {rc}")
    for topic, qos in TOPICS:
        client.subscribe((topic, qos))
        print(f"[MQTT] Subscribe : {topic}")

def on_message(client, userdata, msg):
    topic = msg.topic
    payload = msg.payload.decode()
    print(f"[MQTT] {topic} -> {payload}")

    if topic in SENSOR_TOPIC:
        handle_sensor_data(topic, payload)
    elif topic in ATTACK_RULES:
        handle_attack(topic, payload)

mqtt_client = mqtt.Client()
mqtt_client.on_connect = on_connect
mqtt_client.on_message = on_message

mqtt_client.connect(MQTT_SERVER, MQTT_PORT, 60)

print("[SYSTEM] WareSafe MQTT Subscriber Running...")
mqtt_client.loop_forever()