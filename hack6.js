var aimbotMain = {};

function aimbot() {
    this.radaron = true;
    this.fastbot = false;
    this.enabled = true;		// if the aimbot is enabled
    this.shouldlock = false;	// if the aimbot should aim on this frame
    this.lock = undefined;		// the player the aimbot is locking on to
    this.autoshoot = false;		// if pistol autoshooting is enabled
    this.amountofplayers = 0;
    this.settings = {
        radarsort: 0,
        sortmode: 0,
        togglemode: 0,
        autoshootenabled: false,
    };
    this.terminal = {
        panel: undefined,
        maxMessages: 50,
        lastMessage: 0,
        thisMessage: 0
    };
}


aimbot.prototype.init = function () {
    this.terminal.panel = document.createElement('div');
    this.terminal.panel.setAttribute("style", "margin: auto;background: rgba(0,0,0,0.5);position: absolute;width: 24%;height:10%;top:90%;left:38%;overflow:scroll;overflow-x: hidden;");
    this.terminal.panel.setAttribute("id", "aimbotpanel");
    document.body.appendChild(this.terminal.panel);
    window.addEventListener("keydown", function (e) {
        aimbotMain.keyboardCallbackDown(e);
    }, false);
    window.addEventListener("keyup", function (e) {
        aimbotMain.keyboardCallbackUp(e);
    }, false);
    window.addEventListener("mousedown", function (e) {
        aimbotMain.mouseCallbackDown(e);
    }, false);
    window.addEventListener("mouseup", function (e) {
        aimbotMain.mouseCallbackUp(e);
    }, false);
    this.showMessage("#e1f7d5", "motd");
    console.log("loaded");
};


aimbot.prototype.keyboardCallbackDown = function (e) {
    if (e.keyCode == "90") {
        if (this.settings.togglemode == 0) {
            if (this.shouldlock == true) {
                this.shouldlock = false;
            } else {
                this.shouldlock = true;
                this.lock = this.findPlayer();
            }
        } else if (this.settings.togglemode == 1) {
            if (this.shouldlock == true) {
                return;
            }
            this.shouldlock = true;
            this.lock = this.findPlayer();
        }
    }
    //fastbot ctrl
    if (e.keyCode == "76") {
        if (this.fastbot == false) {
            this.fastbot = true;
            this.showMessage("#c9c9ff", "Zoom : On");
        } else {
            this.fastbot = false;
            this.showMessage("#c9c9ff", "Zoom : Off");
        }
    }
    if (e.keyCode == "72") {
        if (this.settings.sortmode == 0) {
            this.settings.sortmode = 1;
            this.showMessage("#ffbdbd", "Sorting mode: Nearest Pitch/Yaw");
        } else if (this.settings.sortmode == 1) {
            this.settings.sortmode = 0;
            this.showMessage("#ffbdbd", "Sorting mode: Nearest Player");
        }
    }
    if (e.keyCode == "74") {
        if (this.settings.togglemode == 0) {
            this.settings.togglemode = 1;
            this.showMessage("#c9c9ff", "Enable mode: Hold");
        } else if (this.settings.togglemode == 1) {
            this.settings.togglemode = 0;
            this.showMessage("#c9c9ff", "Enable mode: Toggle");
        }
    }
    if (e.keyCode == "75") {
        if (this.settings.autoshootenabled == false) {
            this.settings.autoshootenabled = true;
            this.showMessage("#f1cbff", "Pistol autoshoot: Enabled");
        } else if (this.settings.autoshootenabled == true) {
            this.settings.autoshootenabled = false;
            this.showMessage("#f1cbff", "Pistol autoshoot: Disabled");
        }
    }
    if (e.keyCode == "77") {
        if (this.radaron == true) {
            this.radaron = false;
            console.log("radaron false through ctrl");
        } else {
            this.radaron = true;
            console.log("radaron true through ctrl");
        }
    }
    if (e.keyCode == "78") {
        if (this.radarsort == 0) {
            this.radarsort = 1
        } else {
            this.radarsort = 0
        }
    }
};


