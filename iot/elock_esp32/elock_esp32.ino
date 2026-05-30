/* ============================================================
   FIRMWARE ELOCK - ESP32 + RFID RC522 + SERVO
   ============================================================
   Projeto: TrancAi / Elock - Fechadura inteligente
   Hardware: ESP32 DevKit v1, MFRC522, micro servo (SG90/MG90S)

   COMO USAR (LEIA ANTES DE FAZER UPLOAD):
   1) Edite as constantes da secao CONFIG abaixo (4 valores).
   2) Faca upload pro ESP32.
   3) Abra o Serial Monitor a 115200 baud.
   4) Aproxime seu cartao RFID. O Serial vai imprimir o UID.
   5) Copie esse UID, cole em AUTHORIZED_UIDS, ajuste NUM_AUTHORIZED
      e faca upload de novo. Pronto.
   ============================================================ */

#include <WiFi.h>
#include <HTTPClient.h>
#include <SPI.h>
#include <MFRC522.h>
#include <ESP32Servo.h>

/* ============================================================
   >>> CONFIG - EDITE AQUI <<<
   ============================================================ */

// 1. WiFi (use o HOTSPOT do celular!)
            const char* WIFI_SSID     = "heloisa";
            const char* WIFI_PASSWORD = "Helo197820061277";

// 2. URL da API. Depois de conectar o PC no hotspot, rode `ipconfig`
//    no PowerShell e use o IP do adaptador Wi-Fi (algo tipo 172.20.10.X
//    no iPhone ou 192.168.X.X no Android). NAO use "localhost".
const char* API_BASE = "http://192.168.15.87:8000";

// 3. ID da fechadura no banco (criamos a "Fechadura Demo IoT" com id=2)
const int LOCK_ID = 2;

// 4. Token JWT do usuario ESP32 (valido por 30 dias)
const char* JWT_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiRVNQMzIgUG9ydGEgRGVtbyIsImVtYWlsIjoiZXNwMzJAZWxvY2suY29tIiwic3ViIjoyLCJpYXQiOjE3Nzk5MDYzMDUsImV4cCI6MTc4MjQ5ODMwNX0.h9M32kmt_U8Z720485vbBRYFRGkEDA-EhytfpaZQUOE";

// 5. UIDs autorizados. Deixe a lista vazia na primeira vez para
//    descobrir o UID do seu cartao no Serial Monitor.
//    Formato: "A1 B2 C3 D4" (hex em maiusculas, separado por espaco)
const int NUM_AUTHORIZED = 1;
const char* AUTHORIZED_UIDS[] = {
    "56 B5 9B 21",   // cartao do Gabriel
    // "AB CD EF 01",
};

/* ============================================================
   PINS (so mexa se sua placa for diferente)
   ============================================================ */

// RFID RC522 (SPI)
#define RFID_SS_PIN   5    // SDA do RC522
#define RFID_RST_PIN  22   // RST do RC522
// MISO=19, MOSI=23, SCK=18 - pinos SPI padrao do ESP32

// Servo
#define SERVO_PIN     13

// LED interno do ESP32 (feedback visual)
#define LED_PIN       2

// Angulos do servo (calibre conforme seu servo + mecanismo)
#define ANGULO_FECHADO  0
#define ANGULO_ABERTO   90

// Tempo entre polls do servidor (ms)
const unsigned long INTERVALO_POLL = 2000;

/* ============================================================
   OBJETOS GLOBAIS
   ============================================================ */

MFRC522 rfid(RFID_SS_PIN, RFID_RST_PIN);
Servo servo;
String estadoAtual = "off";
unsigned long ultimoPoll = 0;

/* ============================================================
   SETUP
   ============================================================ */

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println();
  Serial.println("======================================");
  Serial.println("   ELOCK - Fechadura Inteligente");
  Serial.println("======================================");

  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);

  // Servo
  servo.setPeriodHertz(50);
  servo.attach(SERVO_PIN, 500, 2400);
  servo.write(ANGULO_FECHADO);
  Serial.println("[SERVO] Inicializado em 0 graus (FECHADO)");

  // RFID
  SPI.begin();
  rfid.PCD_Init();
  delay(50);
  byte versao = rfid.PCD_ReadRegister(MFRC522::VersionReg);
  Serial.print("[RFID] Versao do chip RC522: 0x");
  Serial.println(versao, HEX);
  if (versao == 0x00 || versao == 0xFF) {
    Serial.println("[RFID] *** ERRO DE FIACAO! O modulo NAO esta respondendo. ***");
    Serial.println("[RFID] Cheque: SDA->D5, SCK->D18, MOSI->D23, MISO->D19, RST->D22, 3.3V->3V3, GND->GND");
  } else {
    Serial.println("[RFID] Leitor RC522 OK - comunicacao SPI funcionando!");
  }

  // WiFi
  Serial.print("[WIFI] Conectando em \"");
  Serial.print(WIFI_SSID);
  Serial.print("\"");
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  int tentativas = 0;
  while (WiFi.status() != WL_CONNECTED && tentativas < 40) {
    delay(500);
    Serial.print(".");
    tentativas++;
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println(" OK");
    Serial.print("[WIFI] IP local: ");
    Serial.println(WiFi.localIP());
    Serial.print("[WIFI] RSSI: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
    piscaLED(3, 100);
  } else {
    Serial.println(" FALHOU!");
    Serial.println("[WIFI] Confira SSID e senha. Reiniciando em 5s...");
    delay(5000);
    ESP.restart();
  }

  Serial.println("======================================");
  Serial.println("Sistema pronto. Aguardando comandos...");
  Serial.println("======================================");
  Serial.println();
}

