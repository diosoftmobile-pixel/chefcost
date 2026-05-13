// Server-rendered research form, 4 languages.
// Mirrors the visual style of the SSR tool pages.

const T = {
  en: {
    metaTitle: 'Help Us Build a Better Tool for Chefs — 6 Months Free App4Chef',
    metaDesc: 'Answer 25 short questions about how you cost recipes and quote events. In return: 6 months of App4Chef completely free. 8 minutes.',
    h1: 'Help us build the chef\'s tool you actually want.',
    subtitle: 'Answer 25 short questions about how you cost recipes and price events. We\'ll send you <strong>6 months of App4Chef completely free</strong> — and your answers will shape what we build next.',
    timeNote: '⏱ Takes 8–10 minutes · 🇪🇺 GDPR-compliant · 🎁 6 months free access in your inbox',
    requiredHint: '* required',
    s1: 'About you',
    name: 'Your name',
    email: 'Email address *',
    emailHint: 'Where we\'ll send your free access code.',
    role: 'Your role *',
    roleOpts: ['Chef-owner', 'Head chef', 'Sous chef / line chef', 'Private chef', 'Catering manager', 'F&B director', 'Owner / non-chef', 'Other'],
    business: 'Type of business *',
    businessOpts: ['Restaurant', 'Catering company', 'Private chef / personal chef', 'Hotel F&B', 'School / institutional catering', 'Cloud / ghost kitchen', 'Food truck', 'Bakery / pastry', 'Other'],
    country: 'Country',
    city: 'City',

    s2: 'Your operation',
    teamSize: 'Team size',
    teamOpts: ['Just me', '2–5 people', '6–15 people', '16–50 people', '50+ people'],
    eventsPerWeek: 'Events or covers per week (roughly)',
    eventsHint: 'e.g. "2 events of 80 guests", or "300 covers/week", or "1–2 weddings/month"',
    avgTicket: 'Average per-guest / per-cover price',
    ticketOpts: ['Under €20', '€20–40', '€40–80', '€80–150', '€150–300', 'Over €300'],
    yearsExp: 'Years in the business',
    expOpts: ['Less than 1 year', '1–3 years', '4–10 years', '11–20 years', '20+ years'],

    s3: 'How you work today',
    s3hint: 'These open answers are the most useful — please write a few sentences. Your exact words help us understand the problem.',
    recipeCosting: 'How do you currently calculate the cost of a recipe? *',
    recipeCostingPh: 'e.g. "I use an Excel sheet, multiply each ingredient by its supplier price, add up the total then divide by portions…"',
    quoteBuilding: 'How do you build a quote for a client event? *',
    quoteBuildingPh: 'e.g. "I send a Word document with a menu, calculate food cost in my head and add 30% margin, then add €500 for staff and transport…"',
    toolsUsed: 'What tools do you use today? (tick all)',
    toolsOpts: ['Excel / Google Sheets', 'Pen and paper', 'A POS system', 'A dedicated catering app', 'Nothing — I do it from memory', 'Other'],
    hoursPerWeek: 'Hours per week spent on costing and quoting',
    hoursOpts: ['Less than 1 hour', '1–3 hours', '4–8 hours', '9–15 hours', 'More than 15 hours'],
    confidence: 'On a scale 1–10, how confident are you that your prices actually make profit? *',
    confidenceHint: '1 = "I have no idea" · 10 = "I know to the cent"',

    s4: 'The real pain',
    s4hint: 'This section matters most. Write honestly — even one sentence helps.',
    biggestFrustration: 'What\'s the single most frustrating part of food cost and event quoting for you? *',
    biggestFrustrationPh: 'e.g. "Recalculating everything when an ingredient price changes"',
    lastMistake: 'Tell us about the last time you got the cost wrong on an event. What happened?',
    lastMistakePh: 'e.g. "Underestimated the lamb cost — lost €600 on a 40-guest wedding"',
    magicWand: 'If you had a magic wand, what one thing would you change about how you manage costs?',
    magicWandPh: 'e.g. "I want to update one ingredient and have every recipe, menu and quote update automatically"',
    whatsStopping: 'What\'s stopping you from solving this today?',
    whatsStoppingPh: 'e.g. "Too busy", "Existing tools are too complex", "Don\'t know what\'s out there"…',

    s5: 'Buying intent',
    triedSoftware: 'Have you tried catering or food-cost software before? Which one(s)?',
    triedSoftwarePh: 'e.g. "Tried Foodics last year, gave up after 2 weeks"',
    stoppedReason: 'Why did you stop using it (if you did)?',
    stoppedReasonPh: 'e.g. "Too expensive", "Too complicated", "Didn\'t solve my problem"',
    mustHave: 'What would a tool need to do for you to pay €50/month for it?',
    mustHavePh: 'Be specific — one feature, one outcome.',
    budget: 'Your monthly budget for back-office software',
    budgetOpts: ['€0 — I won\'t pay for software', '€1–30', '€30–80', '€80–200', 'More than €200'],
    decisionMaker: 'Who decides on software in your business?',
    decisionOpts: ['Me alone', 'Me + business partner', 'Owner / manager', 'Accountant', 'Other'],

    s6: 'Stay in touch',
    allowFollowup: 'Can we follow up with one quick question if your answer is interesting? (we won\'t spam — promise)',
    followupYes: 'Yes, you can email or message me',
    followupNo: 'No, please don\'t',
    betaTester: 'Would you like to be a beta tester for App4Chef?',
    betaYes: 'Yes — I want early access',
    betaMaybe: 'Maybe — tell me more first',
    betaNo: 'No thanks',

    submit: 'Send my answers & get my 6 months free →',
    submitting: 'Sending…',
    privacyNote: 'Your data stays with App4Chef. Used only to improve the product and to send you your free access code. GDPR-compliant. No third-party sharing.',

    thanksTitle: 'Thank you!',
    thanksBody: 'Your answers are saved. We\'ve sent your <strong>6-month free access code</strong> to your email — check your inbox in the next few minutes.',
    thanksCta: 'Explore App4Chef\'s free tools while you wait',
    backHome: 'Back to App4Chef',

    errorTitle: 'Something went wrong',
    errorBody: 'We couldn\'t save your response. Please try again, or email us at hello@app4chef.com.',
    errorRetry: 'Try again',
  },
  fr: {
    metaTitle: 'Aidez-nous à construire un meilleur outil pour chefs — 6 mois gratuits App4Chef',
    metaDesc: 'Répondez à 25 questions courtes sur le coût de vos recettes et le devis d\'événements. En retour : 6 mois d\'App4Chef gratuits. 8 minutes.',
    h1: 'Aidez-nous à construire l\'outil chef que vous voulez vraiment.',
    subtitle: 'Répondez à 25 questions courtes sur la façon dont vous calculez le coût de vos recettes et établissez vos devis. Vous recevrez <strong>6 mois d\'App4Chef totalement gratuits</strong> — et vos réponses orienteront ce que nous construisons ensuite.',
    timeNote: '⏱ 8–10 minutes · 🇪🇺 RGPD · 🎁 6 mois gratuits dans votre boîte mail',
    requiredHint: '* obligatoire',
    s1: 'À propos de vous',
    name: 'Votre nom',
    email: 'Adresse e-mail *',
    emailHint: 'Où nous vous enverrons votre code d\'accès gratuit.',
    role: 'Votre rôle *',
    roleOpts: ['Chef-propriétaire', 'Chef de cuisine', 'Sous-chef / chef de partie', 'Chef privé', 'Responsable traiteur', 'Directeur F&B', 'Propriétaire / non-chef', 'Autre'],
    business: 'Type d\'activité *',
    businessOpts: ['Restaurant', 'Société de traiteur', 'Chef privé / chef personnel', 'F&B hôtelier', 'Cantine scolaire / institutionnelle', 'Dark / ghost kitchen', 'Food truck', 'Boulangerie / pâtisserie', 'Autre'],
    country: 'Pays',
    city: 'Ville',

    s2: 'Votre activité',
    teamSize: 'Taille de l\'équipe',
    teamOpts: ['Juste moi', '2–5 personnes', '6–15 personnes', '16–50 personnes', '50+ personnes'],
    eventsPerWeek: 'Événements ou couverts par semaine (en gros)',
    eventsHint: 'ex : « 2 événements de 80 invités », « 300 couverts/semaine », « 1–2 mariages/mois »',
    avgTicket: 'Prix moyen par invité / couvert',
    ticketOpts: ['Moins de 20 €', '20–40 €', '40–80 €', '80–150 €', '150–300 €', 'Plus de 300 €'],
    yearsExp: 'Années d\'expérience',
    expOpts: ['Moins d\'1 an', '1–3 ans', '4–10 ans', '11–20 ans', '20+ ans'],

    s3: 'Comment vous travaillez aujourd\'hui',
    s3hint: 'Ces réponses libres sont les plus utiles — écrivez quelques phrases s\'il vous plaît. Vos mots exacts nous aident à comprendre le problème.',
    recipeCosting: 'Comment calculez-vous actuellement le coût d\'une recette ? *',
    recipeCostingPh: 'ex : « J\'utilise un fichier Excel, je multiplie chaque ingrédient par son prix fournisseur, j\'additionne, je divise par les portions… »',
    quoteBuilding: 'Comment construisez-vous un devis pour un événement client ? *',
    quoteBuildingPh: 'ex : « J\'envoie un Word avec un menu, je calcule le coût matière de tête, j\'ajoute 30 % de marge, puis 500 € pour le personnel et le transport… »',
    toolsUsed: 'Quels outils utilisez-vous aujourd\'hui ? (cochez tout ce qui s\'applique)',
    toolsOpts: ['Excel / Google Sheets', 'Papier et stylo', 'Un système de caisse (POS)', 'Une appli de traiteur dédiée', 'Rien — je le fais de mémoire', 'Autre'],
    hoursPerWeek: 'Heures par semaine consacrées au coût et aux devis',
    hoursOpts: ['Moins d\'1 heure', '1–3 heures', '4–8 heures', '9–15 heures', 'Plus de 15 heures'],
    confidence: 'Sur une échelle de 1 à 10, à quel point êtes-vous sûr que vos prix sont rentables ? *',
    confidenceHint: '1 = « aucune idée » · 10 = « au centime près »',

    s4: 'Le vrai problème',
    s4hint: 'Cette section est la plus importante. Soyez honnête — même une phrase aide.',
    biggestFrustration: 'Qu\'est-ce qui vous frustre le plus dans le calcul des coûts et la création de devis ? *',
    biggestFrustrationPh: 'ex : « Tout recalculer quand un prix fournisseur change »',
    lastMistake: 'Parlez-nous de la dernière fois où vous vous êtes trompé sur le coût d\'un événement. Que s\'est-il passé ?',
    lastMistakePh: 'ex : « Sous-estimé le coût de l\'agneau — 600 € perdus sur un mariage de 40 invités »',
    magicWand: 'Si vous aviez une baguette magique, qu\'est-ce que vous changeriez dans la gestion de vos coûts ?',
    magicWandPh: 'ex : « Je voudrais modifier un ingrédient et que toutes mes recettes, menus et devis se mettent à jour automatiquement »',
    whatsStopping: 'Qu\'est-ce qui vous empêche de résoudre ça aujourd\'hui ?',
    whatsStoppingPh: 'ex : « Trop occupé », « Les outils existants sont trop compliqués », « Je ne sais pas ce qui existe »…',

    s5: 'Intention d\'achat',
    triedSoftware: 'Avez-vous déjà essayé un logiciel de traiteur / coût matière ? Lequel ?',
    triedSoftwarePh: 'ex : « Essayé Foodics l\'an dernier, abandonné après 2 semaines »',
    stoppedReason: 'Pourquoi avez-vous arrêté de l\'utiliser ?',
    stoppedReasonPh: 'ex : « Trop cher », « Trop compliqué », « Ne résolvait pas mon problème »',
    mustHave: 'Quelle fonctionnalité un outil devrait-il avoir pour que vous payiez 50 €/mois ?',
    mustHavePh: 'Soyez spécifique — une fonctionnalité, un résultat.',
    budget: 'Votre budget mensuel pour les logiciels de back-office',
    budgetOpts: ['0 € — je ne paie pas pour des logiciels', '1–30 €', '30–80 €', '80–200 €', 'Plus de 200 €'],
    decisionMaker: 'Qui décide des logiciels dans votre entreprise ?',
    decisionOpts: ['Moi seul', 'Moi + associé', 'Propriétaire / manager', 'Comptable', 'Autre'],

    s6: 'Restons en contact',
    allowFollowup: 'Pouvons-nous vous recontacter pour une question rapide si votre réponse est intéressante ? (pas de spam — promis)',
    followupYes: 'Oui, vous pouvez m\'écrire',
    followupNo: 'Non merci',
    betaTester: 'Souhaitez-vous être bêta-testeur App4Chef ?',
    betaYes: 'Oui — je veux un accès anticipé',
    betaMaybe: 'Peut-être — donnez-moi plus d\'infos',
    betaNo: 'Non merci',

    submit: 'Envoyer mes réponses & obtenir mes 6 mois gratuits →',
    submitting: 'Envoi en cours…',
    privacyNote: 'Vos données restent avec App4Chef. Utilisées uniquement pour améliorer le produit et vous envoyer votre code d\'accès. RGPD-conforme. Aucun partage avec des tiers.',

    thanksTitle: 'Merci !',
    thanksBody: 'Vos réponses sont enregistrées. Nous avons envoyé votre <strong>code d\'accès gratuit de 6 mois</strong> par email — vérifiez votre boîte de réception dans les minutes qui viennent.',
    thanksCta: 'Explorez les outils gratuits App4Chef en attendant',
    backHome: 'Retour à App4Chef',

    errorTitle: 'Une erreur s\'est produite',
    errorBody: 'Nous n\'avons pas pu enregistrer votre réponse. Veuillez réessayer, ou écrivez-nous à hello@app4chef.com.',
    errorRetry: 'Réessayer',
  },
  ro: {
    metaTitle: 'Ajutați-ne să construim un instrument mai bun pentru bucătari — 6 luni gratuite App4Chef',
    metaDesc: 'Răspundeți la 25 de întrebări scurte despre cum calculați costurile rețetelor și ofertelor de evenimente. În schimb: 6 luni de App4Chef gratuit. 8 minute.',
    h1: 'Ajutați-ne să construim instrumentul de bucătar pe care îl doriți cu adevărat.',
    subtitle: 'Răspundeți la 25 de întrebări scurte despre cum calculați costurile rețetelor și ofertelor. Veți primi <strong>6 luni de App4Chef complet gratuit</strong> — iar răspunsurile dumneavoastră vor modela ce construim în continuare.',
    timeNote: '⏱ 8–10 minute · 🇪🇺 GDPR · 🎁 6 luni gratuite în inbox',
    requiredHint: '* obligatoriu',
    s1: 'Despre dumneavoastră',
    name: 'Numele dumneavoastră',
    email: 'Adresa de email *',
    emailHint: 'Unde vom trimite codul de acces gratuit.',
    role: 'Rolul dumneavoastră *',
    roleOpts: ['Chef-proprietar', 'Chef principal', 'Sous-chef / chef de partidă', 'Chef privat', 'Manager catering', 'Director F&B', 'Proprietar / non-chef', 'Altul'],
    business: 'Tipul afacerii *',
    businessOpts: ['Restaurant', 'Companie de catering', 'Chef privat / personal', 'F&B hotelier', 'Catering școlar / instituțional', 'Cloud / ghost kitchen', 'Food truck', 'Brutărie / patiserie', 'Altul'],
    country: 'Țara',
    city: 'Oraș',

    s2: 'Activitatea dumneavoastră',
    teamSize: 'Dimensiunea echipei',
    teamOpts: ['Doar eu', '2–5 persoane', '6–15 persoane', '16–50 persoane', '50+ persoane'],
    eventsPerWeek: 'Evenimente sau acoperiri pe săptămână (aproximativ)',
    eventsHint: 'ex: „2 evenimente de 80 de invitați", „300 acoperiri/săptămână", „1–2 nunți/lună"',
    avgTicket: 'Preț mediu per invitat / acoperire',
    ticketOpts: ['Sub 20 €', '20–40 €', '40–80 €', '80–150 €', '150–300 €', 'Peste 300 €'],
    yearsExp: 'Ani de experiență',
    expOpts: ['Mai puțin de 1 an', '1–3 ani', '4–10 ani', '11–20 ani', '20+ ani'],

    s3: 'Cum lucrați astăzi',
    s3hint: 'Aceste răspunsuri deschise sunt cele mai utile — vă rugăm să scrieți câteva propoziții. Cuvintele dumneavoastră exacte ne ajută să înțelegem problema.',
    recipeCosting: 'Cum calculați în prezent costul unei rețete? *',
    recipeCostingPh: 'ex: „Folosesc un Excel, înmulțesc fiecare ingredient cu prețul furnizorului, adun totalul și împart la porții…"',
    quoteBuilding: 'Cum construiți o ofertă pentru un eveniment? *',
    quoteBuildingPh: 'ex: „Trimit un document Word cu un meniu, calculez costul materiilor prime din cap, adaug 30% marjă, apoi 500 € pentru personal și transport…"',
    toolsUsed: 'Ce instrumente folosiți astăzi? (bifați tot)',
    toolsOpts: ['Excel / Google Sheets', 'Pix și hârtie', 'Un sistem POS', 'O aplicație dedicată de catering', 'Nimic — fac totul din memorie', 'Altul'],
    hoursPerWeek: 'Ore pe săptămână pentru calcul costuri și oferte',
    hoursOpts: ['Mai puțin de 1 oră', '1–3 ore', '4–8 ore', '9–15 ore', 'Peste 15 ore'],
    confidence: 'Pe o scară de la 1 la 10, cât de sigur sunteți că prețurile dumneavoastră aduc profit? *',
    confidenceHint: '1 = „habar n-am" · 10 = „știu la bănuț"',

    s4: 'Problema reală',
    s4hint: 'Această secțiune este cea mai importantă. Scrieți sincer — chiar și o propoziție ajută.',
    biggestFrustration: 'Care este cea mai frustrantă parte a calculului costurilor și ofertării evenimentelor pentru dumneavoastră? *',
    biggestFrustrationPh: 'ex: „Recalcularea totului când se schimbă prețul unui ingredient"',
    lastMistake: 'Povestiți-ne despre ultima dată când ați greșit costul unui eveniment. Ce s-a întâmplat?',
    lastMistakePh: 'ex: „Am subestimat costul mielului — am pierdut 600 € la o nuntă de 40 de invitați"',
    magicWand: 'Dacă ați avea o baghetă magică, ce ați schimba în gestionarea costurilor?',
    magicWandPh: 'ex: „Vreau să actualizez un ingredient și toate rețetele, meniurile și ofertele să se actualizeze automat"',
    whatsStopping: 'Ce vă oprește să rezolvați asta astăzi?',
    whatsStoppingPh: 'ex: „Prea ocupat", „Instrumentele existente sunt prea complicate", „Nu știu ce există"…',

    s5: 'Intenție de cumpărare',
    triedSoftware: 'Ați încercat vreun software de catering / cost alimentar? Care?',
    triedSoftwarePh: 'ex: „Am încercat Foodics anul trecut, am renunțat după 2 săptămâni"',
    stoppedReason: 'De ce ați renunțat (dacă ați făcut-o)?',
    stoppedReasonPh: 'ex: „Prea scump", „Prea complicat", „Nu rezolva problema mea"',
    mustHave: 'Ce ar trebui să facă un instrument pentru ca să plătiți 50 €/lună pe el?',
    mustHavePh: 'Fiți specific — o funcționalitate, un rezultat.',
    budget: 'Bugetul lunar pentru software de back-office',
    budgetOpts: ['0 € — nu plătesc pentru software', '1–30 €', '30–80 €', '80–200 €', 'Peste 200 €'],
    decisionMaker: 'Cine decide software-ul în afacerea dumneavoastră?',
    decisionOpts: ['Doar eu', 'Eu + partener', 'Proprietar / manager', 'Contabil', 'Altul'],

    s6: 'Să rămânem în contact',
    allowFollowup: 'Vă putem contacta cu o întrebare rapidă dacă răspunsul este interesant? (fără spam — promitem)',
    followupYes: 'Da, mă puteți scrie',
    followupNo: 'Nu, mulțumesc',
    betaTester: 'Doriți să fiți beta-tester App4Chef?',
    betaYes: 'Da — vreau acces anticipat',
    betaMaybe: 'Poate — mai întâi spuneți-mi detalii',
    betaNo: 'Nu, mulțumesc',

    submit: 'Trimite răspunsurile & obține 6 luni gratuite →',
    submitting: 'Se trimite…',
    privacyNote: 'Datele dumneavoastră rămân la App4Chef. Folosite doar pentru îmbunătățirea produsului și trimiterea codului de acces. Conform GDPR. Nu împărtășim cu terți.',

    thanksTitle: 'Mulțumim!',
    thanksBody: 'Răspunsurile sunt salvate. Am trimis <strong>codul de acces gratuit pentru 6 luni</strong> pe email — verificați inbox-ul în următoarele câteva minute.',
    thanksCta: 'Explorați instrumentele gratuite App4Chef în timp ce așteptați',
    backHome: 'Înapoi la App4Chef',

    errorTitle: 'Ceva nu a mers',
    errorBody: 'Nu am putut salva răspunsul. Vă rugăm reîncercați sau scrieți-ne la hello@app4chef.com.',
    errorRetry: 'Reîncearcă',
  },
  hu: {
    metaTitle: 'Segítsen jobb eszközt építeni séfeknek — 6 hónap ingyenes App4Chef',
    metaDesc: 'Válaszoljon 25 rövid kérdésre arról, hogyan kalkulál receptárakat és eseményajánlatokat. Cserébe: 6 hónap App4Chef ingyen. 8 perc.',
    h1: 'Segítsen megépíteni a séf-eszközt, amit valóban szeretne.',
    subtitle: 'Válaszoljon 25 rövid kérdésre arról, hogyan kalkulál receptárakat és árazza az eseményeket. Cserébe <strong>6 hónap App4Chef teljesen ingyen</strong> — a válaszai pedig alakítják, mit építünk legközelebb.',
    timeNote: '⏱ 8–10 perc · 🇪🇺 GDPR · 🎁 6 hónap ingyen az inboxában',
    requiredHint: '* kötelező',
    s1: 'Önről',
    name: 'Az Ön neve',
    email: 'Email cím *',
    emailHint: 'Ide küldjük az ingyenes hozzáférési kódot.',
    role: 'Az Ön szerepe *',
    roleOpts: ['Séf-tulajdonos', 'Konyhafőnök', 'Séfhelyettes / vonalséf', 'Magán séf', 'Catering vezető', 'F&B igazgató', 'Tulajdonos / nem séf', 'Egyéb'],
    business: 'Üzletág típusa *',
    businessOpts: ['Étterem', 'Catering cég', 'Magán séf / személyes séf', 'Szállodai F&B', 'Iskolai / intézményi étkeztetés', 'Cloud / ghost kitchen', 'Foodtruck', 'Pékség / cukrászda', 'Egyéb'],
    country: 'Ország',
    city: 'Város',

    s2: 'Az Ön működése',
    teamSize: 'Csapat mérete',
    teamOpts: ['Csak én', '2–5 fő', '6–15 fő', '16–50 fő', '50+ fő'],
    eventsPerWeek: 'Események vagy fedezetek hetente (kb.)',
    eventsHint: 'pl. „2 esemény 80 vendéggel", „300 fedezet/hét", „1–2 esküvő/hónap"',
    avgTicket: 'Átlag vendég / fedezet ár',
    ticketOpts: ['20 € alatt', '20–40 €', '40–80 €', '80–150 €', '150–300 €', '300 € felett'],
    yearsExp: 'Évek a szakmában',
    expOpts: ['Kevesebb mint 1 év', '1–3 év', '4–10 év', '11–20 év', '20+ év'],

    s3: 'Hogyan dolgozik ma',
    s3hint: 'Ezek a nyitott válaszok a leghasznosabbak — kérjük írjon néhány mondatot. Az Ön pontos szavai segítenek megérteni a problémát.',
    recipeCosting: 'Hogyan számítja jelenleg egy recept költségét? *',
    recipeCostingPh: 'pl. „Excel táblát használok, beszorzom minden hozzávalót a beszállítói árral, összeadom és elosztom a porciókkal…"',
    quoteBuilding: 'Hogyan készít árajánlatot egy ügyfél eseményére? *',
    quoteBuildingPh: 'pl. „Egy Word dokumentumot küldök menüvel, fejben számolom az alapanyagköltséget és 30% haszonkulcsot adok, plusz 500 € személyzetre és szállításra…"',
    toolsUsed: 'Milyen eszközöket használ ma? (jelölje meg amit használ)',
    toolsOpts: ['Excel / Google Sheets', 'Toll és papír', 'POS rendszer', 'Dedikált catering alkalmazás', 'Semmit — fejből csinálom', 'Egyéb'],
    hoursPerWeek: 'Heti óra költségszámolásra és árazásra',
    hoursOpts: ['Kevesebb mint 1 óra', '1–3 óra', '4–8 óra', '9–15 óra', '15 óra felett'],
    confidence: '1-től 10-ig terjedő skálán mennyire biztos abban, hogy az árai valóban profitot termelnek? *',
    confidenceHint: '1 = „fogalmam sincs" · 10 = „centesre tudom"',

    s4: 'A valódi fájdalom',
    s4hint: 'Ez a szakasz a legfontosabb. Írjon őszintén — akár egy mondat is segít.',
    biggestFrustration: 'Mi a legfrusztrálóbb az alapanyagköltség és eseményajánlatok kalkulálásában? *',
    biggestFrustrationPh: 'pl. „Mindent újraszámolni, amikor egy alapanyag ára változik"',
    lastMistake: 'Meséljen az utolsó alkalomról, amikor rosszul számolta egy esemény költségét. Mi történt?',
    lastMistakePh: 'pl. „Alulbecsültem a bárány árát — 600 €-t veszítettem egy 40 fős esküvőn"',
    magicWand: 'Ha lenne egy varázspálcája, mit változtatna meg a költségkezelésben?',
    magicWandPh: 'pl. „Egy alapanyagot szeretnék frissíteni, és minden recept, menü és ajánlat automatikusan frissüljön"',
    whatsStopping: 'Mi akadályozza ebben ma?',
    whatsStoppingPh: 'pl. „Túl elfoglalt", „A meglévő eszközök túl bonyolultak", „Nem tudom mi van a piacon"…',

    s5: 'Vásárlási szándék',
    triedSoftware: 'Próbált már catering / alapanyagköltség szoftvert? Melyiket?',
    triedSoftwarePh: 'pl. „Tavaly próbáltam a Foodics-ot, 2 hét után feladtam"',
    stoppedReason: 'Miért hagyta abba (ha abbahagyta)?',
    stoppedReasonPh: 'pl. „Túl drága", „Túl bonyolult", „Nem oldotta meg a problémámat"',
    mustHave: 'Mit kellene tennie egy eszköznek ahhoz, hogy 50 €/hónapot fizessen érte?',
    mustHavePh: 'Legyen pontos — egy funkció, egy eredmény.',
    budget: 'Havi keret back-office szoftverekre',
    budgetOpts: ['0 € — nem fizetek szoftverért', '1–30 €', '30–80 €', '80–200 €', '200 € felett'],
    decisionMaker: 'Ki dönt a szoftverekről az Ön vállalkozásában?',
    decisionOpts: ['Csak én', 'Én + üzlettárs', 'Tulajdonos / menedzser', 'Könyvelő', 'Egyéb'],

    s6: 'Tartsuk a kapcsolatot',
    allowFollowup: 'Megkereshetjük egy gyors kérdéssel, ha a válasza érdekes? (nem spamelünk — ígérjük)',
    followupYes: 'Igen, írhatnak',
    followupNo: 'Nem, köszönöm',
    betaTester: 'Szeretne App4Chef béta-tesztelő lenni?',
    betaYes: 'Igen — szeretnék korai hozzáférést',
    betaMaybe: 'Talán — előbb mondjon többet',
    betaNo: 'Nem, köszönöm',

    submit: 'Válaszok elküldése & 6 hónap ingyen igénylése →',
    submitting: 'Küldés…',
    privacyNote: 'Az adatai az App4Chef-nél maradnak. Csak a termék javítására és a hozzáférési kód elküldésére használjuk. GDPR-megfelelő. Nem osztjuk meg harmadik féllel.',

    thanksTitle: 'Köszönjük!',
    thanksBody: 'A válaszai elmentve. Elküldtük a <strong>6 hónapos ingyenes hozzáférési kódot</strong> az emailjére — ellenőrizze az inboxát a következő néhány percben.',
    thanksCta: 'Fedezze fel az App4Chef ingyenes eszközeit, amíg vár',
    backHome: 'Vissza az App4Chef-hez',

    errorTitle: 'Hiba történt',
    errorBody: 'Nem tudtuk elmenteni a választ. Próbálja újra vagy írjon nekünk: hello@app4chef.com.',
    errorRetry: 'Újra',
  },
};

