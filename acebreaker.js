const CARD_SPEED = 300;
const JOKER_PROB = 1 / 52;
const SCHOOL_MONEY = 10_000;
const FOLD_PENALTY = 20_000;

cards.init({
    table:'#card-table',
    cardsUrl: 'img/gangs.png',
    cardSize: {
        width: 135,
        height: 186,
        padding: 200
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
let isOpening = false;

let init = () => {
    $('#new-game').hide();
    $('#close-bet').hide();
    $('#fold').hide();
    $('#deal').show();
    $('#bet-dealer').val(0);
    $('#bet-player').val(0);
    $('#card-c0 .card-c-number').text('');
    $('#card-c1 .card-c-number').text('');
    $('#card-c2 .card-c-number').text('');
    $('#bet-dealer').hide();
    $('#bet-player').hide();
    $('#bet-slider').hide();
    $('#win-amount').hide();
    $('.high-low').hide();
    $('#place-bet').hide();
    $('.pop').hide();

    upperHasJoker = false;
    lowerHasJoker = false;
    done = [false, false, false];
    wins = [false, false, false];
    times = 1.0;
    betDealer = 0;
    betPlayer = 0;
    iOpen = 0;
    isOpening = false;

    jokerLower.el.hide();
    jokerLower.moveTo(100, 600);

    jokerUpper.el.hide();
    jokerUpper.moveTo(300, 120);

    deck.removeCard(cards.all);

    deck.addCards(cards.all);
    cards.shuffle(deck);
    deck.render({immediate:true});

    upperhand = new cards.Hand({faceUp:false, y:120});
    lowerhand = new cards.Hand({faceUp:true, y:600});
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

        $('.high-low').show();
    });
});

