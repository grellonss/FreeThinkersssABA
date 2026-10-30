# 🇨🇭 Guida Culturale Svizzera (Swiss Cultural Guide)

Applicazione web full-stack per la scoperta del patrimonio culturale, storico, paesaggistico ed enogastronomico della **Svizzera (Confederazione Elvetica)** attraverso l'integrazione con **API svizzere aperte e 100% gratuite**, senza chiavi a pagamento.

L'architettura include un **backend in .NET 9 (C#)** con persistenza SQLite e un **frontend in React (TailwindCSS, Leaflet & Lucide Icons)** con supporto multilingua (Italiano, Tedesco, Inglese).

---

## 🏔️ Nuove API Svizzere Gratuite Integrate

La piattaforma è stata completamente reingegnerizzata per operare sul territorio elvetico (26 cantoni):

1. **GeoAdmin API (`api3.geo.admin.ch`) - Ufficio Federale di Topografia (Swisstopo)**
   - **Ricerca Comuni in tempo reale (`origins=gg25`)**: Ritorna qualsiasi comune svizzero ufficiale (BFS ID, cantone, coordinate e confini).
   - **Inventario PBC / KGS (`layer=ch.babs.kulturgueter`)**: Protezione beni culturali svizzeri di importanza nazionale e regionale (classe A e B), con indirizzi, classificazioni, link e fotografie ufficiali della Confederazione.
2. **Wikipedia & Wikimedia Commons Geosearch (`*.wikipedia.org`)**
   - Ricerca geospaziale di musei, monumenti, vette alpine, laghi e castelli in base alle coordinate del comune svizzero selezionato.
   - Fornisce estratti storici dettagliati e immagini ad alta risoluzione in italiano, tedesco e inglese.
3. **Database Locale SQLite e Caching**
   - Memorizza i punti di interesse e i profili di preferenza degli utenti (`ProfileVector`), consentendo al chatbot AI con Google Gemini di avere il contesto completo della destinazione per fornire consigli personalizzati.

---

## 🏛️ Struttura del Progetto

```bash
CulturalGuide/
├─ CulturalGuideBACKEND/            # Backend Web API .NET 9
│  ├─ Controllers/                 # SwaggerController (EppoiApiController), ChatbotController, AuthController
│  ├─ Services/                    # SwissCulturalApiService, GeminiService, ChatContextService
│  ├─ Models/                      # Municipality, CardItem, CardItemDetail, ProfileVector, User
│  ├─ DTO/                         # DTO per comuni, schede unificate, categorie e dettagli
│  ├─ Data/                        # AppDbContext (Entity Framework Core SQLite)
│  └─ Program.cs                   # Configurazione middleware, CORS, JWT e DB startup
├─ cultural-guide-frontend/        # Frontend React
│  ├─ src/
│  │  ├─ components/              # InterestSelection, SwipeCarousel, MapView, Chatbot, Start, Header
│  │  ├─ services/                # Servizi per categorie svizzere e client unificato (apiUtils.js)
│  │  ├─ locales/                 # Traduzioni (it.json, de.json, en.json)
│  │  └─ App.js                   # Navigazione e gestione viste
│  └─ package.json
└─ README.md
```

---

## 🚀 Avvio dell'Applicazione

### 1. Avvio del Backend (.NET 9)

```bash
cd CulturalGuideBACKEND

# Ripristino pacchetti e build
dotnet restore
dotnet build

# Avvio del server API (su http://localhost:5203)
dotnet run
```

Al primo avvio, il servizio di warmup popola automaticamente il database SQLite con i principali comuni elvetici (Lugano, Zurigo, Berna, Ginevra, Lucerna, Bellinzona, Zermatt, ecc.) e precarica le schede culturali.

### 2. Avvio del Frontend (React)

```bash
cd cultural-guide-frontend

# Installazione dipendenze
npm install

# Avvio del server di sviluppo (su http://localhost:3000)
npm run dev
# oppure
npm start
```

---

## 🗺️ Funzionalità Chiave

- **Selezione Destinazione Svizzera**: Ricerca intelligente di qualsiasi comune dei 26 cantoni elvetici o selezione rapida tra le città principali con badge cantonale (es. *Lugano (TI)*, *Zürich (ZH)*, *Bern (BE)*).
- **Disponibilità e Preferenze**: Definizione data/ora e selezione degli interessi tra Arte & Musei, Enogastronomia & Grotti, Natura & Vette Alpine, Sentieri & Itinerari, Cioccolato & Prodotti Tipici, Hotel & Chalet.
- **Swipe Carousel Interattivo**: Navigazione a scorrimento tra le schede culturali svizzere con fotografie, distanze, orari e vista dettagliata.
- **Mappa Interattiva Leaflet**: Visualizzazione geografica dei marker su mappa OpenStreetMap centrata automaticamente sulla Svizzera e sulle coordinate del comune scelto.
- **Assistente AI Chatbot**: Assistente virtuale basato su Gemini che risponde in lingua naturale con consigli culturali contestualizzati sui luoghi e sui monumenti della destinazione svizzera selezionata.

---
