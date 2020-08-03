$(function () {
    new Kenkene();
});

class Kenkene {
    constructor() {
        window.kenkene = this;
        this.viewManager = new ViewManager();
        this.viewIDs = {};
        this.viewIDs.gameSelector = this.viewManager.addView(new GameSelector());
        this.viewIDs.login = this.viewManager.addView(new Login());
        this.viewIDs.dashboard = this.viewManager.addView(new Dashboard());
        this.viewIDs.pay = this.viewManager.addView(new Pay());
        this.viewIDs.get = this.viewManager.addView(new Get());
        this.viewIDs.history = this.viewManager.addView(new History(true));
        this.viewIDs.historyGlobal = this.viewManager.addView(new History(false));
        this.gameID = null;
        this.viewManager.showLoading();
        this.getValues();
    }

    getValues() {
        let that = this;
        $.get("values.php").done(function (data) {
            that.values = data;
            that.viewManager.show(that.viewIDs.gameSelector);
        }).fail(function (err) {
            alert("Błąd ładowania konfiguracji: " + err);
            console.error(err);
            setTimeout(function () {
                that.getValues();
            }, 1000);
        });
    }

    onGameSelected(ID) {
        this.gameID = ID;
        this.viewManager.showLoading();
        this.viewManager.show(this.viewIDs.login);
        this.viewManager.hideLoading();
    }

    onLogin(userID, name) {
        this.userID = userID;
        this.name = name;
        this.viewManager.showLoading();
        this.viewManager.show(this.viewIDs.dashboard);
        this.viewManager.hideLoading();
    }

    processMoney(balance) {
        // if (balance > 1000000) {
        //     return balance / 1000000 + "M";
        // } else {
        return balance / 1000 + "k";
        // }
    }
}

class ViewManager {
    views = [];

    constructor() {
        this.loadingOverlayer = $("#loading_overlayer");
    }

    addView(view) {
        this.views.push(view);
        view.hide();
        return this.views.indexOf(view);
    }

    show(ID) {
        for (let view in this.views) {
            // noinspection JSUnfilteredForInLoop
            this.views[view].hide();
        }
        this.views[ID].show();
    }

    showLoading() {
        this.loadingOverlayer.addClass("shown");
    }

    hideLoading() {
        this.loadingOverlayer.removeClass("shown");
    }
}

class View {
    container;

    constructor(container) {
        this.container = container;
    }

    show() {
        this.container.addClass("shown");
    }

    hide() {
        this.container.removeClass("shown");
    }
}

class GameSelector extends View {
    constructor() {
        super($("#game_selector_container"));
        this.gamesContainer = $(".game_selector_games");
        this.requestGames();
    }

    requestGames() {
        kenkene.viewManager.showLoading();
        let that = this;
        $.get("getGames.php").done(function (data) {
            let out = "";
            for (let x in data) {
                // noinspection JSUnfilteredForInLoop
                out += "<div class=\"game_selector_game\" id=\"game_selector_game" + data[x].ID + "\">Gra#" + data[x].ID + " rozpoczęta " + data[x].dateStarted + "</div>";
            }
            that.gamesContainer.html(out);
            $(".game_selector_game").on("click", function (e) {
                let id = parseInt(e.currentTarget.id.replace("game_selector_game", ""));
                console.log("Game selected", id);
                kenkene.onGameSelected(id);
            });
            kenkene.viewManager.hideLoading();
        }).fail(function (err) {
            alert("Błąd ładowania gier: " + err);
            console.error(err);
            setTimeout(function () {
                that.requestGames();
            }, 1000);
        });
    }
}

class Login extends View {
    constructor() {
        super($("#login_container"));
        this.game = $(".login_game");
        this.button = $(".login_button");
        this.input = $("#login_input");
        let that = this;
        this.button.on("click", function () {
            if (that.input.get(0).reportValidity() && that.input.val().length > 2 && that.input.val().length < 65) {
                that.login();
            }
        })
    }

    show() {
        super.show();
        this.game.text("Gra#" + kenkene.gameID);
    }

    login() {
        let username = this.input.val();
        let that = this;
        kenkene.viewManager.showLoading();
        $.post("login.php", {gameID: kenkene.gameID, name: username}).done(function (data) {
            kenkene.onLogin(data.ID, data.name);
            kenkene.viewManager.hideLoading();
        }).fail(function (err) {
            alert("Błąd ładowania logowania: " + err);
            console.error(err);
            setTimeout(function () {
                that.login();
            }, 1000);
        })
    }
}

