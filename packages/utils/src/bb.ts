import { BarretenbergSync, Fr } from "@aztec/bb.js"

function toEvenHex(str: string) {
    const trimmed = str.replace("0x", "")
    return trimmed.length % 2 === 0 ? `0x${trimmed}` : `0x0${trimmed}`
}

export class BarretenbergHelpers {
    constructor(private bb: BarretenbergSync) {}

    static async new() {
        const bb = await BarretenbergSync.new()
        return new BarretenbergHelpers(bb)
    }

    poseidon(inputs: string[]) {
        const inputsFr = inputs.map((i) => Fr.fromString(toEvenHex(i)))
        return BigInt(this.bb.poseidonHash(inputsFr).toString())
    }
}
