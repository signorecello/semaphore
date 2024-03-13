import toml from "toml"
import { readFile } from "fs/promises"
import { join } from "path"
import { ProofData } from "@noir-lang/noir_js"
import { NoirSemaphore, loadCircuit, toEvenHex } from "../src"

const TEST_DEPTH = 2

describe("Noir and Barretenberg", () => {
    describe("Barretenberg Utils", () => {
        it("Should fail to load a circuit with unsupported tree depth", async () => {
            const fun = () => loadCircuit("10" as any)

            await expect(fun).rejects.toThrow("Parameter 'treeDepth' is not a number")
        })
        it("Should load a circuit", async () => {
            const compiled = await loadCircuit(10)
            expect(compiled).toBeDefined()
        })

        it("Should convert a string to an even hex", () => {
            const hex = toEvenHex("0x1")
            expect(hex).toBe("0x01")
        })
    })

    describe("NoirSemaphore", () => {
        it("Should create a NoirSemaphore", async () => {
            const noir = await NoirSemaphore.new()
            expect(noir).toBeDefined()
        })

        it("Should create a NoirSemaphore with a tree depth", async () => {
            const noir = await NoirSemaphore.new(10)
            expect(noir).toBeDefined()
        })

        it("Should destroy a NoirSemaphore", async () => {
            const noir = await NoirSemaphore.new()
            await noir.destroy()
            const fun = () => noir.bb.testThreads(1, 1)

            expect(fun).toThrow("Cannot read properties of undefined (reading 'call')")
        })

        it("Should not prove if no prover exists", async () => {
            const noir = await NoirSemaphore.new()
            const fun = () => noir.prove({} as any)

            await expect(fun).rejects.toThrow("No prover exists")
        })

        let proof: ProofData

        it("Should prove", async () => {
            const noir = await NoirSemaphore.new(TEST_DEPTH, { threads: 8 })

            const proverFile = await readFile(join(__dirname, "../circuits/Prover.toml"), "utf8")
            const inputs = toml.parse(proverFile)

            proof = await noir.prove(inputs)
            expect(proof).toBeDefined()
        }, 50000)

        it("Should not verify if no prover exists", async () => {
            const noir = await NoirSemaphore.new()
            const fun = () => noir.verify({} as any)

            await expect(fun).rejects.toThrow("No prover exists")
        })

        it("Should verify", async () => {
            const noir = await NoirSemaphore.new(TEST_DEPTH, { threads: 8 })

            const verified = await noir.verify(proof)
            expect(verified).toBe(true)
        }, 50000)

        it("Should poseidon hash", async () => {
            const noir = await NoirSemaphore.new()
            const hash = noir.poseidon(["0x01", "0x02"]).toString(16)
            expect(toEvenHex(hash)).toBe("0x024d310f66b0ba122e5da95ee52038a0efe0a77939cecb09a2c0977a16195535")
        })
    })
})
