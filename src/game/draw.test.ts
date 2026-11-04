import {currentDrawPlayer, newDraw, resolveDraw, rollDraw} from "@/game/draw";
import {PlayerColor} from "@/type/PlayerColor";

const {YELLOW, GREEN, RED, BLUE} = PlayerColor;
const players = [YELLOW, GREEN, RED, BLUE];

function playDraw(values: number[]) {
    const queue = [...values];
    let draw = newDraw(players);
    while (currentDrawPlayer(draw))
        draw = rollDraw(draw, () => queue.shift() as number);
    return {draw, unused: queue.length};
}

describe("resolveDraw", () => {
    it("designates a clear winner", () => {
        expect(resolveDraw(players, {yellow: 2, green: 5, red: 6, blue: 1})).toEqual({winner: RED, max: 6});
    });

    it("reports a tie between two players on the max", () => {
        expect(resolveDraw(players, {yellow: 2, green: 5, red: 6, blue: 6})).toEqual({tied: [RED, BLUE], max: 6});
    });

    it("reports a tie between three or four players", () => {
        expect(resolveDraw(players, {yellow: 4, green: 4, red: 4, blue: 1})).toEqual({tied: [YELLOW, GREEN, RED], max: 4});
        expect(resolveDraw(players, {yellow: 3, green: 3, red: 3, blue: 3})).toEqual({tied: players, max: 3});
    });

    it("ignores a tie on a lower number", () => {
        expect(resolveDraw(players, {yellow: 2, green: 2, red: 5, blue: 1})).toEqual({winner: RED, max: 5});
    });
});

describe("rollDraw", () => {
    it("rolls in list order and stops at a clear winner", () => {
        const {draw, unused} = playDraw([1, 6, 3, 2]);
        expect(draw.winner).toBe(GREEN);
        expect(draw.round).toBe(1);
        expect(draw.out).toEqual({yellow: 1, red: 3, blue: 2});
        expect(unused).toBe(0);
    });

    it("only lets tied players roll again, the others stay out", () => {
        const {draw} = playDraw([2, 5, 6, 6, 3, 4]);
        expect(draw.winner).toBe(BLUE);
        expect(draw.round).toBe(2);
        expect(draw.out).toEqual({yellow: 2, green: 5, red: 3});
    });

    it("keeps going through several tied rounds, narrowing the contenders", () => {
        const {draw} = playDraw([6, 6, 6, 1, 4, 4, 2, 5, 5, 1, 3]);
        expect(draw.winner).toBe(GREEN);
        expect(draw.round).toBe(4);
        expect(draw.events.filter(event => event.type === "tie")).toEqual([
            {type: "tie", tied: [YELLOW, GREEN, RED], max: 6},
            {type: "tie", tied: [YELLOW, GREEN], max: 4},
            {type: "tie", tied: [YELLOW, GREEN], max: 5},
        ]);
    });

    it("does nothing once the draw is over", () => {
        const {draw} = playDraw([1, 6, 3, 2]);
        expect(rollDraw(draw, () => 6)).toBe(draw);
    });
});