aimbot.prototype.keyboardCallbackUp = function (e) {
    if (this.settings.togglemode == 1) {
        if (e.keyCode == "90") {
            this.shouldlock = false;
        }
    } else {

    }
};
aimbot.prototype.mouseCallbackDown = function (e) {
    if (e.button == 0) {
        if (aimbotMain.fastbot == true) {
            this.shouldlock = true;
            this.lock = this.findPlayer();
            this.showMessage("#e1f7d5", "autolocked");
        }
        this.autoshoot = true;
    }
};
aimbot.prototype.mouseCallbackUp = function (e) {
    if (e.button == 0) {
        if (aimbotMain.fastbot == true) {
            this.shouldlock = false;
        }
        this.autoshoot = false;
    }
};
aimbot.prototype.getDistLength = function (ini, targ) {
    dx = targ.x - ini.x;
    dy = targ.y - ini.y;
    dz = targ.z - ini.z;
    return new BABYLON.Vector3(dx, dy, dz).length();
};
aimbot.prototype.getAngleDiff = function (ini, targ) {
    res = {};
    dx = targ.x - ini.x;
    dy = targ.y - ini.y;
    dz = targ.z - ini.z;
    res.yaw = BABYLON.Angle.BetweenTwoPoints(
        new BABYLON.Vector2(0, 0),
        new BABYLON.Vector2(dz, dx)
    ).radians();
    res.pitch = Math.abs(
        BABYLON.Angle.BetweenTwoPoints(
            new BABYLON.Vector2(0, 0),
            new BABYLON.Vector2(
                Math.sqrt(
                    (dz ** 2) + (dx ** 2)
                ),
                -dy
            )
        ).radians()
    );
    if (res.pitch > 1.5) {
        res.pitch = (Math.PI * 2 - res.pitch) * -1;
    }
    return res;
};

aimbot.prototype.findPlayer = function () {
    console.log("run findplayer");
    if (this.radaron == true) {
        this.radar();
    }
    if (window.players == undefined) {
        return;
    }
    var numPlayers = window.players.length;
    this.amountofplayers = numPlayers;
    var angdist = 0;
    var posdist = 0;
    var snapply = undefined;
    for (var i = 0; i < numPlayers; i++) {
        if (window.players[i] == undefined) {
            continue;
        }
        if (window.players[i].id == window.me.id) {
            continue;
        }
        if (window.players[i].name == "Pinecone") {
            continue;
        }
        if (window.players[i].isDead()) {
            continue;
        }
        if (window.gameType == 1) {
            if (window.players[i].team == window.me.team) {
                continue;
            }
        }
        if (this.settings.sortmode == 0) {
            if (posdist == 0) {
                posdist = this.getDistLength(window.me, window.players[i]);
                snapply = window.players[i];
            } else if (this.getDistLength(window.me, window.players[i]) < posdist) {
                posdist = this.getDistLength(window.me, window.players[i]);
                snapply = window.players[i];
            }
        } else if (this.settings.sortmode == 1) {
            angs = this.getAngleDiff(window.me, window.players[i]);
            compangs = {};
            compangs.pitch = Math.abs(angs.pitch - window.me.pitch);
            compangs.yaw = Math.abs(angs.yaw - window.me.viewYaw);
            // the only 3 lines of code in this that i'm proud of
            if (compangs.yaw > Math.PI) {
                compangs.yaw = (Math.PI * 2) - compangs.yaw;
            }
            if (angdist == 0) {
                angdist = Math.sqrt(compangs.pitch ** 2 + compangs.yaw ** 2);
                snapply = window.players[i];
            } else if ((Math.sqrt(compangs.pitch ** 2 + compangs.yaw ** 2)) < angdist) {
                angdist = Math.sqrt(compangs.pitch ** 2 + compangs.yaw ** 2);
                snapply = window.players[i];
            }
        }

    }

    if (snapply == undefined) {
        return undefined;
    } else {
        return snapply.id;
    }
};

