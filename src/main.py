#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import sys
from time import time, sleep
from functions import GnomeShazam, Recorder

lastMusic = ''
LOOP_LENGTH = 10
currentPath = '/'.join(sys.argv[0].split('/')[:-1])

def AddValue(value):
    global currentPath
    if os.path.exists(currentPath + '/music'):
        file = open(currentPath + '/music', 'a')
        file.write(value + "\n")
        file.close()

def CheckHealth():
    global LOOP_LENGTH, currentPath
    state = False
    if os.path.exists(currentPath + '/state'):
        state = True
        with open(currentPath + '/state', 'r') as f:
            LOOP_LENGTH = int(f.readlines()[0])
        '''file = open(currentPath + '/state', 'r')
        lines = file.readlines()
        state = lines[0][:-1] == 'alive'
        LOOP_LENGTH = int(lines[1])
        file.close()'''
    return state

def Loop():
    global lastMusic, LOOP_LENGTH, currentPath

    t = time()
    Alive = CheckHealth()
    while Alive:
        RECORD_LENGTH = min(int(LOOP_LENGTH / 2), 10)
        rec = Recorder(currentPath + '/record.wav', RECORD_LENGTH, True)
        sha = GnomeShazam(currentPath + '/record.wav')
        son = sha.Recognize()
        rec.Clear()
        if son != None and son != lastMusic:
            AddValue(son)
            lastMusic = son

        if LOOP_LENGTH == 9: break
        while (time() - t < LOOP_LENGTH): sleep(.5) # Wait for next loop
        Alive = CheckHealth()                       # Check state
        t = time()                                  # Refresh timer

if len(sys.argv) == 2:
    if sys.argv[1] == 'start': Loop()