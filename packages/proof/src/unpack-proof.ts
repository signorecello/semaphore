import { Groth16Proof } from "@zk-kit/groth16"
import { PackedPoints } from "./types"

/**
 * Unpacks the Groth16 proof points into their original form.
 * @param proof The proof points compatible with Semaphore.
 * @returns The proof points compatible with SnarkJS.
 */
export default function unpackPoints(proof: PackedPoints): Groth16Proof {
    return {
        pi_a: [proof[0], proof[1]],
        pi_b: [
            [proof[3], proof[2]],
            [proof[5], proof[4]]
        ],
        pi_c: [proof[6], proof[7]],
        protocol: "groth16",
        curve: "bn128"
    }
}
