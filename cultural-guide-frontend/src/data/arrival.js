// shortcut: contenuti statici nel frontend, come data/transport.js; spostarli dietro un endpoint
// quando UNICAM / FHNW o gli studenti dovranno aggiornarli senza toccare il codice.
//
// Fonti: interview Sprint 1 (studenti e ex ESN Camerino) e Sprint 2 (International Office FHNW e HSLU),
// guide UNICAM / ERDIS, siti ufficiali linkati sotto. Le procedure legali restano generiche e rimandano
// sempre alla fonte ufficiale (requisito emerso dalle interview con gli International Office).

const LINKS = {
    visaIt: { label: "Visto per l'Italia", url: "https://vistoperitalia.esteri.it" },
    agenzia: { label: "Agenzia delle Entrate", url: "https://www.agenziaentrate.gov.it" },
    erdis: { label: "ERDIS Marche", url: "https://erdis.it" },
    unicamIntl: { label: "UNICAM International", url: "https://international.unicam.it" },
    immigrazione: { label: "Portale Immigrazione", url: "https://www.portaleimmigrazione.it" },
    sem: { label: "SEM", url: "https://www.sem.admin.ch" },
    fhnwHousing: { label: "FHNW Accommodation", url: "https://www.fhnw.ch/en/business/degree-programmes/international/accommodation" },
    fhnwInfo: { label: "FHNW Info Switzerland", url: "https://www.fhnw.ch/en/degree-programmes/international/incoming/info-switzerland" },
    olten: { label: "Stadt Olten", url: "https://www.olten.ch" },
    bag: { label: "BAG / FOPH", url: "https://www.bag.admin.ch" },
};

// Struttura comune a tutte le lingue: ordine, fase, prerequisiti, link. I testi stanno sotto, per lingua.
const CAMERINO_STEPS = [
    { id: "visa", phase: "before", needs: [], links: [LINKS.visaIt] },
    { id: "codice", phase: "before", needs: [], links: [LINKS.agenzia] },
    { id: "housing", phase: "before", needs: [], links: [LINKS.erdis, LINKS.unicamIntl] },
    { id: "health", phase: "before", needs: [], links: [] },
    { id: "enrol", phase: "first", needs: ["codice"], links: [LINKS.unicamIntl] },
    { id: "permit", phase: "first", needs: ["visa"], links: [LINKS.immigrazione] },
    { id: "bus", phase: "first", needs: ["codice", "enrol"], links: [], action: "transport" },
    { id: "canteen", phase: "first", needs: ["codice", "enrol"], links: [LINKS.erdis] },
    { id: "sports", phase: "later", needs: [], links: [] },
];

