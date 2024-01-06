const CARD_SPEED = 150;

cards.init({
    table:'#card-table',
    cardsUrl: 'img/cards.png',
    cardSize: {
        width: 69,
        height: 94,
        padding: 100
    }
});

deck = new cards.Deck();

let upperhand;
let lowerhand;

let iOpen = 0;
let isOpening = false;

let init = () => {
    $('#open').hide();
    $('#fold').hide();
    $('#new-game').hide();
    $('.labels').hide();

    $('#deal').show();

    iOpen = 0;
    isOpening = false;

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
        $('#open').show();
        $('#fold').show();
    });
});

$('#open').click(() => {
    $('#fold').hide();

    if (isOpening) return false;
    isOpening = true;

    for (const card of deck) {
        card.moveTo(50, card.y, CARD_SPEED);
    }

    upperhand[iOpen].moveTo(upperhand[iOpen].x, 130, CARD_SPEED * 2, () => {
        upperhand[iOpen].showCard();
    });

    lowerhand[iOpen].moveTo(lowerhand[iOpen].x, 270, CARD_SPEED * 2, () => {
        // 두 명 모두 에이스 가지고 있을 때 (무승부)
        if (lowerhand[iOpen].rank == 1 && upperhand[iOpen].rank == 1) {
            $(`#label-${iOpen}`).text('DRAW').css({color: 'black'}).show();
        // 플레이어만 에이스 (승리)
        } else if (lowerhand[iOpen].rank == 1) {
            $(`#label-${iOpen}`).text('WIN').css({color: 'blue'}).show();
        // 딜러만 에이스 (패배)
        } else if (upperhand[iOpen].rank == 1) {
            $(`#label-${iOpen}`).text('LOSE').css({color: 'red'}).show();
        // 에이스가 없는 경우
        } else {
            // HIGH
            if (lowerhand[iOpen].rank > upperhand[iOpen].rank) {
                if (iOpen == 0 || iOpen == 2) {
                    $(`#label-${iOpen}`).text('WIN').css({color: 'blue'}).show();
                } else {
                    $(`#label-${iOpen}`).text('LOSE').css({color: 'red'}).show();
                }
            // LOW
            } else if (lowerhand[iOpen].rank < upperhand[iOpen].rank) {
                if (iOpen == 0 || iOpen == 2) {
                    $(`#label-${iOpen}`).text('LOSE').css({color: 'red'}).show();
                } else {
                    $(`#label-${iOpen}`).text('WIN').css({color: 'blue'}).show();
                }
            // SAME
            } else {
                $(`#label-${iOpen}`).text('DRAW').css({color: 'black'}).show();
            }
        }

        iOpen++;
        isOpening = false;

        if (iOpen == 3) {
            $('#open').hide();
            $('#new-game').show();
        }
    });
});

$('#fold').click(() => {
    init();
});

$('#new-game').click(() => {
    init();
});

init();
