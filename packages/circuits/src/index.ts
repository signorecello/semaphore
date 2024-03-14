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
    const compiled = JSON.parse(data)
    return compiled.program
}

export function toEvenHex(num: bigint) {
    const trimmed = num.toString(16)
    return trimmed.length % 2 === 0 ? `0x${trimmed}` : `0x0${trimmed}`
}

export class NoirSemaphore {
    constructor(private bb: BarretenbergSync, private backend?: BarretenbergBackend, private noir?: Noir) {}

    static async new(treeDepth?: number) {
        const bb = await BarretenbergSync.new()
        if (!treeDepth) {
            return new NoirSemaphore(bb)
        }
        const compiled = await loadCircuit(treeDepth)
        const backend = new BarretenbergBackend(compiled as CompiledCircuit, { threads: cpus().length })
        await backend.instantiate()
        const noir = new Noir(compiled, backend)
        await noir.init()
        return new NoirSemaphore(bb, backend, noir)
    }

    async destroy() {
        if (this.noir) {
            await this.noir.destroy()
        }
    }

    async prove(inputs: InputMap) {
        if (!this.noir) throw new Error("No prover exists")

        let a1 = Date.now()
        const { witness } = await this.noir.execute(inputs)
        let a2 = Date.now()
        console.log("Execution time: ", a2 - a1)

        a1 = Date.now()
        const proof = await this.backend!.generateProof(witness)
        a2 = Date.now()
        console.log("Proof generation time: ", a2 - a1)

        return proof
    }

    async verify(proofData: ProofData) {
        if (!this.noir) throw new Error("No prover exists")
        const verified = await this.noir.verifyProof(proofData)
        return verified
    }

    poseidon(inputs: bigint[]) {
        console.log(inputs)
        const inputsFr = inputs.map((i) => new Fr(i % Fr.MODULUS))
        const ret = BigInt(this.bb.poseidonHash(inputsFr).toString())
        return ret
    }

    test() {
        return this.bb.testThreads(1, 1)
    }
}