class Dashboard extends View {
    constructor() {
        super($("#dashboard_container"));
        this.refreshTaskID = -1;
        this.refreshing = false;
        this.competitors = [];
        this.me = {};
        this.elements = {me: {name: $(".me_name"), balance: $(".me_balance")}, competitors: $(".competitors")};
        this.buttons = {
            pay: $("#pay"),
            get: $("#get"),
            incomeTax: $("#incomeTax"),
            luxuryTax: $("#luxuryTax"),
            start: $("#start"),
            history: $("#history"),
            historyGlobal: $("#history_global")
        };
        let that = this;
        this.buttons.pay.on("click", function () {
            kenkene.viewManager.showLoading();
            kenkene.viewManager.show(kenkene.viewIDs.pay);
        });
        this.buttons.get.on("click", function () {
            kenkene.viewManager.showLoading();
            kenkene.viewManager.show(kenkene.viewIDs.get);
        });
        this.buttons.history.on("click", function () {
            kenkene.viewManager.showLoading();
            kenkene.viewManager.show(kenkene.viewIDs.history);
        });
        this.buttons.historyGlobal.on("click", function () {
            kenkene.viewManager.showLoading();
            kenkene.viewManager.show(kenkene.viewIDs.historyGlobal);
        });
        this.buttons.incomeTax.on("click", function () {
            if (confirm("Czy na pewno stoisz na podatku dochodowym (" + kenkene.processMoney(kenkene.values.INCOME_TAX_MONEY) + ")?")) {
                kenkene.viewManager.showLoading();
                $.post("incomeTax.php", {ID: kenkene.userID}).fail(function (err) {
                    alert("Wystąpił błąd: " + err);
                    console.error(err);
                }).always(function () {
                    kenkene.viewManager.hideLoading();
                    that.refresh();
                })
            }
        });
        this.buttons.luxuryTax.on("click", function () {
            if (confirm("Czy na pewno stoisz na podatku luksusowym (" + kenkene.processMoney(kenkene.values.LUXURY_TAX_MONEY) + ")?")) {
                kenkene.viewManager.showLoading();
                $.post("luxuryTax.php", {ID: kenkene.userID}).done(function (data) {
                    if (data.success !== true) {
                        if (data.success === 3) alert("Nie masz wystarczająco pieniędzy!");
                        else alert("Coś poszło nie tak. (" + data.success + ")");
                    }
                }).fail(function (err) {
                    alert("Wystąpił błąd: " + err);
                    console.error(err);
                }).always(function () {
                    kenkene.viewManager.hideLoading();
                    that.refresh();
                })
            }
        });
        this.buttons.start.on("click", function () {
            if (confirm("Czy na pewno przeszedłeś przez start (" + kenkene.processMoney(kenkene.values.START_MONEY) + ")?")) {
                kenkene.viewManager.showLoading();
                $.post("start.php", {ID: kenkene.userID}).fail(function (err) {
                    alert("Wystąpił błąd: " + err);
                    console.error(err);
                }).always(function () {
                    kenkene.viewManager.hideLoading();
                    that.refresh();
                })
            }
        });

    }

    show() {
        super.show();
        let that = this;
        this.refresh();
        this.refreshTaskID = setInterval(function () {
            that.refresh();
        }, 500);
    }

    hide() {
        super.hide();
        clearInterval(this.refreshTaskID);
        this.refreshTaskID = -1;
        this.refreshing = false;
    }

    refresh() {
        if (!this.refreshing) {
            this.refreshing = true;
            let that = this;
            $.post("getPlayers.php", {gameID: kenkene.gameID}).done(function (data) {
                that.competitors = [];
                for (let x in data) {
                    // noinspection JSUnfilteredForInLoop
                    if (data[x].ID === kenkene.userID) {
                        // noinspection JSUnfilteredForInLoop
                        that.me = data[x];
                    } else {
                        // noinspection JSUnfilteredForInLoop
                        that.competitors.push(data[x]);
                    }
                }
                that.updateView();
            }).fail(function (err) {
                alert("Błąd ładowania informacji: " + err);
                console.error(err);
            }).always(function () {
                that.refreshing = false;
            })
        }
    }

