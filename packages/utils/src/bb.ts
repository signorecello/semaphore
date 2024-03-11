import { BarretenbergSync, Fr } from "@aztec/bb.js"

export class BarretenbergHelpers {
    constructor(private bb: BarretenbergSync) {}

    static async new() {
        const bb = await BarretenbergSync.new()
        return new BarretenbergHelpers(bb)
    }

    poseidon(inputs: bigint[]) {
        const serialized = inputs.map((i) => Fr.fromString(`0x${i.toString(16)}`))
        console.log("serialized", serialized.toString())
        return BigInt(this.bb.poseidonHash(serialized).toString())
    }
}
