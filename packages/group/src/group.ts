import { IMT } from "@zk-kit/imt"
import { NoirSemaphore } from "@semaphore-protocol/circuits"
import { poseidon2 } from "poseidon-lite/poseidon2"
import { BigNumberish, MerkleProof } from "./types"

/**
 * The Semaphore group is a {@link https://zkkit.pse.dev/classes/_zk_kit_imt.LeanIMT.html | LeanIMT}
 * (Lean Incremental Merkle Tree), i.e. an optimized version of the incremental binary Merkle tree
 * used by Semaphore V3. The new tree does not use zero hashes, and its depth is dynamic.
 * The members of a Semaphore group, or the leaves of a tree, are the identity commitments.
 * Thanks to the properties of Merkle trees, it can be efficiently demonstrated that a group
 * member belongs to the group.
 * This class supports operations such as member addition, update, removal and Merkle proof
 * generation and verification. Groups can also be exported or imported.
 */
export default class Group {
    // The {@link https://zkkit.pse.dev/classes/_zk_kit_imt.LeanIMT.html | LeanIMT} instance.
    public imt: IMT

    /**
     * Creates a new instance of the Group. Optionally, a list of identity commitments can
     * be passed as a parameter. Adding members in chunks is more efficient than adding
     * them one by one with the `addMember` function.
     * @param members A list of identity commitments.
     */
    private constructor(bb: NoirSemaphore, members: BigNumberish[], depth: number, zeroValue = BigInt(0)) {
        const hasher = (values: bigint[]) => poseidon2(values.map(BigInt))
        this.imt = new IMT(hasher, depth, zeroValue, 2, members.map(BigInt))
    }

    static async new(members: BigNumberish[], depth: number, zeroValue = BigInt(0)) {
        const bb = await NoirSemaphore.new()
        const group = new Group(bb, members, depth, zeroValue)
        return group
    }

    /**
     * Returns the root hash of the tree.
     * @returns The root hash as a string.
     */
    public get root(): string {
        return this.imt.root ? this.imt.root.toString() : "0"
    }

    /**
     * Returns the depth of the tree.
     * @returns The tree depth as a number.
     */
    public get depth(): number {
        return this.imt.depth
    }

    /**
     * Returns the size of the tree (i.e. number of leaves).
     * @returns The tree size as a number.
     */
    public get size(): number {
        return this.imt.leaves.length
    }

    /**
     * Returns the members (i.e. identity commitments) of the group.
     * @returns The list of members of the group.
     */
    public get members(): string[] {
        return this.imt.leaves.map(String)
    }

    /**
     * Returns the index of a member. If the member does not exist it returns -1.
     * @param member A member of the group.
     * @returns The index of the member, or -1 if it does not exist.
     */
    public indexOf(member: BigNumberish): number {
        return this.imt.indexOf(BigInt(member))
    }

    /**
     * Adds a new member to the group.
     * @param member The new member to be added.
     */
    public addMember(member: BigNumberish) {
        this.imt.insert(BigInt(member))
    }

    /**
     * Adds new members to the group.
     * @param members New members.
     */
    public addMembers(members: BigNumberish[]) {
        members.map((m) => this.imt.insert(BigInt(m)))
    }

    /**
     * Updates a member in the group.
     * @param index Index of the member to be updated.
     * @param member New member value.
     */
    public updateMember(index: number, member: BigNumberish) {
        console.log("updating", index, member)
        this.imt.update(index, BigInt(member))
    }

    /**
     * Removes a member from the group.
     * @param index The index of the member to be removed.
     */
    public removeMember(index: number) {
        this.imt.update(index, BigInt(0))
    }

    /**
     * Creates a proof of membership for a member of the group.
     * @param index The index of the member.
     * @returns The {@link MerkleProof} object.
     */
    public generateMerkleProof(_index: number): MerkleProof {
        const { pathIndices, leafIndex, leaf, root, siblings } = this.imt.createProof(_index)

        return {
            leafIndex,
            pathIndices,
            leaf: leaf.toString(),
            root: root.toString(),
            siblings: siblings.map(String)
        }
    }
}
