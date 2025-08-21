# n8n-nodes-leadtable

Eine professionelle n8n Custom Node für die nahtlose Integration mit der LeadTable API. Automatisieren Sie Ihre Lead-Management-Workflows mit umfassenden CRUD-Operationen und Echtzeit-Webhook-Unterstützung.

![LeadTable Node](https://img.shields.io/badge/n8n-community--node-FF6D5A)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🚀 Überblick

Diese n8n Custom Node ermöglicht die vollständige Integration mit LeadTable - einer führenden Lead-Management-Plattform. Von der automatischen Lead-Erstellung bis hin zur Echtzeit-Benachrichtigung bei Statusänderungen - automatisieren Sie Ihren gesamten Lead-Lifecycle ohne eine einzige Zeile Code.

## ✨ Hauptfunktionen

### 📊 **Vollständiges Lead-Management**
- **Lead-Erstellung**: Neue Leads mit benutzerdefinierten Datenfeldern anlegen
- **Lead-Abruf**: Detaillierte Lead-Informationen mit flexiblen Formatierungsoptionen
- **Lead-Aktualisierung**: Dynamisches Frage-Antwort-System für Lead-Daten
- **Lead-Suche**: Leistungsstarke E-Mail-basierte Suchfunktionen
- **Datei-Upload**: Dokumente und Anhänge direkt an Leads anhängen

### ⚡ **Echtzeit-Automatisierung**
- **Webhook-Trigger**: Sofortige Reaktion auf Lead-Events
- **Multi-Level-Webhooks**: Agency-, Customer- und Campaign-spezifische Trigger
- **Event-Typen**: Neue Leads, Statusänderungen, Daten-Updates
- **Automatische Lead-Details**: Intelligente Anreicherung von Webhook-Daten

### 🏢 **Umfassendes Account-Management**
- **Customer-Verwaltung**: Übersicht aller Kunden mit Pagination
- **Campaign-Management**: Kampagnen-Abruf pro Kunde
- **Hierarchische Struktur**: Agency → Customer → Campaign → Leads

### 🔐 **Sichere API-Integration**
- **Dual-Authentifizierung**: API-Key + E-Mail-Verifizierung
- **Verbindungstest**: Automatische Authentifizierungs-Überprüfung
- **Fehlerbehandlung**: Robuste Error-Handling mit aussagekräftigen Meldungen

## 📦 Installation

### Voraussetzungen
- n8n Version 1.0.0 oder höher
- Aktiver LeadTable Account mit gültigem API-Schlüssel

## 🔧 Konfiguration

### API-Credentials einrichten
1. Navigieren Sie in n8n zu **Credentials** → **Neue Credentials erstellen**
2. Suchen Sie nach "LeadTable API"
3. Tragen Sie Ihre Zugangsdaten ein:
   - **API Key**: Ihr LeadTable API-Schlüssel
   - **E-Mail**: Ihre LeadTable Account-E-Mail
   - **Base URL**: `https://api.lead-table.com/api/v3/external`

### API-Schlüssel erhalten
1. Melden Sie sich bei LeadTable an
2. Navigieren Sie zu **Einstellungen** → **API**
3. Generieren Sie einen neuen API-Schlüssel
4. Kopieren Sie den Schlüssel und Ihre Account-E-Mail

### LeadTable Node (Manuelle Aktionen)

#### **Lead-Management**
| Aktion | Beschreibung |
|--------|--------------|
| **Lead erstellen** | Neuen Lead in Kampagne mit Custom-Daten anlegen |
| **Lead abrufen** | Lead-Details laden (optional: Plain-Text Beschreibung) |
| **Lead aktualisieren** | Lead-Informationen über Frage-Antwort-System ändern |
| **Beschreibung aktualisieren** | Nur Lead-Beschreibung bearbeiten |
| **Nach E-Mail suchen** | Leads anhand E-Mail-Adresse finden (mit Pagination) |
| **Nach Kampagne abrufen** | Alle Leads einer Kampagne laden (mit Pagination) |
| **Datei hinzufügen** | Datei-Upload und Verknüpfung mit Lead |

#### **Account-Management**
| Aktion | Beschreibung |
|--------|--------------|
| **Alle Kunden abrufen** | Vollständige Kundenliste (mit Pagination) |
| **Alle Kampagnen abrufen** | Kampagnen für spezifischen Kunden laden |

#### **Webhook-Management**
| Aktion | Beschreibung |
|--------|--------------|
| **Webhook anhängen** | Webhook für Events registrieren (Multi-Level) |
| **Webhook entfernen** | Registrierten Webhook löschen |
| **Webhook abfragen** | Ausstehende Events abrufen (Polling) |

#### **Authentifizierung**
| Aktion | Beschreibung |
|--------|--------------|
| **Authentifizierung prüfen** | API-Verbindung und Zugangsdaten testen |

### LeadTable Trigger (Automatische Events)

#### **Event-Typen**
- **Neuer Lead erstellt**: Bei jedem neuen Lead ausgelöst
- **Lead-Status geändert**: Bei Statusänderungen ausgelöst  
- **Lead aktualisiert**: Bei jeder Datenänderung ausgelöst

#### **Webhook-Ebenen**
- **Agency (Global)**: Events von allen Kampagnen der gesamten Agentur
- **Customer**: Events von allen Kampagnen eines spezifischen Kunden
- **Table (Kampagne)**: Events nur von einer bestimmten Kampagne

#### **Erweiterte Funktionen**
- **Lead-Details einschließen**: Automatisches Laden vollständiger Lead-Informationen
- **Automatisches Webhook-Management**: Registrierung beim Aktivieren, Entfernung beim Deaktivieren
- **Echtzeit-Verarbeitung**: Sofortige Event-Verarbeitung ohne Verzögerung

## 📖 Anwendungsbeispiele

folgt....
