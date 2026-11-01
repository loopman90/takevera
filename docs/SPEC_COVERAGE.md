# Dekking van de productspecificatie

Deze kaart vergelijkt de oorspronkelijke Takevera-specificatie met de huidige code en documentatie. `Aanwezig` betekent dat de functie in de app is geïmplementeerd; het betekent niet dat iedere mogelijke workflow op alle besturingssystemen interactief is gevalideerd. Installatie- en validatiebeperkingen staan apart vermeld.

## Fase 1 — lokale Mac-basis

| Onderdeel | Status | Huidige dekking |
| --- | --- | --- |
| Projecten en scripts | Aanwezig | Projectwizard, lokale JSON-opslag, autosave, scènebeheer, scriptvormen voor film, theater, podcast, commercial en documentaire, zoeken/vervangen, print/export en herstelpunten. |
| Projectbijbel en productiegegevens | Aanwezig | Personages, locaties, tijdlijn, continuïteit, script-breakdown en per-scène-inventaris met controlemarkeringen. |
| Visuele referenties | Aanwezig | PNG, JPEG en WebP kunnen worden gekopieerd of gekoppeld; moodboards, storyboard, licht- en geluidsreferenties ondersteunen metadata, slepen en neerzetten en bundeling. |
| Productieplanning en call sheets | Aanwezig | Draaidagen, scènes, voorlopige planning, call sheets, contacttoestemming, veiligheidsgegevens, weer/daglicht na bevestiging en on-set weergave. |
| PDF en talen | Aanwezig met grenzen | Printdialoog kan als PDF worden opgeslagen. Interface en documentatie zijn Nederlands en Engels. PDF-import behoudt de oorspronkelijke lay-out en paginering niet. |

## Fase 2 — productie en bestandscompatibiliteit

| Onderdeel | Status | Huidige dekking |
| --- | --- | --- |
| Shotlist, shortlist en apparatuur | Aanwezig | Shottype/kader, beweging, lens, geluid en licht bieden suggestiemenu's; lenssuggesties nemen camera- en apparatuurnamen uit het project mee. Suggesties blijven vrije invoervelden. De apparatuurlijst koppelt items aan scènes/shots, bewaart eigenaar, aantal en status, en levert een apart rapport en call-sheetstatus. |
| Apparatuurfilters en presets | Aanwezig met grenzen | Filter apparatuur op draaidag en status; meldingen tonen nog te regelen items, aantallen van nul en mogelijk dubbele namen. Herbruikbare shot-, licht- en apparatuurpresets worden in het project bewaard. Dubbele namen bewijzen geen gelijktijdige boeking; tijdgebonden uitgifte per exemplaar wordt nog niet bijgehouden. |
| Licht- en geluidsplannen | Aanwezig | Gestructureerde opstellingen, referentieafbeeldingen en lichtmarkers op een achtergrondafbeelding; afzonderlijke rapporten en draaiboekuitvoer. |
| Taken en begroting | Aanwezig | Verantwoordelijken, deadlines, statussen, valuta, ramingen en werkelijke bedragen. |
| Scriptrevisies | Aanwezig voor benoemde rondes | Benoemde snapshots kunnen worden vergeleken en hersteld; FDX-revisiemarkeringen worden beperkt ingelezen en uitgevoerd. |
| DOCX en FDX | Gedeeltelijk | Gangbare scriptstructuren worden ondersteund. Extra Takevera-productiegegevens reizen mee in een optionele DOCX-projectbijlage of een expliciete FDX-zijfile; gewone bestanden dragen deze gegevens niet. Complexe opmaak en sommige revisiedetails kunnen verloren gaan. |
| Productieboek | Aanwezig | Bewerkbare, per project opgeslagen sjablonen; volledige productie of actieve draaidag; eigen secties, selectie en volgorde; print/PDF via het systeemdialoogvenster. |

## Fase 3 — AI en samenwerking

| Onderdeel | Status | Huidige dekking |
| --- | --- | --- |
| AI-configuratie | Aanwezig met externe afhankelijkheid | Compatibel chat-completions-eindpunt of een lokaal modelserver-eindpunt; contextpreview en bevestiging per aanvraag; resultaten worden niet automatisch toegepast. |
| Lokale modelruntime | Niet ingebouwd | De gebruiker installeert en start een lokaal model apart. Er is geen verplichte leverancier of AI-account. |
| Gedeelde-map-synchronisatie | Aanwezig, handmatig | Projecten kunnen met expliciete bevestiging als snapshots worden uitgewisseld. Dit is geen realtime bewerking. |
| Realtime samenwerking | Aanwezig met zelfbeheer | Yjs CRDT-documenten, rollen, projectuitnodigingen, aanwezigheid, scèneopmerkingen en serverauditlog. Een eigen server en beheer van hosting/TLS zijn nodig. |
| Samenwerkingsgeschiedenis | Gedeeltelijk | Activiteiten registreren auteur, tijd, gewijzigd gebied en scène. Een wijziging aan één scène kan onder voorwaarden een begrensd herstelpunt van de script-/revisievelden bewaren en herstellen (maximaal 20/1 MiB/128 KiB per punt). Reacties en afbeeldingen blijven behouden. Te grote wijzigingen, scèneverplaatsingen en wijzigingen aan meerdere scènes blijven activiteiten zonder herstelpunt; gebruik daarvoor benoemde scriptrevisies. Undo/redo geldt alleen voor de lokale sessie. |

