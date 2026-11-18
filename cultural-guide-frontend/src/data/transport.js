// shortcut: contenuti statici nel frontend; quando ESN deve aggiornarli da sola (US 2.1.1 / 2.1.2)
// spostare questo stesso JSON dietro un endpoint del backend.
//
// Fonti Camerino (controllate a novembre 2026): unicam.it/studente/vivere-unicam/trasporti,
// isas.unicam.it/transport-and-unicam-mobility, volantini UNICAM/Contram 2023.
// Olten: solo informazioni generali, NON ancora validate con interviste.

const L = {
    unicam: "https://www.unicam.it/studente/vivere-unicam/trasporti",
    contram: "https://www.contram.it",
    romaMarche: "https://marcheroma.contram.it",
    trenitalia: "https://www.trenitalia.com",
    sbb: "https://www.sbb.ch",
    awelle: "https://www.a-welle.ch",
    bogg: "https://www.bogg.ch",
    scioperi: "https://scioperi.mit.gov.it",
};

const CAMERINO = {
    verified: "2026-11",
    validated: false,
    it: {
        facts: [
            "Bus urbani gratis per studenti UNICAM con la tessera UNICAMMOBILITÀ",
            "Camerino non ha stazione: si scende a Castelraimondo-Camerino, poi 15 min di bus",
            "Orari e rinnovo abbonamento nell'app Contram Mobilità",
        ],
        sections: [
            {
                id: "pass",
                title: "Attiva l'abbonamento bus gratuito",
                intro: "Si chiama UNICAMMOBILITÀ ed è gestito da Contram. Copre i bus urbani di Camerino e le tratte Camerino–Castelraimondo e Camerino–Matelica.",
                steps: [
                    "Prepara l'attestato di iscrizione UNICAM con numero di matricola, la tua email e il codice fiscale.",
                    "La prima volta vai di persona alla biglietteria Contram, via Le Mosse 19/21, piano terra (aperta la mattina).",
                    "Ti consegnano la tessera e il primo abbonamento mensile, entrambi gratuiti.",
                    "Scarica l'app Contram Mobilità (Android e iOS) e registra la tessera.",
                    "Ogni mese rinnova dall'app: sezione Tessere, pulsante «Rinnova ora».",
                ],
                warning: "Sei in scambio o Erasmus? Le fonti ufficiali parlano di «studenti UNICAM idonei» senza citare gli studenti in mobilità: chiedi conferma a ESN Camerino o all'International Office prima di andare in biglietteria.",
                links: [
                    { label: "Trasporti UNICAM (pagina ufficiale)", url: L.unicam },
                    { label: "Contram", url: L.contram },
                ],
            },
            {
                id: "arrive",
                title: "Arrivare a Camerino",
                items: [
                    { title: "In treno", text: "Scendi alla stazione Castelraimondo-Camerino (linea Civitanova Marche–Fabriano). Da lì un bus Contram porta a Camerino in circa 15 minuti, più o meno una corsa all'ora. Gratis con la tessera, altrimenti 1–2 €." },
                    { title: "Da Roma (Fiumicino, Ciampino)", text: "Treno fino a Fabriano e cambio per Castelraimondo-Camerino. In alternativa c'è il bus Roma–Marche di Contram, da prenotare online." },
                    { title: "Da Ancona (aeroporto di Falconara)", text: "Treno Ancona → Fabriano → Castelraimondo-Camerino. Esiste anche UNICAMBUS, gratuito per studenti UNICAM ma solo su prenotazione." },
                ],
                links: [
                    { label: "Orari treni (Trenitalia)", url: L.trenitalia },
                    { label: "Bus Roma–Marche", url: L.romaMarche },
                ],
            },
            {
                id: "around",
                title: "Muoversi in città e nei dintorni",
                items: [
                    { title: "Bus urbani", text: "Collegano centro, campus e residenze. Controlla sempre l'ultima corsa prima di uscire la sera o nei festivi." },
                    { title: "E-bike", text: "Contram offre il noleggio di e-bike gratuito per gli studenti UNICAM. Verifica la disponibilità in biglietteria." },
                    { title: "Ultimo bus e salite", text: "L'ultimo bus non sempre passa: tienine conto se esci la sera. Camerino è in collina, a piedi tra residenze e centro possono servire 30 minuti." },
                    { title: "Scioperi", text: "Treni e bus italiani si fermano spesso per sciopero e i biglietti già comprati possono andare persi. Prima di viaggiare controlla il calendario ufficiale degli scioperi." },
                    { title: "App non disponibile", text: "Se l'app Contram Mobilità non è scaricabile nel tuo App Store (succede con account di altri paesi), chiedi in biglietteria come gestire la tessera." },
                ],
                links: [{ label: "Orari bus Contram", url: L.contram }, { label: "Calendario scioperi", url: L.scioperi }],
            },
            {
                id: "help",
                title: "A chi chiedere",
                items: [
                    { title: "Biglietteria Contram", text: "Via Le Mosse 19/21, Camerino. Gli orari cambiano: controllali sul sito prima di andare." },
                    { title: "Numero verde Contram", text: "800 037 737, lunedì–venerdì 9–13." },
                ],
            },
        ],
    },
    en: {
        facts: [
            "City buses are free for UNICAM students with the UNICAMMOBILITÀ card",
            "Camerino has no station: get off at Castelraimondo-Camerino, then a 15 min bus",
            "Timetables and pass renewal are in the Contram Mobilità app",
        ],
        sections: [
            {
                id: "pass",
                title: "Activate your free bus pass",
                intro: "It is called UNICAMMOBILITÀ and is run by Contram. It covers city buses in Camerino and the Camerino–Castelraimondo and Camerino–Matelica routes.",
                steps: [
                    "Bring your UNICAM enrolment certificate with your student number (matricola), your email and your Italian tax code (codice fiscale).",
                    "The first time, go in person to the Contram ticket office, via Le Mosse 19/21, ground floor (open in the morning).",
                    "You receive the card and the first monthly pass, both free.",
                    "Download the Contram Mobilità app (Android and iOS) and register the card.",
                    "Renew every month in the app: Tessere section, «Rinnova ora» button.",
                ],
                warning: "On exchange or Erasmus? Official sources say «eligible UNICAM students» and do not mention exchange students: confirm with ESN Camerino or the International Office before going to the ticket office.",
                links: [
                    { label: "UNICAM transport (official page)", url: L.unicam },
                    { label: "Contram", url: L.contram },
                ],
            },
            {
                id: "arrive",
                title: "Getting to Camerino",
                items: [
                    { title: "By train", text: "Get off at Castelraimondo-Camerino station (Civitanova Marche–Fabriano line). From there a Contram bus reaches Camerino in about 15 minutes, roughly once an hour. Free with the card, otherwise €1–2." },
                    { title: "From Rome (Fiumicino, Ciampino)", text: "Train to Fabriano, then change for Castelraimondo-Camerino. Alternatively take Contram's Rome–Marche coach, to be booked online." },
                    { title: "From Ancona (Falconara airport)", text: "Train Ancona → Fabriano → Castelraimondo-Camerino. There is also UNICAMBUS, free for UNICAM students but only with a booking." },
                ],
                links: [
                    { label: "Train times (Trenitalia)", url: L.trenitalia },
                    { label: "Rome–Marche coach", url: L.romaMarche },
                ],
            },
            {
                id: "around",
                title: "Getting around town and nearby",
                items: [
                    { title: "City buses", text: "They link the centre, the campus and the student residences. Always check the last bus before going out in the evening or on public holidays." },
                    { title: "E-bikes", text: "Contram offers free e-bike rental to UNICAM students. Check availability at the ticket office." },
                    { title: "Last bus and hills", text: "The last bus does not always run: keep it in mind when you go out at night. Camerino is on a hill, walking between the residences and the centre can take 30 minutes." },
                    { title: "Strikes", text: "Italian trains and buses often stop for strikes, and tickets you already bought can be lost. Check the official strike calendar before you travel." },
                    { title: "App not available", text: "If the Contram Mobilità app is not available in your App Store (this happens with accounts from other countries), ask the ticket office how to manage your card." },
                ],
                links: [{ label: "Contram bus times", url: L.contram }, { label: "Strike calendar", url: L.scioperi }],
            },
            {
                id: "help",
                title: "Who to ask",
                items: [
                    { title: "Contram ticket office", text: "Via Le Mosse 19/21, Camerino. Opening hours change: check the website before you go." },
                    { title: "Contram free phone", text: "800 037 737, Monday–Friday 9–13." },
                ],
            },
        ],
    },
    de: {
        facts: [
            "Stadtbusse sind für UNICAM-Studierende mit der UNICAMMOBILITÀ-Karte gratis",
            "Camerino hat keinen Bahnhof: in Castelraimondo-Camerino aussteigen, dann 15 Min. Bus",
            "Fahrpläne und Abo-Verlängerung in der App Contram Mobilità",
        ],
        sections: [
            {
                id: "pass",
                title: "Gratis-Busabo aktivieren",
                intro: "Es heisst UNICAMMOBILITÀ und wird von Contram betrieben. Es gilt für die Stadtbusse in Camerino sowie die Strecken Camerino–Castelraimondo und Camerino–Matelica.",
                steps: [
                    "Halte die UNICAM-Immatrikulationsbestätigung mit Matrikelnummer, deine E-Mail-Adresse und die italienische Steuernummer (codice fiscale) bereit.",
                    "Beim ersten Mal gehst du persönlich zum Contram-Schalter, Via Le Mosse 19/21, Erdgeschoss (vormittags geöffnet).",
                    "Du erhältst die Karte und das erste Monatsabo, beides gratis.",
                    "Lade die App Contram Mobilità (Android und iOS) herunter und registriere die Karte.",
                    "Verlängere jeden Monat in der App: Bereich «Tessere», Knopf «Rinnova ora».",
                ],
                warning: "Im Austausch oder Erasmus? Die offiziellen Quellen nennen «berechtigte UNICAM-Studierende» und erwähnen Austauschstudierende nicht: frag bei ESN Camerino oder beim International Office nach, bevor du zum Schalter gehst.",
                links: [
                    { label: "UNICAM Verkehr (offizielle Seite)", url: L.unicam },
                    { label: "Contram", url: L.contram },
                ],
            },
            {
                id: "arrive",
                title: "Anreise nach Camerino",
                items: [
                    { title: "Mit dem Zug", text: "Steig am Bahnhof Castelraimondo-Camerino aus (Linie Civitanova Marche–Fabriano). Von dort fährt ein Contram-Bus in rund 15 Minuten nach Camerino, etwa einmal pro Stunde. Mit der Karte gratis, sonst 1–2 €." },
                    { title: "Ab Rom (Fiumicino, Ciampino)", text: "Zug bis Fabriano, dann umsteigen nach Castelraimondo-Camerino. Alternativ der Fernbus Rom–Marken von Contram, online zu buchen." },
                    { title: "Ab Ancona (Flughafen Falconara)", text: "Zug Ancona → Fabriano → Castelraimondo-Camerino. Es gibt auch den UNICAMBUS, gratis für UNICAM-Studierende, aber nur mit Reservation." },
                ],
                links: [
                    { label: "Zugfahrplan (Trenitalia)", url: L.trenitalia },
                    { label: "Fernbus Rom–Marken", url: L.romaMarche },
                ],
            },
            {
                id: "around",
                title: "Unterwegs in der Stadt und Umgebung",
                items: [
                    { title: "Stadtbusse", text: "Sie verbinden Zentrum, Campus und Wohnheime. Prüfe immer den letzten Bus, bevor du abends oder an Feiertagen ausgehst." },
                    { title: "E-Bikes", text: "Contram verleiht E-Bikes gratis an UNICAM-Studierende. Frag am Schalter nach der Verfügbarkeit." },
                    { title: "Letzter Bus und Steigungen", text: "Der letzte Bus fährt nicht immer: denk daran, wenn du abends ausgehst. Camerino liegt auf einem Hügel, zu Fuss zwischen Wohnheim und Zentrum brauchst du bis zu 30 Minuten." },
                    { title: "Streiks", text: "Italienische Züge und Busse stehen oft wegen Streiks still, und bereits gekaufte Billette können verfallen. Prüfe vor der Reise den offiziellen Streikkalender." },
                    { title: "App nicht verfügbar", text: "Wenn die App Contram Mobilità in deinem App Store nicht verfügbar ist (passiert mit Konten aus anderen Ländern), frag am Schalter, wie du die Karte verwaltest." },
                ],
                links: [{ label: "Contram Busfahrplan", url: L.contram }, { label: "Streikkalender", url: L.scioperi }],
            },
            {
                id: "help",
                title: "Wen fragen",
                items: [
                    { title: "Contram-Schalter", text: "Via Le Mosse 19/21, Camerino. Die Öffnungszeiten ändern sich: prüfe sie vorher auf der Website." },
                    { title: "Contram Gratisnummer", text: "800 037 737, Montag–Freitag 9–13 Uhr." },
                ],
            },
        ],
    },
};

