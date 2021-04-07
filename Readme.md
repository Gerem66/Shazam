# Shazam for Gnome

## Description
Shazam for Gnome 3.8
> Tested on Gnome 3.8 environment on ArchLinux  
> Tested on python 3.9.2

## How to install
- Requirements
    * [Python 3.9.X](https://www.python.org/)
    * [Pip3](https://pypi.org/project/pip/)
- Install python packages
    * [PyAudio](https://pypi.org/project/PyAudio/) `pip install pyaudio`
    * [ShazamAPI](https://pypi.org/project/ShazamAPI/) `pip install ShazamAPI`
- Download extension from git
    * `git clone https://github.com/Gerem66/Shazam.git ~/.local/share/gnome-shell/extensions/shazam@gerem`

## How to remove
* `rm -R ~/.local/share/gnome-shell/extensions/shazam@gerem`
* `pip uninstall pyaudio`
* `pip uninstall ShazamAPI`

## Todo
- [ ] Save settings (default switches / timer)
- [ ] Save history
- [ ] Publish the app
<!--
### Interface
- [x] Faire une interface
- [x] Switch pour activer / désavtiver l'auto shazam
- [x] Historique (date + titre + lien shazam) + "Supprimer l'historique"
### Features
- [x] Slider pour modifier la fréquences des scans
- [x] Récupérer et afficher le lien Shazam
- [x] Switch pour l'autoclipboard
- [x] Ajouter un scan pour une unique musique
- [x] Auto copy on clipboard
### System
- [ ] Sauvegarder les paramètres (switchs par défaut / timer)
- [ ] Sauvegarder l'historique
- [x] Optimiser la vitesse de détection et les perfs (async)
- [x] Fenêtre de confirmation pour supprimer l'historique
- [x] Enlever la première notification vide
- [x] Ne pas enregistrer les même sons consécutifs
- [x] Lire le contenu des fichiers depuis js
- [x] Supprimer les fichiers à la fin de l'utilisation
- [x] Afficher un msg si aucun son trouvé pr le "single shazam"
### Finish
- [ ] Publier l'app
-->

## Links - Thanks to
* DialogBox / History [Gnome shell extension clipboard indicator](https://github.com/Tudmotu/gnome-shell-extension-clipboard-indicator)
* SliderBar [Gnome shell extension night light slider](https://codeberg.org/kiyui/gnome-shell-night-light-slider-extension)