    updateView() {
        //Update me view
        this.elements.me.name.text(this.me.name);
        this.elements.me.balance.text(kenkene.processMoney(this.me.balance));
        //Update competitors view
        let out = "";
        for (let x in this.competitors) {
            // noinspection JSUnfilteredForInLoop
            out += "<div class=\"competitor\">\n" +
                "                <div class=\"competitor_name\">" + this.competitors[x].name + "</div>\n" +
                "                <div class=\"competitor_balance\">" + kenkene.processMoney(this.competitors[x].balance) + "</div>\n" +
                "            </div>"
        }
        this.elements.competitors.html(out);
    }
}

class Pay extends View {
    constructor() {
        super($("#pay_container"));
        this.recipients = [];
        this.elements = {};
        this.elements.recipients = $(".recipients");
        this.elements.back = $("#pay_back");
        this.elements.execute = $("#pay_execute");
        this.elements.amount = $("#pay_amount");
        this.descriptions = [["Zakup posesji", "Spłata zastawu", "Inne"], ["Opłata za pobyt", "Opłata za przejazd", "Inne"]];
        this.description = "Inne";
        this.descriptionSet = 0;
        let that = this;

        this.elements.back.on("click", function () {
            kenkene.viewManager.showLoading();
            kenkene.viewManager.show(kenkene.viewIDs.dashboard);
            kenkene.viewManager.hideLoading();
        });
        this.elements.execute.on("click", function () {
            // noinspection EqualityComparisonWithCoercionJS
            if (that.elements.amount.val() == 0) return;
            let address;
            let data;
            if (that.selectedRecipient === -1) {
                address = "buy.php";
                data = {ID: kenkene.userID, value: that.elements.amount.val() * 1000, description: that.description}
            } else {
                address = "pay.php";
                data = {
                    fromID: kenkene.userID,
                    toID: that.selectedRecipient,
                    value: that.elements.amount.val() * 1000,
                    description: that.description
                }
            }
            $.post(address, data).done(function (data) {
                if (data.success !== true) {
                    if (data.success === 3) alert("Nie masz wystarczająco pieniędzy!");
                } else
                    kenkene.viewManager.show(kenkene.viewIDs.dashboard);
            }).fail(function (err) {
                alert("Wystąpił błąd: " + err);
                console.error(err);
            }).always(function () {
                kenkene.viewManager.hideLoading();
            });
            kenkene.viewManager.showLoading();
        });
        this.selectedRecipient = -1;
    }

    show() {
        super.show();
        kenkene.viewManager.showLoading();
        this.descriptionSet = -1;
        this.elements.amount.val("");
        this.getRecipients();
    }

    getRecipients() {
        let that = this;
        $.post("getPlayers.php", {gameID: kenkene.gameID}).done(function (data) {
            that.recipients = [];
            for (let x in data) {
                // noinspection JSUnfilteredForInLoop
                if (data[x].ID !== kenkene.userID) {
                    // noinspection JSUnfilteredForInLoop
                    that.recipients.push(data[x]);
                }
            }
            //Update recipients
            that.selectRecipient(-1);
            kenkene.viewManager.hideLoading();
        }).fail(function (err) {
            alert("Błąd ładowania przeciwników: " + err);
            console.error(err);
        }).always(function () {
            that.refreshing = false;
        })
    }

    selectRecipient(ID) {
        let that = this;
        this.selectedRecipient = ID;
        let out = "<div class=\"recipient" + (this.selectedRecipient === -1 ? " selected" : "") + "\" id=\"recipientbank\">&lt;Bank&gt;</div>";
        for (let x in this.recipients) {
            // noinspection JSUnfilteredForInLoop
            out += "<div class=\"recipient" + (this.selectedRecipient === this.recipients[x].ID ? " selected" : "") + "\" id=\"recipient" + this.recipients[x].ID + "\">" + this.recipients[x].name + "</div>";
        }
        this.elements.recipients.html(out);
        $(".recipient").on("click", function (e) {
            let id = e.currentTarget.id.replace("recipient", "");
            if (id === "bank") id = -1;
            else id = parseInt(id);
            that.selectRecipient(id);
        });
        let update = false;
        if (this.selectedRecipient !== -1) {
            if (this.descriptionSet !== 1) {
                this.descriptionSet = 1;
                update = true;
            }
        } else {
            if (this.descriptionSet !== 0) {
                this.descriptionSet = 0;
                update = true;
            }
        }
        if (update) {
            for (let i = 0; i < 3; i++) {
                $("#description" + i).text(this.descriptions[this.descriptionSet][i]);
            }
            that.selectDescription(2);
            $(".description").on("click", function (e) {
                let id = parseInt(e.currentTarget.id.replace("description", ""));
                that.selectDescription(id);
            });
        }
    }

