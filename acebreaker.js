const CARD_SPEED = 109;
const JOKER_PROB = 1 / 52;
const SCHOOL_MONEY = 10_000;
const FOLD_PENALTY = 20_000;

cards.init({
    table:'#card-table',
    cardSize: {
        width: 69,
        height: 94,
        padding: 100
    }
});

deck = new cards.Deck();

let jokerUpper = new cards.Card('rj', 0, '#card-table');
let jokerLower = new cards.Card('bj', 0, '#card-table');

let upperhand;
let lowerhand;

let upperHasJoker = false;
let lowerHasJoker = false;
let done = [false, false, false];
let wins = [false, false, false];
let times = 1.0;

let playerMoney = 1_000_000;
let betDealer = 0;
let betPlayer = 0;

let iOpen = 0;

let init = () => {
    $('#new-game').hide();
    $('#close-bet').hide();
    $('#fold').hide();
    $('#deal').show();
    $('#bet-dealer').val(0);
    $('#bet-player').val(0);
    $('#card-c0').text('');
    $('#card-c1').text('');
    $('#card-c2').text('');
    $('#bet-dealer').hide();
    $('#bet-player').hide();
    $('#bet-slider').hide();
    $('#win-amount').hide();

    upperHasJoker = false;
    lowerHasJoker = false;
    done = [false, false, false];
    wins = [false, false, false];
    times = 1.0;
    betDealer = 0;
    betPlayer = 0;
    iOpen = 0;

    jokerLower.el.hide();
    jokerLower.moveTo(50, 340);

    jokerUpper.el.hide();
    jokerUpper.moveTo(50, 60);

    deck.removeCard(cards.all);

    deck.addCards(cards.all);
    cards.shuffle(deck);
    deck.render({immediate:true});

    upperhand = new cards.Hand({faceUp:false, y:60});
    lowerhand = new cards.Hand({faceUp:true, y:340});
}

let updatePlayerMoney = (amount) => {
    playerMoney += amount;
    $('#player-money').text(playerMoney.toLocaleString());
}

$('#deal').click(() => {
    $('#deal').hide();

    updatePlayerMoney(-SCHOOL_MONEY);

    deck.deal(3, [upperhand, lowerhand], CARD_SPEED, () => {
        $('#redeal').show();
        $('#place-bet').show();

        if (Math.random() < JOKER_PROB) {
            jokerLower.el.show();
            lowerHasJoker = true;
        }

        if (Math.random() < JOKER_PROB) {
            upperHasJoker = true;
        }
    });
});

$('#redeal').click(() => {
    $('#redeal').hide();
    $('#place-bet').hide();
    jokerLower.el.hide();

    for (let i = lowerhand.length - 1; i >= 0; i--) {
        lowerhand[i].hideCard();
        lowerhand[i].moveTo(50 + i * 10, 340, CARD_SPEED, () => {
            lowerhand.removeCard(lowerhand[i]);
        });
    }

    setTimeout(() => {
        deck.deal(3, [lowerhand], CARD_SPEED, () => {
            $('#place-bet').show();

            if (Math.random() < JOKER_PROB) {
                lowerHasJoker = true;
                jokerLower.el.show();
            }

            if (Math.random() < JOKER_PROB) {
                upperHasJoker = true;
            }
        });
    }, CARD_SPEED * 4);
});

$('#place-bet').click(() => {
    // TODO: 일정 확률로 포기

    $('#place-bet').hide();
    $('#redeal').hide();

    $('#close-bet').show();
    $('#fold').show();

    betDealer = Math.floor(Math.random() * 1_000) * 100;

    if (betDealer > playerMoney)
        betDealer = playerMoney;

    $('#bet-slider').attr('min', betDealer);
    $('#bet-slider').attr('max', playerMoney);
    $('#bet-slider').attr('value', betDealer);
    $('#bet-slider').attr('step', 1_000);

    $('#bet-dealer').val(betDealer);
    $('#bet-player').val(betDealer);

    $('#bet-dealer').show();
    $('#bet-player').show();
    $('#bet-slider').show();
});

$('#bet-slider').on('input', () => {
    betPlayer = $('#bet-slider').val();
    $('#bet-player').val(betPlayer);
});

let setText = (i, text) => {
    switch (text) {
        case 'Win(AB)':
            $(`#card-c${i}`).text(text).css({color: 'darkblue'});
            wins[i] = 1;
            times += 1;
            break;
        case 'Win(A)':
            $(`#card-c${i}`).text(text).css({color: 'darkblue'});
            wins[i] = 1;
            times += 0.5;
            break;
        case 'Win':
            $(`#card-c${i}`).text(text).css({color: 'darkblue'});
            wins[i] = 1;
            break;
        case 'Lose(AB)':
            $(`#card-c${i}`).text(text).css({color: 'orangered'});
            wins[i] = -1;
            times += 1;
            break;
        case 'Lose(A)':
            $(`#card-c${i}`).text(text).css({color: 'orangered'});
            wins[i] = -1;
            times += 0.5;
            break;
        case 'Lose':
            $(`#card-c${i}`).text(text).css({color: 'orangered'});
            wins[i] = -1;
            break;
        case 'Draw(AB)':
            $(`#card-c${i}`).text(text).css({color: 'black'});
            wins[i] = 0;
            times += 2;
            break;
        case 'Draw(A)':
            $(`#card-c${i}`).text(text).css({color: 'black'});
            wins[i] = 0;
            times += 1;
            break;
        case 'Draw':
            $(`#card-c${i}`).text(text).css({color: 'black'});
            wins[i] = 0;
            break;
        default:
            break;
    }

    done[i] = true;
};

