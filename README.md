# flapper-news 

Ik heb een [tutorial over Mean](https://thinkster.io/mean-stack-tutorial/) gevolgd, namelijk 
Deze tutorial maakt gebruik van AngularJS, MongoDb, NodeJS en Express.js (npm, bower, ...) en kunnen we als test gebruiken om te prutsen.

Een live versie staat op poort 3000 op van mijn pi [link](81.164.88.90:3000)

# Fork

Het project is opgebouwd zodat iedereen er makkelijk aan kan bijdragen dus hieronder een paar stapkes om het op uwe pi draaiende te krijgen maar bovenal op je pc om mee te proggen! 

## Getting started

### NodeJS

Eerst een update en een ARM-versie van NodeJS
```
sudo apt-get update
sudo apt-get upgrade
wget http://node-arm.herokuapp.com/node_latest_armhf.deb 
sudo dpkg -i node_latest_armhf.deb
```

Je kan de installatie checken met 
```
node -v
```

### MongoDB

Wat libs die we nodig hebben en git clone van ongecompileerde mongo
```
sudo apt-get install build-essential libboost-filesystem-dev libboost-program-options-dev libboost-system-dev libboost-thread-dev scons libboost-all-dev python-pymongo git
cd ~
git clone https://github.com/skrabban/mongo-nonx86
```

Houd u vast, het commando hieronder duurde bij mij bijna een uur
```
cd mongo-nonx86
sudo scons
```

Ook bij deze kan je beter even gaan wandelen
```
sudo scons --prefix=/opt/mongo install
```

We zijn er bijna, nog een paar permissies, mappen aanmaken en path in orde zetten
```
sudo adduser --firstuid 100 --ingroup nogroup --shell /etc/false --disabled-password --gecos "" --no-create-home mongodb
sudo mkdir /var/log/mongodb/
sudo chown mongodb:nogroup /var/log/mongodb/
sudo mkdir /var/lib/mongodb
sudo chown mongodb:nogroup /var/lib/mongodb
sudo cp debian/init.d /etc/init.d/mongod
sudo cp debian/mongodb.conf /etc/
sudo ln -s /opt/mongo/bin/mongod /usr/bin/mongod
sudo chmod u+x /etc/init.d/mongod
sudo update-rc.d mongod defaults
```

Het grote moment is aangebroken
```
sudo /etc/init.d/mongod start
```

Testen
```
mongo
```

Laat mongo maar draaien want het is tijd voor het eigelijke project

### Clone project

Je hebt natturlijk het project nodig
```
git clone https://github.com/TamoMaez/flapper-news.git
```

Nu gaan we aan Node zeggen dat hij alle dependencies moet installeren die bij het project horen
```
cd flapper-news/ 
npm install
```

Om de server te starten geef je volgend commando in
```
npm start
```

Et voila op <jou_rpi_ip_addr>:3000 zie je de indexpagina van Flapper news