## Formaten, platformen en distributie

| Onderdeel | Status | Huidige dekking |
| --- | --- | --- |
| Eigen projectformaat | Aanwezig | Gedocumenteerd JSON-formaat en schema; export/import van projectbundels en volledige projectmappen met afbeeldingshashes. |
| Celtx | Niet geïmplementeerd | Er is geen ondersteunde, toegestane import-/exportmethode opgenomen; de app claimt geen Celtx-compatibiliteit en reverse-engineert geen beschermd formaat. |
| macOS | Gebouwd | Apple Silicon- en Intel-DMG/ZIP-pakketten. De ARM64-versie is op deze Mac gebouwd; Intel is verpakt maar niet interactief op Intel-hardware gevalideerd. |
| Windows en Linux | Niet gevalideerd | Architectuur en Electron Builder-doelen zijn voorbereid; bouw en runtime moeten op de doelbesturingssystemen worden gevalideerd. macOS-specifieke PDF-OCR werkt daar niet. |
| Ondertekening en updates | Beperkt | Lokale Mac-builds zijn ad-hoc ondertekend, zonder Developer ID en zonder notarization. Er is geen automatische updater; voor publieke distributie is een Apple Developer ID-certificaat en notarization nodig. Maak een back-up vóór een grote update. |

## Gebruiksgemak, privacy en eerste gebruik

| Onderdeel | Status | Huidige dekking |
| --- | --- | --- |
| Beginnershulp | Aanwezig met grenzen | Overslaanbare introductie, projectwizard, woordenlijst en uitschakelbare schrijftips. Er is geen aparte eenvoudige modus die de werkruimte herconfigureert. |
| Toegankelijkheid en weergave | Aanwezig met grenzen | Toetsenbordbediening, zichtbare labels/ARIA-namen, tekstgroottes, hoog contrast, licht/donker en verstelbare navigatiezijbalk. De volledige app is niet met schermlezers op ieder platform gevalideerd. |
| Lokale opslag en herstel | Aanwezig | Lokale projectbestanden, automatische en handmatige back-ups, herstel na beschadiging, verplaatsen van opslag, projectexport en definitieve verwijdering via projectbeheer. |
| Afbeeldingsrechten | Aanwezig | Referenties kunnen bijschrift, bron, maker, datum, gebruiksrechten en notities opslaan; de gebruiker blijft verantwoordelijk voor toegestaan gebruik. |
| AI-privacy | Aanwezig met externe afhankelijkheid | De gebruiker kiest de provider en endpoint, bekijkt de context en bevestigt vóór verzending; resultaten worden niet automatisch toegepast. Externe API-kosten en lokale modelinstallatie vallen buiten de app. |

## Bekende functionele grenzen

- De voorlopige planning berekent geen route, locatiespecifieke opbouwtijd of optimale castcombinatie. Gebruikers moeten tijden en beschikbaarheid controleren.
- Weer komt alleen op verzoek na bevestiging binnen; de externe dienst levert maximaal 16 dagen vooruit. Handmatige invoer blijft beschikbaar.
- PDF-import haalt selecteerbare tekst op. Lokale OCR van maximaal 100 pagina’s per import vereist macOS Vision en de Swift-opdrachtregeltools.
- AI-context voor volledige scripts is begrensd tot maximaal 16.000 tekens; de preview toont wanneer die is afgekapt. Geavanceerde paginering en provider-specifieke AI-adapters zijn toekomstig werk.
- Complexe DOCX-/FDX-opmaak, native Word-tracked changes en alle historische projectmomentopnamen kunnen niet volledig worden bewaard in standaard scriptbestanden.
- Electron 45 meldt dat de synchrone controle van beveiligde sleutelopslag verouderd is. Een toekomstige Electron-upgrade vereist een zorgvuldige migratie met behoud van toegang tot bestaande sleutels.

De actuele installatie-instructies, veiligheidsinformatie, exportdetails en samenwerkingslimieten staan in [README.md](../README.md) en de [Nederlandse](USER_GUIDE_NL.md)/[Engelse](USER_GUIDE_EN.md) gebruikershandleidingen.