const CAMERINO_TEXT = {
    it: {
        steps: {
            visa: { title: "Visto di studio (solo fuori UE)", text: "Se non sei cittadino UE o Schengen ti serve un visto per studio (tipo D) dall'ambasciata o dal consolato italiano. Inizia presto: un visto in ritardo può farti perdere la scadenza per ritirare le chiavi dell'alloggio." },
            codice: { title: "Codice fiscale", text: "Quasi tutto dipende da questo codice: iscrizione, abbonamento bus gratuito, mensa. Puoi chiederlo al consolato italiano prima di partire o a un ufficio dell'Agenzia delle Entrate. Chiedi all'International Office UNICAM se possono aiutarti.", bring: ["Passaporto o carta d'identità"] },
            housing: { title: "Alloggio e ritiro chiavi", text: "Residenze e mensa sono gestite da ERDIS Marche. Chiedi in anticipo quando e dove ritirare le chiavi e se serve un certificato medico: alcuni studenti lo hanno dovuto presentare per la residenza." },
            health: { title: "Copertura sanitaria", text: "Studenti UE e svizzeri: porta la tessera europea di assicurazione malattia (TEAM / EHIC). Gli altri chiedano all'International Office se serve un'assicurazione privata o l'iscrizione al Servizio sanitario nazionale." },
            enrol: { title: "Iscrizione e numero di matricola", text: "Completa l'iscrizione con l'International Office o la segreteria studenti. Ricevi la matricola e il certificato di iscrizione, che serve per l'abbonamento bus.", bring: ["Codice fiscale", "Passaporto o carta d'identità", "Lettera di accettazione"] },
            permit: { title: "Permesso di soggiorno (fuori UE, oltre 90 giorni)", text: "Entro 8 giorni lavorativi dall'arrivo richiedi il permesso di soggiorno con il kit disponibile negli uffici postali abilitati (Sportello Amico). Conserva la ricevuta: dimostra che hai fatto domanda." },
            bus: { title: "Abbonamento bus gratuito", text: "Con codice fiscale e certificato di iscrizione attivi la tessera UNICAMMOBILITÀ alla biglietteria Contram. Tutti i passi sono nella guida ai trasporti." },
            canteen: { title: "Accesso alla mensa", text: "La mensa centrale ERDIS è a Colle Paradiso. Per le tariffe studenti servono codice fiscale e iscrizione. Nei festivi gli orari cambiano: controllali prima di andare." },
            sports: { title: "Centro sportivo", text: "Per iscriverti serve un certificato medico sportivo (non agonistico). Gli studenti l'hanno scoperto solo arrivati: procuratelo con calma." },
        },
        tips: [
            "Gli uffici chiudono per alcune settimane ad agosto: non lasciare nulla all'ultimo momento.",
            "Le richieste online possono restare senza risposta a lungo: quando puoi, vai di persona.",
            "Alcuni uffici rispondono solo in italiano: tieni pronta un'app di traduzione.",
        ],
    },
    en: {
        steps: {
            visa: { title: "Study visa (non-EU only)", text: "If you are not an EU or Schengen citizen you need a study visa (type D) from the Italian embassy or consulate. Start early: a late visa can make you miss the deadline to collect your room keys." },
            codice: { title: "Tax code (codice fiscale)", text: "Almost everything depends on it: enrolment, the free bus pass, the canteen. You can request it from the Italian consulate before you leave or at an Agenzia delle Entrate office. Ask the UNICAM International Office whether they can help.", bring: ["Passport or ID card"] },
            housing: { title: "Housing and key collection", text: "Residences and the canteen are run by ERDIS Marche. Ask in advance when and where to collect the keys and whether a medical certificate is needed: some students had to show one for the residence." },
            health: { title: "Health cover", text: "EU and Swiss students: bring your European Health Insurance Card (EHIC). Everyone else should ask the International Office whether you need private insurance or registration with the Italian health service (SSN)." },
            enrol: { title: "Enrolment and student number", text: "Complete your enrolment with the International Office or the student office. You get your student number (matricola) and the enrolment certificate you need for the bus pass.", bring: ["Tax code", "Passport or ID card", "Acceptance letter"] },
            permit: { title: "Residence permit (non-EU, over 90 days)", text: "Within 8 working days of arrival, apply for the residence permit (permesso di soggiorno) with the kit from an authorised post office (Sportello Amico). Keep the receipt: it proves you applied." },
            bus: { title: "Free bus pass", text: "With your tax code and enrolment certificate you activate the UNICAMMOBILITÀ card at the Contram ticket office. All the steps are in the transport guide." },
            canteen: { title: "Canteen access", text: "The main ERDIS canteen is at Colle Paradiso. Student prices need your tax code and enrolment. Opening hours change on public holidays: check before you go." },
            sports: { title: "Sports centre", text: "To join you need a sports medical certificate (certificato medico sportivo non agonistico). Students found out only after arriving: get it without rushing." },
        },
        tips: [
            "Offices close for a few weeks in August: do not leave anything to the last minute.",
            "Online requests can stay unanswered for a long time: go in person when you can.",
            "Some offices answer only in Italian: keep a translation app ready.",
        ],
    },
    de: {
        steps: {
            visa: { title: "Studienvisum (nur Nicht-EU)", text: "Wenn du nicht aus der EU oder dem Schengen-Raum kommst, brauchst du ein Studienvisum (Typ D) von der italienischen Botschaft oder dem Konsulat. Fang früh an: Ein verspätetes Visum kann dazu führen, dass du die Frist für die Schlüsselübergabe verpasst." },
            codice: { title: "Steuernummer (codice fiscale)", text: "Fast alles hängt davon ab: Einschreibung, Gratis-Busabo, Mensa. Du kannst sie vor der Abreise beim italienischen Konsulat oder bei einem Büro der Agenzia delle Entrate beantragen. Frag das UNICAM International Office, ob es dir helfen kann.", bring: ["Pass oder Identitätskarte"] },
            housing: { title: "Wohnen und Schlüsselübergabe", text: "Wohnheime und Mensa betreibt ERDIS Marche. Frag vorher, wann und wo du die Schlüssel abholst und ob ein Arztzeugnis nötig ist: Einige Studierende mussten eines für das Wohnheim vorlegen." },
            health: { title: "Krankenversicherung", text: "Studierende aus der EU und der Schweiz: Nimm die Europäische Krankenversicherungskarte (EHIC) mit. Alle anderen fragen das International Office, ob sie eine private Versicherung oder die Anmeldung beim italienischen Gesundheitsdienst (SSN) brauchen." },
            enrol: { title: "Einschreibung und Matrikelnummer", text: "Schliess die Einschreibung beim International Office oder im Studierendensekretariat ab. Du erhältst die Matrikelnummer (matricola) und die Immatrikulationsbestätigung, die du für das Busabo brauchst.", bring: ["Steuernummer", "Pass oder Identitätskarte", "Zulassungsschreiben"] },
            permit: { title: "Aufenthaltsbewilligung (Nicht-EU, über 90 Tage)", text: "Beantrage innerhalb von 8 Arbeitstagen nach der Ankunft die Aufenthaltsbewilligung (permesso di soggiorno) mit dem Formularset aus einer berechtigten Poststelle (Sportello Amico). Bewahre die Quittung auf: Sie beweist, dass du den Antrag gestellt hast." },
            bus: { title: "Gratis-Busabo", text: "Mit Steuernummer und Immatrikulationsbestätigung aktivierst du die UNICAMMOBILITÀ-Karte am Contram-Schalter. Alle Schritte stehen im Verkehrs-Guide." },
            canteen: { title: "Zugang zur Mensa", text: "Die ERDIS-Hauptmensa ist in Colle Paradiso. Für Studierendenpreise brauchst du Steuernummer und Einschreibung. An Feiertagen ändern sich die Öffnungszeiten: prüfe sie vorher." },
            sports: { title: "Sportzentrum", text: "Für die Anmeldung brauchst du ein sportärztliches Zeugnis (certificato medico sportivo non agonistico). Studierende haben das erst vor Ort erfahren: besorg es dir in Ruhe." },
        },
        tips: [
            "Im August schliessen die Büros für einige Wochen: lass nichts auf den letzten Moment.",
            "Online-Anfragen bleiben oft lange unbeantwortet: geh wenn möglich persönlich hin.",
            "Manche Büros antworten nur auf Italienisch: halte eine Übersetzungs-App bereit.",
        ],
    },
};

