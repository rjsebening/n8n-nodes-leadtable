# 📄 CREDENTIALS.md

# LeadTable API Credentials

Diese Datei beschreibt, wie du die Zugangsdaten (Credentials) für die **LeadTable API** in n8n anlegst, um die [n8n-nodes-leadtable](./) Node zu verwenden.

## 🔑 Benötigte Zugangsdaten

Um die Integration nutzen zu können, brauchst du folgende Angaben:

1. **API Key (`x-api-key`)**  
   - Dein persönlicher API-Schlüssel für LeadTable.
   - Diesen erhältst du im [LeadTable Portal](https://portal.lead-table.com/).  
     Gehe auf **Einstellungen → API-Token → Neues API Token erstellen** oder verwalte ein bestehendes.  
   - Tipp: Vergib dem Token einen aussagekräftigen Namen, z. B. `n8n-leadtable-token`.

2. **Agency Email (`email`)**  
   - Die E-Mail-Adresse des Account-Inhabers deiner LeadTable-Agentur.  
   - Diese wird zusammen mit dem API-Key zur Authentifizierung genutzt.

3. **Base URL (`baseUrl`)** *(Default hinterlegt)*  
   - Standardwert:  
     ```
     https://api.lead-table.com/api/v3/external
     ```
   - Dieser Wert ist beim Anlegen der Credentials in n8n bereits vorausgefüllt und muss in der Regel **nicht angepasst werden**.

## ⚙️ Einrichtung in n8n

1. Öffne n8n und gehe zu **Credentials → Neues Credential hinzufügen**.  
2. Wähle **LeadTable API** aus.  
3. Trage die Werte ein:  
   - **API Key:** Dein `x-api-key` aus dem Portal  
   - **Email:** Deine Agentur-Inhaber-E-Mail  
   - **Base URL:** (optional, Standardwert wird empfohlen)  
4. Speichern.

## ✅ Verbindung testen

Um zu prüfen, ob die Credentials korrekt funktionieren, führt n8n automatisch einen Test gegen den Authentifizierungs-Endpoint aus:


```

GET /auth  
Host: [https://api.lead-table.com/api/v3/external](https://api.lead-table.com/api/v3/external)  
Headers:  
x-api-key: <DEIN_API_KEY>  
email: <DEINE_EMAIL>  
accept: application/json

```

- Wenn die Daten korrekt sind, sollte eine Bestätigung mit Status **200 OK** zurückkommen.  
- Falls ein Fehler angezeigt wird, überprüfe bitte API-Key, E-Mail-Adresse und ob dein Token aktiv ist.


## 📝 Hinweise

- API-Keys laufen nicht automatisch ab, können aber jederzeit im [LeadTable Portal](https://portal.lead-table.com/) widerrufen oder neu erstellt werden.  
- Pro Anwendungsfall empfiehlt es sich, ein eigenes API-Token zu erstellen (z. B. `n8n-leadtable-token`).  
- Änderungen an deinen API-Tokens wirken sich sofort auf bestehende Integrationen aus.  
