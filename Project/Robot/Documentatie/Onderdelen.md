# Onderdelen Robot
---
### Inleiding
Voor deze robot hebben we gekozen voor open en makkelijk te gebruiken onderdelen. Ook kan je het frame 3D printen. Hieronder staat verwerkt welke onderdelen we gebruiken.

# TODO/WORKINPROGRESS
Wat hieronder staat is nog allemaal work in progress!!!

## Controller
Voor de microcontroller van de robot zijn er een paar mogelijke opties

De ESP32-S3 is een iets krachtigere ESP32, Hierdoor heeft deze net iets meer storage waardoor je hiermee wel AI modellen kan laden. andere opties zouden zijn de ESP-CAM of ESP-EYE. Waarvan bij de Eye devboard er ook bij staat genoteerd dat deze face recognition heeft. 

Wat belangrijk is dat de gene die we kunnen gebruiken met AI functionaliteit moet PSRAM hebben. Dit is iets wat niet elke ESP heeft. Deze kan oplopen tot ongeveer 16MB. Op de S3 zit 4MB. Wat voor een kleine Computervision model mogelijk genoeg is. Maar dit moet wel eerst getest worden. En niet alleen of het kan maar ook de performance. want anders moet er gekeken worden of we er eentje kunnen halen die iets meer PSRAM.

Hier is mogelijk een library die we kunnen gebruiken om CV op onze ESP te zetten:
https://github.com/becem-gharbi/esp-computer-vision

FOMO:https://docs.edgeimpulse.com/studio/projects/learning-blocks/blocks/object-detection/fomo

ESP-boards:https://docs.edgeimpulse.com/hardware/boards/espressif-esp32#using-with-other-esp32-boards

---

## Frame

Beetje een notitie van wat belangrijk is voor het frame dat we gaan 3D printen

Natuurlijk dat we alle onderdelen er goed op kunnen verwerken. Maar ook dat het goedkoop ge3D print kan worden.
Hierdoor had ik in gedachten om het mogelijk te maken dat we het zo maken dat we met 3 wielen het wagentje magen.
Zo hoeft er een minder groot frame ge 3D print te worden, Hebben we een wiel minder nodig en kan er nog steeds met de 2 achterste wielen gestuurd worden.

## Motor

Voor de motor hebben we een *TB6612 H-bridge* nodig, dit om twee 5V DC motoren te besturen.

## Sensoren

We hebben nodig voor de robot:
-Een Camera
-Een afstandsensor


## (tijdelijk)
extra benodigdheden:
-Batterij
-Wielen