const ANALYTICS = `
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-V9JWPMLF45"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-V9JWPMLF45', { anonymize_ip: true });
  </script>
  <script type="text/javascript">
    (function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "wqmvajwdi7");
  </script>`;

const CSS = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{--bg:#F9F7F3;--surface:#fff;--dark:#1A1916;--accent:#D4A853;--accent-dark:#B8892E;--text:#2C2B28;--muted:#6B6860;--border:#E8E4DA;--radius:10px}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:var(--bg);color:var(--text);line-height:1.6;font-size:16px}
  .top-nav{background:var(--dark);padding:0 24px;height:56px;display:flex;align-items:center;justify-content:space-between}
  .nav-logo{display:flex;align-items:center;gap:10px;text-decoration:none;color:#fff;font-size:18px;font-weight:700}
  .nav-logo-mark{width:30px;height:30px;background:var(--accent);border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:800;color:var(--dark)}
  .lang-switcher{display:flex;gap:6px}
  .lang-switcher a{font-size:12px;color:rgba(255,255,255,0.5);text-decoration:none;padding:4px 9px;border-radius:5px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px}
  .lang-switcher a:hover{color:#fff;background:rgba(255,255,255,0.06)}
  .lang-switcher a.active{color:var(--accent);background:rgba(212,168,83,0.15)}
  .hero{max-width:720px;margin:0 auto;padding:48px 24px 24px;text-align:center}
  .hero-pill{display:inline-block;background:rgba(212,168,83,0.15);color:var(--accent-dark);font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:5px 12px;border-radius:4px;margin-bottom:16px}
  .hero h1{font-size:clamp(26px,4vw,38px);font-weight:800;color:var(--dark);line-height:1.2;margin-bottom:16px}
  .hero-sub{font-size:17px;color:var(--muted);max-width:600px;margin:0 auto 16px;line-height:1.7}
  .hero-sub strong{color:var(--accent-dark)}
  .hero-meta{font-size:13px;color:var(--muted);margin-top:20px}
  form.research{max-width:720px;margin:24px auto 48px;padding:0 24px}
  .section{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:28px;margin-bottom:20px}
  .section-num{display:inline-block;background:var(--dark);color:var(--accent);font-size:11px;font-weight:700;letter-spacing:1px;padding:4px 10px;border-radius:5px;margin-bottom:10px}
  .section h2{font-size:22px;font-weight:700;color:var(--dark);margin-bottom:6px}
  .section-hint{font-size:13.5px;color:var(--muted);margin-bottom:20px;font-style:italic}
  .field{margin-bottom:18px}
  .field label{display:block;font-size:14px;font-weight:600;color:var(--dark);margin-bottom:6px}
  .field-hint{font-size:12.5px;color:var(--muted);margin-bottom:6px;margin-top:-2px}
  .field input[type=text],.field input[type=email],.field select,.field textarea{width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:7px;font-size:14.5px;font-family:inherit;color:var(--dark);background:#fff;transition:border-color 0.15s}
  .field input:focus,.field select:focus,.field textarea:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 3px rgba(212,168,83,0.15)}
  .field textarea{min-height:90px;resize:vertical}
  .checks{display:flex;flex-direction:column;gap:8px}
  .check{display:flex;align-items:flex-start;gap:9px;font-size:14px;color:var(--text);cursor:pointer;padding:6px 0}
  .check input{margin-top:3px;flex-shrink:0}
  .radio-row{display:flex;flex-wrap:wrap;gap:10px}
  .radio-row label{display:flex;align-items:center;gap:6px;padding:8px 14px;border:1px solid var(--border);border-radius:6px;cursor:pointer;background:#fff;font-size:13.5px;font-weight:500;transition:all 0.15s}
  .radio-row label:hover{border-color:var(--accent)}
  .radio-row input{display:none}
  .radio-row input:checked + span{color:var(--accent-dark);font-weight:700}
  .radio-row label:has(input:checked){border-color:var(--accent);background:rgba(212,168,83,0.08)}
  .confidence-scale{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
  .confidence-scale label{flex:1;min-width:50px;text-align:center;padding:10px 4px;border:1px solid var(--border);border-radius:6px;cursor:pointer;background:#fff;font-size:14px;font-weight:700;transition:all 0.15s}
  .confidence-scale input{display:none}
  .confidence-scale label:has(input:checked){background:var(--accent);color:var(--dark);border-color:var(--accent)}
  .submit-row{margin-top:28px;text-align:center}
  .submit-btn{background:var(--accent);color:var(--dark);font-weight:700;font-size:16px;padding:14px 32px;border:none;border-radius:8px;cursor:pointer;width:100%;max-width:380px;transition:background 0.15s}
  .submit-btn:hover{background:var(--accent-dark)}
  .submit-btn:disabled{opacity:0.6;cursor:not-allowed}
  .privacy-note{font-size:12px;color:var(--muted);margin-top:14px;line-height:1.5}
  .err{background:#FEE2E2;color:#991B1B;padding:12px 16px;border-radius:8px;font-size:14px;margin-bottom:16px;display:none}
  .err.show{display:block}
  @media (max-width: 600px){.hero{padding:32px 16px 16px}form.research{padding:0 16px}.section{padding:20px}}`;

function escAttr(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function navHeader(lang) {
  const langs = ['en', 'fr', 'ro', 'hu'];
  const switcher = langs.map(l =>
    `<a href="${l === 'en' ? '/research' : '/research/' + l}" class="${l === lang ? 'active' : ''}">${l.toUpperCase()}</a>`
  ).join('');
  return `
    <nav class="top-nav">
      <a href="/" class="nav-logo"><div class="nav-logo-mark">4</div>App4Chef</a>
      <div class="lang-switcher">${switcher}</div>
    </nav>`;
}

function radioRow(name, options) {
  return `<div class="radio-row">${options.map((opt, i) =>
    `<label><input type="radio" name="${name}" value="${escAttr(opt)}"${i === 0 ? ' required' : ''}><span>${escAttr(opt)}</span></label>`
  ).join('')}</div>`;
}

function checkboxes(name, options) {
  return `<div class="checks">${options.map(opt =>
    `<label class="check"><input type="checkbox" name="${name}" value="${escAttr(opt)}"><span>${escAttr(opt)}</span></label>`
  ).join('')}</div>`;
}

function confidenceScale() {
  let html = '<div class="confidence-scale">';
  for (let i = 1; i <= 10; i++) {
    html += `<label><input type="radio" name="pricing_confidence" value="${i}" required>${i}</label>`;
  }
  html += '</div>';
  return html;
}

export function buildResearchForm(lang = 'en') {
  const t = T[lang] || T.en;
  const canonicalPath = lang === 'en' ? '/research' : `/research/${lang}`;

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escAttr(t.metaTitle)}</title>
  <meta name="description" content="${escAttr(t.metaDesc)}" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="https://app4chef.com${canonicalPath}" />
  <meta property="og:title" content="${escAttr(t.metaTitle)}" />
  <meta property="og:description" content="${escAttr(t.metaDesc)}" />
  <meta property="og:image" content="https://app4chef.com/og-image.svg" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  ${ANALYTICS}
  <style>${CSS}</style>
</head>
<body>
  ${navHeader(lang)}

  <header class="hero">
    <span class="hero-pill">🎁 6 months free · 8 minutes</span>
    <h1>${escAttr(t.h1)}</h1>
    <p class="hero-sub">${t.subtitle}</p>
    <p class="hero-meta">${t.timeNote}</p>
  </header>

  <form class="research" id="research-form" novalidate>
    <input type="hidden" name="language" value="${lang}" />
    <div class="err" id="form-err"></div>

    <div class="section">
      <span class="section-num">1 / 6</span>
      <h2>${escAttr(t.s1)}</h2>
      <p class="section-hint">${escAttr(t.requiredHint)}</p>
      <div class="field"><label>${escAttr(t.name)}</label><input type="text" name="name" /></div>
      <div class="field">
        <label>${escAttr(t.email)}</label>
        <input type="email" name="email" required />
        <div class="field-hint">${escAttr(t.emailHint)}</div>
      </div>
      <div class="field"><label>${escAttr(t.role)}</label>${radioRow('role', t.roleOpts)}</div>
      <div class="field"><label>${escAttr(t.business)}</label>${radioRow('business_type', t.businessOpts)}</div>
      <div class="field" style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
        <div><label>${escAttr(t.country)}</label><input type="text" name="country" /></div>
        <div><label>${escAttr(t.city)}</label><input type="text" name="city" /></div>
      </div>
    </div>

    <div class="section">
      <span class="section-num">2 / 6</span>
      <h2>${escAttr(t.s2)}</h2>
      <div class="field"><label>${escAttr(t.teamSize)}</label>${radioRow('team_size', t.teamOpts)}</div>
      <div class="field">
        <label>${escAttr(t.eventsPerWeek)}</label>
        <input type="text" name="events_per_week" placeholder="${escAttr(t.eventsHint)}" />
      </div>
      <div class="field"><label>${escAttr(t.avgTicket)}</label>${radioRow('avg_ticket', t.ticketOpts)}</div>
      <div class="field"><label>${escAttr(t.yearsExp)}</label>${radioRow('years_experience', t.expOpts)}</div>
    </div>

    <div class="section">
      <span class="section-num">3 / 6</span>
      <h2>${escAttr(t.s3)}</h2>
      <p class="section-hint">${escAttr(t.s3hint)}</p>
      <div class="field">
        <label>${escAttr(t.recipeCosting)}</label>
        <textarea name="recipe_costing_method" placeholder="${escAttr(t.recipeCostingPh)}" required></textarea>
      </div>
      <div class="field">
        <label>${escAttr(t.quoteBuilding)}</label>
        <textarea name="quote_building_method" placeholder="${escAttr(t.quoteBuildingPh)}" required></textarea>
      </div>
      <div class="field"><label>${escAttr(t.toolsUsed)}</label>${checkboxes('tools_used', t.toolsOpts)}</div>
      <div class="field"><label>${escAttr(t.hoursPerWeek)}</label>${radioRow('hours_per_week', t.hoursOpts)}</div>
      <div class="field">
        <label>${escAttr(t.confidence)}</label>
        <div class="field-hint">${escAttr(t.confidenceHint)}</div>
        ${confidenceScale()}
      </div>
    </div>

    <div class="section">
      <span class="section-num">4 / 6</span>
      <h2>${escAttr(t.s4)}</h2>
      <p class="section-hint">${escAttr(t.s4hint)}</p>
      <div class="field">
        <label>${escAttr(t.biggestFrustration)}</label>
        <textarea name="biggest_frustration" placeholder="${escAttr(t.biggestFrustrationPh)}" required></textarea>
      </div>
      <div class="field">
        <label>${escAttr(t.lastMistake)}</label>
        <textarea name="last_mistake" placeholder="${escAttr(t.lastMistakePh)}"></textarea>
      </div>
      <div class="field">
        <label>${escAttr(t.magicWand)}</label>
        <textarea name="magic_wand" placeholder="${escAttr(t.magicWandPh)}"></textarea>
      </div>
      <div class="field">
        <label>${escAttr(t.whatsStopping)}</label>
        <textarea name="whats_stopping" placeholder="${escAttr(t.whatsStoppingPh)}"></textarea>
      </div>
    </div>

    <div class="section">
      <span class="section-num">5 / 6</span>
      <h2>${escAttr(t.s5)}</h2>
      <div class="field">
        <label>${escAttr(t.triedSoftware)}</label>
        <input type="text" name="tried_software" placeholder="${escAttr(t.triedSoftwarePh)}" />
      </div>
      <div class="field">
        <label>${escAttr(t.stoppedReason)}</label>
        <input type="text" name="stopped_reason" placeholder="${escAttr(t.stoppedReasonPh)}" />
      </div>
      <div class="field">
        <label>${escAttr(t.mustHave)}</label>
        <textarea name="must_have_feature" placeholder="${escAttr(t.mustHavePh)}"></textarea>
      </div>
      <div class="field"><label>${escAttr(t.budget)}</label>${radioRow('monthly_budget', t.budgetOpts)}</div>
      <div class="field"><label>${escAttr(t.decisionMaker)}</label>${radioRow('decision_maker', t.decisionOpts)}</div>
    </div>

    <div class="section">
      <span class="section-num">6 / 6</span>
      <h2>${escAttr(t.s6)}</h2>
      <div class="field">
        <label>${escAttr(t.allowFollowup)}</label>
        <div class="radio-row">
          <label><input type="radio" name="allow_followup" value="1"><span>${escAttr(t.followupYes)}</span></label>
          <label><input type="radio" name="allow_followup" value="0" checked><span>${escAttr(t.followupNo)}</span></label>
        </div>
      </div>
      <div class="field">
        <label>${escAttr(t.betaTester)}</label>
        <div class="radio-row">
          <label><input type="radio" name="beta_tester" value="yes"><span>${escAttr(t.betaYes)}</span></label>
          <label><input type="radio" name="beta_tester" value="maybe" checked><span>${escAttr(t.betaMaybe)}</span></label>
          <label><input type="radio" name="beta_tester" value="no"><span>${escAttr(t.betaNo)}</span></label>
        </div>
      </div>
    </div>

    <div class="submit-row">
      <button type="submit" class="submit-btn" id="submit-btn">${escAttr(t.submit)}</button>
      <p class="privacy-note">${escAttr(t.privacyNote)}</p>
    </div>
  </form>

  <script>
    const form = document.getElementById('research-form');
    const errBox = document.getElementById('form-err');
    const btn = document.getElementById('submit-btn');
    const labels = {
      submitting: ${JSON.stringify(t.submitting)},
      submit: ${JSON.stringify(t.submit)},
      errorBody: ${JSON.stringify(t.errorBody)},
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errBox.classList.remove('show');
      btn.disabled = true;
      btn.textContent = labels.submitting;

      const fd = new FormData(form);
      // Collect checkbox values as comma-separated
      const tools = fd.getAll('tools_used').join(', ');
      const data = {};
      for (const [k, v] of fd.entries()) {
        if (k === 'tools_used') continue;
        data[k] = v;
      }
      data.tools_used = tools;

      try {
        const res = await fetch('/api/research/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('submit_failed');
        window.location.href = '/research/thanks/' + ${JSON.stringify(lang)};
      } catch (err) {
        errBox.textContent = labels.errorBody;
        errBox.classList.add('show');
        btn.disabled = false;
        btn.textContent = labels.submit;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  </script>
</body>
</html>`;
}

export function buildResearchThanks(lang = 'en') {
  const t = T[lang] || T.en;
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escAttr(t.thanksTitle)} — App4Chef</title>
  <meta name="robots" content="noindex" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  ${ANALYTICS}
  <style>${CSS}
    .thanks-card{max-width:560px;margin:80px auto;padding:48px 32px;background:var(--surface);border:1px solid var(--border);border-radius:12px;text-align:center}
    .thanks-icon{width:80px;height:80px;background:rgba(212,168,83,0.15);color:var(--accent-dark);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:36px;margin:0 auto 24px}
    .thanks-card h1{font-size:32px;font-weight:800;color:var(--dark);margin-bottom:12px}
    .thanks-card p{color:var(--muted);font-size:16px;line-height:1.7}
    .thanks-card strong{color:var(--accent-dark)}
    .thanks-actions{margin-top:28px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
    .thanks-actions a{padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px}
    .btn-gold{background:var(--accent);color:var(--dark)}
    .btn-ghost{background:#f5f3ee;color:var(--text);border:1px solid var(--border)}</style>
</head>
<body>
  ${navHeader(lang)}
  <div class="thanks-card">
    <div class="thanks-icon">✓</div>
    <h1>${escAttr(t.thanksTitle)}</h1>
    <p>${t.thanksBody}</p>
    <div class="thanks-actions">
      <a href="/tools" class="btn-gold">${escAttr(t.thanksCta)}</a>
      <a href="/" class="btn-ghost">${escAttr(t.backHome)}</a>
    </div>
  </div>
</body>
</html>`;
}
