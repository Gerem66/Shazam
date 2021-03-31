/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

const Lang = imports.lang;
const St = imports.gi.St;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const Mainloop = imports.mainloop;
const GLib = imports.gi.GLib;

const Clipboard = St.Clipboard.get_default();
const CLIPBOARD_TYPE = St.ClipboardType.CLIPBOARD;

let lastsong = '';
let state = 0;
var icon_name = "audio-input-microphone-low";
const currentPath = GLib.get_home_dir() + '/.local/share/gnome-shell/extensions/shazam@gerem';

const toggleButton = new Lang.Class({
    Name: "toggleButton",
    Extends: PanelMenu.Button,
        
    _init: function () {
    this.parent(null, "toggleButton");
        
    this.icon = new St.Icon({
        icon_name: "audio-input-microphone-low",
        style_class: "system-status-icon"
    });
    this.actor.add_actor(this.icon);
    this.actor.connect('button-press-event', toggler);    
    }
});

function enable() {
    let panelToggleButton = new toggleButton();
    Main.panel.addToStatusArea("shazam@gerem", panelToggleButton);
    Main.panel.statusArea["shazam@gerem"].icon.icon_name = icon_name;
    Main.panel.statusArea["shazam@gerem"].actor.visible = true;
}

function disable() {
    Main.panel.statusArea["shazam@gerem"].destroy();
    Main.panel.statusArea["shazam@gerem"].actor.visible = false;
}

function init() {
}

function toggler() {
    state = !state;
    if (state == 0) {
        // Stop
        Command('python ' + currentPath + '/src/main.py stop');
        Main.panel.statusArea["shazam@gerem"].icon.icon_name = "audio-input-microphone-low";
    } else {
        // Start
        Command('python ' + currentPath + '/src/main.py start', false);
        LoopFunction(CheckLastArtist, 2);
        Main.panel.statusArea["shazam@gerem"].icon.icon_name = "audio-input-microphone-none-panel";
    }
}

function CheckLastArtist() {
    let res = Command('python ' + currentPath + '/src/main.py get');
    res = res.substring(0, res.length - 2);
    if (res != lastsong) {
        Main.notify(_("Musique actuelle : " + res));
        Clipboard.set_text(CLIPBOARD_TYPE, res);
        lastsong = res;
    }
}

function Command(command, sync = true) {
    let spawn = sync ? GLib.spawn_sync : GLib.spawn_async;
    let [res, out] = spawn(null, command.split(' '), null, GLib.SpawnFlags.SEARCH_PATH, null);

    let ret;
    if(out == null) {
        ret = _("Error executing command.");
    } else {
        ret = out.toString();
    }
    return sync ? ret : null;
}

function LoopFunction(func, delay, iteration = -1) {
    if (state && (iteration > 0 || iteration == -1)) {
        func();
        Mainloop.timeout_add_seconds(delay, () => {
            this.LoopFunction(func, delay, Math.max(iteration - 1, -1));
        });
    }
}