    selectDescription(ID) {
        for (let i = 0; i < 3; i++) {
            if (i !== ID) {
                $("#description" + i).removeClass("selected");
            }
        }
        $("#description" + ID).addClass("selected");
        this.description = this.descriptions[this.descriptionSet][ID];
    }
}

class Get extends View {
    constructor() {
        super($("#get_container"));
        this.elements = {};
        this.elements.back = $("#get_back");
        this.elements.execute = $("#get_execute");
        this.elements.amount = $("#get_amount");
        this.descriptions = ["Zastaw posesji", "Inne"];
        this.description = "Inne";
        let that = this;

        this.elements.back.on("click", function () {
            kenkene.viewManager.showLoading();
            kenkene.viewManager.show(kenkene.viewIDs.dashboard);
            kenkene.viewManager.hideLoading();
        });
        this.elements.execute.on("click", function () {
            // noinspection EqualityComparisonWithCoercionJS
            if (that.elements.amount.val() == 0) return;
            $.post("sell.php", {
                ID: kenkene.userID,
                value: that.elements.amount.val() * 1000,
                description: that.description
            }).done(function (data) {
                if (data.success !== true) {
                    if (data.success === 3) alert("Nie masz wystarczająco pieniędzy!");
                } else
                    kenkene.viewManager.show(kenkene.viewIDs.dashboard);
            }).fail(function (err) {
                alert("Wystąpił błąd: " + err);
                console.error(err);
            }).always(function () {
                kenkene.viewManager.hideLoading();
            });
            kenkene.viewManager.showLoading();
        });
        $(".get_description").on("click", function (e) {
            let id = parseInt(e.currentTarget.id.replace("get_description", ""));
            that.selectDescription(id);
        });
    }

    show() {
        super.show();
        kenkene.viewManager.showLoading();
        this.selectDescription(1);
        this.elements.amount.val("");
        kenkene.viewManager.hideLoading();
    }

    selectDescription(ID) {
        for (let i = 0; i < 2; i++) {
            if (i !== ID) {
                $("#get_description" + i).removeClass("selected");
            }
        }
        $("#get_description" + ID).addClass("selected");
        this.description = this.descriptions[ID];
    }
}

class History extends View {
    constructor(own) {
        super($("#history_container"));
        this.own = own;
        this.elements = {};
        this.elements.back = $("#history_back");
        this.elements.list = $(".history_list");
        this.elements.back.on("click", function () {
            kenkene.viewManager.showLoading();
            kenkene.viewManager.show(kenkene.viewIDs.dashboard);
            kenkene.viewManager.hideLoading();
        });
    }

    show() {
        super.show();
        this.update();
    }

    update() {
        let that = this;
        let data;
        kenkene.viewManager.showLoading();
        if (this.own) data = {gameID: kenkene.gameID, ID: kenkene.userID};
        else data = {gameID: kenkene.gameID};
        $.post("history.php", data).done(function (data) {
            function checkOwn(user) {
                if (user === null) return "<b>&lt;Bank&gt;</b>"
                if (user.ID === kenkene.userID) return "<span style=\"color: #7d0f0f; font-weight: bold;\">" + user.name + "</span>";
                else return user.name;
            }

            let out = "";
            data.reverse();
            for (let x in data) {
                // noinspection JSUnfilteredForInLoop
                out += "<div class=\"history_entry\">" + checkOwn(data[x].from) + " -&gt; " + checkOwn(data[x].to) + "<br>" + kenkene.processMoney(data[x].value) + "<br>" + data[x].description + "<br>" + data[x].date + "</div>"
            }
            if (data.length === 0) out += "<i style='font-size: 2em; text-align:center; font-weight:lighter;'>Trochę tu pusto</i>"
            that.elements.list.html(out);
        }).fail(function (err) {
            alert("Wystąpił błąd: " + err);
            console.error(err);
            kenkene.viewManager.show(kenkene.viewIDs.dashboard);
        }).always(function () {
            kenkene.viewManager.hideLoading();
        })
    }
}