const OLTEN = {
    verified: "2026-11",
    validated: false,
    draft: true,
    it: {
        facts: [
            "Olten è uno dei principali nodi ferroviari svizzeri",
            "Orari e biglietti di treni e bus nell'app SBB Mobile",
            "Con il metà-prezzo (Halbtax) paghi la metà su quasi tutti i trasporti",
        ],
        sections: [
            {
                id: "arrive",
                title: "Treni e bus",
                items: [
                    { title: "Treni", text: "Da Olten partono treni diretti per Zurigo, Berna, Basilea e Lucerna, ciascuna a circa mezz'ora." },
                    { title: "Bus locali", text: "I bus di Olten sono gestiti da BOGG e rientrano nella comunità tariffale A-Welle." },
                ],
                links: [
                    { label: "SBB / FFS", url: L.sbb },
                    { label: "A-Welle", url: L.awelle },
                    { label: "BOGG", url: L.bogg },
                ],
            },
        ],
    },
    en: {
        facts: [
            "Olten is one of Switzerland's main railway hubs",
            "Train and bus timetables and tickets are in the SBB Mobile app",
            "With the Half Fare Card (Halbtax) you pay half on almost all transport",
        ],
        sections: [
            {
                id: "arrive",
                title: "Trains and buses",
                items: [
                    { title: "Trains", text: "Direct trains run from Olten to Zurich, Bern, Basel and Lucerne, each about half an hour away." },
                    { title: "Local buses", text: "Buses in Olten are run by BOGG and belong to the A-Welle fare network." },
                ],
                links: [
                    { label: "SBB", url: L.sbb },
                    { label: "A-Welle", url: L.awelle },
                    { label: "BOGG", url: L.bogg },
                ],
            },
        ],
    },
    de: {
        facts: [
            "Olten ist einer der wichtigsten Bahnknoten der Schweiz",
            "Fahrpläne und Billette für Zug und Bus in der App SBB Mobile",
            "Mit dem Halbtax zahlst du fast überall die Hälfte",
        ],
        sections: [
            {
                id: "arrive",
                title: "Züge und Busse",
                items: [
                    { title: "Züge", text: "Ab Olten fahren direkte Züge nach Zürich, Bern, Basel und Luzern, jeweils rund eine halbe Stunde." },
                    { title: "Lokale Busse", text: "Die Busse in Olten betreibt BOGG, sie gehören zum Tarifverbund A-Welle." },
                ],
                links: [
                    { label: "SBB", url: L.sbb },
                    { label: "A-Welle", url: L.awelle },
                    { label: "BOGG", url: L.bogg },
                ],
            },
        ],
    },
};

const GUIDES = { camerino: CAMERINO, olten: OLTEN };

// Restituisce la guida per città e lingua, oppure null se la città non è coperta.
export function getTransportGuide(city, lang) {
    const guide = GUIDES[(city || "").trim().toLowerCase()];
    if (!guide) return null;
    const content = guide[(lang || "it").slice(0, 2)] || guide.it;
    return { ...content, verified: guide.verified, validated: guide.validated, draft: !!guide.draft };
}