const OLTEN_STEPS = [
    { id: "visa", phase: "before", needs: [], links: [LINKS.sem] },
    { id: "housing", phase: "before", needs: [], links: [LINKS.fhnwHousing] },
    { id: "register", phase: "first", needs: [], links: [LINKS.olten, LINKS.fhnwInfo] },
    { id: "insurance", phase: "first", needs: ["register"], links: [LINKS.bag] },
    { id: "transport", phase: "first", needs: [], links: [], action: "transport" },
];

const OLTEN_TEXT = {
    it: {
        steps: {
            visa: { title: "Visto (solo fuori UE/AELS)", text: "Se non sei cittadino UE o AELS controlla sul sito della Segreteria di Stato della migrazione se ti serve un visto e richiedilo per tempo." },
            housing: { title: "Cerca casa presto", text: "Trovare casa in Svizzera è difficile e caro. L'Accommodation Office della FHNW aiuta gli studenti in scambio e a Olten ci sono poche stanze a prezzi accessibili: chiedi subito." },
            register: { title: "Registrati in comune entro 14 giorni", text: "Annunciati all'ufficio controllo abitanti (Einwohnerkontrolle) del comune dove vivi entro 14 giorni dall'arrivo. Riceverai il permesso di soggiorno." },
            insurance: { title: "Assicurazione malattia", text: "In Svizzera è obbligatoria entro 3 mesi dall'arrivo. Gli studenti UE con tessera europea (EHIC) possono chiedere l'esonero al cantone." },
            transport: { title: "Treni e bus", text: "Trasporti e account della scuola vengono spiegati solo nella prima settimana: guarda prima la guida ai trasporti." },
        },
        tips: ["Alla FHNW non c'è una settimana di introduzione: molte informazioni pratiche arrivano solo dopo l'inizio."],
    },
    en: {
        steps: {
            visa: { title: "Visa (non-EU/EFTA only)", text: "If you are not an EU or EFTA citizen, check on the State Secretariat for Migration website whether you need a visa and apply in good time." },
            housing: { title: "Look for housing early", text: "Housing in Switzerland is hard to find and expensive. The FHNW Accommodation Office helps exchange students, and Olten has only a few affordable rooms: ask right away." },
            register: { title: "Register with the municipality within 14 days", text: "Register at the residents' office (Einwohnerkontrolle) of the town where you live within 14 days of arrival. You will receive your residence permit." },
            insurance: { title: "Health insurance", text: "It is compulsory in Switzerland within 3 months of arrival. EU students with a European Health Insurance Card (EHIC) can ask the canton for an exemption." },
            transport: { title: "Trains and buses", text: "Transport and school accounts are explained only in the first week: read the transport guide first." },
        },
        tips: ["FHNW has no introduction week: a lot of practical information arrives only after the start."],
    },
    de: {
        steps: {
            visa: { title: "Visum (nur Nicht-EU/EFTA)", text: "Wenn du nicht aus der EU oder EFTA kommst, prüfe auf der Website des Staatssekretariats für Migration, ob du ein Visum brauchst, und beantrage es rechtzeitig." },
            housing: { title: "Früh eine Wohnung suchen", text: "Wohnen in der Schweiz ist schwierig und teuer. Das Accommodation Office der FHNW hilft Austauschstudierenden, und in Olten gibt es nur wenige günstige Zimmer: frag sofort." },
            register: { title: "Innerhalb von 14 Tagen anmelden", text: "Melde dich innerhalb von 14 Tagen nach der Ankunft bei der Einwohnerkontrolle deines Wohnorts an. Du erhältst deine Aufenthaltsbewilligung." },
            insurance: { title: "Krankenversicherung", text: "In der Schweiz ist sie innerhalb von 3 Monaten nach der Ankunft obligatorisch. EU-Studierende mit Europäischer Krankenversicherungskarte (EHIC) können beim Kanton eine Befreiung beantragen." },
            transport: { title: "Züge und Busse", text: "Verkehr und Schul-Accounts werden erst in der ersten Woche erklärt: lies zuerst den Verkehrs-Guide." },
        },
        tips: ["An der FHNW gibt es keine Einführungswoche: Viele praktische Infos kommen erst nach dem Start."],
    },
};