/* ============================================================
   LOOP
   ============================================================ */

void loop() {
  // 1. Le RFID continuamente
  verificarRFID();

  // 2. Polling do servidor a cada N ms
  if (millis() - ultimoPoll > INTERVALO_POLL) {
    sincronizarComServidor();
    ultimoPoll = millis();
  }

  delay(50);
}

/* ============================================================
   RFID
   ============================================================ */

void verificarRFID() {
  if (!rfid.PICC_IsNewCardPresent()) return;
  if (!rfid.PICC_ReadCardSerial()) return;

  String uid = lerUID();
  Serial.print("[RFID] Cartao detectado, UID: ");
  Serial.println(uid);

  if (estaAutorizado(uid)) {
    Serial.println("[RFID] ===> AUTORIZADO");
    piscaLED(2, 80);

    String novoEstado = (estadoAtual == "on") ? "off" : "on";
    if (atualizarServidor(novoEstado)) {
      atualizarServo(novoEstado);
      estadoAtual = novoEstado;
      Serial.print("[OK] Fechadura agora: ");
      Serial.println(novoEstado);
    } else {
      Serial.println("[ERRO] Falha ao atualizar servidor (servo nao mexeu)");
    }
  } else {
    Serial.println("[RFID] ===> NAO AUTORIZADO");
    if (NUM_AUTHORIZED == 0) {
      Serial.println("--------------------------------------");
      Serial.println("MODO DESCOBERTA ATIVO:");
      Serial.println("Copie o UID acima e cole no array");
      Serial.println("AUTHORIZED_UIDS do codigo. Depois");
      Serial.println("ajuste NUM_AUTHORIZED e re-upload.");
      Serial.println("--------------------------------------");
    }
    piscaLED(5, 50);
  }

  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
  delay(1500); // anti-bouncing: evita varias leituras seguidas
}

String lerUID() {
  String uid = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    if (rfid.uid.uidByte[i] < 0x10) uid += "0";
    uid += String(rfid.uid.uidByte[i], HEX);
    if (i < rfid.uid.size - 1) uid += " ";
  }
  uid.toUpperCase();
  return uid;
}

bool estaAutorizado(String uid) {
  for (int i = 0; i < NUM_AUTHORIZED; i++) {
    if (uid.equalsIgnoreCase(AUTHORIZED_UIDS[i])) return true;
  }
  return false;
}

/* ============================================================
   API HTTP - sincronizacao e comandos
   ============================================================ */

void sincronizarComServidor() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[WIFI] Desconectado, tentando reconectar...");
    WiFi.reconnect();
    return;
  }

  HTTPClient http;
  String url = String(API_BASE) + "/door-locks/" + String(LOCK_ID);
  http.begin(url);
  http.addHeader("Authorization", String("Bearer ") + JWT_TOKEN);

  int code = http.GET();
  if (code == 200) {
    String body = http.getString();
    // parser simples sem ArduinoJson - basta para resposta da API
    int idx = body.indexOf("\"status\":\"");
    if (idx >= 0) {
      String statusServer = body.substring(idx + 10);
      statusServer = statusServer.substring(0, statusServer.indexOf("\""));
      if (statusServer != estadoAtual) {
        Serial.print("[POLL] Mudanca detectada no servidor: ");
        Serial.print(estadoAtual);
        Serial.print(" -> ");
        Serial.println(statusServer);
        atualizarServo(statusServer);
        estadoAtual = statusServer;
      }
    }
  } else if (code > 0) {
    Serial.print("[POLL] HTTP ");
    Serial.println(code);
  } else {
    Serial.print("[POLL] Erro de conexao: ");
    Serial.println(http.errorToString(code));
  }
  http.end();
}

bool atualizarServidor(String novoStatus) {
  if (WiFi.status() != WL_CONNECTED) return false;

  HTTPClient http;
  String url = String(API_BASE) + "/door-locks/" + String(LOCK_ID);
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", String("Bearer ") + JWT_TOKEN);

  String payload = String("{\"status\":\"") + novoStatus + "\"}";
  int code = http.PUT(payload);

  bool ok = (code == 200 || code == 201);
  Serial.print("[PUT] ");
  Serial.print(url);
  Serial.print(" payload=");
  Serial.print(payload);
  Serial.print(" -> HTTP ");
  Serial.println(code);

  http.end();
  return ok;
}

/* ============================================================
   SERVO E FEEDBACK
   ============================================================ */

void atualizarServo(String estado) {
  if (estado == "on") {
    servo.write(ANGULO_ABERTO);
    Serial.println("[SERVO] >>> ABERTO");
  } else {
    servo.write(ANGULO_FECHADO);
    Serial.println("[SERVO] >>> FECHADO");
  }
}

void piscaLED(int vezes, int intervalo_ms) {
  for (int i = 0; i < vezes; i++) {
    digitalWrite(LED_PIN, HIGH);
    delay(intervalo_ms);
    digitalWrite(LED_PIN, LOW);
    delay(intervalo_ms);
  }
}