let moveUpperJoker = (i) => {
    upperHasJoker = false;
    jokerUpper.el.show();
    jokerUpper.moveToFront();
    jokerUpper.moveTo(upperhand[i].targetLeft + 50, upperhand[i].targetTop + 110, CARD_SPEED);
};

let moveLowerJoker = (i) => {
    lowerHasJoker = false;
    jokerLower.moveToFront();
    jokerLower.moveTo(lowerhand[i].targetLeft + 50, lowerhand[i].targetTop - 15, CARD_SPEED);
};

$('#close-bet').click(() => {
    $('#bet-dealer').hide();
    $('#bet-player').hide();
    $('#bet-slider').hide();

    betDealer = parseInt($('#bet-dealer').val());
    betPlayer = parseInt($('#bet-player').val());

    if (betPlayer < betDealer) {
        return alert('딜러보다 높은 금액을 베팅해야 합니다!');
    } else if (betPlayer > playerMoney) {
        return alert('소지 금액보다 더 높은 금액을 베팅할 수 없습니다!');
    }

    updatePlayerMoney(-betPlayer);

    $('#close-bet').hide();
    $('#fold').hide();

    for (let card of deck) {
        card.moveTo(100, card.y, CARD_SPEED);
    }

    $('#open').show();
});

$('#open').click(() => {
    upperhand[iOpen].moveTo(upperhand[iOpen].x, 140, CARD_SPEED * 2, () => {
        upperhand[iOpen].showCard();
    });

    lowerhand[iOpen].moveTo(lowerhand[iOpen].x, 260, CARD_SPEED * 2, () => {
        // Ace Breaker
        if (upperhand[iOpen].rank == 1 || lowerhand[iOpen].rank == 1) {
            if (upperhand[iOpen].rank == 1 && lowerhand[iOpen].rank == 1) {
                if (upperHasJoker && lowerHasJoker) {
                    moveUpperJoker(iOpen);
                    moveLowerJoker(iOpen);
                    setText(iOpen, 'Draw(AB)');
                } else if (upperHasJoker) {
                    moveUpperJoker(iOpen);
                    setText(iOpen, 'Lose(AB)');
                } else if (lowerHasJoker) {
                    moveLowerJoker(iOpen);
                    setText(iOpen, 'Win(AB)');
                } else {
                    setText(iOpen, 'Draw(A)');
                }
            } else if (upperhand[iOpen].rank == 1 && lowerHasJoker) {
                moveLowerJoker(iOpen);
                setText(iOpen, 'Win(AB)');
            } else if (lowerhand[iOpen].rank == 1 && upperHasJoker) {
                moveUpperJoker(iOpen);
                setText(iOpen, 'Lose(AB)');
            } else if (upperhand[iOpen].rank == 1) {
                setText(iOpen, 'Lose(A)');
            } else if (lowerhand[iOpen].rank == 1) {
                setText(iOpen, 'Win(A)');
            }
        }

        if (!done[iOpen])
            switch (iOpen) {
                case 0:
                case 2:
                    if (upperhand[iOpen].rank > lowerhand[iOpen].rank) {
                        setText(iOpen, 'Lose');
                    } else if (upperhand[iOpen].rank < lowerhand[iOpen].rank) {
                        setText(iOpen, 'Win');
                    } else {
                        setText(iOpen, 'Draw');
                    }
                    break;

                case 1:
                    if (upperhand[iOpen].rank < lowerhand[iOpen].rank) {
                        setText(iOpen, 'Lose');
                    } else if (upperhand[iOpen].rank > lowerhand[iOpen].rank) {
                        setText(iOpen, 'Win');
                    } else {
                        setText(iOpen, 'Draw');
                    }
                    break;

                default:
                    break;
            }

        iOpen++;
    }, CARD_SPEED);

    if (iOpen == 2) {
        $('#open').hide();

        let score = 0;
        for(let i = 0; i < wins.length; i++) {
            score += wins[i];
        }

        const winAmount = parseInt((betDealer + betPlayer) * times);

        if (score > 0) {
            updatePlayerMoney(winAmount);
            $('#win-amount').text(winAmount.toLocaleString()).css({color: 'darkblue'}).show();
        } else if (score < 0) {
            updatePlayerMoney(-winAmount);
            $('#win-amount').text((-winAmount).toLocaleString()).css({color: 'orangered'}).show();
        } else {
            updatePlayerMoney(betPlayer + SCHOOL_MONEY);
        }

        $('#new-game').show();
    }
});

$('#fold').click(() => {
    updatePlayerMoney(-FOLD_PENALTY);
    init();
});

$('#new-game').click(() => {
    init();
});

init();
