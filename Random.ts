// LCG - http://en.wikipedia.org/wiki/Linear_congruential_generator
class Random {
    m: number = (1 << 31);
    a: number = 1103515245;
    c: number = 12345;
    x: number = 0xECE66D; //xor:ed with seed
    x0: number;

    constructor(private seed: number) {
        this.setSeed(seed);
        this.x0 = seed;
    }

    private setSeed(seed: number): void {
        this.seed = (seed & (this.m - 1)) ^ this.x;
    }

    private next(): number {
        this.x0 = (this.x0 * this.a + this.c) % this.m; //Can be optimzed with bitwise "AND" instead of modulus but loses uniformity (or something like that)
        return (this.x0);
    }

    public nextDouble(): number {
        return this.next() / this.m;
    }

    public nextRange(from: number, to: number): number {
        return (this.next() % (to - from + 1)) + from;
    }

    public get Seed(): number {
        return this.seed;
    }
}