const GUIDES = {
    camerino: { steps: CAMERINO_STEPS, text: CAMERINO_TEXT, verified: "2026-11", validated: false, draft: false },
    olten: { steps: OLTEN_STEPS, text: OLTEN_TEXT, verified: "2026-11", validated: false, draft: true },
};

// Restituisce la checklist per città e lingua, oppure null se la città non è coperta.
export function getArrivalGuide(city, lang) {
    const guide = GUIDES[(city || "").trim().toLowerCase()];
    if (!guide) return null;
    const text = guide.text[(lang || "it").slice(0, 2)] || guide.text.it;
    return {
        steps: guide.steps.map((s) => ({ ...s, ...text.steps[s.id] })),
        tips: text.tips,
        verified: guide.verified,
        validated: guide.validated,
        draft: guide.draft,
    };
}

// shortcut: avanzamento salvato solo nel browser; spostarlo nel profilo utente sul backend se serve tra dispositivi.
const key = (city) => `arrival_done_${(city || "").trim().toLowerCase()}`;

export function loadDone(city) {
    try {
        return JSON.parse(localStorage.getItem(key(city))) || [];
    } catch {
        return [];
    }
}

export function saveDone(city, ids) {
    try {
        localStorage.setItem(key(city), JSON.stringify(ids));
    } catch {
        // storage bloccato (navigazione privata): la checklist funziona lo stesso per questa visita
    }
}
