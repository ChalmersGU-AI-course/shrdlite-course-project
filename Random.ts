// LCG - http://en.wikipedia.org/wiki/Linear_congruential_generator
class Random {
    seed: number;
    m: number = (1 << 24);
    a: number = 0x43FD43FD;
    c: number = 0xC39EC3;
    x: number = 0xECE66D;
    x0: number;

    constructor(seed: number) {
        this.setSeed(seed);
        this.x0 = seed;
    }

    private setSeed(seed: number): void {
        this.seed = (seed & (this.m - 1)) ^ this.x;
    }

    private next(): number {
        this.seed = (this.seed * this.a + this.c) % this.m; //Can be optimzed with bitwise "AND" instead of modulus but loses uniformity (or something like that)
        return (this.seed);
    }

    public nextDouble(): number {
        return this.next() / this.m;
    }

    public nextRange(from: number, to: number): number {
        return (this.next() % (to - from + 1)) + from;
    }
}