aimbot.prototype.radar = function () {
    var numPlayers = this.amountofplayers;
    for (var i = 0; i < numPlayers; i++) {
        lockedplayer = "null";
        distance = 0;
        if (window.players[i] == undefined) {
            continue;
        }
        if (window.players[i].id == window.me.id) {
            continue;
        }
        if (window.players[i].name == "Pinecone") {
            continue;
        }
        if (window.players[i].isDead()) {
            continue;
        }
        if (window.gameType == 1) {
            if (window.players[i].team == window.me.team) {
                continue;
            }
        }
        if (this.settings.radarsort == 0) {
            if (posdist == 0) {
                posdist = this.getDistLength(window.me, window.players[i]);
                lockedplayer = window.players[i].name;
                distance = this.getDistLength(window.me, window.players[i]);
            } else if (this.getDistLength(window.me, window.players[i]) < posdist) {
                posdist = this.getDistLength(window.me, window.players[i]);
                lockedplayer = window.players[i].name;
                distance = this.getDistLength(window.me, window.players[i]);
            }
        } else if (this.settings.radarsort == 1) {
            angs = this.getAngleDiff(window.me, window.players[i]);
            compangs = {};
            compangs.pitch = Math.abs(angs.pitch - window.me.pitch);
            compangs.yaw = Math.abs(angs.yaw - window.me.viewYaw);
            // the only 3 lines of code in this that i'm proud of
            if (compangs.yaw > Math.PI) {
                compangs.yaw = (Math.PI * 2) - compangs.yaw;
            }
            if (angdist == 0) {
                angdist = Math.sqrt(compangs.pitch ** 2 + compangs.yaw ** 2);
                lockedplayer = window.players[i].name;
                distance = this.getDistLength(window.me, window.players[i]);
            } else if ((Math.sqrt(compangs.pitch ** 2 + compangs.yaw ** 2)) < angdist) {
                angdist = Math.sqrt(compangs.pitch ** 2 + compangs.yaw ** 2);
                lockedplayer = window.players[i].name;
                distance = this.getDistLength(window.me, window.players[i]);
            }
        }
        this.showMessage("#ffbdbd", lockedplayer + " is: " + distance + " units away");
    }

};

aimbot.prototype.snap = function () {
    if (aimbotMain.fastbot == true) {
        this.lock = this.findPlayer();
    }
    if (this.shouldlock == false || this.lock == undefined || window.players[this.lock] == undefined) {
        return;
    }
    if (window.players[this.lock].isDead() || window.players[this.lock] == undefined) {
        this.lock = this.findPlayer();
        if (this.lock == undefined) {
            //this.showMessage("#f1cbff","The currently locked player died, but another one could not be resolved!");
            return;
        }
        //this.showMessage("#f1cbff","The currently locked player died, but another one was found.");
    }
    eyeangs = this.getAngleDiff(window.me, window.players[this.lock]);
    window.me.viewYaw = eyeangs.yaw;
    window.me.moveYaw = eyeangs.yaw;
    if (eyeangs.pitch > 1.5) {
        eyeangs.pitch = (Math.PI * 2 - eyeangs.pitch) * -1;
    }
    window.me.pitch = eyeangs.pitch;
    if ((this.autoshoot == true) && (this.settings.autoshootenabled == true)) {
        if (window.me.weapon.name == "Cluck 9mm") {
            window.me.fire();
        }
    }
};
aimbot.prototype.doAutoShoot = function () {
    if ((this.autoshoot == true) && (this.settings.autoshootenabled == true)) {
        if (window.me.weapon.name == "Cluck 9mm") {
            window.me.fire();
        }
    }
};
aimbot.prototype.showMessage = function (color, message) {
    newMessage = document.createElement('p');
    newMessage.setAttribute("style", "color: " + color + ";font-size:1.5vh;");
    newMessage.setAttribute("id", "aimbotmessage-" + this.terminal.thisMessage);
    newMessage.innerHTML = message;
    panel = document.getElementById("aimbotpanel");
    panel.appendChild(newMessage);
    this.terminal.thisMessage++;
    if (this.terminal.thisMessage > this.terminal.maxMessages) {
        document.getElementById("aimbotmessage-" + this.terminal.lastMessage).remove();
        this.terminal.lastMessage++;
    }
    panel.scrollTop = panel.scrollHeight;
};

var readyStateCheckInterval = setInterval(function () {
    if (document.readyState === "complete") {
        clearInterval(readyStateCheckInterval);
        aimbotMain = new aimbot();
        aimbotMain.init();
        setInterval(function () {
            aimbotMain.snap();
            aimbotMain.doAutoShoot();
            aimbotMain.findPlayer();
        }, 16);
    }
}, 10);