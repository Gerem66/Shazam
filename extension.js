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

/* exported init */

const GETTEXT_DOMAIN = 'my-indicator-extension';

const { GObject, St } = imports.gi;

const Gettext = imports.gettext.domain(GETTEXT_DOMAIN);
const _ = Gettext.gettext;

const ExtensionUtils = imports.misc.extensionUtils;
const Main = imports.ui.main;
const Mainloop = imports.mainloop;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Slider = imports.ui.slider;
const GLib = imports.gi.GLib;
const Clipboard = St.Clipboard.get_default();
const CLIPBOARD_TYPE = St.ClipboardType.CLIPBOARD;

const currentPath = GLib.get_home_dir() + '/.local/share/gnome-shell/extensions/shazam@gerem';

const Indicator = GObject.registerClass(
class Indicator extends PanelMenu.Button {

    _init() {
        super._init(0.0, _('My Shiny Indicator'));

        this.timer = 10;
        this._value = -1;
        this.lastsong = "";
        this.autoclipboard = true;
        this._single = false;
        this._shazaming = false;
        this._build();
    }

    _build() {
        // Box
        let box = new St.BoxLayout({ style_class: 'panel-status-menu-box' });
        box.add_child(new St.Icon({
            icon_name: 'banshee-panel',
            style_class: 'system-status-icon',
        }));
        box.add_child(PopupMenu.arrowIcon(St.Side.BOTTOM));
        this.add_child(box);

        // Button
        //let clearMenuItem = new PopupMenu.PopupMenuItem(_('Clear history'));
        //this.menu.addMenuItem(clearMenuItem);
        //clearMenuItem.connect('activate', Lang.bind(this, this._removeAll));

        // Separator
        //this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        let autoclipboard = new PopupMenu.PopupSwitchMenuItem(_("Auto copy in clipboard"), this.autoclipboard, { reactive: true });
        autoclipboard.connect('toggled', this._AutoClipboard_toggle.bind(this));
        this.menu.addMenuItem(autoclipboard);

        let autoShazam = new PopupMenu.PopupSwitchMenuItem(_("Auto shazam"), false, { reactive: true });
        autoShazam.connect('toggled', this._AutoShazam_toggle.bind(this));
        this.menu.addMenuItem(autoShazam);

        // Slider
        let sliderBox = new PopupMenu.PopupBaseMenuItem({ activate: false });
        this.slider = new Slider.Slider(0);
        this.slider_detail = new St.Label({ text: this.timer + 's' });
        this.menu.addMenuItem(sliderBox);
        sliderBox.add(this.slider_detail);
        sliderBox.add_child(this.slider);

        // Separator
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        let singleShazam = new PopupMenu.PopupMenuItem(_('Single shazam'));
        singleShazam.connect('activate', this._SingleShazam.bind(this));
        this.menu.addMenuItem(singleShazam);

        //let settingsMenuItem = new PopupMenu.PopupMenuItem(_('Settings'));
        //this.menu.addMenuItem(settingsMenuItem);
        //settingsMenuItem.connect('activate', Lang.bind(this, this._openSettings));

        this._LoopFunction(this._sync, 1);
    }

    _sync() {
        // Slider change event
        if (this._value != this.slider.value) {
            this._value = this.slider.value;
            this._SliderChange(parseInt(this._value * 590 + 10));
        }
        // Last artist change event
        try {
            let file = GLib.file_get_contents(currentPath + '/src/music');
            let state = file[0];

            if (state) {
                let musics = String(file[1]).split('\n');
                let index = Math.max(0, musics.length - 2);
                if (musics[index] != '' && this.lastsong != musics[index]) {
                    this._SongChanged(musics[index]);
                }
            }
        } catch (err) {
            // No file
        }
    }

    _StartShazam() {
        this._shazaming = true;
        let content = "alive\n" + (this._single ? '9' : this.timer);
        GLib.file_set_contents(currentPath + '/src/state', content, content.length);
        GLib.file_set_contents(currentPath + '/src/music', "", 0);

        this._Command('python ' + currentPath + '/src/main.py start', false);
    }

    _StopShazam() {
        this._shazaming = false;
        if (this._single) this._single = false;
        if (this.lastsong != '') {
            this.lastsong = '';
        } else {
            Main.notify(_('No music found :('));
        }
        this._FileDelete(currentPath + '/src/state');
        this._FileDelete(currentPath + '/src/music');
    }
    
    _SingleShazam() {
        this._single = true;
        this._StartShazam();
        Mainloop.timeout_add_seconds(10, () => {
            if (this._shazaming)
                this._StopShazam();
        });
    }

    // Events //

    _SliderChange(value) {
        this.timer = value;
        this.slider_detail.text = value + 's';
        if (this._FileExists(currentPath + '/src/state')) {
            let content = "alive\n" + value;
            GLib.file_set_contents(currentPath + '/src/state', content, content.length);
        }
    }

    _AutoClipboard_toggle(obj, checked) {
        this.autoclipboard = checked;
    }

    _AutoShazam_toggle(obj, checked) {
        if (checked) this._StartShazam();
        else this._StopShazam();
    }

    _SongChanged(song) {
        this.lastsong = song;
        Main.notify(_('Current music : ' + song));
        if (this.autoclipboard)
            Clipboard.set_text(CLIPBOARD_TYPE, song);
        if (this._single)
            this._StopShazam();
    }

    // Functions //

    _FileExists(filename) {
        let output = false;
        try {
            let file = GLib.file_get_contents(filename);
            output = file[0];
        } catch (err) {}
        return output;
    }

    _FileDelete(filename) {
        if (this._FileExists(filename))
            GLib.unlink(filename);
    }

    _Command(command, sync = true) {
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

    _LoopFunction(func, delay, iteration = -1) {
        if (iteration > 0 || iteration == -1) {
            func.apply(this);
            Mainloop.timeout_add_seconds(delay, () => {
                this._LoopFunction(func, delay, Math.max(iteration - 1, -1));
            });
        }
    }
});

class Extension {
    constructor(uuid) {
        this._uuid = uuid;

        ExtensionUtils.initTranslations(GETTEXT_DOMAIN);
    }

    enable() {
        this._indicator = new Indicator();
        Main.panel.addToStatusArea(this._uuid, this._indicator);
    }

    disable() {
        this._indicator.destroy();
        this._indicator = null;
    }
}

function init(meta) {
    return new Extension(meta.uuid);
}
