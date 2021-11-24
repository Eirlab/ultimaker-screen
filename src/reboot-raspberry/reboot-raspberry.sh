#!/bin/bash

# if the script is run on a Raspberry Pi, reboot
if [ -f /sys/firmware/devicetree/base/model ]; then
  if grep -q "Raspberry Pi" /sys/firmware/devicetree/base/model; then
    sudo reboot now
  else
    exit 1
  fi
else
  exit 1
fi

