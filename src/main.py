#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import sys
from time import time, sleep
from functions import GnomeShazam, Recorder

currentPath = '/'.join(sys.argv[0].split('/')[:-1])

# Settings

RECORD_LENGTH = 5
LOOP_LENGTH = 10

##########

def AddValue(value):
    file = open(currentPath + '/musics.txt', 'a')
    file.write(value + "\n")
    file.close()
def CheckHealth():
    state = None
    if os.path.exists(currentPath + '/state'):
        file = open(currentPath + '/state', 'r')
        lines = file.readlines()
        state = lines[0]
        file.close()
    return state == 'alive'

def Loop():
    t = time()
    Alive = True
    while Alive:
        rec = Recorder(currentPath + '/record.wav', RECORD_LENGTH, True)
        sha = GnomeShazam(currentPath + '/record.wav', True)
        son = sha.Recognize()
        rec.Clear()
        if son != None: AddValue(son)

        while (time() - t < LOOP_LENGTH): sleep(.5) # Wait for next loop
        Alive = CheckHealth()                       # Check state
        t = time()                                  # Refresh timer
    if os.path.exists(currentPath + '/state'):
        os.remove(currentPath + '/state')
    if os.path.exists(currentPath + '/musics.txt'):
        os.remove(currentPath + '/musics.txt')

def Start():
    file = open(currentPath + '/state', 'w')
    file.write("alive")
    file.close()
    Loop()

def Stop():
    file = open(currentPath + '/state', 'w')
    file.write("dead")
    file.close()

def Get():
    file = open(currentPath + '/musics.txt', 'r')
    lines = file.readlines()
    prelast = max(0, len(lines) - 2)
    print(lines[prelast])

if len(sys.argv) == 2:
    if sys.argv[1] == 'get': Get()
    elif sys.argv[1] == 'start': Start()
    elif sys.argv[1] == 'stop': Stop()