$('#redeal').click(() => {
    $('#redeal').hide();
    $('#place-bet').hide();
    jokerLower.el.hide();
    lowerHasJoker = false;
    upperHasJoker = false;

    for (let i = lowerhand.length - 1; i >= 0; i--) {
        lowerhand[i].hideCard();
        lowerhand[i].moveTo(80 + i * 10, 600, CARD_SPEED, () => {
            lowerhand.removeCard(lowerhand[i]);
        });
    }

    setTimeout(() => {
        deck.deal(3, [lowerhand], CARD_SPEED, () => {
            $('#place-bet').show();
            $('#fold').show();

            if (Math.random() < JOKER_PROB) {
                lowerHasJoker = true;
                jokerLower.moveToFront();
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

    betDealer = Math.floor((Math.random() * 1_000_000) / 10_000) * 10_000 + 10_000;

    if (betDealer > playerMoney)
        betDealer = playerMoney;

    betPlayer = betDealer;

    $('#bet-slider').attr('min', betDealer);
    $('#bet-slider').attr('max', playerMoney);
    $('#bet-slider').attr('value', betPlayer);
    $('#bet-slider').attr('step', 10_000);

    $('#bet-dealer').val(betDealer);
    $('#bet-player').val(betPlayer);

    $('#bet-dealer').show();
    $('#bet-player').show();
    $('#bet-slider').show();
});

$('#bet-slider').on('input', () => {
    betPlayer = parseInt($('#bet-slider').val());
    $('#bet-player').val(betPlayer);
});

let setText = (i, text) => {
    const numberContainer = $(`#card-c${i} .card-c-number`);
    const popContainer = $(`#pop-c${i}`);

    switch (text) {
        case 'Win(AB)':
            numberContainer.text(text).css({color: 'deepskyblue'});
            wins[i] = 1;
            times += 1;
            popContainer.show();
            break;
        case 'Win(A)':
            numberContainer.text(text).css({color: 'deepskyblue'});
            wins[i] = 1;
            times += 0.5;
            popContainer.show();
            break;
        case 'Win':
            numberContainer.text(text).css({color: 'deepskyblue'});
            wins[i] = 1;
            popContainer.show();
            break;
        case 'Lose(AB)':
            numberContainer.text(text).css({color: 'orangered'});
            wins[i] = -1;
            times += 1;
            break;
        case 'Lose(A)':
            numberContainer.text(text).css({color: 'orangered'});
            wins[i] = -1;
            times += 0.5;
            break;
        case 'Lose':
            numberContainer.text(text).css({color: 'orangered'});
            wins[i] = -1;
            break;
        case 'Draw(AB)':
            numberContainer.text(text).css({color: 'white'});
            wins[i] = 0;
            times += 2;
            break;
        case 'Draw(A)':
            numberContainer.text(text).css({color: 'white'});
            wins[i] = 0;
            times += 1;
            break;
        case 'Draw':
            numberContainer.text(text).css({color: 'white'});
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
    jokerUpper.moveTo(upperhand[i].targetLeft + 100, upperhand[i].targetTop + 200, CARD_SPEED);
};

let moveLowerJoker = (i) => {
    lowerHasJoker = false;
    jokerLower.moveToFront();
    jokerLower.moveTo(lowerhand[i].targetLeft + 100, lowerhand[i].targetTop - 15, CARD_SPEED);
};

$('#close-bet').click(() => {
    betDealer = parseInt($('#bet-dealer').val());
    betPlayer = parseInt($('#bet-player').val());

    if (betPlayer < betDealer) {
        return alert('딜러보다 높은 금액을 베팅해야 합니다!');
    } else if (betPlayer > playerMoney) {
        return alert('소지 금액보다 더 높은 금액을 베팅할 수 없습니다!');
    }

    $('#bet-dealer').hide();
    $('#bet-player').hide();
    $('#bet-slider').hide();

    updatePlayerMoney(-betPlayer);

    $('#close-bet').hide();
    $('#fold').hide();

    for (let card of deck) {
        card.moveTo(100, card.y, CARD_SPEED);
    }

    $('#open').show();
});

$('#open').click(() => {
    if (isOpening) return false;
    isOpening = true;

    upperhand[iOpen].moveTo(upperhand[iOpen].x, 250, CARD_SPEED * 2, () => {
        upperhand[iOpen].showCard();
    });

    lowerhand[iOpen].moveTo(lowerhand[iOpen].x, 470, CARD_SPEED * 2, () => {
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
        isOpening = false;

        if (iOpen == 3) {
            $('#open').hide();

            let score = 0;
            for(let i = 0; i < wins.length; i++) {
                score += wins[i];
            }

            if (score > 0) { // 플레이어 승리
                const winAmount = parseInt(betDealer + betPlayer * times);
                let winAmountText = `${betDealer.toLocaleString()}+${betPlayer.toLocaleString()}×${times - 1.0}`;

                updatePlayerMoney(winAmount + SCHOOL_MONEY);
                $('#win-amount').text(winAmountText).css({color: 'deepskyblue'}).show();
            } else if (score < 0) { // 딜러 승리
                const winAmount = parseInt(betDealer * (times - 1.0));
                let winAmountText = `${betDealer.toLocaleString()}×${times - 1.0}`;

                updatePlayerMoney(-winAmount);
                $('#win-amount').text(winAmountText).css({color: 'orangered'}).show();
            } else { // 무승부
                updatePlayerMoney(betPlayer + SCHOOL_MONEY);
            }

            $('#new-game').show();
        }
    }, CARD_SPEED);
});

$('#fold').click(() => {
    updatePlayerMoney(-FOLD_PENALTY);
    init();
});

$('#new-game').click(() => {
    init();
});

$(document).keyup((e) => {
    const visibleButtons = $('button').filter(function() {
        return $(this).css('display') !== 'none';
    });

    let betSlider = $('#bet-slider');

    switch (e.key) {
        case 'a':
        case 'A':
        case 'ㅁ':
            visibleButtons.first().click();
            break;
        case 'd':
        case 'D':
        case 'ㅇ':
            if (visibleButtons.length > 1) {
                visibleButtons.eq(1).click();
            }
            break;
        case 'ArrowLeft':
            betSlider.val(betPlayer - parseInt(betSlider.attr('step'))).trigger('input');
            break;
        case 'ArrowRight':
            betSlider.val(betPlayer + parseInt(betSlider.attr('step'))).trigger('input');;
            break;
        default:
            break;
    }
});

init();
