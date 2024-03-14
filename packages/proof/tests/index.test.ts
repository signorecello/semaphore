import { Group } from "@semaphore-protocol/group"
import { Identity } from "@semaphore-protocol/identity"
import { NoirSemaphore } from "@semaphore-protocol/circuits"
import { Worker } from "worker_threads"
import os from "os"
import path, { join } from "path"
import { SemaphoreProof, generateProof, verifyProof } from "../src"

describe("Proof", () => {
    let treeDepth = 10

    let identity: Identity | null = null
    let proof: SemaphoreProof

    beforeAll(async () => {
        identity = await Identity.new(42)
    })

    describe("# generateProof", () => {
        // describe("Should not generate a Semaphore proof with invalid tree depth", () => {
        //     let noirSemaphore: NoirSemaphore | null = null

        //     beforeAll(async () => {
        //         treeDepth = 13
        //         noirSemaphore = await NoirSemaphore.new(treeDepth)
        //     })

        //     afterAll(async () => {
        //         await noirSemaphore?.destroy()
        //     })

        //     it("Should not generate a Semaphore proof if the tree depth is not supported", async () => {
        //         const group = await Group.new([BigInt(1), BigInt(2), identity!.commitment])

        //         const fun = () => generateProof(noirSemaphore!, identity!, group, treeDepth)

        //         await expect(fun).rejects.toThrow("tree depth must be")
        //     })
        // })

        // describe("Should generate a Semaphore proof", () => {
        //     let noirSemaphore: NoirSemaphore | null = null

        //     beforeAll(async () => {
        //         treeDepth = 10
        //         noirSemaphore = await NoirSemaphore.new(treeDepth)
        //     })

        //     afterAll(async () => {
        //         await noirSemaphore?.destroy()
        //     })

        //     it("Should not generate Semaphore proofs if the identity is not part of the group", async () => {
        //         const group = await Group.new([BigInt(1), BigInt(2)])

        //         const fun = () => generateProof(noirSemaphore!, identity!, group, treeDepth)

        //         await expect(fun).rejects.toThrow("does not exist")
        //     })

        //     it("Should generate a Semaphore proof", async () => {
        //         const group = await Group.new([BigInt(1), BigInt(2), identity!.commitment])

        //         proof = await generateProof(noirSemaphore!, identity!, group, treeDepth)

        //         expect(typeof proof).toBe("object")
        //     }, 8000)

        //     it("Should generate a Semaphore proof passing a Merkle proof instead of a group", async () => {
        //         const group = await Group.new([BigInt(1), BigInt(2), identity!.commitment])

        //         proof = await generateProof(noirSemaphore!, identity!, group.generateMerkleProof(2), treeDepth)

        //         expect(typeof proof).toBe("object")
        //     }, 8000)
        // })
        describe("Should generate a Semaphore proof of depth 32", () => {
            let noirSemaphore: NoirSemaphore | null = null

            let group: Group
            beforeAll(async () => {
                treeDepth = 32
                noirSemaphore = await NoirSemaphore.new(treeDepth)
                group = await Group.new([identity!.commitment], treeDepth, BigInt(0))
            }, 800000)

            afterAll(async () => {
                await noirSemaphore?.destroy()
            })

            it("Should generate a Semaphore proof of depth 32", async () => {
                proof = await generateProof(noirSemaphore!, identity!, group, treeDepth)

                expect(typeof proof).toBe("object")
            }, 800000)
        })
    })

    describe("# verifyProof", () => {
        // it("Should not verify a Semaphore proof if the tree depth is not supported", async () => {
        //     const fun = () => verifyProof({ ...proof, depth: 40 })
        //     await expect(fun).rejects.toThrow()
        // })
        // it("Should verify a Semaphore proof", async () => {
        //     const response = await verifyProof(proof)
        //     expect(response).toBe(true)
        // }, 8000)
    })
})
