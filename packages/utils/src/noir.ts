import { Barretenberg } from "@aztec/bb.js"
import { BackendOptions, BarretenbergBackend, CompiledCircuit, ProofData } from "@noir-lang/backend_barretenberg"
import { readFile } from "fs/promises"
import { join } from "path"
import { InputMap, Noir } from "@noir-lang/noir_js"
import { requireNumber } from "./errors"

async function loadCircuit(treeDepth: number) {
    requireNumber(treeDepth, "treeDepth")

    const data = await readFile(join(__dirname, `../../circuits/compiled/depth_${treeDepth}.json`), "utf-8")

    const compiled = JSON.parse(data) as CompiledCircuit
    return compiled
}

export class NoirSemaphore {
    noir: Noir
    bb: Barretenberg

    constructor(bb: Barretenberg, compiled: CompiledCircuit, private options: BackendOptions) {
        const backend = new BarretenbergBackend(compiled, options)
        this.noir = new Noir(compiled, backend)
        this.bb = bb
    }

    static async new(treeDepth: number, options: BackendOptions) {
        const compiled = await loadCircuit(treeDepth)
        const bb = await Barretenberg.new(options)
        return new NoirSemaphore(bb, compiled, options)
    }

    async prove(inputs: InputMap) {
        const proof = await this.noir.generateProof(inputs)
        return proof
    }

    async verify(proofData: ProofData) {
        const verified = await this.noir.verifyProof(proofData)
        return verified
    }
}
