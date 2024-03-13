import { requireDefined, requireObject, requireString } from "@semaphore-protocol/utils/errors"
import { NoirSemaphore } from "@semaphore-protocol/circuits"
import { SemaphoreProof } from "./types"

/**
 * Verifies whether a Semaphore proof is valid. Depending on the depth of the tree used to
 * generate the proof, a different verification key will be used.
 * @param proof The Semaphore proof.
 * @returns True if the proof is valid, false otherwise.
 */
export default async function verifyProof({ proof, nullifier, root, depth }: SemaphoreProof): Promise<boolean> {
    requireDefined(proof, "proof")
    requireObject(proof, "proof")
    requireString(nullifier, "nullifier")
    requireString(root, "root")

    const noirSemaphore = await NoirSemaphore.new(depth)
    const verified = await noirSemaphore.verify({ proof: proof.proof, publicInputs: [nullifier, root] })
    return verified
}
