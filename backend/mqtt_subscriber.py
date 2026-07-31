import json
import pymysql
import paho.mqtt.client as mqtt
from datetime import datetime

MQTT_SERVER = "broker.emqx.io"
MQTT_PORT = 1883

TOPICS = [
    ("office/floor1/vibration", 0),
    ("office/floor1/buzzer", 0),
    ("office/floor1/system", 0),
    ("office/floor1/security", 0),
]

DB_HOST = "127.0.0.1"
DB_USER = "root"
DB_PASSWORD = ""
DB_NAME = "waresafe_db"

SENSOR_ID_VIBRATION = 3
SENSOR_ID_BUZZER_A = 4
ATTACK_ID_SCENARIO_2 = 2


def get_connection():
    return pymysql.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
        cursorclass=pymysql.cursors.DictCursor
    )


def insert_sensor_data(sensor_id, value):
    connection = get_connection()

    try:
        with connection.cursor() as cursor:
            sql = """
                INSERT INTO sensor_data (sensor_id, value, timestamp)
                VALUES (%s, %s, %s)
            """
            cursor.execute(sql, (
                sensor_id,
                value,
                datetime.now()
            ))

        connection.commit()

    finally:
        connection.close()


def insert_alert(sensor_id, attack_id, alert_type):
    connection = get_connection()

    try:
        with connection.cursor() as cursor:
            sql = """
                INSERT INTO alerts (sensor_id, attack_id, alert_type, timestamp)
                VALUES (%s, %s, %s, %s)
            """
            cursor.execute(sql, (
                sensor_id,
                attack_id,
                alert_type,
                datetime.now()
            ))

        connection.commit()

    finally:
        connection.close()


def on_connect(client, userdata, flags, rc):
    print("[MQTT] Connected with result code:", rc)

    for topic in TOPICS:
        client.subscribe(topic)
        print("[MQTT] Subscribed to:", topic[0])


def on_message(client, userdata, msg):
    topic = msg.topic
    payload = msg.payload.decode()

    print(f"[MQTT] {topic} => {payload}")

    if topic == "office/floor1/vibration":
        insert_sensor_data(SENSOR_ID_VIBRATION, payload)

        if payload in [
            "danger_vibration_detected",
            "abnormal_vibration_detected"
        ]:
            insert_sensor_data(SENSOR_ID_BUZZER_A, "buzzer_on")

            insert_alert(
                SENSOR_ID_VIBRATION,
                ATTACK_ID_SCENARIO_2,
                payload
            )

    elif topic == "office/floor1/security":
        if payload in [
            "vibration_data_anomaly_detected",
            "danger_vibration_alert"
        ]:
            insert_alert(
                SENSOR_ID_VIBRATION,
                ATTACK_ID_SCENARIO_2,
                payload
            )
    elif topic == "office/floor1/buzzer":
        insert_sensor_data(SENSOR_ID_BUZZER_A, payload)

    elif topic == "office/floor1/system":
        insert_sensor_data(SENSOR_ID_VIBRATION, payload)

        if payload in [
        "normal_mode_restored",
        "cooldown_finished"
        ]:
            insert_sensor_data(SENSOR_ID_BUZZER_A, "buzzer_off")

client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

client.connect(MQTT_SERVER, MQTT_PORT, 60)

print("[SYSTEM] WareSafe MQTT Subscriber Running...")
client.loop_forever()