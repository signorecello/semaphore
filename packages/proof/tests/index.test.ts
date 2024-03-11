import { Group } from "@semaphore-protocol/group"
import { Identity } from "@semaphore-protocol/identity"
import { getCurveFromName } from "ffjavascript"
import { SemaphoreProof, generateProof, verifyProof } from "../src"

describe("Proof", () => {
    const treeDepth = 10

    let identity: Identity | null = null
    let proof: SemaphoreProof
    let curve: any

    beforeAll(async () => {
        identity = await Identity.new(42)
        curve = await getCurveFromName("bn128")
    })

    afterAll(async () => {
        await curve.terminate()
    })

    describe("# generateProof", () => {
        // it("Should not generate a Semaphore proof if the tree depth is not supported", async () => {
        //     const group = await Group.new([BigInt(1), BigInt(2), identity!.commitment])

        //     const fun = () => generateProof(identity!, group, 13)

        //     await expect(fun).rejects.toThrow("tree depth must be")
        // })

        // it("Should not generate Semaphore proofs if the identity is not part of the group", async () => {
        //     const group = await Group.new([BigInt(1), BigInt(2)])

        //     const fun = () => generateProof(identity!, group, treeDepth)

        //     await expect(fun).rejects.toThrow("does not exist")
        // })

        it("Should generate a Semaphore proof", async () => {
            const group = await Group.new([BigInt(1), BigInt(2), identity!.commitment])

            proof = await generateProof(identity!, group, treeDepth)

            expect(typeof proof).toBe("object")
        }, 50000)

        // it("Should generate a Semaphore proof passing a Merkle proof instead of a group", async () => {
        //     const group = await Group.new([BigInt(1), BigInt(2), identity!.commitment])

        //     proof = await generateProof(identity!, group.generateMerkleProof(2), treeDepth)

        //     expect(typeof proof).toBe("object")
        // }, 50000)
    })

    // describe("# verifyProof", () => {
    //     it("Should not verify a Semaphore proof if the tree depth is not supported", async () => {
    //         const fun = () => verifyProof({ ...proof, merkleTreeDepth: 40 })

    //         await expect(fun).rejects.toThrow("tree depth must be")
    //     })

    //     it("Should verify a Semaphore proof", async () => {
    //         const response = await verifyProof(proof)

    //         expect(response).toBe(true)
    //     })
    // })
})
