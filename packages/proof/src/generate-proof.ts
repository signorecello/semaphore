import type { Group, MerkleProof } from "@semaphore-protocol/group"
import type { Identity } from "@semaphore-protocol/identity"
import { requireDefined, requireNumber, requireObject } from "@semaphore-protocol/utils/errors"
import { NoirSemaphore } from "@semaphore-protocol/utils/noir"
import { BarretenbergHelpers } from "@semaphore-protocol/utils/bb"

/**
 * It generates a Semaphore proof, i.e. a zero-knowledge proof that an identity that
 * is part of a group has shared an anonymous message.
 * The message may be any arbitrary user-defined value (e.g. a vote), or the hash of that value.
 * The scope is a value used like a topic on which users can generate a valid proof only once,
 * for example the id of an election in which voters can only vote once.
 * The hash of the identity's scope and secret scalar is called a nullifier and can be
 * used to verify whether that identity has already generated a valid proof in that scope.
 * The depth of the tree determines which zero-knowledge artifacts to use to generate the proof.
 * If it is not defined, it will be inferred from the group or Merkle proof passed as the second parameter.
 * Finally, the artifacts themselves can be passed manually with file paths,
 * or they will be automatically fetched.
 * @param identity The Semaphore identity.
 * @param groupOrMerkleProof The Semaphore group or its Merkle proof.
 * @param scope The Semaphore scope.
 * @param message The Semaphore message.
 * @param merkleTreeDepth The depth of the tree with which the circuit was compiled.
 * @returns The Semaphore proof ready to be verified.
 */
export default async function generateProof(
    identity: Identity,
    groupOrMerkleProof: Group | MerkleProof,
    merkleTreeDepth: number
) {
    requireDefined(identity, "identity")
    requireDefined(groupOrMerkleProof, "groupOrMerkleProof")

    requireObject(identity, "identity")
    requireObject(groupOrMerkleProof, "groupOrMerkleProof")

    if (merkleTreeDepth) {
        requireNumber(merkleTreeDepth, "merkleTreeDepth")
    }

    if (merkleTreeDepth !== undefined) {
        if (merkleTreeDepth < 1 || merkleTreeDepth > 12) {
            throw new TypeError("The tree depth must be a number between 1 and 12")
        }
    }

    let merkleProof

    // The second parameter can be either a Merkle proof or a group.
    // If it is a group the Merkle proof will be calculated here.
    if ("siblings" in groupOrMerkleProof) {
        merkleProof = groupOrMerkleProof
    } else {
        console.log("group members", groupOrMerkleProof.members)
        console.log("identity.commitment", BigInt(identity.commitment).toString(16))
        const leafIndex = groupOrMerkleProof.indexOf(identity.commitment)
        console.log("leafIndex", leafIndex)
        merkleProof = groupOrMerkleProof.generateMerkleProof(leafIndex)
        console.log("index", merkleProof.index)
    }

    const secret = BigInt(identity.secretScalar)
    const root = `0x${BigInt(merkleProof.root).toString(16)}`

    const indices = []
    const hashPath = merkleProof.siblings

    for (let i = 0; i < merkleTreeDepth; i += 1) {
        indices.push((merkleProof.index >> i) & 1)

        if (hashPath[i] === undefined) {
            hashPath[i] = "0"
        }
    }
    console.log(indices)

    const bb = await BarretenbergHelpers.new()
    const noirSemaphore = await NoirSemaphore.new(merkleTreeDepth, { threads: 8 })

    const input = {
        secret: `0x${secret.toString(16)}`,
        hash_path: hashPath.map((x) => `0x${BigInt(x).toString(16)}`),
        indices: BigInt(`0b${indices.join("")}`).toString(10),
        nullifier: `0x${bb.poseidon([secret]).toString(16)}`,
        root
    }

    console.log(input)

    const proof = await noirSemaphore.prove(input)

    return {
        proof
    }
}
