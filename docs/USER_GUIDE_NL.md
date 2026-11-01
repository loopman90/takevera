# Takevera – beginnershandleiding

Deze gids loopt de belangrijkste workflows door. Projecten staan standaard lokaal op je computer en Takevera slaat je werk automatisch op. Een internetverbinding is alleen nodig voor functies die bewust online werken, zoals een bevestigde weersverwachting of een door jou ingestelde AI-dienst.

De meegeleverde Mac-app vereist macOS 13 Ventura of nieuwer. De ARM64-versie is op deze Mac gebouwd; de Intel-versie is verpakt, maar niet op Intel-hardware interactief gevalideerd.

## Een Mac-versie openen

Er is nog geen officiële release. Een toekomstige open-sourceversie kan lokaal technisch zijn ondertekend, zonder betaald Apple Developer-account en zonder notarization. Die handtekening bewijst de identiteit van de maker niet; macOS kan de app bij de eerste start blokkeren.

Download een toekomstige versie alleen via de officiële projectbron en controleer dat het bestand het verwachte, ongewijzigde bestand is. Probeer de app te openen. Blokkeert macOS de app, dan kan onder **Systeeminstellingen → Privacy en beveiliging** de optie **Open toch** verschijnen. Volg de [uitleg en veiligheidsadviezen van Apple](https://support.apple.com/en-us/102445). Verschijnt een melding dat de app malware bevat of beschadigd of gewijzigd is, open deze dan niet. De precieze tekst en beschikbaarheid verschillen per macOS-versie en beheerde computer.

## Windows en Linux

De verdere ontwikkeling en verificatie van Windows- en Linux-versies is uitgesteld. Er is nog geen officiële release; oudere lokale proefbestanden zijn geen goedgekeurde installatieversies. Lokale OCR voor gescande PDF's is op macOS beschikbaar. Voor het opslaan van API-sleutels en samenwerkingstokens op Linux is een ondersteunde beveiligde sleutelopslag nodig.

## Hulp vinden

Kies bovenaan de app **? Help mij**. Je ziet uitleg bij het scherm dat je open hebt. Zoek op een woord, open een stappenplan of kies **Volledige handleiding**. Via hetzelfde venster open je de startgids en de begrippenlijst. Deze hulp werkt zonder internet.

Bij de eerste start gebruikt Takevera de systeemtaal als deze beschikbaar is; andere talen vallen terug op Engels. Kies zelf een andere interfacetaal via **Instellingen**. De taal van een script kun je per project kiezen.

## 1. Begin met een project

1. Kies **Nieuw project** en vul een titel in.
2. Kies het productietype en de taal van het script. De interfacetaal stel je apart in bij **Instellingen**. Die taal wordt ook gebruikt voor veelvoorkomende foutmeldingen bij bestanden, opslag en verbindingen. Daar kun je de schrijftip in de editor verbergen of opnieuw tonen en de startgids opnieuw openen. Sleep de scheidingslijn naast de navigatiekolom om die breder of smaller te maken; de breedte wordt onthouden. Je kunt de scheidingslijn ook focussen en met de pijltjestoetsen, Home en End bedienen.
3. Voeg eventueel een logline, synopsis en makers toe.
4. Een nieuwe installatie begint zonder projecten. Maak zelf een project of importeer een bestaand project.

De startpagina toont je projecten, het aantal scènes, de taakvoortgang en wanneer een project voor het laatst is gewijzigd. Gebruik de zoekbalk om projecten te vinden.

## 2. Schrijf en orden scènes

Open **Script** en maak een scène. Vul de scènekop, actie, personage en dialoog in. Bij personage/spreker en locatie kun je een bestaande naam uit het project kiezen of zelf tekst typen. Gebruik de scriptonderdelen voor regieaanwijzingen, muziek, geluid of eigen cues. Het gekozen productietype past de editor en afdrukweergave aan.

- Voeg scènes toe, dupliceer ze of versleep ze in de scèneslijst.
- Gebruik de kaartweergave voor overzicht of de doorlopende scriptweergave om te lezen.
- Gebruik zoeken en vervangen om tekst in het projectscript te vinden of aan te passen.
- De editor slaat automatisch op. De woordtelling, geschatte pagina's en speelduur staan onder de scène.
- Vergrendel of keur scènes goed wanneer ze niet ongemerkt gewijzigd mogen worden.
- Voeg scèneopmerkingen toe. Je kunt geselecteerde tekst aan een opmerking koppelen.

Met de toetsenbordcombinaties **⌘/Ctrl+N**, **⌘/Ctrl+S** en **⌘/Ctrl+F** kun je respectievelijk een project maken, opslaan en zoeken. De scèneslijst ondersteunt de pijltjestoetsen en Home/End. Open de begrippenlijst via **Begrippenlijst** als je een productie- of scriptterm wilt opzoeken.

## 3. Beheer de projectbijbel en breakdown

Open **Projectbijbel** om personages, locaties, tijdlijn, wereldregels, belangrijke voorwerpen en stijl- of terminologieafspraken te beheren. Voeg onder **Tijdlijngebeurtenissen** momenten toe met datum en tijd, omschrijving, notities en een optionele scènekoppeling. Verplaats gebeurtenissen met de pijlen; de ingestelde volgorde verschijnt ook in AI-continuïteitscontext en als lijst in het productiedraaiboek. Bij personages kun je geschiedenis, eigenschappen, relaties en ontwikkeling vastleggen. Bij locaties kun je onder meer adres, toegang, parkeren, reistijd, contact, veiligheid en geluidsregels bewaren. Personages en locaties tonen de scènes waarin ze voorkomen; klik een scène om die direct in **Script** te openen.

Gebruik **Scan scriptverwijzingen** om mogelijke personages, locaties, muziek en geluidscues voor te stellen. Nieuwe suggesties zijn gemarkeerd voor controle: bevestig of pas ze aan voordat je ze als projectinformatie gebruikt.

Open **Breakdown** om per scène props, kostuums, apparatuur, geluid, make-up, effecten en vervoer te noteren. Wijs een verantwoordelijke toe en werk de status bij. Continuïteits-, licht- en geluidsnotities blijven aan de scène gekoppeld.

## 4. Maak een shotlist en apparatuurplan

Open **Productie → Shotlist** en voeg shots toe. Koppel elk shot aan een scène. De velden voor shottype/kader, beweging, lens/apparatuur, geluid en licht hebben suggesties. Bij lens/apparatuur komen ook camera’s en andere items uit de apparatuur- en scenelijst terug. Klik in zo’n veld of druk op de pijl-omlaag om het keuzemenu te openen. Kies een suggestie of typ je eigen waarde; eigen waarden blijven toegestaan.

Je kunt per shot een referentieafbeelding toevoegen met bijschrift en bron-/rechteninformatie. Vergrendelde draaidagen beschermen de bijbehorende shotlist tot je de dag ontgrendelt.

Open **Apparatuurlijst** om materiaal, categorie, aantal, eigenaar en status bij te houden. Suggesties tonen itemnamen en eigenaren die je al in dit project gebruikt; je kunt ook gewoon een nieuwe waarde typen. Koppel apparatuur aan scènes of shots. Items zonder koppeling gelden als algemene productiebenodigdheden. Werk de status tijdens de draaidag bij vanuit de call sheet.

Filter de lijst op draaidag en status. Bij een draaidag worden algemene items en items van gekoppelde scènes of shots getoond. Meldingen wijzen op items die nog op **Nodig** staan, een aantal van nul en mogelijk dubbele namen. Gelijke namen kunnen ook aparte exemplaren zijn; de melding stelt geen overlap in de planning vast.

Kies bij een ingevuld shot, apparatuuritem of lichtbron **Bewaar preset** en geef deze een naam. Kies hem daarna in hetzelfde project en gebruik **Preset toevoegen** om een nieuw item te maken. Scène-, shot- en dagkoppelingen, afbeeldingen en apparatuurstatus worden niet overgenomen; controleer deze bij het nieuwe item. Presets worden met het project opgeslagen en gedeeld. Een preset verwijderen laat bestaande items intact.

## 5. Plan draaidagen

Open **Productie → Dagoverzicht**. Voeg draaidagen toe, stel datum, calltijd, wrap en adres in en wijs scènes toe. Wijzig de scènevolgorde met de pijlen. De locatiegroepering is een voorstel; controleer beschikbaarheid, reistijd en haalbaarheid zelf.

Gebruik **Voorstel planning** om een conceptplanning op te bouwen. De planner vraagt per scène een draaitijd, een standaard reistijd tussen locaties, een eventuele pauze en een voorbereidingsbuffer. Een getal in minuten bij de bestemmingslocatie in de projectbijbel gaat voor die verplaatsing voor; decimale minuten worden afgerond. Vul de standaard alleen in als een verplaatsing geen eigen reistijd heeft; laat hem leeg als alle overgangen een eigen schatting hebben. Hij begint bij de calltijd en waarschuwt voor overlap, krappe wrap, ontbrekende informatie en onbekende of onbeschikbare cast-, crew- en locatiebeschikbaarheid. Controleer en pas het voorstel aan voordat je het deelt.

Stel beschikbaarheid in via **Projectbijbel**: kies de draaidag en markeer per cast-/crewpersoon en projectlocatie beschikbaar, niet beschikbaar of onbekend. Bij cast en crew kun je ook notities bewaren en per persoon aangeven of die op de call sheet mogen. Het dagoverzicht gebruikt deze gegevens voor waarschuwingen.

Vul praktische informatie in zoals catering, weer, daglicht, veiligheidsplan, noodcontact, ziekenhuis, licht en geluid. Noteer bij daglicht bijvoorbeeld zonsopkomst, zonsondergang of golden hour. Weer kan ook handmatig worden ingevuld. Je kunt ook na bevestiging een verwachting ophalen; de app toont zonsopkomst, zonsondergang en daglichtduur als astronomische schatting, met bron en ophaaltijd. Handmatige notities blijven behouden.

## 6. Gebruik de call sheet op de set

Open **Productie → Call sheet** en kies de draaidag. De call sheet verzamelt scènes, planning, cast/crew, daggebonden apparatuur en productietaken. Je kunt taken- en apparatuurstatussen direct bijwerken; wijzigingen worden in het project opgeslagen.

Locaties die bij de scènes horen tonen beschikbare projectbijbelgegevens zoals adres, toegang, parkeren, reistijd, veiligheid en geluidsregels. Locatiecontact, telefoonnummers en andere contactgegevens worden alleen opgenomen wanneer de schakelaar voor contactgegevens aanstaat. Controleer de call sheet vóór afdrukken of delen. De compacte on-setmodus biedt grotere tekst, zoeken en wisselen van draaidag.

## 7. Licht, geluid en beeldreferenties

Open de tabbladen **Licht** en **Geluid** om opstelling per scène of shot vast te leggen. Lichtbronnen, posities, modifiers, stroombehoefte en veiligheidsnotities kunnen worden genoteerd. Geluid ondersteunt microfoon, plaatsing, recorder, opnameformaat, ambiance, wild tracks en risico's.

Voeg bij scènes, shots, licht en geluid PNG-, JPEG- of WebP-referenties toe. Je kunt afbeeldingen kopiëren naar de projectopslag of koppelen aan het origineel. Bewaar waar nodig bijschrift, bron, maker, datum, gebruiksrechten en notities. Als een gekoppeld bestand ontbreekt, meldt Takevera dat.

In het lichtplan kun je een lichtreferentie gebruiken als plattegrond of sfeerbeeld. Klik op de afbeelding om een lampmarkering te plaatsen. Sleep markeringen, verplaats ze met de pijltjestoetsen en vul label, armatuur en notities in. Markeringen verschijnen ook op de afdruk.

## 8. Moodboards, storyboards, taken en budget

Open **Borden** om meerdere moodboards te maken en afbeeldingen, kleurvlakken, tekst en links te ordenen. Storyboardkaarten kunnen aan scène en shot worden gekoppeld. Kadrering, camerabeweging en geluid hebben dezelfde keuzelijsten als de shotlist; kies een suggestie of typ een eigen waarde. Gebruik dupliceren en de verplaatsknoppen om kaarten te ordenen.

Shortlists kunnen zowel scriptpersonages als echte cast-/crewleden bevatten, naast scènes, shots, locaties en apparatuur. De gekozen volgorde blijft behouden in het draaiboek.

Open **Taken** voor verantwoordelijken, deadlines en status. De statussen blijven correct als je de interfacetaal wijzigt. Veelvoorkomende productietaken en eerder gebruikte taaknamen en eigenaren verschijnen als suggesties; nieuwe invoer blijft mogelijk. De apparatuur- en breakdownvelden suggereren ook gebruikelijke apparatuur, categorieën en eerder ingevulde waarden. Kies per taak één draaidag of alle draaidagen; de call sheet toont de taken voor de geselecteerde dag. Als je een draaidag verwijdert, blijven de taken behouden en worden ze aan alle dagen gekoppeld. Shots van die dag gaan naar de eerstvolgende dag, of naar de vorige dag als je de laatste dag verwijdert. De startpagina toont de voortgang op basis van afgeronde taken. Gebruik **Budget** om ramingen, werkelijke bedragen, categorieën, eigenaars en valuta vast te leggen. Categorieën en eigenaren bieden gebruikelijke en eerder gebruikte suggesties; je kunt ook eigen waarden typen.

## 9. Revisies, afdrukken en back-ups

Bewaar een scriptrevisie met datum, versienummer en notitie. Vergelijk een revisie met de huidige tekst of kies twee opgeslagen revisies om onderling te vergelijken. Je kunt een revisie herstellen. Bij realtime samenwerking registreert de activiteitenlijst wie een wijziging opsloeg, wanneer dat gebeurde, welke scène veranderde en welke projectruimte werd bijgewerkt. De lijst bewaart maximaal 1.000 gebeurtenissen en meldt wanneer oudere items zijn verwijderd. Bij een wijziging aan één scène bewaart de lijst, zolang de scènevolgorde en het aantal scènes gelijk blijven, een begrensd herstelpunt voor de script-/revisievelden. Kies **Herstel script van vóór deze wijziging** om die velden terug te zetten; reacties en afbeeldingen blijven behouden. Er worden maximaal 20 herstelpunten van samen maximaal 1 MiB bewaard, met maximaal 128 KiB per punt. Te grote wijzigingen, scèneverplaatsingen en wijzigingen aan meerdere scènes blijven alleen als activiteit zichtbaar; maak daarvoor een benoemde revisie. Als een wijziging van een andere samenwerker binnenkomt, wordt de sessiegeschiedenis voor undo/redo met een melding opnieuw gestart om te voorkomen dat een oude momentopname nieuwere inhoud overschrijft. Revisiepagina's kunnen een kleur krijgen; zet achtergrondafbeeldingen aan in het afdrukvenster om die kleur in PDF te behouden.

Vanuit **Productie** kun je het volledige draaiboek, de actieve draaidag, call sheet, shotlist, lichtplan, geluidsplan, cast-/crewlijst en apparatuur afdrukken of als PDF bewaren. Pas zo nodig het projectsjabloon aan en gebruik **Beheer exportsjablonen** om eigen sjablonen te bewaren. Voeg daar ook eigen tekstonderdelen aan het draaiboek toe; je kunt ze per sjabloon opnemen of verbergen en ze in de volgorde verplaatsen. Controleer vóór de definitieve export welke onderdelen en contactgegevens worden opgenomen. Voor persoonlijke telefoonnummers moeten zowel de exportschakelaar als de toestemming per persoon aanstaan.

De scriptwerkruimte biedt import en export voor Fountain, FDX en DOCX, plus PDF-tekstimport. Vóór import zie je de herkende scènekoppen en scriptblokken en kun je de omzettingswaarschuwingen bekijken. Als een FDX- of DOCX-bestand Takevera-projectgegevens bevat, kun je die gegevens in een nieuw project herstellen of alleen de zichtbare scripttekst gebruiken. Bij vervanging van het huidige script worden de gevolgen voor bestaande scènekoppelingen getoond. Bij DOCX-export kun je kiezen voor alleen het zichtbare script of ook voor een verborgen Takevera-projectbijlage met productiegegevens, opmerkingen en revisies. PDF-opmaak gaat niet mee; gangbare DOCX/FDX-opmaak en Takevera-productiemetadata hebben beperkingen (zie **Bekende grenzen** en de README). Gebruik de projectexport voor een JSON-uitwisseling of exporteer een volledige projectmap wanneer je ook de afbeeldingsassets wilt meenemen. Bij FDX kun je optioneel een project-zijbestand exporteren om extra Takevera-projectgegevens mee te bewaren.

Nieuwe installaties bewaren projecten in `Documenten/Takevera`. Een bestaande installatie gebruikt de oude map `Documenten/ScriptStudio` zolang daar projecten staan; gebruik **Instellingen → Projectmap verplaatsen** om ze naar een map `Takevera` te kopiëren. Projectbeheer en **Instellingen → Back-ups** bieden lokale snapshots en herstelpunten. Je kunt twee geldige snapshots of herstelpunten vergelijken om te zien welke scriptvelden zijn gewijzigd. Beschadigde back-ups kun je niet vergelijken. Als een projectbestand ontbreekt of beschadigd is, verschijnt op het startscherm een hersteloptie voor de nieuwste geldige back-up. Het beschadigde origineel blijft als aparte kopie bewaard en kan in de back-upbeheerder worden verwijderd. Als geen geldige back-up bestaat, meldt het startscherm dat zonder projectbestanden te wijzigen. Via **Instellingen → Projectmap verplaatsen** kun je de projectopslag naar een andere map kopiëren. Je kunt projecten ook exporteren als JSON of als volledige projectmap met assets. Bewaar bij mapback-ups het manifest en de `assets`-map bij elkaar. Verwijderen van een project verwijdert ook de bijbehorende lokale bestanden en back-ups.

### Takevera veilig bijwerken

1. Exporteer vóór een grote update elk belangrijk project via **Volledige projectmap exporteren**. Bewaar de `.takevera`-map op een andere schijf of in een andere map; laat `takevera-project.json` en `assets/` bij elkaar.
2. Sluit Takevera helemaal af voordat je de app vervangt. De projectbestanden blijven in je projectmap staan wanneer je alleen de app bijwerkt.
3. Kies het installatiebestand dat bij je Mac past, vervang Takevera in **Programma’s** en start de nieuwe versie.
4. Controleer of je projecten en afbeeldingen openen. Als een project ontbreekt of beschadigd is, gebruik **Volledige projectback-up importeren** of **Back-ups** om het te herstellen.

Takevera werkt niet automatisch bij. Controleer zelf de release-informatie voordat je een nieuwe versie installeert. De lokale repository-builds zijn ad-hoc ondertekend, maar niet met een Developer ID en niet genotariseerd; macOS kan daarom een beveiligingsmelding tonen.

## AI verbinden via een API

1. Open **Instellingen → AI instellen**. Kies **OpenAI-compatibel endpoint** voor een externe aanbieder, of **Lokaal model op dit apparaat** als je zelf een lokale server hebt geïnstalleerd en gestart.
2. Neem het basisadres van de chat-completions-API en de exacte modelnaam over van je aanbieder. Bijvoorbeeld: als het basisadres eindigt op `/v1`, maakt Takevera daar `/v1/chat/completions` van. Staat `/chat/completions` al aan het einde, dan wordt het niet opnieuw toegevoegd. Een extern adres moet HTTPS gebruiken; HTTP is alleen toegestaan op localhost. Vul het definitieve API-adres in: doorverwijzingen worden om veiligheidsredenen niet gevolgd.
3. Vul je API-sleutel in als die nodig is. Een lokale server heeft soms geen sleutel nodig. Kies **AI-instellingen opslaan**. Beveiligde sleutelopslag moet beschikbaar zijn als je een sleutel opslaat.
4. Open een project en kies **AI-schrijfhulp** in **Script** of **Productie**. Kies een taak, lees de contextpreview en bevestig de aanvraag. De geselecteerde informatie gaat naar het ingestelde endpoint. Bij een externe aanbieder verlaat die informatie je computer; controleer de kosten en voorwaarden van die aanbieder.
5. Bekijk het resultaat. Suggesties wijzigen het script niet automatisch. Bij een fout: controleer het adres, de modelnaam, sleutel en beschikbare tegoeden. Controleer bij een lokaal model ook of de server draait.

## 10. Optionele AI en samenwerking

AI staat los van de lokale schrijf- en productiefuncties. Stel in **Instellingen** een compatibel API-endpoint of een lokale modelserver in. Open de assistent vanuit **Script** voor schrijfwerk of vanuit **Productie** voor een breakdown van bestaande scènegegevens. Bekijk de contextpreview en bevestig de aanvraag; bij vertalen vul je expliciet de doeltaal in. AI-voorstellen vervangen je tekst niet automatisch. Een lokaal model moet je zelf installeren en starten.

Gedeelde-map-synchronisatie is handmatig en vraagt bevestiging voordat gegevens worden geschreven. Bij conflicten kies je welke kopie je wilt behouden; maak vooraf een onafhankelijke back-up. Realtime samenwerking vraagt een zelfgehoste server en uitnodiging. De server kan lokaal worden gebruikt; externe hosting, TLS en domeinen regel je zelf. Lees de privacy- en beperkingeninformatie in de README voordat je productiegegevens deelt.

## Bekende grenzen

PDF-import haalt tekst uit selecteerbare PDF's; op macOS kan optionele lokale OCR scans herkennen. PDF-opmaak en oorspronkelijke paginering blijven niet behouden. DOCX en FDX ondersteunen gangbare scriptstructuren, maar complexe opmaak en sommige revisiegegevens kunnen verloren gaan. Voor Takevera DOCX/FDX-uitwisseling kunnen optionele projectgegevensbestanden aanvullende metadata bewaren. Celtx-import is niet beschikbaar. De app is nog niet interactief gevalideerd op Windows of Linux. De lokale macOS-installers zijn ad-hoc ondertekend, maar hebben geen Developer ID-ondertekening of notarization.
