const CARD_SPEED = 109;
const JOKER_PROB = 1 / 52;

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

    upperHasJoker = false;
    lowerHasJoker = false;
    done = [false, false, false];
    wins = [false, false, false];
    times = 1.0;

    jokerLower.el.hide();
    jokerLower.moveTo(550, 340);

    jokerUpper.el.hide();
    jokerUpper.moveTo(50, 60);

    deck.removeCard(cards.all);

    deck.addCards(cards.all);
    cards.shuffle(deck);
    deck.render({immediate:true});

    upperhand = new cards.Hand({faceUp:false, y:60});
    lowerhand = new cards.Hand({faceUp:true, y:340});
}

$('#deal').click(() => {
    $('#deal').hide();

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

    $('#bet-dealer').val(10000);
    $('#bet-player').val(10000);
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
    let betDealer = parseInt($('#bet-dealer').val());
    let betPlayer = parseInt($('#bet-player').val());

    if (!betPlayer || betPlayer <= 0) {
        return alert('0보다 큰 금액을 베팅해야 합니다!');
    } else if (betPlayer < betDealer) {
        return alert('딜러보다 높은 금액을 베팅해야 합니다!');
    }

    $('#close-bet').hide();
    $('#fold').hide();

    for (let card of deck) {
        card.moveTo(100, card.y, CARD_SPEED);
    }

    for (let i = 0; i < upperhand.length; i++) {
        setTimeout(() => {
            upperhand[i].moveTo(upperhand[i].x, 140, CARD_SPEED * 2, () => {
                upperhand[i].showCard();
            });

            lowerhand[i].moveTo(lowerhand[i].x, 260, CARD_SPEED * 2, () => {
                // Ace Breaker
                if (upperhand[i].rank == 1 || lowerhand[i].rank == 1) {
                    if (upperhand[i].rank == 1 && lowerhand[i].rank == 1) {
                        if (upperHasJoker && lowerHasJoker) {
                            moveUpperJoker(i);
                            moveLowerJoker(i);
                            setText(i, 'Draw(AB)');
                        } else if (upperHasJoker) {
                            moveUpperJoker(i);
                            setText(i, 'Lose(AB)');
                        } else if (lowerHasJoker) {
                            moveLowerJoker(i);
                            setText(i, 'Win(AB)');
                        } else {
                            setText(i, 'Draw(A)');
                        }
                    } else if (upperhand[i].rank == 1 && lowerHasJoker) {
                        moveLowerJoker(i);
                        setText(i, 'Win(AB)');
                    } else if (lowerhand[i].rank == 1 && upperHasJoker) {
                        moveUpperJoker(i);
                        setText(i, 'Lose(AB)');
                    } else if (upperhand[i].rank == 1) {
                        setText(i, 'Lose(A)');
                    } else if (lowerhand[i].rank == 1) {
                        setText(i, 'Win(A)');
                    }
                }

                if (!done[i])
                    switch (i) {
                        case 0:
                        case 2:
                            if (upperhand[i].rank > lowerhand[i].rank) {
                                setText(i, 'Lose');
                            } else if (upperhand[i].rank < lowerhand[i].rank) {
                                setText(i, 'Win');
                            } else {
                                setText(i, 'Draw');
                            }
                            break;

                        case 1:
                            if (upperhand[i].rank < lowerhand[i].rank) {
                                setText(i, 'Lose');
                            } else if (upperhand[i].rank > lowerhand[i].rank) {
                                setText(i, 'Win');
                            } else {
                                setText(i, 'Draw');
                            }
                            break;

                        default:
                            break;
                    }
            });
        }, CARD_SPEED * 4 * i)
    }

    setTimeout(() => {
        console.log(wins, times);

        $('#new-game').show();
    }, CARD_SPEED * 4 * 3);
});

$('#fold').click(() => {
    init();
});

$('#new-game').click(() => {
    init();
});

init();
