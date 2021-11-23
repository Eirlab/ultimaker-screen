# Monitoring application for Ultimaker S series

Since September 2021, Eirlab Community has 2 Ultimaker S series
printers. These printers are delivered with an API developed by
Ultimaker to get different information about the prints, the status
of the printer etc.

As a result, Antoine and Sébastien have developed an application
to track the printing in progress at Eirlab, this application is
licensed under [GPL-3.0
License](https://github.com/Eirlab/ultimaker-screen/blob/main/LICENSE)
on this repository and is developed in Javascript to be displayed on
a browser.

The application is currently used on one of Eirlab's TVs allowing
us to see the status of the printers from the open space.

[![Television](https://raw.githubusercontent.com/Eirlab/ultimaker-screen/main/docs/tv.jpg)](https://raw.githubusercontent.com/Eirlab/ultimaker-screen/main/docs/tv.jpg)

## Quick setup

```bash
git clone https://github.com/Eirlab/ultimaker-screen
cd ultimaker-screen
npm install
npm run start
```

This application runs on the following environment:
- Raspberry Pi 3B+ (16Gb, [this OS](https://downloads.raspberrypi.org/raspios_armhf/images/raspios_armhf-2021-11-08/2021-10-30-raspios-bullseye-armhf.zip))
- npm 5.8.0
- node 10.21.0
- nodejs 10.19.0

## Usage

To edit the configuration, open the `index.js` file in
`src/` folder. You should edit:
- `API.HOST_URL` [here](https://github.com/Eirlab/ultimaker-screen/blob/498cfca2f0deb80dfaaec7fab34f1031c31e57e3/src/index.js#L9) with the ip of your cluster of Ultimaker
  printers
- The printers instantiated [here](https://github.com/Eirlab/ultimaker-screen/blob/498cfca2f0deb80dfaaec7fab34f1031c31e57e3/src/index.js#L347)
- The timers on TV instantiation [here](https://github.com/Eirlab/ultimaker-screen/blob/498cfca2f0deb80dfaaec7fab34f1031c31e57e3/src/index.js#L350).

To run the application, run the following commands:
```bash
npm install
npm run start
```

## Result

| [![Screenshot](https://raw.githubusercontent.com/Eirlab/ultimaker-screen/main/docs/specific.png)](https://raw.githubusercontent.com/Eirlab/ultimaker-screen/main/docs/specific.png) | [![Screenshot](https://raw.githubusercontent.com/Eirlab/ultimaker-screen/main/docs/general.png)](https://raw.githubusercontent.com/Eirlab/ultimaker-screen/main/docs/general.png) |
| --------------------- | ------------------ |
| Screenshot Individial | Screenshot General |

## Contribution

- ✨ New features and ideas for features of this screen are welcome! ⚠ Access to the 3D printers API can only be done via the eirlabIoT network.
- 🐛 Although this is v2 of the implementation, the application surely contains errors in the console, if you find any, please report them in the issues and suggest a fix if you know of one.

