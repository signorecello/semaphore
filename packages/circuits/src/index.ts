import { BarretenbergSync, Fr } from "@aztec/bb.js"
import { BackendOptions, BarretenbergBackend, CompiledCircuit, ProofData } from "@noir-lang/backend_barretenberg"
import { readFile } from "fs/promises"
import { join } from "path"
import { InputMap, Noir } from "@noir-lang/noir_js"
import { requireNumber } from "@semaphore-protocol/utils/errors"
import { cpus } from "os"

export async function loadCircuit(treeDepth: number) {
    requireNumber(treeDepth, "treeDepth")
    const data = await readFile(join(__dirname, `../compiled_circuits/depth_${treeDepth}.json`), "utf-8")
    const compiled = JSON.parse(data) as CompiledCircuit
    return compiled
}

export function toEvenHex(str: string) {
    const trimmed = str.replace("0x", "")
    return trimmed.length % 2 === 0 ? `0x${trimmed}` : `0x0${trimmed}`
}

export class NoirSemaphore {
    constructor(private bb: BarretenbergSync, private noir?: Noir) {}

    static async new(treeDepth?: number) {
        const bb = await BarretenbergSync.new()
        if (!treeDepth) {
            return new NoirSemaphore(bb)
        }
        const compiled = await loadCircuit(treeDepth)
        const backend = new BarretenbergBackend(compiled, { threads: cpus().length })
        await backend.instantiate()
        const noir = new Noir(compiled, backend)
        await noir.init()
        return new NoirSemaphore(bb, noir)
    }

    async destroy() {
        if (this.noir) {
            await this.noir.destroy()
        }
    }

    async prove(inputs: InputMap) {
        if (!this.noir) throw new Error("No prover exists")
        const proof = await this.noir.generateProof(inputs)
        return proof
    }

    async verify(proofData: ProofData) {
        if (!this.noir) throw new Error("No prover exists")
        const verified = await this.noir.verifyProof(proofData)
        return verified
    }

    poseidon(inputs: string[]) {
        const inputsFr = inputs.map((i) => Fr.fromString(toEvenHex(i)))
        return BigInt(this.bb.poseidonHash(inputsFr).toString())
    }
}
