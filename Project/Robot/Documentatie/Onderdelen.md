# Onderdelen Robot
---
### Inleiding
Voor deze robot hebben we gekozen voor open en makkelijk te gebruiken onderdelen. Ook kan je het frame 3D printen. Hieronder staat verwerkt welke onderdelen we gebruiken.

# TODO/WORKINPROGRESS
Wat hieronder staat is nog allemaal work in progress!!!

## Controllers
Voor de microcontroller van de robot zijn er een paar mogelijke opties

De ESP32-S3 is een iets krachtigere ESP32, Hierdoor heeft deze net iets meer storage waardoor je hiermee wel AI modellen kan laden. andere opties zouden zijn de ESP-CAM of ESP-EYE. Waarvan bij de Eye devboard er ook bij staat genoteerd dat deze face recognition heeft. 

Wat belangrijk is dat de gene die we kunnen gebruiken met AI functionaliteit moet PSRAM hebben. Dit is iets wat niet elke ESP heeft. Deze kan oplopen tot ongeveer 16MB. Op de S3 zit 4MB. Wat voor een kleine Computervision model mogelijk genoeg is. Maar dit moet wel eerst getest worden. En niet alleen of het kan maar ook de performance. want anders moet er gekeken worden of we er eentje kunnen halen die iets meer PSRAM.

Hier is mogelijk een library die we kunnen gebruiken om CV op onze ESP te zetten:
https://github.com/becem-gharbi/esp-computer-vision

FOMO:https://docs.edgeimpulse.com/studio/projects/learning-blocks/blocks/object-detection/fomo

ESP-boards:https://docs.edgeimpulse.com/hardware/boards/espressif-esp32#using-with-other-esp32-boards

ESP-CAM hebben we in het lab, Maar moeten we even kijken of deze gebaseerd is op een S3 en de PSRAM die deze heeft. Hij heeft wel een SD kaart. Mogelijk kunnen we onderzoeken wat we kunnen opslaan op deze SD kaart want misschien kunnen we daarmee de mogelijke modellen/Data voor de robot opslaan.

| Ordering Code                 | Flash memory | PSRAM | Bruikbaar                                                         |
| ----------------------------- | ------------ | ----- | ----------------------------------------------------------------- |
| ESP32-S3-WROOM-2-N32R16V      | 32MB         | 16MB  | Zeker, Gericht op AI gebruik,Met AI instructieset, ideaal voor ML |
| ESP32-S3-WROOM-2-N16R8V (EOL) | 16MB         | 8MB   | ja                                                                |
| ESP32-S3-WROOM-2-N32R8V (EOL) | 32MB         | 8MB   | ja                                                                |
| ESP32 (WROOM-32)              | 4MB          | Geen  | Niet                                                              |
| ESP32 (WROVER-B)              | 4MB          | 4MB   | Mischien                                                          |
| ESP32 (WROVER-E)              | 16MB         | 8MB   | Ja                                                                |
| ESP32-CAM                     | 4MB          | 4MB   | Ja maar hierbij opletten hoe goed het draaid                      |
| ESP32-C3 & ESP32-C3           | 4MB          | geen  | Niet bruikbaar                                                    |
| ESP32-H2                      | 4MB          | geen  | Ook niet bruikbaar                                                |



---

## Frame

Beetje een notitie van wat belangrijk is voor het frame dat we gaan 3D printen

Natuurlijk dat we alle onderdelen er goed op kunnen verwerken. Maar ook dat het goedkoop ge3D print kan worden.
Hierdoor had ik in gedachten om het mogelijk te maken dat we het zo maken dat we met 3 wielen het wagentje magen.
Zo hoeft er een minder groot frame ge 3D print te worden, Hebben we een wiel minder nodig en kan er nog steeds met de 2 achterste wielen gestuurd worden.

## Motor

Voor de motor hebben we een *TB6612 H-bridge* nodig, dit om twee 5V DC motoren te besturen.
- In het lab hebben we TT 130 motors die we kunnen gebruiken voor de wielen

## Sensoren

We hebben nodig voor de robot:

-Een Camera
We moeten dus kijken dat we die kunnen gebruiken met FOMO (Zoals hierboven beschreven)
Waardoor hij de juiste pins moet hebben.

-Een afstandsensor
(Mogelijk een hele goedkope 90 Grade lidar ofzo??? Laten we hierover in gesprek gaan @shad)


## (tijdelijk)
extra benodigdheden:

-Batterij
Natuurlijk genoeg voor een sessie. Mogelijk kunnen we heroplaadbare AA's gebruiken ofzo, Laten we het hier samen nog over hebben @shad :)

We moeten bespreken met de PO over hoe lang de robot op batterij moet kunnen draaien, want al wil je op 1 dag meerdere sessies houden, Moet hij of het lang vol kunnen houden of dus mogelijk dat je de batterij kan wisselen. Er zijn genoeg mogelijkheden die we kunnen onderzoeken

-Wielen
