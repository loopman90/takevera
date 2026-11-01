# Takevera — stijlgids

Deze gids beschrijft de gekozen visuele stijl voor Takevera. Gebruik hem als referentie bij nieuwe schermen en componenten, zodat de app rustig, helder en professioneel blijft.

## Ontwerpgevoel

- Modern en professioneel, met een subtiele filmische toon.
- Veel witruimte en een duidelijke hiërarchie.
- Neutrale oppervlakken met bordeauxrode accenten.
- Eenvoudige vormen en fijne randen; schaduwen alleen wanneer ze een element helpen onderscheiden.
- Geen decoratieve verlopen, gloeiende effecten of overbodige versieringen.

## Kleuren

| Gebruik | Licht thema | Donker thema |
| --- | --- | --- |
| Achtergrond | `#F4F6F8` | `#231F22` |
| Oppervlak / kaarten | `#FFFFFF` | `#2D282C` |
| Hoofdtekst | `#202833` | `#F0EBED` |
| Secundaire tekst | `#687482` | `#B9ADB2` |
| Rand | `#DFE4EA` | `#493E43` |
| Bordeaux accent | `#784452` | `#C28695` |
| Accentachtergrond | `#F3E9EC` | `#3B2E33` |

Gebruik het bordeaux voor primaire acties, actieve navigatie, focus- en statusaccenten. Gebruik de lichte accentachtergrond voor geselecteerde items en kleine labels. Houd lange tekst op neutrale achtergronden voor goede leesbaarheid. In het donkere thema krijgt de primaire knop een donkerdere bordeauxkleur met witte tekst.

## Typografie

### Interface

- **Avenir Next** voor navigatie, koppen, labels en gewone interface-tekst.
- Aanbevolen terugval: `Avenir`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `sans-serif`.
- Gebruik een duidelijke, compacte koppenhiërarchie. Houd gewone tekst goed leesbaar en vermijd decoratieve letterstijlen.

### Script

- **Courier** is de conventionele screenplay-letter. Gebruik 12 pt voor de afdruk en behoud de bestaande scriptmarges en regelafstand.
- Voor de editor: **Courier Prime** wanneer beschikbaar, gevolgd door **Courier New**, **Courier** en `monospace` als terugval.
- Gebruik monospace uitsluitend voor scriptinhoud en metadata waar uitlijning helpt. De rest van de interface gebruikt Avenir Next.

### Titelpagina

- **Bebas Neue** voor de titel van het script op de titelpagina.
- Houd de titel in hoofdletters en geef hem ruimte; laat namen en overige titelpagina-informatie in Courier staan.
- Terugval: `Arial Narrow`, `Impact`, `sans-serif`.

> Courier Prime en Bebas Neue worden lokaal meegeleverd, inclusief hun SIL Open Font License. Avenir Next gebruikt de systeeminstallatie; wanneer dat lettertype ontbreekt, gebruikt de interface het volgende lettertype in de CSS-stack.

## Componenten

- **Knoppen:** bescheiden afronding (ongeveer 5 px), duidelijke tekst en fijne rand. Primaire knop bordeaux met witte tekst; secundaire knop wit of transparant.
- **Kaarten en panelen:** witte achtergrond, dunne neutrale rand en bescheiden afronding (ongeveer 6 px). Gebruik schaduw heel subtiel.
- **Formuliervelden:** neutrale achtergrond, dunne rand, consistente padding en een zichtbare focusstatus.
- **Navigatie:** compacte labels en iconen. Toon de actieve sectie met een zachte bordeaux/roze achtergrond.
- **Tags en status:** kleine, rustige labels; gebruik kleur als aanvulling op tekst, niet als enige informatiedrager.
- **Ruimte:** hergebruik vaste tussenruimtes en groepeer onderdelen op functie. Laat secties voldoende ademen.

## Implementatie in deze app

De centrale stijlen staan in [`src/styles.css`](src/styles.css). De kleur- en lettertypevariabelen staan bij de thematische overrides. De lokale lettertypen en hun licenties staan in [`src/fonts`](src/fonts). Pas bestaande componenten aan voordat je een tweede, concurrerende set globale stijlen toevoegt.

Bij wijzigingen:

1. Hergebruik de CSS-variabelen voor kleuren en lettertypen.
2. Controleer zowel licht als donker thema.
3. Houd script-editor en scriptprint typografisch monospaced; verander de screenplay-opmaak niet mee met de algemene interface.
4. Behoud zichtbare focusstijlen en voldoende contrast.
5. Houd de weergave bruikbaar op smalle vensters en in afdrukken.
